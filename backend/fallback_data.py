FALLBACKS = {
    # Property & Tenancy
    "Rent Control Act": {
        "desc": "Governs the rules of tenancy, eviction, and security deposits.",
        "helps": "Protects tenants from unlawful eviction and ensures return of deposits.",
        "rights": ["Right to receive security deposit back", "Right to peaceful possession", "Right to a written explanation for eviction"],
        "score": 88, "assess": "Strong", "reason": "Unlawful eviction or retention of deposit violates tenancy agreements.",
        "case": "Standard Tenancy Dispute Precedents", "year": "2021", "outcome": "Landlord ordered to return deposit with interest.", "relevance": "Shows courts favor tenants in arbitrary deposit deductions.",
        "steps": ["Step 1: Send a 15-day legal notice to the landlord.", "Step 2: Approach the Rent Controller or Small Causes Court."],
        "letter": "Subject: Complaint against Landlord\n\nRespected Sir/Madam,\n\nI am filing this complaint against my landlord who has unlawfully retained my security deposit and is harassing me.\n\nDespite multiple reminders, the deposit has not been returned. I request your intervention to direct the landlord to release the funds immediately."
    },
    "RERA Act": {
        "desc": "Protects homebuyers from builder fraud and project delays.",
        "helps": "Allows you to claim refund with interest for delayed possession.",
        "rights": ["Right to claim refund for delayed project", "Right to transparent project details", "Right to file complaint with RERA authority"],
        "score": 90, "assess": "Very Strong", "reason": "Documented delay in project handover strongly favors the homebuyer under RERA guidelines.",
        "case": "Pioneer Urban Land and Infrastructure Ltd v. Govindan Raghavan", "year": "2019", "outcome": "Builder ordered to refund money with interest for delay.", "relevance": "Establishes builder's absolute liability for project delays.",
        "steps": ["Step 1: Send a legal notice to the builder.", "Step 2: File a formal complaint on the state RERA portal.", "Step 3: Approach the NCLT if the builder is insolvent."],
        "letter": "Subject: Complaint against Builder under RERA\n\nRespected Sir/Madam,\n\nI am filing this complaint regarding extreme delay in the handover of my purchased flat.\n\nI have paid the majority of the amount but the builder has failed to deliver possession. I request a full refund with interest."
    },
    
    # Consumer & Finance
    "Consumer Protection Act": {
        "desc": "Protects consumers from unfair trade practices and defective products.",
        "helps": "Allows you to claim a refund, replacement, and compensation.",
        "rights": ["Right to receive a full refund or replacement", "Right to seek compensation for harassment", "Right to product safety"],
        "score": 92, "assess": "Very Strong", "reason": "Defective goods or services with a valid invoice makes this a highly winnable case.",
        "case": "Consumer Court Precedents", "year": "2023", "outcome": "Company ordered to refund amount with 9% interest.", "relevance": "Establishes consumer right to refund for defective items.",
        "steps": ["Step 1: Send a legal notice giving 15 days to resolve.", "Step 2: File a complaint on the National Consumer Helpline (NCH).", "Step 3: File a case in the District Consumer Disputes Redressal Commission."],
        "letter": "Subject: Formal Complaint for Deficient Service / Defective Product\n\nRespected Sir/Madam,\n\nI am writing to formally lodge a complaint regarding the recent purchase which was highly defective and not as promised.\n\nThis constitutes an unfair trade practice. I demand a full refund within 15 days, failing which I will approach the Consumer Court."
    },
    "IPC Section 420": {
        "desc": "Deals with cheating and dishonestly inducing delivery of property.",
        "helps": "Allows police to arrest the fraudster and helps recover lost money.",
        "rights": ["Right to register a criminal FIR", "Right to recover defrauded money", "Right to police protection if threatened"],
        "score": 85, "assess": "Strong", "reason": "Financial fraud backed by bank statements or chats provides solid evidentiary support.",
        "case": "State of Kerala v. A. Pareed Pillai", "year": "1972", "outcome": "Accused convicted for intentional deception.", "relevance": "Highlights that deceitful intention from the beginning constitutes cheating.",
        "steps": ["Step 1: Gather all transaction proofs and chats.", "Step 2: File a complaint on the Cyber Crime Portal (if online) or local police station.", "Step 3: Follow up with the investigating officer for FIR registration."],
        "letter": "Subject: FIR for Cheating and Fraud under IPC 420\n\nRespected Sir/Madam,\n\nI am writing to report a severe financial fraud committed against me. The accused deceived me and extracted money under false pretenses.\n\nI have attached all transaction proofs. I request you to urgently register an FIR and help recover my funds."
    },
    "IPC Section 406": {
        "desc": "Punishes criminal breach of trust.",
        "helps": "Helps recover property or money entrusted to someone who misappropriated it.",
        "rights": ["Right to file an FIR for breach of trust", "Right to recover entrusted assets"],
        "score": 80, "assess": "Strong", "reason": "If there is proof of entrustment, the misappropriation is a clear criminal act.",
        "case": "Sushil Kumar Gupta v. State of Jharkhand", "year": "2005", "outcome": "Conviction upheld for misappropriating entrusted property.", "relevance": "Proves that violating trust with entrusted goods is a strict offense.",
        "steps": ["Step 1: Issue a formal demand notice for return of property.", "Step 2: File a police complaint for Criminal Breach of Trust.", "Step 3: Approach the Magistrate if police refuse to file FIR."],
        "letter": "Subject: Complaint for Criminal Breach of Trust under IPC 406\n\nRespected Sir/Madam,\n\nI had entrusted my property/funds to the accused in good faith, which they have now dishonestly misappropriated and refuse to return.\n\nThis is a clear breach of trust. I request immediate registration of an FIR to recover my assets."
    },
    
    # Labour & Employment
    "Labour Law": {
        "desc": "A set of laws protecting employee rights, ensuring fair wages, and preventing exploitation.",
        "helps": "Provides mechanisms to challenge unlawful termination and claim unpaid dues.",
        "rights": ["Right to fair wages", "Right to safe working conditions", "Right against unlawful termination"],
        "score": 85, "assess": "Strong", "reason": "Documentary evidence like offer letters and bank statements make labour disputes highly actionable.",
        "case": "Workmen of Dimakuchi Tea Estate v. Management", "year": "1958", "outcome": "Upheld workmen's right to dispute unfair practices.", "relevance": "Foundational case ensuring collective and individual worker rights.",
        "steps": ["Step 1: Send a formal email to HR/Management.", "Step 2: File a complaint with the Labour Commissioner.", "Step 3: Approach the Labour Court or Industrial Tribunal."],
        "letter": "Subject: Complaint Regarding Unfair Labour Practice\n\nRespected Sir/Madam,\n\nI am an employee at the aforementioned company and have been subjected to unfair labour practices, including denial of rightful dues.\n\nI request your intervention to ensure my rights are protected and dues cleared."
    },
    "Payment of Wages Act": {
        "desc": "Ensures timely payment of wages to employees.",
        "helps": "Provides a legal mechanism to recover unpaid salary with penalty.",
        "rights": ["Right to receive salary on time", "Right to claim interest on delayed payments", "Right to file grievance without retaliation"],
        "score": 88, "assess": "Strong", "reason": "Non-payment of earned wages is illegal and courts mandate strict compliance.",
        "case": "Labour Court Precedents", "year": "2022", "outcome": "Employer ordered to pay dues with compensation.", "relevance": "Labour courts strictly enforce payment of wages.",
        "steps": ["Step 1: Send a formal email/notice to HR and Management.", "Step 2: File a complaint with the Labour Commissioner.", "Step 3: Send a legal notice for recovery of dues."],
        "letter": "Subject: Complaint Regarding Non-Payment of Salary\n\nRespected Sir/Madam,\n\nI was employed at the company and my salary for the past months has been unlawfully withheld.\n\nI have made multiple requests but received no response. I request your urgent intervention to recover my rightful dues."
    },
    
    # Women & Family Protection
    "IPC Section 498A": {
        "desc": "Criminalizes cruelty by husband or relatives and prohibits the giving or taking of dowry.",
        "helps": "Allows for immediate arrest of the perpetrators and recovery of dowry items.",
        "rights": ["Right to live without harassment", "Right to reclaim stridhan (gifts)", "Right to seek police protection"],
        "score": 88, "assess": "Strong", "reason": "Dowry demands accompanied by harassment are serious non-bailable offenses.",
        "case": "Arnesh Kumar v. State of Bihar", "year": "2014", "outcome": "Guidelines issued for proper investigation before arrest.", "relevance": "Ensures genuine complaints are investigated thoroughly.",
        "steps": ["Step 1: Call the Women's Helpline (1091).", "Step 2: File an FIR at the Women's Police Station under IPC 498A.", "Step 3: Consult a family lawyer."],
        "letter": "Subject: Complaint under IPC Section 498A\n\nRespected Sir/Madam,\n\nI am writing to report severe mental and physical harassment by my husband and his family demanding dowry/cash.\n\nDespite fulfilling initial demands, the torture has increased. I request you to register an FIR and provide protection."
    },
    "Domestic Violence Act": {
        "desc": "Protects women from physical, emotional, verbal, or economic abuse.",
        "helps": "Provides protection orders, residence orders, and monetary relief.",
        "rights": ["Right to reside in shared household", "Right to obtain Protection Order", "Right to claim maintenance"],
        "score": 85, "assess": "Strong", "reason": "Physical or mental abuse in a domestic setting is strictly prohibited. Medical reports strengthen the case.",
        "case": "Satish Chander Ahuja v. Sneha Ahuja", "year": "2020", "outcome": "Supreme Court ruled woman has right to shared household.", "relevance": "Protects from being illegally evicted.",
        "steps": ["Step 1: Contact Protection Officer or Helpline (1091).", "Step 2: File application under DV Act before Magistrate.", "Step 3: Seek medical examination for injuries."],
        "letter": "Subject: Application under Domestic Violence Act\n\nRespected Sir/Madam,\n\nI am facing severe physical and emotional abuse from my husband/family.\n\nThey have made it unsafe for me to live without protection. I request a Protection Order and Residence Order for my safety."
    },
    "POSH Act": {
        "desc": "Prevention of Sexual Harassment at Workplace.",
        "helps": "Mandates employers to resolve sexual harassment complaints and provides legal redressal.",
        "rights": ["Right to a safe working environment", "Right to confidentiality during inquiry", "Right to file complaint with ICC/LCC"],
        "score": 90, "assess": "Very Strong", "reason": "Workplaces must strictly comply with POSH. Any violation is taken very seriously by authorities.",
        "case": "Vishaka v. State of Rajasthan", "year": "1997", "outcome": "Established foundational guidelines against workplace harassment.", "relevance": "Forms the basis of your absolute right to a harassment-free workplace.",
        "steps": ["Step 1: File a written complaint to the Internal Complaints Committee (ICC).", "Step 2: If no ICC exists, approach the Local Complaints Committee (LCC).", "Step 3: You can simultaneously file an FIR under IPC 354."],
        "letter": "Subject: Formal Complaint of Sexual Harassment at Workplace\n\nRespected Sir/Madam,\n\nI am writing to formally report an incident of sexual harassment by a colleague/senior at the workplace.\n\nThis has caused me immense distress. I request the ICC to initiate an immediate and impartial inquiry into the matter."
    },
    
    # Defamation & Intimidation
    "IPC Section 499": {
        "desc": "Defines and penalizes Defamation.",
        "helps": "Allows you to file a criminal defamation suit against someone spreading false, damaging information.",
        "rights": ["Right to protect your reputation", "Right to seek compensation", "Right to demand a public apology"],
        "score": 75, "assess": "Moderate", "reason": "Requires solid proof (written/recorded) that the statement was false and caused actual harm to reputation.",
        "case": "Subramanian Swamy v. Union of India", "year": "2016", "outcome": "Upheld the constitutional validity of criminal defamation.", "relevance": "Confirms your right to criminally prosecute individuals for destroying your reputation.",
        "steps": ["Step 1: Send a legal notice demanding an apology and retraction.", "Step 2: File a criminal complaint before a Magistrate.", "Step 3: File a civil suit for damages/compensation."],
        "letter": "Subject: Complaint for Criminal Defamation\n\nRespected Sir/Madam,\n\nI am filing this complaint against an individual who has maliciously spread false information about me to ruin my reputation.\n\nI have evidence of these defamatory statements and request you to take necessary legal action."
    },
    "IPC Section 506": {
        "desc": "Punishment for criminal intimidation.",
        "helps": "Provides police protection and penalizes those threatening your life, property, or reputation.",
        "rights": ["Right to file an FIR for threats", "Right to police protection", "Right to live without fear"],
        "score": 80, "assess": "Strong", "reason": "Threats of death or grievous hurt (Part II of 506) are serious offenses resulting in immediate police action.",
        "case": "Manik Taneja v. State of Karnataka", "year": "2015", "outcome": "Clarified what constitutes criminal intimidation.", "relevance": "Ensures that genuine threats are punished by law.",
        "steps": ["Step 1: Save all evidence (call recordings, messages).", "Step 2: File an FIR at the local police station.", "Step 3: Request police protection if the threat is imminent."],
        "letter": "Subject: FIR for Criminal Intimidation and Threats\n\nRespected Sir/Madam,\n\nI am writing to urgently report that I am receiving severe threats to my life/property from the accused.\n\nI fear for my safety and request you to register an FIR and provide me with immediate protection."
    },

    # Catch-all generic high-quality template
    "DEFAULT": {
        "desc": "Provides legal remedies and statutory protection for your specific grievance.",
        "helps": "Enables you to seek justice, file a formal complaint, and claim appropriate relief or compensation.",
        "rights": ["Right to immediate legal remedy", "Right to protection from harassment or fraud", "Right to fair investigation"],
        "score": 78, "assess": "Moderate to Strong", "reason": "Based on the facts, you have a valid legal grievance that requires intervention from competent authorities.",
        "case": "Standard Supreme Court Guidelines", "year": "2023", "outcome": "Authorities directed to resolve citizen grievances expeditiously.", "relevance": "Establishes that citizens have a fundamental right to timely legal remedy.",
        "steps": ["Step 1: Send a formal legal notice to the opposite party giving them 15 days to resolve the issue.", "Step 2: File a formal complaint with the relevant authority or police station.", "Step 3: Consult a local advocate for filing a petition/suit in court."],
        "letter": "Subject: Formal Complaint Regarding Legal Violation\n\nRespected Sir/Madam,\n\nI am writing to formally lodge a complaint regarding a severe issue I have faced. This constitutes a direct violation of my legal rights.\n\nI have tried to resolve this amicably but to no avail. I request you to register this complaint and take immediate action to ensure justice is served."
    }
}
