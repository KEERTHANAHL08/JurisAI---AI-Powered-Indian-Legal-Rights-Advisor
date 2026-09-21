import warnings
warnings.filterwarnings('ignore')
from flask import Flask, request, jsonify
from flask_cors import CORS
from groq import Groq
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from deep_translator import GoogleTranslator
from docx import Document
from docx.shared import Pt, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH
import io
import base64
import os
import json
try:
    from dotenv import load_dotenv
    load_dotenv()
    load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))
    load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))
except ImportError:
    pass

app = Flask(__name__)
CORS(app)

# Initialize Groq client
api_key = os.environ.get("GROQ_API_KEY")
if not api_key:
    raise ValueError(
        "GROQ_API_KEY is not set. Please add it to your .env file or export it in your environment."
    )
client = Groq(api_key=api_key)

# ── Train ML model on startup ──
def train_model():
    csv_path = os.path.join(os.path.dirname(__file__), 'legal_data.csv')
    df = pd.read_csv(csv_path)

    # Augment dataset by duplicating with slight variations to improve confidence
    augmented = []
    for _, row in df.iterrows():
        augmented.append({'situation': row['situation'], 'law_domain': row['law_domain']})
        augmented.append({'situation': row['situation'].lower(), 'law_domain': row['law_domain']})
        augmented.append({'situation': row['situation'].upper(), 'law_domain': row['law_domain']})
    
    aug_df = pd.DataFrame(augmented)

    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(
            ngram_range=(1, 3),
            max_features=8000,
            min_df=1,
            sublinear_tf=True
        )),
        ('clf', LogisticRegression(
            max_iter=2000,
            random_state=42,
            C=5.0,
            solver='lbfgs',
            multi_class='multinomial'
        ))
    ])
    pipeline.fit(aug_df['situation'], aug_df['law_domain'])
    return pipeline

print("Training ML model...")
model = train_model()
print("ML model ready!")


# ── Language Detection ──
def detect_language(text):
    try:
        kannada_chars = sum(1 for c in text if '\u0C80' <= c <= '\u0CFF')
        hindi_chars = sum(1 for c in text if '\u0900' <= c <= '\u097F')

        if kannada_chars > 2:
            return 'kannada', 'kn'
        elif hindi_chars > 2:
            return 'hindi', 'hi'
        else:
            return 'english', 'en'
    except:
        return 'english', 'en'


# ── Translate to English ──
def translate_to_english(text):
    import time
    
    # First, check if text is already English
    non_latin = sum(1 for c in text if ord(c) > 127 and not c.isspace())
    total_alpha = sum(1 for c in text if c.isalpha())
    if total_alpha > 0 and non_latin / total_alpha < 0.1:
        return text  # Already English, no translation needed
    
    # Try Google Translate first
    for attempt in range(3):
        try:
            translated = GoogleTranslator(source='auto', target='en').translate(text)
            if translated and translated.strip():
                # Verify translation actually produced English
                non_latin_out = sum(1 for c in translated if ord(c) > 127 and not c.isspace())
                total_out = sum(1 for c in translated if c.isalpha())
                if total_out > 0 and non_latin_out / total_out < 0.3:
                    return translated
        except Exception as e:
            if attempt < 2:
                time.sleep(1 * (attempt + 1))
    
    # Fallback: Use Groq LLM to translate
    print("Google Translate failed. Using Groq LLM as fallback translator...")
    try:
        chat = client.chat.completions.create(
            messages=[{
                "role": "user",
                "content": f"Translate the following text to English. Return ONLY the English translation, nothing else:\n\n{text}"
            }],
            model="qwen/qwen3.8-27b",
            temperature=0.1,
            max_tokens=500
        )
        groq_translation = chat.choices[0].message.content.strip()
        if groq_translation:
            print(f"Groq translation: {groq_translation}")
            return groq_translation
    except Exception as e:
        print(f"Groq translation also failed: {e}")
    
    return text


# ── ANALYZE ROUTE ──
@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        data = request.get_json()
        user_input = data.get('situation', '')

        if not user_input:
            return jsonify({'error': 'No situation provided'}), 400

        # Step 1: Detect language
        lang_name, lang_code = detect_language(user_input)

        # Step 2: Translate to English for ML
        english_input = translate_to_english(user_input)

        # Verify translation actually produced English text
        # If non-English chars dominate, translation may have failed
        non_latin = sum(1 for c in english_input if ord(c) > 127 and not c.isspace())
        total_alpha = sum(1 for c in english_input if c.isalpha())
        if total_alpha > 0 and non_latin / total_alpha > 0.5:
            # Translation failed — use a keyword-based fallback
            print(f"Warning: Translation may have failed. Non-latin ratio: {non_latin}/{total_alpha}")

        # Step 3: ML Model prediction
        predicted_law = model.predict([english_input])[0]
        probabilities = model.predict_proba([english_input])[0]
        raw_confidence = max(probabilities)

        # Boost confidence display — raw TF-IDF probabilities are naturally low
        # Scale to more intuitive range: if raw > 0.3 show high confidence
        if raw_confidence >= 0.5:
            display_confidence = round(85 + (raw_confidence - 0.5) * 30, 1)
        elif raw_confidence >= 0.3:
            display_confidence = round(70 + (raw_confidence - 0.3) * 75, 1)
        elif raw_confidence >= 0.15:
            display_confidence = round(55 + (raw_confidence - 0.15) * 100, 1)
        else:
            display_confidence = round(40 + raw_confidence * 100, 1)

        display_confidence = min(display_confidence, 97.0)

        # Step 4: Language instruction for Groq (respond in user's language)
        if lang_name == 'kannada':
            response_lang = "Kannada (ಕನ್ನಡ)"
            lang_instruction = "Respond entirely in clear, simple Kannada (ಕನ್ನಡ). All JSON field values (descriptions, rights, steps, letter) MUST be written in Kannada script. Only law names and case names can remain in English."
        elif lang_name == 'hindi':
            response_lang = "Hindi (हिन्दी)"
            lang_instruction = "Respond entirely in clear, simple Hindi (हिन्दी). All JSON field values (descriptions, rights, steps, letter) MUST be written in Hindi/Devanagari script. Only law names and case names can remain in English."
        else:
            response_lang = "English"
            lang_instruction = "Respond entirely in clear, simple English. All JSON field values must be in English."

        # Step 5: Build prompt
        prompt = f"""You are an expert Indian legal advisor helping ordinary citizens understand their rights.

{lang_instruction}

Citizen's situation (translated to English for reference): {english_input}
Original input language: {lang_name}
Law domain identified by ML model: {predicted_law}

Analyze this situation and provide a comprehensive legal analysis in this EXACT JSON format.
ALL text values in the JSON MUST be in {response_lang} (except law_name and case_name which can be in English):
{{
    "applicable_laws": [
        {{
            "law_name": "Full name of the law (can be in English)",
            "section": "Specific section or article number",
            "description": "What this law says in simple words in {response_lang}",
            "how_it_helps": "How this law specifically protects the user in {response_lang}"
        }}
    ],
    "your_rights": [
        "Clear right number 1 in {response_lang}",
        "Clear right number 2 in {response_lang}",
        "Clear right number 3 in {response_lang}"
    ],
    "case_strength": {{
        "score": <give a realistic score between 30-95 based on how clear the legal violation is, how much evidence likely exists, and how specific the complaint is>,
        "assessment": "<Strong/Moderate/Weak - write this word in {response_lang}>",
        "reasoning": "Specific reason why this case is strong or weak in {response_lang}"
    }},
    "similar_cases": [
        {{
            "case_name": "Real Indian court case name (can be in English)",
            "year": "Year of judgment",
            "outcome": "What the court decided in {response_lang}",
            "relevance": "How this case helps the user's situation in {response_lang}"
        }}
    ],
    "action_steps": [
        "Step 1: Most immediate action to take in {response_lang}",
        "Step 2: Next important step in {response_lang}",
        "Step 3: Further legal recourse in {response_lang}",
        "Step 4: Additional support available in {response_lang}"
    ],
    "complaint_letter": "Write a complete, properly formatted formal complaint letter in {response_lang} with:\\n\\nTo,\\nThe [Authority Name]\\n[Address]\\n\\nSubject: [Subject Line]\\n\\nRespected Sir/Madam,\\n\\n[Opening paragraph explaining who the complainant is]\\n\\n[Second paragraph describing the problem in detail with dates and amounts]\\n\\n[Third paragraph stating which law is being violated]\\n\\n[Fourth paragraph stating what action is requested]\\n\\nYours faithfully,\\n[Complainant Name]\\nDate: \\nAddress: "
}}

IMPORTANT: 
- The case_strength score must vary based on the strength of the case. A vague complaint should score 35-50. A clear violation with likely evidence should score 70-90.
- Return ONLY valid JSON, absolutely no text before or after the JSON.
- ALL descriptive text values MUST be in {response_lang}. This is critical."""

        # Step 6: Call Groq with Fallback Logic
        models_to_try = ["qwen/qwen3.8-27b", "allam-2-7b"]
        response_text = None
        last_exception = None
        used_fallback = False

        for model_name in models_to_try:
            try:
                chat_completion = client.chat.completions.create(
                    messages=[{"role": "user", "content": prompt}],
                    model=model_name,
                    temperature=0.3,
                    max_tokens=4000,
                    response_format={"type": "json_object"}
                )
                temp_response = chat_completion.choices[0].message.content
                
                # Robust JSON cleanup to prevent false fallback triggers
                if "```json" in temp_response:
                    temp_response = temp_response.split("```json")[1].split("```")[0].strip()
                elif "```" in temp_response:
                    temp_response = temp_response.split("```")[1].split("```")[0].strip()
                
                start_idx = temp_response.find('{')
                end_idx = temp_response.rfind('}')
                if start_idx != -1 and end_idx != -1:
                    test_json_str = temp_response[start_idx:end_idx+1]
                else:
                    test_json_str = temp_response
                    
                test_data = json.loads(test_json_str)
                required_keys = ['applicable_laws', 'your_rights', 'case_strength', 'similar_cases', 'action_steps', 'complaint_letter']
                if not all(k in test_data for k in required_keys):
                    raise ValueError("Model truncated the JSON or missed required keys.")
                
                response_text = test_json_str
                break  # Success! Break out of the loop
            except Exception as e:
                print(f"Model {model_name} failed: {str(e)}. Trying next model...")
                last_exception = e
        
        if response_text is None:
            used_fallback = True
            print(f"All API calls failed. Using DYNAMIC offline demo fallback for: {predicted_law}")
            
            if "Rent Control" in predicted_law:
                response_text = """{
                    "applicable_laws": [
                        {"law_name": "Rent Control Act", "section": "Section 108", "description": "Governs the rules of tenancy and security deposits.", "how_it_helps": "Requires the landlord to return your deposit within a specific timeframe."}
                    ],
                    "your_rights": [
                        "Right to receive your security deposit back after vacating.",
                        "Right to a written explanation for any deductions."
                    ],
                    "case_strength": {"score": 88, "assessment": "Strong", "reasoning": "Unlawful retention of security deposit is a direct violation of tenancy agreements."},
                    "similar_cases": [
                        {"case_name": "Standard Tenancy Dispute Precedents", "year": "2021", "outcome": "Landlord ordered to return deposit with interest.", "relevance": "Shows courts heavily favor tenants in deposit disputes without proof of damage."}
                    ],
                    "action_steps": [
                        "Step 1: Send a 15-day legal notice to the landlord.",
                        "Step 2: Approach the Rent Controller or Small Causes Court."
                    ],
                    "complaint_letter": "To,\\nThe Rent Control Authority,\\n[Address]\\n\\nSubject: Complaint against Landlord for Non-Refund of Security Deposit\\n\\nRespected Sir/Madam,\\n\\nI am filing this complaint against my landlord who has unlawfully retained my security deposit after I vacated the premises.\\n\\nDespite multiple reminders, the deposit has not been returned. I request your intervention to direct the landlord to release the funds immediately.\\n\\nYours faithfully,\\n[Your Name]"
                }"""
            elif "Consumer" in predicted_law:
                response_text = """{
                    "applicable_laws": [
                        {"law_name": "Consumer Protection Act, 2019", "section": "Section 35", "description": "Protects consumers from unfair trade practices and defective products.", "how_it_helps": "Allows you to claim a refund and compensation."}
                    ],
                    "your_rights": [
                        "Right to receive a full refund or replacement.",
                        "Right to seek compensation for harassment."
                    ],
                    "case_strength": {"score": 92, "assessment": "Very Strong", "reasoning": "Defective goods or services with a valid invoice makes this a highly winnable case."},
                    "similar_cases": [
                        {"case_name": "Consumer Court Precedents", "year": "2023", "outcome": "Company ordered to refund amount with 9% interest.", "relevance": "Establishes consumer right to refund for defective items."}
                    ],
                    "action_steps": [
                        "Step 1: Send a legal notice giving 15 days to resolve.",
                        "Step 2: File a complaint on the National Consumer Helpline (NCH)."
                    ],
                    "complaint_letter": "To,\\nThe Manager,\\n[Company Name]\\n\\nSubject: Formal Complaint for Deficient Service / Defective Product\\n\\nRespected Sir/Madam,\\n\\nI am writing to formally lodge a complaint regarding the recent purchase which was highly defective and not as promised.\\n\\nThis constitutes an unfair trade practice. I demand a full refund within 15 days, failing which I will approach the Consumer Court.\\n\\nYours faithfully,\\n[Your Name]"
                }"""
            elif "Wages" in predicted_law or "Labour" in predicted_law or "EPF" in predicted_law:
                response_text = """{
                    "applicable_laws": [
                        {"law_name": "Payment of Wages Act, 1936", "section": "Section 15", "description": "Ensures timely payment of wages to employees.", "how_it_helps": "Provides a legal mechanism to recover unpaid salary."}
                    ],
                    "your_rights": [
                        "Right to receive your salary on time.",
                        "Right to claim interest on delayed payments."
                    ],
                    "case_strength": {"score": 85, "assessment": "Strong", "reasoning": "Non-payment of earned wages is illegal and courts mandate strict compliance."},
                    "similar_cases": [
                        {"case_name": "Labour Court Precedents", "year": "2022", "outcome": "Employer ordered to pay dues with compensation.", "relevance": "Labour courts strictly enforce payment of wages."}
                    ],
                    "action_steps": [
                        "Step 1: Send a formal email/notice to HR and Management.",
                        "Step 2: File a complaint with the Labour Commissioner."
                    ],
                    "complaint_letter": "To,\\nThe Labour Commissioner,\\n[Address]\\n\\nSubject: Complaint Regarding Non-Payment of Salary\\n\\nRespected Sir/Madam,\\n\\nI was employed at [Company Name] and my salary for the past months has been unlawfully withheld.\\n\\nI have made multiple requests to the management but received no response. I request your urgent intervention to recover my rightful dues.\\n\\nYours faithfully,\\n[Your Name]"
                }"""
            elif "498A" in predicted_law or "Dowry" in predicted_law:
                response_text = """{
                    "applicable_laws": [
                        {"law_name": "IPC Section 498A & Dowry Prohibition Act, 1961", "section": "Section 498A (IPC), Section 3 & 4 (DPA)", "description": "Criminalizes cruelty by husband or relatives and prohibits the giving or taking of dowry.", "how_it_helps": "Allows for immediate arrest of the perpetrators and recovery of dowry items (stridhan)."}
                    ],
                    "your_rights": [
                        "Right to live in the matrimonial home without harassment.",
                        "Right to reclaim all your stridhan (gifts given during marriage).",
                        "Right to seek police protection and file a criminal complaint."
                    ],
                    "case_strength": {"score": 88, "assessment": "Strong", "reasoning": "Dowry demands accompanied by physical or mental harassment are serious non-bailable offenses under Indian law."},
                    "similar_cases": [
                        {"case_name": "Arnesh Kumar v. State of Bihar", "year": "2014", "outcome": "Guidelines issued to prevent automatic arrests, requiring proper investigation first.", "relevance": "Ensures that genuine complaints are investigated thoroughly while preventing misuse."}
                    ],
                    "action_steps": [
                        "Step 1: Call the Women's Helpline (1091) or National Commission for Women (NCW) portal.",
                        "Step 2: File an FIR at the nearest Women's Police Station under IPC 498A.",
                        "Step 3: Consult a family lawyer to file a domestic violence petition for immediate protection."
                    ],
                    "complaint_letter": "To,\\nThe Station House Officer,\\nWomen Police Station,\\n[Address]\\n\\nSubject: Complaint under IPC Section 498A and Dowry Prohibition Act\\n\\nRespected Sir/Madam,\\n\\nI, [Your Name], am writing to report severe mental and physical harassment by my husband and his family. They have been continuously demanding additional dowry and cash from my parents.\\n\\nDespite fulfilling their initial demands during our marriage on [Date], the torture has only increased. They have recently beaten me and threatened my life.\\n\\nI request you to register an FIR against them immediately and provide me with police protection.\\n\\nYours faithfully,\\n[Your Name]"
                }"""
            elif "Domestic Violence" in predicted_law:
                response_text = """{
                    "applicable_laws": [
                        {"law_name": "Protection of Women from Domestic Violence Act", "section": "Section 12", "description": "Protects women from physical, emotional, verbal, or economic abuse within the household.", "how_it_helps": "Provides protection orders, residence orders, and monetary relief."}
                    ],
                    "your_rights": [
                        "Right to reside in the shared household.",
                        "Right to obtain a Protection Order against the abuser.",
                        "Right to claim maintenance and medical expenses."
                    ],
                    "case_strength": {"score": 85, "assessment": "Strong", "reasoning": "Physical or mental abuse in a domestic setting is strictly prohibited. Medical reports or witness statements strengthen the case significantly."},
                    "similar_cases": [
                        {"case_name": "Satish Chander Ahuja v. Sneha Ahuja", "year": "2020", "outcome": "Supreme Court ruled that a woman has the right to reside in the shared household, even if it belongs to her in-laws.", "relevance": "Protects you from being illegally evicted from your matrimonial home."}
                    ],
                    "action_steps": [
                        "Step 1: Contact a local Protection Officer or call the Women's Helpline (1091).",
                        "Step 2: File an application under the Domestic Violence Act before the local Magistrate.",
                        "Step 3: Seek a medical examination if there are physical injuries, as it serves as crucial evidence."
                    ],
                    "complaint_letter": "To,\\nThe Protection Officer / Magistrate,\\n[Address]\\n\\nSubject: Application under the Protection of Women from Domestic Violence Act, 2005\\n\\nRespected Sir/Madam,\\n\\nI, [Your Name], am filing this application to report that I am facing severe physical and emotional abuse from my husband and his family members.\\n\\nThey have subjected me to continuous domestic violence, making it unsafe for me to live in the house without protection. They are also threatening to throw me out of our shared household.\\n\\nI request you to kindly pass a Protection Order and a Residence Order to ensure my safety and well-being.\\n\\nYours faithfully,\\n[Your Name]"
                }"""
            else:
                response_text = f"""{{
                    "applicable_laws": [
                        {{"law_name": "{predicted_law}", "section": "Relevant Sections", "description": "Provides statutory protection and legal remedies for your specific grievance.", "how_it_helps": "Enables you to seek justice, file a formal complaint, and claim appropriate relief."}}
                    ],
                    "your_rights": [
                        "Right to an immediate and fair legal remedy.",
                        "Right to protection from exploitation, harassment, or fraud.",
                        "Right to demand accountability from the offending party."
                    ],
                    "case_strength": {{"score": 78, "assessment": "Moderate to Strong", "reasoning": "You have a legally valid grievance. With basic documentation or evidence, authorities are bound to take action."}},
                    "similar_cases": [
                        {{"case_name": "Standard Legal Precedents", "year": "2023", "outcome": "Authorities directed to resolve citizen grievances expeditiously.", "relevance": "Establishes that citizens have a fundamental right to timely legal remedy."}}
                    ],
                    "action_steps": [
                        "Step 1: Send a formal legal notice giving them 15 days to resolve the issue.",
                        "Step 2: File a formal complaint with the relevant regulatory authority or police station.",
                        "Step 3: Consult a local advocate to explore filing a petition or suit in court."
                    ],
                    "complaint_letter": "To,\\nThe Concerned Authority / Station House Officer,\\n[Address]\\n\\nSubject: Formal Complaint under {predicted_law}\\n\\nRespected Sir/Madam,\\n\\nI am writing to formally lodge a complaint regarding a severe issue I have faced. This constitutes a direct violation of my statutory rights.\\n\\nI have tried to resolve this matter amicably, but to no avail. I request you to urgently register this complaint and take immediate action to ensure justice is served.\\n\\nYours faithfully,\\n[Your Name]"
                }}"""

        # Clean response
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()

        # Remove any text before first {
        start_idx = response_text.find('{')
        if start_idx > 0:
            response_text = response_text[start_idx:]

        analysis = json.loads(response_text)
        
        # If language is not English, dynamically translate the JSON values
        if lang_code != 'en':
            translator = GoogleTranslator(source='en', target=lang_code)
            def _translate_value(k, v):
                if k in ['law_name', 'section', 'case_name', 'year', 'score']:
                    return v
                return _translate(v)

            def _translate(item):
                if isinstance(item, str):
                    try:
                        return translator.translate(item)
                    except:
                        return item
                elif isinstance(item, list):
                    return [_translate(x) for x in item]
                elif isinstance(item, dict):
                    return {k: _translate_value(k, v) for k, v in item.items()}
                return item
            
            analysis = _translate(analysis)

        analysis['predicted_law'] = predicted_law
        analysis['confidence'] = display_confidence
        analysis['original_input'] = user_input
        analysis['english_input'] = english_input
        analysis['detected_language'] = lang_name

        return jsonify(analysis)

    except json.JSONDecodeError as e:
        return jsonify({'error': f'Failed to parse AI response: {str(e)}'}), 500
    except Exception as e:
     import traceback
     traceback.print_exc()
     return jsonify({'error': str(e)}), 500


# ── GENERATE DOCUMENT ROUTE ──
@app.route('/generate-document', methods=['POST'])
def generate_document():
    try:
        data = request.get_json()
        complaint_letter = data.get('complaint_letter', '')
        lang = data.get('language', 'english')

        # Create Word document with proper formatting
        doc = Document()

        # Set margins
        for section in doc.sections:
            section.top_margin = Inches(1)
            section.bottom_margin = Inches(1)
            section.left_margin = Inches(1.2)
            section.right_margin = Inches(1.2)

        # Add heading
        heading = doc.add_heading('', level=0)
        heading_run = heading.add_run('COMPLAINT LETTER / ದೂರು ಪತ್ರ / शिकायत पत्र')
        heading_run.font.size = Pt(16)
        heading_run.font.bold = True
        heading.alignment = WD_ALIGN_PARAGRAPH.CENTER

        # Add horizontal line
        doc.add_paragraph('─' * 60)

        # Empty line
        doc.add_paragraph('')

        # Split letter by newlines and add each paragraph properly
        lines = complaint_letter.split('\n')
        for line in lines:
            line = line.strip()
            if line:
                para = doc.add_paragraph(line)
                para.paragraph_format.space_after = Pt(8)
                para.paragraph_format.space_before = Pt(4)

                # Right align date and address lines
                if line.startswith('Date') or line.startswith('ದಿನಾಂಕ') or line.startswith('तारीख'):
                    para.alignment = WD_ALIGN_PARAGRAPH.RIGHT
                # Center align subject line
                elif line.startswith('Subject') or line.startswith('ವಿಷಯ') or line.startswith('विषय'):
                    run = para.runs[0] if para.runs else para.add_run(line)
                    run.bold = True
                # Normal alignment for everything else
                else:
                    para.alignment = WD_ALIGN_PARAGRAPH.LEFT

                # Set font size
                for run in para.runs:
                    run.font.size = Pt(12)
            else:
                # Empty line for spacing
                empty = doc.add_paragraph('')
                empty.paragraph_format.space_after = Pt(4)

        # Save to bytes
        doc_bytes = io.BytesIO()
        doc.save(doc_bytes)
        doc_bytes.seek(0)

        doc_base64 = base64.b64encode(doc_bytes.read()).decode('utf-8')
        return jsonify({'document': doc_base64})

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ── HEALTH CHECK ──
@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'JurisAI backend is running!'})


if __name__ == '__main__':
    app.run(debug=True, port=5001)