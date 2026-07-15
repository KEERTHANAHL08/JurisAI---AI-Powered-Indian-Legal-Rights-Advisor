import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:5001';

// ─── GLOBAL STYLES ───
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'DM Sans', sans-serif; background: #F0F4F8; color: #1A2332; min-height: 100vh; }

  @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
  @keyframes countUp { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: scale(1); } }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

  .fade-up { animation: fadeUp 0.6s ease both; }
  .fade-up-1 { animation: fadeUp 0.6s ease 0.1s both; }
  .fade-up-2 { animation: fadeUp 0.6s ease 0.2s both; }
  .fade-up-3 { animation: fadeUp 0.6s ease 0.3s both; }
  .fade-up-4 { animation: fadeUp 0.6s ease 0.4s both; }
  .fade-up-5 { animation: fadeUp 0.6s ease 0.5s both; }
  .fade-up-6 { animation: fadeUp 0.6s ease 0.6s both; }

  .card-hover { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
  .card-hover:hover { transform: translateY(-4px); box-shadow: 0 20px 60px rgba(0,0,0,0.12) !important; }

  .btn-primary { transition: all 0.2s ease; }
  .btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 25px rgba(15,118,110,0.35); }
  .btn-primary:active:not(:disabled) { transform: translateY(0); }

  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: #F0F4F8; }
  ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 3px; }
`;

const C = {
  teal: '#0F766E', tealLight: '#14B8A6', tealBg: '#CCFBF1',
  navy: '#1A2332', blue: '#1E40AF', blueBg: '#DBEAFE',
  gold: '#D97706', goldBg: '#FEF3C7', purple: '#6D28D9', purpleBg: '#EDE9FE',
  green: '#059669', greenBg: '#D1FAE5', red: '#DC2626', redBg: '#FEE2E2',
  white: '#FFFFFF', bg: '#F0F4F8', card: '#FFFFFF', border: '#E2E8F0',
  text: '#1A2332', muted: '#64748B', light: '#94A3B8',
};

// ─── LOCAL STORAGE HELPERS ───
const STORAGE_KEY = 'jurisai_cases';

function saveCase(caseData) {
  const existing = getCases();
  const newCase = {
    id: Date.now(),
    date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
    time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    ...caseData
  };
  const updated = [newCase, ...existing].slice(0, 50); // Keep max 50 cases
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return newCase;
}

function getCases() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch { return []; }
}

function deleteCase(id) {
  const updated = getCases().filter(c => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

function clearAllCases() {
  localStorage.removeItem(STORAGE_KEY);
}

// ─── NAVBAR ───
function Navbar({ page, setPage }) {
  const caseCount = getCases().length;
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)',
      borderBottom: `1px solid ${C.border}`, padding: '0 32px',
      height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      boxShadow: '0 1px 20px rgba(0,0,0,0.06)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => setPage('home')}>
        <span style={{ fontSize: '24px' }}>⚖️</span>
        <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '22px', fontWeight: 700, color: C.teal }}>JurisAI</span>
        <span style={{ fontSize: '11px', background: C.tealBg, color: C.teal, padding: '2px 8px', borderRadius: '10px', fontWeight: 600 }}>Beta</span>
      </div>
      <div style={{ display: 'flex', gap: '4px' }}>
        {[
          { id: 'home', label: '🏠 Home' },
          { id: 'analyze', label: '🔍 Analyze' },
          { id: 'dashboard', label: `📊 Dashboard ${caseCount > 0 ? `(${caseCount})` : ''}` },
          { id: 'ipc', label: '📖 IPC Search' },
          { id: 'legalaid', label: '🗺️ Legal Aid' },
          { id: 'about', label: 'ℹ️ About' },
        ].map(nav => (
          <button key={nav.id} onClick={() => setPage(nav.id)} style={{
            padding: '8px 16px', borderRadius: '8px', border: 'none',
            background: page === nav.id ? C.teal : 'transparent',
            color: page === nav.id ? C.white : C.muted,
            fontSize: '13px', fontWeight: 500, cursor: 'pointer',
            fontFamily: 'DM Sans, sans-serif', transition: 'all 0.2s'
          }}>{nav.label}</button>
        ))}
      </div>
    </nav>
  );
}

// ─── HOME PAGE ───
function HomePage({ setPage }) {
  const features = [
    { icon: '🌐', title: 'Multilingual', desc: 'Type in Kannada, Hindi or English — JurisAI understands all Indian languages', color: C.teal, bg: C.tealBg },
    { icon: '🤖', title: 'ML Powered', desc: 'Custom trained TF-IDF + Logistic Regression model classifies your legal situation', color: C.blue, bg: C.blueBg },
    { icon: '💪', title: 'Case Strength', desc: 'Get an objective score showing how strong your legal position is', color: C.purple, bg: C.purpleBg },
    { icon: '⚖️', title: 'Know Your Rights', desc: 'Applicable Indian laws, IPC sections and your rights explained simply', color: C.gold, bg: C.goldBg },
    { icon: '📋', title: 'Case History', desc: 'All your previous analyses saved — revisit any case anytime', color: C.green, bg: C.greenBg },
    { icon: '📄', title: 'Complaint Letter', desc: 'Auto-generated complaint letter ready to submit to police or court', color: C.teal, bg: C.tealBg },
  ];

  return (
    <div style={{ paddingTop: '64px' }}>
      {/* Hero */}
      <div style={{
        background: `linear-gradient(135deg, #ECFDF5 0%, #F0FDFA 40%, #EFF6FF 100%)`,
        padding: '80px 32px 60px', textAlign: 'center', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(15,118,110,0.05)' }} />
        <div style={{ position: 'absolute', bottom: '-40px', left: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(30,64,175,0.04)' }} />

        <div className="fade-up" style={{ fontSize: '64px', marginBottom: '16px' }}>⚖️</div>
        <h1 className="fade-up-1" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 700, color: C.navy, lineHeight: 1.2, marginBottom: '16px' }}>
          Your AI Legal Rights Advisor<br />
          <span style={{ color: C.teal }}>for Every Indian Citizen</span>
        </h1>
        <p className="fade-up-2" style={{ fontSize: '18px', color: C.muted, maxWidth: '560px', margin: '0 auto 32px', lineHeight: 1.7 }}>
          Describe your legal problem in plain language. Get instant guidance on your rights, applicable laws, and a ready-to-submit complaint letter — completely free.
        </p>
        <div className="fade-up-3" style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '40px' }}>
          <button className="btn-primary" onClick={() => setPage('analyze')} style={{
            padding: '14px 32px', background: C.teal, color: C.white,
            border: 'none', borderRadius: '12px', fontSize: '16px',
            fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif'
          }}>🔍 Analyze My Legal Rights</button>
          <button onClick={() => setPage('dashboard')} style={{
            padding: '14px 32px', background: C.white, color: C.teal,
            border: `2px solid ${C.teal}`, borderRadius: '12px', fontSize: '16px',
            fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'all 0.2s'
          }}>📊 View Dashboard</button>
        </div>

        <div className="fade-up-4" style={{ display: 'flex', gap: '32px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            { num: '300+', label: 'Legal Situations Trained' },
            { num: '6+', label: 'Law Domains Covered' },
            { num: '3', label: 'Indian Languages' },
            { num: '₹0', label: 'Cost to Use' },
          ].map((stat, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '32px', fontWeight: 700, color: C.teal }}>{stat.num}</div>
              <div style={{ fontSize: '12px', color: C.light }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div style={{ padding: '60px 32px', maxWidth: '1100px', margin: '0 auto' }}>
        <h2 className="fade-up" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '36px', fontWeight: 700, textAlign: 'center', marginBottom: '8px' }}>Everything You Need</h2>
        <p style={{ textAlign: 'center', color: C.muted, marginBottom: '40px' }}>Complete legal guidance in one place</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {features.map((f, i) => (
            <div key={i} className="card-hover" style={{ background: C.white, borderRadius: '16px', padding: '24px', border: `1px solid ${C.border}`, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', marginBottom: '14px' }}>{f.icon}</div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: C.navy, marginBottom: '6px' }}>{f.title}</h3>
              <p style={{ fontSize: '13px', color: C.muted, lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer style={{ background: C.navy, color: C.light, padding: '32px', textAlign: 'center' }}>
        <div style={{ fontSize: '20px', marginBottom: '8px' }}>⚖️ JurisAI</div>
        <p style={{ fontSize: '13px', marginBottom: '6px' }}>AI Powered Indian Legal Rights Advisor</p>
        <p style={{ fontSize: '11px', color: '#475569' }}>Keerthana H L & Lekhana H — Dept. of ISE, SSIT Tumkur — AY 2025-26</p>
      </footer>
    </div>
  );
}

// ─── ANALYZE PAGE ───
function AnalyzePage({ setPage }) {
  const [situation, setSituation] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('laws');
  const [saved, setSaved] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceLang, setVoiceLang] = useState('en-IN');
  const recognitionRef = React.useRef(null);

  const startVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Voice not supported. Please use Chrome.');
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = voiceLang;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.onstart = () => setListening(true);
    recognition.onresult = (e) => {
      const transcript = Array.from(e.results).map(r => r[0].transcript).join('');
      setSituation(transcript);
    };
    recognition.onerror = (e) => {
      setError('Voice error: ' + e.error + '. Try again.');
      setListening(false);
    };
    recognition.onend = () => setListening(false);
    recognition.start();
  };

  const analyze = async () => {
    if (!situation.trim()) { setError('Please describe your legal situation'); return; }
    setLoading(true); setError(''); setResult(null); setSaved(false);
    try {
      const res = await axios.post(`${API_BASE_URL}/analyze`, { situation });
      setResult(res.data);
      setActiveTab('laws');
      // Auto save to history
      saveCase({
        situation: situation,
        predicted_law: res.data.predicted_law,
        confidence: res.data.confidence,
        detected_language: res.data.detected_language,
        case_strength: res.data.case_strength,
        full_result: res.data
      });
      setSaved(true);
    } catch { setError('Something went wrong. Please check if the backend is running.'); }
    setLoading(false);
  };

  const download = async () => {
    try {
      const res = await axios.post(`${API_BASE_URL}/generate-document`, {
        complaint_letter: result.complaint_letter,
        language: result.detected_language
      });
      const link = document.createElement('a');
      link.href = `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${res.data.document}`;
      link.download = 'JurisAI_Complaint_Letter.docx';
      link.click();
    } catch { setError('Could not generate document.'); }
  };

  const getStrengthData = (score) => {
    if (score >= 75) return { color: C.green, bg: C.greenBg, label: 'Strong Case' };
    if (score >= 50) return { color: C.gold, bg: C.goldBg, label: 'Moderate Case' };
    return { color: C.red, bg: C.redBg, label: 'Weak Case' };
  };

  const getLangFlag = (lang) => {
    if (lang === 'kannada') return '🇮🇳 Kannada detected';
    if (lang === 'hindi') return '🇮🇳 Hindi detected';
    return '🇮🇳 English detected';
  };

  const tabs = [
    { id: 'laws', label: '📜 Laws' },
    { id: 'rights', label: '🛡️ Rights' },
    { id: 'cases', label: '⚖️ Cases' },
    { id: 'steps', label: '🎯 Steps' },
    { id: 'letter', label: '📄 Letter' },
  ];

  return (
    <div style={{ paddingTop: '64px', minHeight: '100vh', background: C.bg }}>
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '40px 24px' }}>
        <div className="fade-up" style={{ marginBottom: '32px' }}>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '36px', fontWeight: 700, color: C.navy, marginBottom: '6px' }}>Analyze Your Legal Situation</h1>
          <p style={{ color: C.muted, fontSize: '15px' }}>Describe your problem in any language — we'll identify your rights instantly</p>
        </div>

        {/* Input Card */}
        <div className="fade-up-1" style={{ background: C.white, borderRadius: '20px', padding: '28px', border: `1px solid ${C.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: C.navy, marginBottom: '10px' }}>📝 Describe your legal situation</label>
          <textarea
            value={situation}
            onChange={e => setSituation(e.target.value)}
            placeholder={`Type in any language...\n\nEnglish: My landlord is not returning my security deposit...\nಕನ್ನಡ: ನನ್ನ ಮಾಲೀಕ ಡೆಪಾಸಿಟ್ ವಾಪಸ್ ಕೊಡ್ತಿಲ್ಲ...\nहिंदी: मेरे मालिक ने डिपॉजिट वापस नहीं किया...`}
            style={{
              width: '100%', minHeight: '160px', padding: '14px 16px', borderRadius: '12px',
              border: `1.5px solid ${situation ? C.teal : C.border}`, fontSize: '14px', lineHeight: '1.6',
              resize: 'vertical', outline: 'none', fontFamily: 'DM Sans, sans-serif',
              color: C.text, background: '#FAFAFA', transition: 'border-color 0.2s', boxSizing: 'border-box'
            }}
          />
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', color: C.muted }}>Supports:</span>
            {['🇮🇳 English', '🇮🇳 ಕನ್ನಡ', '🇮🇳 हिंदी'].map((l, i) => (
              <span key={i} style={{ fontSize: '11px', background: C.tealBg, color: C.teal, padding: '2px 10px', borderRadius: '10px', fontWeight: 500 }}>{l}</span>
            ))}
          </div>

          {/* Voice Input Section */}
          <div style={{ marginTop: '14px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', color: C.muted, fontWeight: 500 }}>🎤 Voice language:</span>
            {[
              { code: 'en-IN', label: 'English' },
              { code: 'kn-IN', label: 'ಕನ್ನಡ' },
              { code: 'hi-IN', label: 'हिंदी' },
            ].map(lang => (
              <button key={lang.code} onClick={() => setVoiceLang(lang.code)} style={{
                padding: '4px 12px', borderRadius: '20px', border: 'none',
                background: voiceLang === lang.code ? C.teal : C.bg,
                color: voiceLang === lang.code ? C.white : C.muted,
                fontSize: '12px', fontWeight: 500, cursor: 'pointer',
                fontFamily: 'DM Sans, sans-serif', transition: 'all 0.2s'
              }}>{lang.label}</button>
            ))}
            <button onClick={startVoice} style={{
              padding: '8px 16px', borderRadius: '10px', border: 'none',
              background: listening ? C.redBg : C.tealBg,
              color: listening ? C.red : C.teal,
              fontSize: '13px', fontWeight: 600, cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif', transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', gap: '6px',
              animation: listening ? 'pulse 1s ease infinite' : 'none'
            }}>
              {listening ? '⏹ Stop' : '🎤 Speak'}
            </button>
            {listening && <span style={{ fontSize: '12px', color: C.red, fontWeight: 500, animation: 'pulse 1s ease infinite' }}>● Recording...</span>}
          </div>

          {error && <div style={{ marginTop: '12px', padding: '10px 14px', background: C.redBg, borderRadius: '8px', color: C.red, fontSize: '13px' }}>⚠️ {error}</div>}

          <button className="btn-primary" onClick={analyze} disabled={loading} style={{
            marginTop: '16px', width: '100%', padding: '14px',
            background: loading ? '#CBD5E1' : `linear-gradient(135deg, ${C.teal}, #0D9488)`,
            color: C.white, border: 'none', borderRadius: '12px', fontSize: '15px',
            fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
          }}>
            {loading ? (
              <><span style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />Analyzing your situation...</>
            ) : '🔍 Analyze My Legal Rights'}
          </button>
        </div>

        {/* Results */}
        {result && (
          <div style={{ animation: 'fadeIn 0.5s ease both' }}>

            {/* Saved badge */}
            {saved && (
              <div style={{ background: C.greenBg, border: `1px solid ${C.green}30`, borderRadius: '10px', padding: '10px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: C.green, fontWeight: 500 }}>
                ✅ Case automatically saved to your history! <span onClick={() => setPage('dashboard')} style={{ textDecoration: 'underline', cursor: 'pointer', marginLeft: '4px' }}>View Dashboard →</span>
              </div>
            )}

            {/* Law Domain Banner */}
            <div style={{ background: C.white, borderRadius: '16px', padding: '20px 24px', border: `1px solid ${C.border}`, marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '11px', background: C.purpleBg, color: C.purple, padding: '4px 10px', borderRadius: '10px', fontWeight: 600 }}>{getLangFlag(result.detected_language)}</span>
                <div>
                  <div style={{ fontSize: '12px', color: C.muted }}>Law Domain Identified</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: C.navy }}>{result.predicted_law}</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '12px', color: C.muted }}>ML Confidence</div>
                <div style={{ fontSize: '22px', fontWeight: 700, color: C.teal, fontFamily: 'Cormorant Garamond, serif' }}>{result.confidence}%</div>
              </div>
            </div>

            {/* Case Strength */}
            {result.case_strength && (() => {
              const s = getStrengthData(result.case_strength.score);
              return (
                <div style={{ background: s.bg, borderRadius: '16px', padding: '20px 24px', border: `1px solid ${s.color}30`, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                  <div style={{ width: '72px', height: '72px', borderRadius: '50%', border: `4px solid ${s.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: C.white }}>
                    <span style={{ fontSize: '18px', fontWeight: 700, color: s.color, fontFamily: 'Cormorant Garamond, serif' }}>{result.case_strength.score}%</span>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: s.color, fontWeight: 600, marginBottom: '2px' }}>CASE STRENGTH</div>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: C.navy, marginBottom: '4px' }}>{result.case_strength.assessment}</div>
                    <div style={{ fontSize: '13px', color: C.muted, maxWidth: '500px' }}>{result.case_strength.reasoning}</div>
                  </div>
                </div>
              );
            })()}

            {/* Tabs */}
            <div style={{ background: C.white, borderRadius: '20px', border: `1px solid ${C.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
              <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}`, overflowX: 'auto', padding: '0 8px' }}>
                {tabs.map(tab => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                    padding: '14px 18px', border: 'none', background: 'none',
                    fontSize: '13px', fontWeight: activeTab === tab.id ? 600 : 400,
                    color: activeTab === tab.id ? C.teal : C.muted,
                    cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                    borderBottom: activeTab === tab.id ? `2px solid ${C.teal}` : '2px solid transparent',
                    marginBottom: '-1px', whiteSpace: 'nowrap', transition: 'all 0.2s'
                  }}>{tab.label}</button>
                ))}
              </div>

              <div style={{ padding: '24px' }}>
                {activeTab === 'laws' && result.applicable_laws && (
                  <div style={{ animation: 'fadeIn 0.3s ease' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: C.navy }}>📜 Applicable Indian Laws</h3>
                    {result.applicable_laws.map((law, i) => (
                      <div key={i} style={{ background: C.bg, borderRadius: '12px', padding: '16px 20px', marginBottom: '12px', borderLeft: `4px solid ${C.teal}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '14px', fontWeight: 700, color: C.navy }}>{law.law_name}</span>
                          <span style={{ fontSize: '11px', background: C.tealBg, color: C.teal, padding: '2px 10px', borderRadius: '10px', fontWeight: 600 }}>§ {law.section}</span>
                        </div>
                        <p style={{ fontSize: '13px', color: C.muted, marginBottom: '8px', lineHeight: 1.6 }}>{law.description}</p>
                        <div style={{ fontSize: '13px', color: C.green, display: 'flex', gap: '6px' }}>✅ {law.how_it_helps}</div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'rights' && result.your_rights && (
                  <div style={{ animation: 'fadeIn 0.3s ease' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: C.navy }}>🛡️ Your Legal Rights</h3>
                    {result.your_rights.map((right, i) => (
                      <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', padding: '14px 16px', background: C.bg, borderRadius: '10px', marginBottom: '10px' }}>
                        <div style={{ width: '28px', height: '28px', minWidth: '28px', background: `linear-gradient(135deg, ${C.teal}, ${C.tealLight})`, borderRadius: '50%', color: C.white, fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</div>
                        <p style={{ fontSize: '14px', color: C.text, lineHeight: 1.6, marginTop: '4px' }}>{right}</p>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'cases' && result.similar_cases && (
                  <div style={{ animation: 'fadeIn 0.3s ease' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: C.navy }}>⚖️ Similar Court Cases</h3>
                    {result.similar_cases.map((c, i) => (
                      <div key={i} style={{ background: C.bg, borderRadius: '12px', padding: '16px 20px', marginBottom: '12px', borderLeft: `4px solid ${C.purple}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '14px', fontWeight: 700, color: C.navy }}>{c.case_name}</span>
                          <span style={{ fontSize: '11px', background: C.purpleBg, color: C.purple, padding: '2px 10px', borderRadius: '10px', fontWeight: 600 }}>{c.year}</span>
                        </div>
                        <p style={{ fontSize: '13px', color: C.muted, marginBottom: '6px', lineHeight: 1.6 }}>{c.outcome}</p>
                        <p style={{ fontSize: '12px', color: C.light }}>Relevance: {c.relevance}</p>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'steps' && result.action_steps && (
                  <div style={{ animation: 'fadeIn 0.3s ease' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: C.navy }}>🎯 What You Should Do Now</h3>
                    {result.action_steps.map((step, i) => (
                      <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', padding: '14px 16px', background: C.bg, borderRadius: '10px', marginBottom: '10px', borderLeft: `4px solid ${C.gold}` }}>
                        <div style={{ width: '28px', height: '28px', minWidth: '28px', background: C.gold, borderRadius: '50%', color: C.white, fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</div>
                        <p style={{ fontSize: '14px', color: C.text, lineHeight: 1.6, marginTop: '4px' }}>{step}</p>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'letter' && result.complaint_letter && (
                  <div style={{ animation: 'fadeIn 0.3s ease' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 600, color: C.navy }}>📄 Auto Generated Complaint Letter</h3>
                      <button onClick={download} style={{ padding: '8px 18px', background: C.green, color: C.white, border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>📥 Download .docx</button>
                    </div>
                    <div style={{ background: '#FAFAFA', borderRadius: '12px', padding: '20px', border: `1px solid ${C.border}`, maxHeight: '340px', overflowY: 'auto', fontSize: '13px', lineHeight: '2', color: C.text, whiteSpace: 'pre-wrap', fontFamily: 'DM Sans, sans-serif' }}>
                      {result.complaint_letter}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button onClick={() => { setResult(null); setSituation(''); setSaved(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }} style={{ marginTop: '16px', width: '100%', padding: '12px', background: 'transparent', color: C.muted, border: `1px solid ${C.border}`, borderRadius: '12px', fontSize: '14px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
              🔄 Analyze Another Situation
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── DASHBOARD PAGE ───
function DashboardPage({ setPage }) {
  const [cases, setCases] = useState([]);
  const [selectedCase, setSelectedCase] = useState(null);
  const [activeTab, setActiveTab] = useState('laws');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => { setCases(getCases()); }, []);

  const handleDelete = (id) => {
    deleteCase(id);
    setCases(getCases());
    if (selectedCase?.id === id) setSelectedCase(null);
  };

  const handleClearAll = () => {
    clearAllCases();
    setCases([]);
    setSelectedCase(null);
    setShowClearConfirm(false);
  };

  // ── Stats ──
  const totalCases = cases.length;
  const avgStrength = cases.length > 0
    ? Math.round(cases.reduce((sum, c) => sum + (c.case_strength?.score || 0), 0) / cases.length)
    : 0;

  const lawCounts = cases.reduce((acc, c) => {
    acc[c.predicted_law] = (acc[c.predicted_law] || 0) + 1;
    return acc;
  }, {});
  const topLaw = Object.entries(lawCounts).sort((a, b) => b[1] - a[1])[0];

  const langCounts = cases.reduce((acc, c) => {
    const lang = c.detected_language || 'english';
    acc[lang] = (acc[lang] || 0) + 1;
    return acc;
  }, {});

  const strongCases = cases.filter(c => (c.case_strength?.score || 0) >= 75).length;

  const getStrengthColor = (score) => {
    if (score >= 75) return C.green;
    if (score >= 50) return C.gold;
    return C.red;
  };

  const getLangEmoji = (lang) => {
    if (lang === 'kannada') return '🇮🇳 Kannada';
    if (lang === 'hindi') return '🇮🇳 Hindi';
    return '🇮🇳 English';
  };

  const tabs = [
    { id: 'laws', label: '📜 Laws' },
    { id: 'rights', label: '🛡️ Rights' },
    { id: 'cases', label: '⚖️ Cases' },
    { id: 'steps', label: '🎯 Steps' },
    { id: 'letter', label: '📄 Letter' },
  ];

  return (
    <div style={{ paddingTop: '64px', minHeight: '100vh', background: C.bg }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>

        {/* Header */}
        <div className="fade-up" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '36px', fontWeight: 700, color: C.navy, marginBottom: '6px' }}>Your Legal Dashboard</h1>
            <p style={{ color: C.muted, fontSize: '15px' }}>Track all your previous legal analyses in one place</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setPage('analyze')} style={{ padding: '10px 20px', background: C.teal, color: C.white, border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
              + New Analysis
            </button>
            {cases.length > 0 && (
              <button onClick={() => setShowClearConfirm(true)} style={{ padding: '10px 20px', background: C.redBg, color: C.red, border: `1px solid ${C.red}30`, borderRadius: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                🗑️ Clear All
              </button>
            )}
          </div>
        </div>

        {/* Clear Confirm */}
        {showClearConfirm && (
          <div style={{ background: C.redBg, border: `1px solid ${C.red}30`, borderRadius: '12px', padding: '16px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <p style={{ color: C.red, fontWeight: 500, fontSize: '14px' }}>⚠️ Are you sure you want to delete all {cases.length} cases? This cannot be undone.</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={handleClearAll} style={{ padding: '8px 16px', background: C.red, color: C.white, border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Yes, Delete All</button>
              <button onClick={() => setShowClearConfirm(false)} style={{ padding: '8px 16px', background: C.white, color: C.muted, border: `1px solid ${C.border}`, borderRadius: '8px', fontSize: '13px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>Cancel</button>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="fade-up-1" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
          {[
            { icon: '📋', label: 'Total Cases Analyzed', value: totalCases, color: C.teal, bg: C.tealBg },
            { icon: '💪', label: 'Average Case Strength', value: totalCases > 0 ? `${avgStrength}%` : '—', color: C.green, bg: C.greenBg },
            { icon: '⚖️', label: 'Top Law Domain', value: topLaw ? topLaw[0].split(' ').slice(0, 2).join(' ') : '—', color: C.purple, bg: C.purpleBg },
            { icon: '🏆', label: 'Strong Cases (75%+)', value: strongCases, color: C.gold, bg: C.goldBg },
          ].map((stat, i) => (
            <div key={i} className="card-hover" style={{ background: C.white, borderRadius: '16px', padding: '20px', border: `1px solid ${C.border}`, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', marginBottom: '12px' }}>{stat.icon}</div>
              <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '28px', fontWeight: 700, color: stat.color, marginBottom: '4px' }}>{stat.value}</div>
              <div style={{ fontSize: '12px', color: C.light }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Language Breakdown */}
        {cases.length > 0 && (
          <div className="fade-up-2" style={{ background: C.white, borderRadius: '16px', padding: '20px 24px', border: `1px solid ${C.border}`, marginBottom: '24px', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: C.navy, marginBottom: '14px' }}>🌐 Cases by Language</h3>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {Object.entries(langCounts).map(([lang, count], i) => (
                <div key={i} style={{ background: C.bg, borderRadius: '10px', padding: '10px 16px', border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '14px' }}>{getLangEmoji(lang)}</span>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: C.teal, fontFamily: 'Cormorant Garamond, serif' }}>{count}</div>
                    <div style={{ fontSize: '11px', color: C.light }}>case{count > 1 ? 's' : ''}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {cases.length === 0 && (
          <div className="fade-up-2" style={{ background: C.white, borderRadius: '20px', padding: '60px', textAlign: 'center', border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
            <h3 style={{ fontSize: '20px', fontWeight: 600, color: C.navy, marginBottom: '8px' }}>No Cases Yet</h3>
            <p style={{ color: C.muted, fontSize: '14px', marginBottom: '24px' }}>Your legal analyses will appear here automatically after you analyze a situation.</p>
            <button onClick={() => setPage('analyze')} style={{ padding: '12px 28px', background: C.teal, color: C.white, border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
              🔍 Analyze Your First Case
            </button>
          </div>
        )}

        {/* Cases List + Detail */}
        {cases.length > 0 && (
          <div className="fade-up-3" style={{ display: 'grid', gridTemplateColumns: selectedCase ? '340px 1fr' : '1fr', gap: '20px', alignItems: 'flex-start' }}>

            {/* Cases List */}
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: C.navy, marginBottom: '14px' }}>📋 Case History ({cases.length})</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '600px', overflowY: 'auto', paddingRight: '4px' }}>
                {cases.map((c, i) => (
                  <div key={c.id} onClick={() => { setSelectedCase(c); setActiveTab('laws'); }}
                    style={{
                      background: selectedCase?.id === c.id ? C.tealBg : C.white,
                      borderRadius: '14px', padding: '16px', cursor: 'pointer',
                      border: `1.5px solid ${selectedCase?.id === c.id ? C.teal : C.border}`,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                      transition: 'all 0.2s'
                    }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <span style={{ fontSize: '11px', background: C.tealBg, color: C.teal, padding: '2px 8px', borderRadius: '8px', fontWeight: 600 }}>
                        {c.predicted_law?.split(' ').slice(0, 3).join(' ')}
                      </span>
                      <button onClick={e => { e.stopPropagation(); handleDelete(c.id); }} style={{ background: 'none', border: 'none', color: C.light, cursor: 'pointer', fontSize: '14px', padding: '0 4px' }}>✕</button>
                    </div>
                    <p style={{ fontSize: '13px', color: C.navy, fontWeight: 500, marginBottom: '8px', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {c.situation}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: getStrengthColor(c.case_strength?.score || 0) }} />
                        <span style={{ fontSize: '11px', color: getStrengthColor(c.case_strength?.score || 0), fontWeight: 600 }}>{c.case_strength?.score || 0}%</span>
                      </div>
                      <span style={{ fontSize: '11px', color: C.light }}>{c.date} · {c.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Case Detail */}
            {selectedCase && (
              <div style={{ background: C.white, borderRadius: '20px', border: `1px solid ${C.border}`, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', overflow: 'hidden', animation: 'fadeIn 0.3s ease' }}>

                {/* Case Header */}
                <div style={{ background: `linear-gradient(135deg, ${C.tealBg}, #EFF6FF)`, padding: '20px 24px', borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                    <span style={{ fontSize: '11px', background: C.white, color: C.teal, padding: '3px 10px', borderRadius: '8px', fontWeight: 600, border: `1px solid ${C.teal}30` }}>{selectedCase.predicted_law}</span>
                    <span style={{ fontSize: '11px', color: C.light }}>{selectedCase.date} at {selectedCase.time}</span>
                  </div>
                  <p style={{ fontSize: '14px', color: C.navy, lineHeight: 1.5, fontWeight: 500 }}>{selectedCase.situation}</p>
                  <div style={{ display: 'flex', gap: '12px', marginTop: '12px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '12px', background: C.white, color: C.teal, padding: '3px 10px', borderRadius: '8px', fontWeight: 600 }}>ML: {selectedCase.confidence}%</span>
                    <span style={{ fontSize: '12px', background: C.white, padding: '3px 10px', borderRadius: '8px', fontWeight: 600, color: getStrengthColor(selectedCase.case_strength?.score || 0) }}>Strength: {selectedCase.case_strength?.score || 0}%</span>
                    <span style={{ fontSize: '12px', background: C.white, color: C.purple, padding: '3px 10px', borderRadius: '8px', fontWeight: 600 }}>{getLangEmoji(selectedCase.detected_language)}</span>
                  </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}`, overflowX: 'auto', padding: '0 8px' }}>
                  {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                      padding: '12px 16px', border: 'none', background: 'none',
                      fontSize: '12px', fontWeight: activeTab === tab.id ? 600 : 400,
                      color: activeTab === tab.id ? C.teal : C.muted,
                      cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                      borderBottom: activeTab === tab.id ? `2px solid ${C.teal}` : '2px solid transparent',
                      marginBottom: '-1px', whiteSpace: 'nowrap'
                    }}>{tab.label}</button>
                  ))}
                </div>

                <div style={{ padding: '20px', maxHeight: '400px', overflowY: 'auto' }}>
                  {activeTab === 'laws' && selectedCase.full_result?.applicable_laws?.map((law, i) => (
                    <div key={i} style={{ background: C.bg, borderRadius: '10px', padding: '14px', marginBottom: '10px', borderLeft: `3px solid ${C.teal}` }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: C.navy, marginBottom: '4px' }}>{law.law_name} — {law.section}</div>
                      <p style={{ fontSize: '12px', color: C.muted, marginBottom: '6px', lineHeight: 1.5 }}>{law.description}</p>
                      <div style={{ fontSize: '12px', color: C.green }}>✅ {law.how_it_helps}</div>
                    </div>
                  ))}

                  {activeTab === 'rights' && selectedCase.full_result?.your_rights?.map((right, i) => (
                    <div key={i} style={{ display: 'flex', gap: '12px', padding: '12px 14px', background: C.bg, borderRadius: '8px', marginBottom: '8px' }}>
                      <div style={{ width: '24px', height: '24px', minWidth: '24px', background: C.teal, borderRadius: '50%', color: C.white, fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</div>
                      <p style={{ fontSize: '13px', color: C.text, lineHeight: 1.5 }}>{right}</p>
                    </div>
                  ))}

                  {activeTab === 'cases' && selectedCase.full_result?.similar_cases?.map((c, i) => (
                    <div key={i} style={{ background: C.bg, borderRadius: '10px', padding: '14px', marginBottom: '10px', borderLeft: `3px solid ${C.purple}` }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: C.navy, marginBottom: '4px' }}>{c.case_name} ({c.year})</div>
                      <p style={{ fontSize: '12px', color: C.muted, lineHeight: 1.5 }}>{c.outcome}</p>
                    </div>
                  ))}

                  {activeTab === 'steps' && selectedCase.full_result?.action_steps?.map((step, i) => (
                    <div key={i} style={{ display: 'flex', gap: '12px', padding: '12px 14px', background: C.bg, borderRadius: '8px', marginBottom: '8px', borderLeft: `3px solid ${C.gold}` }}>
                      <div style={{ width: '24px', height: '24px', minWidth: '24px', background: C.gold, borderRadius: '50%', color: C.white, fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</div>
                      <p style={{ fontSize: '13px', color: C.text, lineHeight: 1.5 }}>{step}</p>
                    </div>
                  ))}

                  {activeTab === 'letter' && (
                    <div style={{ background: '#FAFAFA', borderRadius: '10px', padding: '16px', fontSize: '12px', lineHeight: 2, color: C.text, whiteSpace: 'pre-wrap', fontFamily: 'DM Sans, sans-serif' }}>
                      {selectedCase.full_result?.complaint_letter || 'No letter available'}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ABOUT PAGE ───
function AboutPage() {
  const techStack = [
    { icon: '⚛️', name: 'React.js', role: 'Frontend', desc: 'Multi-page responsive web interface', color: C.teal, bg: C.tealBg },
    { icon: '🐍', name: 'Python Flask', role: 'Backend', desc: 'REST API server with POST endpoints', color: C.blue, bg: C.blueBg },
    { icon: '🧠', name: 'scikit-learn', role: 'ML Model', desc: 'TF-IDF + Logistic Regression classifier', color: C.purple, bg: C.purpleBg },
    { icon: '🤖', name: 'Groq API', role: 'AI Engine', desc: 'LLaMA 3.3 70B for legal analysis', color: C.gold, bg: C.goldBg },
    { icon: '🌐', name: 'deep-translator', role: 'Translation', desc: 'Multilingual Kannada Hindi English', color: C.green, bg: C.greenBg },
    { icon: '📝', name: 'python-docx', role: 'Documents', desc: 'Formal complaint letter generation', color: C.teal, bg: C.tealBg },
  ];

  return (
    <div style={{ paddingTop: '64px', background: C.bg, minHeight: '100vh' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '40px 24px' }}>
        <div className="fade-up" style={{ marginBottom: '40px' }}>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '40px', fontWeight: 700, color: C.navy, marginBottom: '8px' }}>About JurisAI</h1>
          <p style={{ color: C.muted, fontSize: '16px', maxWidth: '600px', lineHeight: 1.7 }}>A complete AI-powered legal rights advisor built with Machine Learning and Large Language Models for Indian citizens.</p>
        </div>

        <div className="fade-up-1" style={{ background: C.white, borderRadius: '20px', padding: '28px', border: `1px solid ${C.border}`, marginBottom: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '26px', fontWeight: 700, marginBottom: '20px', color: C.navy }}>🛠️ Technology Stack</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
            {techStack.map((t, i) => (
              <div key={i} className="card-hover" style={{ background: C.bg, borderRadius: '12px', padding: '16px', border: `1px solid ${C.border}`, display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                <div style={{ width: '44px', height: '44px', minWidth: '44px', borderRadius: '10px', background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>{t.icon}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: C.navy }}>{t.name}</div>
                  <div style={{ fontSize: '11px', color: t.color, fontWeight: 600, marginBottom: '3px' }}>{t.role}</div>
                  <div style={{ fontSize: '12px', color: C.muted }}>{t.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="fade-up-2" style={{ background: C.goldBg, borderRadius: '14px', padding: '18px 22px', border: `1px solid ${C.gold}30`, display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '20px' }}>⚠️</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: '14px', color: C.gold, marginBottom: '4px' }}>Disclaimer</div>
            <p style={{ fontSize: '13px', color: C.muted, lineHeight: 1.6 }}>JurisAI is for legal awareness and educational purposes only. It does not replace professional legal advice. For serious legal matters, please consult a qualified lawyer.</p>
          </div>
        </div>
      </div>
    </div>
  );
}


// ─── IPC DATA ───
const IPC_DATA = [
  { section: "34", title: "Common Intention", punishment: "Same as principal offence", category: "General", desc: "Acts done by several persons in furtherance of common intention — each person liable as if act done by them alone." },
  { section: "107", title: "Abetment", punishment: "Same as offence abetted", category: "General", desc: "Abetment of a thing by instigation, conspiracy, or intentional aid in commission of the act." },
  { section: "120B", title: "Criminal Conspiracy", punishment: "Same as offence conspired", category: "General", desc: "Party to a criminal conspiracy to commit an offence punishable with death or life imprisonment." },
  { section: "147", title: "Rioting", punishment: "Up to 2 years + fine", category: "Public Order", desc: "Whoever is guilty of rioting shall be punished with imprisonment up to 2 years or fine or both." },
  { section: "153A", title: "Promoting Enmity Between Groups", punishment: "Up to 3 years + fine", category: "Public Order", desc: "Promoting enmity between different groups on grounds of religion, race, place of birth, language or region." },
  { section: "166", title: "Public Servant Disobeying Law", punishment: "Up to 1 year + fine", category: "Public Servants", desc: "Public servant disobeying direction of law with intent to cause injury to any person." },
  { section: "186", title: "Obstructing Public Servant", punishment: "Up to 3 months + fine", category: "Public Servants", desc: "Voluntarily obstructs any public servant in discharge of public functions." },
  { section: "191", title: "Giving False Evidence", punishment: "Up to 7 years + fine", category: "False Evidence", desc: "Whoever gives false evidence in judicial proceeding or before public servant legally bound to receive evidence." },
  { section: "201", title: "Causing Disappearance of Evidence", punishment: "Up to 7 years + fine", category: "False Evidence", desc: "Causing disappearance of evidence of an offence committed, or giving false information to screen offender." },
  { section: "211", title: "False Charge of Offence", punishment: "Up to 7 years + fine", category: "False Evidence", desc: "Institution of criminal proceedings or false charge with intent to cause injury." },
  { section: "268", title: "Public Nuisance", punishment: "Fine", category: "Public Health", desc: "Act or omission causing common injury, danger, or annoyance to the public or people in vicinity." },
  { section: "279", title: "Rash Driving", punishment: "Up to 6 months + fine", category: "Public Safety", desc: "Whoever drives any vehicle in a manner so rash or negligent as to endanger human life." },
  { section: "295A", title: "Outraging Religious Feelings", punishment: "Up to 3 years + fine", category: "Religion", desc: "Deliberate and malicious acts intended to outrage religious feelings of any class by insulting its religion." },
  { section: "299", title: "Culpable Homicide", punishment: "Varies", category: "Against Body", desc: "Whoever causes death by doing an act with intention of causing death or with knowledge that act is likely to cause death." },
  { section: "302", title: "Murder", punishment: "Death or life imprisonment + fine", category: "Against Body", desc: "Whoever commits murder shall be punished with death or imprisonment for life and shall also be liable to fine." },
  { section: "304", title: "Culpable Homicide not amounting to Murder", punishment: "Life imprisonment or 10 years + fine", category: "Against Body", desc: "Culpable homicide not amounting to murder — imprisonment for life, or up to 10 years, and fine." },
  { section: "304A", title: "Causing Death by Negligence", punishment: "Up to 2 years + fine", category: "Against Body", desc: "Causing death of any person by doing rash or negligent act not amounting to culpable homicide." },
  { section: "304B", title: "Dowry Death", punishment: "Minimum 7 years to life", category: "Against Women", desc: "Death of woman caused by burns or bodily injury within 7 years of marriage connected to dowry demand." },
  { section: "306", title: "Abetment of Suicide", punishment: "Up to 10 years + fine", category: "Against Body", desc: "If any person commits suicide, whoever abets the commission shall be punished with imprisonment up to 10 years." },
  { section: "307", title: "Attempt to Murder", punishment: "Up to 10 years + fine", category: "Against Body", desc: "Whoever does any act with intention or knowledge that the act would cause death if executed." },
  { section: "323", title: "Voluntarily Causing Hurt", punishment: "Up to 1 year + fine", category: "Against Body", desc: "Whoever voluntarily causes hurt shall be punished with imprisonment up to 1 year or fine up to Rs.1000." },
  { section: "324", title: "Hurt by Dangerous Weapons", punishment: "Up to 3 years + fine", category: "Against Body", desc: "Voluntarily causing hurt by dangerous weapon — imprisonment up to 3 years or fine or both." },
  { section: "325", title: "Grievous Hurt", punishment: "Up to 7 years + fine", category: "Against Body", desc: "Voluntarily causing grievous hurt — imprisonment up to 7 years and fine." },
  { section: "326A", title: "Acid Attack", punishment: "Minimum 10 years to life + fine", category: "Against Body", desc: "Causing permanent or partial damage by throwing acid — minimum 10 years to life." },
  { section: "341", title: "Wrongful Restraint", punishment: "Up to 1 month + fine", category: "Against Body", desc: "Whoever wrongfully restrains any person — imprisonment up to 1 month or fine up to Rs.500." },
  { section: "342", title: "Wrongful Confinement", punishment: "Up to 1 year + fine", category: "Against Body", desc: "Whoever wrongfully confines any person — imprisonment up to 1 year or fine up to Rs.1000." },
  { section: "351", title: "Assault", punishment: "Up to 3 months + fine", category: "Against Body", desc: "Whoever makes any gesture intending to cause apprehension of criminal force commits assault." },
  { section: "354", title: "Assault on Woman", punishment: "1-5 years + fine", category: "Against Women", desc: "Assault or criminal force to woman with intent to outrage her modesty — minimum 1 year." },
  { section: "354A", title: "Sexual Harassment", punishment: "Up to 3 years + fine", category: "Against Women", desc: "Physical contact, demand for sexual favours, showing pornography, or making sexually coloured remarks." },
  { section: "354B", title: "Assault to Disrobe", punishment: "3-7 years + fine", category: "Against Women", desc: "Assault with intent to disrobe or compel woman to be naked — 3 to 7 years." },
  { section: "354C", title: "Voyeurism", punishment: "1-3 years first offence", category: "Against Women", desc: "Watching or capturing image of woman engaging in private act without her consent." },
  { section: "354D", title: "Stalking", punishment: "Up to 3 years", category: "Against Women", desc: "Following, contacting, or monitoring a woman despite clear indication of disinterest." },
  { section: "363", title: "Kidnapping", punishment: "Up to 7 years + fine", category: "Kidnapping", desc: "Whoever kidnaps any person from India or from lawful guardianship." },
  { section: "364A", title: "Kidnapping for Ransom", punishment: "Death or life imprisonment", category: "Kidnapping", desc: "Kidnapping or abducting and threatening to cause death and detaining person for ransom." },
  { section: "366", title: "Kidnapping Woman to Compel Marriage", punishment: "Up to 10 years + fine", category: "Kidnapping", desc: "Kidnapping or abducting a woman to compel her to marry against her will." },
  { section: "375", title: "Rape", punishment: "7 years to life + fine", category: "Sexual Offences", desc: "Sexual assault without consent. Includes penile penetration, insertion of object without consent." },
  { section: "376", title: "Punishment for Rape", punishment: "Minimum 10 years to life + fine", category: "Sexual Offences", desc: "Rigorous imprisonment not less than 10 years, may extend to life imprisonment, with fine." },
  { section: "376D", title: "Gang Rape", punishment: "Minimum 20 years to life + fine", category: "Sexual Offences", desc: "Woman raped by one or more persons constituting a group — each punished with minimum 20 years." },
  { section: "378", title: "Theft", punishment: "Varies", category: "Theft", desc: "Whoever intending to take dishonestly any moveable property out of possession of any person without consent." },
  { section: "379", title: "Punishment for Theft", punishment: "Up to 3 years + fine", category: "Theft", desc: "Whoever commits theft shall be punished with imprisonment up to 3 years or fine or both." },
  { section: "380", title: "Theft in Dwelling House", punishment: "Up to 7 years + fine", category: "Theft", desc: "Theft committed in any building, tent, or vessel used as human dwelling — up to 7 years." },
  { section: "383", title: "Extortion", punishment: "Up to 3 years + fine", category: "Extortion", desc: "Intentionally putting a person in fear of injury to dishonestly deliver property." },
  { section: "384", title: "Punishment for Extortion", punishment: "Up to 3 years + fine", category: "Extortion", desc: "Whoever commits extortion shall be punished with imprisonment up to 3 years or fine or both." },
  { section: "390", title: "Robbery", punishment: "Up to 10 years + fine", category: "Robbery", desc: "Theft is robbery if offender causes or attempts to cause death, hurt, or wrongful restraint." },
  { section: "392", title: "Punishment for Robbery", punishment: "Up to 10 years + fine", category: "Robbery", desc: "Whoever commits robbery shall be punished with rigorous imprisonment up to 10 years." },
  { section: "395", title: "Dacoity", punishment: "Life imprisonment or 10 years + fine", category: "Robbery", desc: "When robbery is committed by 5 or more persons conjointly — every person is guilty of dacoity." },
  { section: "406", title: "Criminal Breach of Trust", punishment: "Up to 3 years + fine", category: "Breach of Trust", desc: "Dishonest misappropriation or conversion of property by a person entrusted with it." },
  { section: "415", title: "Cheating", punishment: "Varies", category: "Cheating", desc: "Deceiving any person fraudulently or dishonestly inducing that person to deliver property." },
  { section: "417", title: "Punishment for Cheating", punishment: "Up to 1 year + fine", category: "Cheating", desc: "Whoever cheats shall be punished with imprisonment up to 1 year or with fine or with both." },
  { section: "420", title: "Cheating and Dishonestly Inducing Delivery", punishment: "Up to 7 years + fine", category: "Cheating", desc: "Cheating and thereby dishonestly inducing the person deceived to deliver property." },
  { section: "425", title: "Mischief", punishment: "Varies", category: "Mischief", desc: "Whoever with intent to cause wrongful loss or damage to property of any person." },
  { section: "427", title: "Mischief causing Damage", punishment: "Up to 2 years + fine", category: "Mischief", desc: "Mischief causing loss or damage to property of value of Rs.50 or more." },
  { section: "441", title: "Criminal Trespass", punishment: "Up to 3 months + fine", category: "Trespass", desc: "Entering property in possession of another with intent to commit offence or intimidate the person." },
  { section: "447", title: "Punishment for Criminal Trespass", punishment: "Up to 3 months + fine", category: "Trespass", desc: "Whoever commits criminal trespass shall be punished with imprisonment up to 3 months or fine up to Rs.500." },
  { section: "448", title: "House Trespass", punishment: "Up to 1 year + fine", category: "Trespass", desc: "Committing criminal trespass by entering into any building used as dwelling." },
  { section: "463", title: "Forgery", punishment: "Up to 2 years + fine", category: "Forgery", desc: "Making false document with intent to cause damage or injury to the public or any person." },
  { section: "465", title: "Punishment for Forgery", punishment: "Up to 2 years + fine", category: "Forgery", desc: "Whoever commits forgery shall be punished with imprisonment up to 2 years or fine or both." },
  { section: "468", title: "Forgery for Purpose of Cheating", punishment: "Up to 7 years + fine", category: "Forgery", desc: "Committing forgery intending that the document forged shall be used for cheating." },
  { section: "471", title: "Using Forged Document as Genuine", punishment: "Same as forgery", category: "Forgery", desc: "Whoever fraudulently uses as genuine any document known to be forged." },
  { section: "489A", title: "Counterfeiting Currency", punishment: "Life imprisonment or 10 years + fine", category: "Currency", desc: "Counterfeiting or knowingly performing any part of process of counterfeiting currency note or bank note." },
  { section: "498A", title: "Cruelty by Husband or Relatives", punishment: "Up to 3 years + fine", category: "Against Women", desc: "Husband or his relatives subjecting a woman to cruelty — physical or mental. Includes dowry demand. Non-bailable." },
  { section: "499", title: "Defamation", punishment: "Up to 2 years + fine", category: "Defamation", desc: "Whoever makes or publishes any imputation concerning any person intending to harm their reputation." },
  { section: "500", title: "Punishment for Defamation", punishment: "Up to 2 years + fine", category: "Defamation", desc: "Whoever defames another shall be punished with simple imprisonment up to 2 years or fine or both." },
  { section: "503", title: "Criminal Intimidation", punishment: "Up to 2 years + fine", category: "Intimidation", desc: "Threatening another with injury to person, reputation, or property to cause alarm." },
  { section: "506", title: "Punishment for Criminal Intimidation", punishment: "Up to 2 years (7 years if serious threat)", category: "Intimidation", desc: "If threat is of death or grievous hurt — up to 7 years imprisonment." },
  { section: "509", title: "Insulting Modesty of Woman", punishment: "Up to 3 years + fine", category: "Against Women", desc: "Word, sound, gesture intending to insult modesty of a woman or intruding upon privacy of a woman." },
];

// ─── LEGAL AID DATA ───
const LEGAL_AID_DATA = [
  { state: "National", city: "New Delhi", name: "National Legal Services Authority (NALSA)", address: "12/11, Jam Nagar House, Shahjahan Road, New Delhi - 110011", phone: "011-23382778", helpline: "15100", type: "NALSA" },
  { state: "National", city: "Toll Free", name: "NALSA Toll Free Legal Aid Helpline", address: "Accessible from anywhere in India", phone: "15100", helpline: "15100", type: "Helpline" },
  { state: "Karnataka", city: "Bengaluru", name: "Karnataka State Legal Services Authority", address: "High Court of Karnataka, Ambedkar Veedhi, Bengaluru - 560001", phone: "080-22867597", helpline: "1800-425-9385", type: "SLSA" },
  { state: "Karnataka", city: "Tumkur", name: "District Legal Services Authority Tumkur", address: "District Court Complex, B.H. Road, Tumkur - 572101", phone: "0816-2272364", helpline: "1800-425-9385", type: "DLSA" },
  { state: "Karnataka", city: "Mysuru", name: "District Legal Services Authority Mysuru", address: "District Court Complex, Mysuru - 570001", phone: "0821-2421013", helpline: "1800-425-9385", type: "DLSA" },
  { state: "Karnataka", city: "Mangaluru", name: "District Legal Services Authority Dakshina Kannada", address: "District Court Complex, Mangaluru - 575001", phone: "0824-2421013", helpline: "1800-425-9385", type: "DLSA" },
  { state: "Karnataka", city: "Hubballi", name: "District Legal Services Authority Dharwad", address: "District Court Complex, Hubballi - 580001", phone: "0836-2747013", helpline: "1800-425-9385", type: "DLSA" },
  { state: "Karnataka", city: "Belagavi", name: "District Legal Services Authority Belagavi", address: "District Court Complex, Belagavi - 590001", phone: "0831-2421100", helpline: "1800-425-9385", type: "DLSA" },
  { state: "Karnataka", city: "Shivamogga", name: "District Legal Services Authority Shivamogga", address: "District Court Complex, Shivamogga - 577201", phone: "08182-222013", helpline: "1800-425-9385", type: "DLSA" },
  { state: "Karnataka", city: "Kalaburagi", name: "District Legal Services Authority Kalaburagi", address: "District Court Complex, Kalaburagi - 585101", phone: "08472-264013", helpline: "1800-425-9385", type: "DLSA" },
  { state: "Karnataka", city: "Ballari", name: "District Legal Services Authority Ballari", address: "District Court Complex, Ballari - 583101", phone: "08392-272013", helpline: "1800-425-9385", type: "DLSA" },
  { state: "Maharashtra", city: "Mumbai", name: "Maharashtra State Legal Services Authority", address: "High Court of Bombay, Fort, Mumbai - 400032", phone: "022-22671911", helpline: "1800-22-7000", type: "SLSA" },
  { state: "Maharashtra", city: "Pune", name: "District Legal Services Authority Pune", address: "District Court Complex, Shivajinagar, Pune - 411005", phone: "020-25532013", helpline: "1800-22-7000", type: "DLSA" },
  { state: "Maharashtra", city: "Nagpur", name: "District Legal Services Authority Nagpur", address: "District Court Complex, Civil Lines, Nagpur - 440001", phone: "0712-2568013", helpline: "1800-22-7000", type: "DLSA" },
  { state: "Delhi", city: "New Delhi", name: "Delhi State Legal Services Authority", address: "Patiala House Courts Complex, New Delhi - 110001", phone: "011-23384559", helpline: "1516", type: "SLSA" },
  { state: "Tamil Nadu", city: "Chennai", name: "Tamil Nadu State Legal Services Authority", address: "High Court Campus, Chennai - 600104", phone: "044-25333300", helpline: "1800-425-3555", type: "SLSA" },
  { state: "Tamil Nadu", city: "Coimbatore", name: "District Legal Services Authority Coimbatore", address: "District Court, Coimbatore - 641018", phone: "0422-2399013", helpline: "1800-425-3555", type: "DLSA" },
  { state: "Telangana", city: "Hyderabad", name: "Telangana State Legal Services Authority", address: "High Court of Telangana, Nayapul, Hyderabad - 500028", phone: "040-23220660", helpline: "1800-599-4455", type: "SLSA" },
  { state: "Kerala", city: "Ernakulam", name: "Kerala State Legal Services Authority", address: "High Court of Kerala, Ernakulam - 682031", phone: "0484-2395671", helpline: "1800-4255-1056", type: "SLSA" },
  { state: "Andhra Pradesh", city: "Amaravati", name: "Andhra Pradesh State Legal Services Authority", address: "High Court of AP, Amaravati - 522503", phone: "0863-2344500", helpline: "1800-425-2288", type: "SLSA" },
  { state: "West Bengal", city: "Kolkata", name: "West Bengal State Legal Services Authority", address: "Calcutta High Court, Strand Road, Kolkata - 700001", phone: "033-22435221", helpline: "1800-345-0300", type: "SLSA" },
  { state: "Gujarat", city: "Ahmedabad", name: "Gujarat State Legal Services Authority", address: "High Court of Gujarat, Sola, Ahmedabad - 380060", phone: "079-27660065", helpline: "1800-233-8477", type: "SLSA" },
  { state: "Rajasthan", city: "Jaipur", name: "Rajasthan State Legal Services Authority", address: "High Court of Rajasthan, Jodhpur - 342001", phone: "0291-2544451", helpline: "1800-180-6127", type: "SLSA" },
  { state: "Madhya Pradesh", city: "Jabalpur", name: "Madhya Pradesh State Legal Services Authority", address: "High Court of MP, Jabalpur - 482001", phone: "0761-2628712", helpline: "1800-233-1882", type: "SLSA" },
  { state: "Uttar Pradesh", city: "Allahabad", name: "UP State Legal Services Authority", address: "High Court of Allahabad, Allahabad - 211001", phone: "0532-2623393", helpline: "1800-180-5232", type: "SLSA" },
  { state: "Punjab", city: "Chandigarh", name: "Punjab State Legal Services Authority", address: "Punjab and Haryana High Court, Chandigarh - 160001", phone: "0172-2748013", helpline: "1800-180-7676", type: "SLSA" },
  { state: "Haryana", city: "Chandigarh", name: "Haryana State Legal Services Authority", address: "Punjab and Haryana High Court, Chandigarh - 160001", phone: "0172-2749013", helpline: "1800-180-9088", type: "SLSA" },
  { state: "Bihar", city: "Patna", name: "Bihar State Legal Services Authority", address: "High Court of Patna, Patna - 800001", phone: "0612-2225588", helpline: "1800-345-6195", type: "SLSA" },
  { state: "Odisha", city: "Cuttack", name: "Odisha State Legal Services Authority", address: "Orissa High Court, Cuttack - 753002", phone: "0671-2305013", helpline: "1800-345-6770", type: "SLSA" },
  { state: "Assam", city: "Guwahati", name: "Assam State Legal Services Authority", address: "Gauhati High Court, Guwahati - 781001", phone: "0361-2735013", helpline: "1800-345-3614", type: "SLSA" },
  { state: "National", city: "New Delhi", name: "National Commission for Women", address: "Plot No. 21, Jasola Institutional Area, New Delhi - 110025", phone: "7827-170-170", helpline: "7827-170-170", type: "Women" },
];

// ─── IPC SEARCH PAGE ───
function IPCPage() {
  const [query, setQuery] = React.useState('');
  const [selected, setSelected] = React.useState(null);

  const results = query.trim()
    ? IPC_DATA.filter(item =>
        item.section.includes(query) ||
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.desc.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase()) ||
        item.punishment.toLowerCase().includes(query.toLowerCase())
      )
    : IPC_DATA;

  return (
    <div style={{ paddingTop: '64px', minHeight: '100vh', background: '#F0F4F8' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 24px' }}>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '36px', fontWeight: 700, color: '#1A2332', marginBottom: '6px' }}>
          📖 IPC Section Search
        </h1>
        <p style={{ color: '#64748B', fontSize: '15px', marginBottom: '24px' }}>Search {IPC_DATA.length} Indian Penal Code sections by number, title or keyword</p>

        {/* Search */}
        <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', border: '1px solid #E2E8F0', marginBottom: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <input
            value={query}
            onChange={e => { setQuery(e.target.value); setSelected(null); }}
            placeholder="Search by section number (e.g. 420) or keyword (e.g. theft, murder, assault)..."
            style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', border: `1.5px solid ${query ? '#0F766E' : '#E2E8F0'}`, fontSize: '14px', outline: 'none', fontFamily: 'DM Sans, sans-serif', color: '#1A2332', background: '#FAFAFA', boxSizing: 'border-box' }}
          />
          <div style={{ display: 'flex', gap: '6px', marginTop: '12px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', color: '#94A3B8' }}>Quick:</span>
            {['302', '354', '379', '406', '420', '441', '498A', '503', 'murder', 'theft', 'rape', 'assault'].map(q => (
              <button key={q} onClick={() => setQuery(q)} style={{ padding: '3px 10px', borderRadius: '12px', border: '1px solid #E2E8F0', background: query === q ? '#CCFBF1' : '#fff', color: query === q ? '#0F766E' : '#94A3B8', fontSize: '11px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>{q}</button>
            ))}
          </div>
        </div>

        <p style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '16px' }}>Showing {results.length} of {IPC_DATA.length} sections</p>

        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1fr' : 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '65vh', overflowY: 'auto', paddingRight: '4px' }}>
            {results.map((item, i) => (
              <div key={i} onClick={() => setSelected(selected?.section === item.section ? null : item)}
                style={{ background: selected?.section === item.section ? '#CCFBF1' : '#fff', borderRadius: '12px', padding: '14px 16px', border: `1.5px solid ${selected?.section === item.section ? '#0F766E' : '#E2E8F0'}`, cursor: 'pointer', transition: 'all 0.2s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span style={{ fontSize: '11px', background: '#CCFBF1', color: '#0F766E', padding: '2px 8px', borderRadius: '8px', fontWeight: 700 }}>IPC {item.section}</span>
                  <span style={{ fontSize: '10px', background: '#F0F4F8', color: '#94A3B8', padding: '2px 6px', borderRadius: '6px' }}>{item.category}</span>
                </div>
                <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#1A2332', marginBottom: '4px' }}>{item.title}</h3>
                <p style={{ fontSize: '11px', color: '#DC2626', fontWeight: 500 }}>⚖️ {item.punishment}</p>
              </div>
            ))}
          </div>

          {selected && (
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', position: 'sticky', top: '80px' }}>
              <div style={{ background: 'linear-gradient(135deg, #CCFBF1, #EFF6FF)', padding: '20px 24px', borderBottom: '1px solid #E2E8F0' }}>
                <span style={{ fontSize: '11px', background: '#fff', color: '#0F766E', padding: '3px 10px', borderRadius: '8px', fontWeight: 700, border: '1px solid rgba(15,118,110,0.2)', display: 'inline-block', marginBottom: '10px' }}>IPC Section {selected.section}</span>
                <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '22px', fontWeight: 700, color: '#1A2332', marginBottom: '8px' }}>{selected.title}</h2>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#FEE2E2', padding: '6px 12px', borderRadius: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#DC2626' }}>⚖️ {selected.punishment}</span>
                </div>
              </div>
              <div style={{ padding: '20px 24px' }}>
                <h4 style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>Description</h4>
                <p style={{ fontSize: '14px', color: '#1A2332', lineHeight: 1.7, marginBottom: '16px' }}>{selected.desc}</p>
                <div style={{ padding: '14px', background: '#FEF3C7', borderRadius: '10px', border: '1px solid rgba(217,119,6,0.2)' }}>
                  <p style={{ fontSize: '12px', color: '#D97706', fontWeight: 600, marginBottom: '4px' }}>💡 What to do</p>
                  <p style={{ fontSize: '12px', color: '#64748B', lineHeight: 1.5 }}>File an FIR at your nearest police station mentioning IPC Section {selected.section}. Use JurisAI Analyze feature for complete legal guidance and complaint letter.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── LEGAL AID PAGE ───
function LegalAidPage() {
  const [selectedState, setSelectedState] = React.useState('All');
  const [search, setSearch] = React.useState('');
  const [selected, setSelected] = React.useState(null);

  const states = ['All', ...new Set(LEGAL_AID_DATA.map(c => c.state))];

  const filtered = LEGAL_AID_DATA.filter(c => {
    const matchState = selectedState === 'All' || c.state === selectedState;
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.city.toLowerCase().includes(search.toLowerCase()) || c.state.toLowerCase().includes(search.toLowerCase());
    return matchState && matchSearch;
  });

  const getTypeColor = (type) => {
    if (type === 'NALSA') return { color: '#D97706', bg: '#FEF3C7' };
    if (type === 'SLSA') return { color: '#0F766E', bg: '#CCFBF1' };
    if (type === 'Helpline') return { color: '#059669', bg: '#D1FAE5' };
    if (type === 'Women') return { color: '#6D28D9', bg: '#EDE9FE' };
    return { color: '#1E40AF', bg: '#DBEAFE' };
  };

  return (
    <div style={{ paddingTop: '64px', minHeight: '100vh', background: '#F0F4F8' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' }}>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '36px', fontWeight: 700, color: '#1A2332', marginBottom: '6px' }}>
          🗺️ Find Legal Aid Near You
        </h1>
        <p style={{ color: '#64748B', fontSize: '15px', marginBottom: '20px' }}>All services are completely FREE for eligible citizens</p>

        {/* NALSA Helpline Banner */}
        <div style={{ background: 'linear-gradient(135deg, #0F766E, #0D9488)', borderRadius: '16px', padding: '20px 24px', marginBottom: '20px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '4px', fontWeight: 600, letterSpacing: '1px' }}>NATIONAL TOLL FREE HELPLINE — 24/7</div>
            <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '40px', fontWeight: 700 }}>15100</div>
            <div style={{ fontSize: '13px', opacity: 0.8 }}>NALSA Legal Aid — Free from any phone in India</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '13px', fontWeight: 600 }}>Karnataka: 1800-425-9385</div>
            <div style={{ fontSize: '13px', fontWeight: 600 }}>Delhi: 1516</div>
            <div style={{ fontSize: '13px', fontWeight: 600 }}>Women Helpline: 7827-170-170</div>
          </div>
        </div>

        {/* Filters */}
        <div style={{ background: '#fff', borderRadius: '14px', padding: '16px 20px', border: '1px solid #E2E8F0', marginBottom: '20px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by city or center name..." style={{ flex: '1', minWidth: '200px', padding: '10px 14px', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '13px', outline: 'none', fontFamily: 'DM Sans, sans-serif' }} />
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {states.map(state => (
              <button key={state} onClick={() => setSelectedState(state)} style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', background: selectedState === state ? '#0F766E' : '#F0F4F8', color: selectedState === state ? '#fff' : '#64748B', fontSize: '11px', fontWeight: 500, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', transition: 'all 0.2s' }}>{state}</button>
            ))}
          </div>
        </div>

        <p style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '16px' }}>Showing {filtered.length} centers</p>

        <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 1fr' : 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '65vh', overflowY: 'auto', paddingRight: '4px' }}>
            {filtered.map((center, i) => {
              const tc = getTypeColor(center.type);
              return (
                <div key={i} onClick={() => setSelected(selected?.name === center.name ? null : center)}
                  style={{ background: selected?.name === center.name ? '#CCFBF1' : '#fff', borderRadius: '14px', padding: '16px 20px', border: `1.5px solid ${selected?.name === center.name ? '#0F766E' : '#E2E8F0'}`, cursor: 'pointer', transition: 'all 0.2s' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', background: tc.bg, color: tc.color, padding: '3px 8px', borderRadius: '8px', fontWeight: 700 }}>{center.type}</span>
                    <span style={{ fontSize: '11px', background: '#D1FAE5', color: '#059669', padding: '3px 8px', borderRadius: '8px', fontWeight: 600 }}>FREE</span>
                  </div>
                  <h3 style={{ fontSize: '13px', fontWeight: 700, color: '#1A2332', marginBottom: '4px', lineHeight: 1.4 }}>{center.name}</h3>
                  <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '4px' }}>📍 {center.city}, {center.state}</p>
                  <p style={{ fontSize: '13px', color: '#0F766E', fontWeight: 600 }}>📞 {center.phone}</p>
                </div>
              );
            })}
          </div>

          {selected && (() => {
            const tc = getTypeColor(selected.type);
            return (
              <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', position: 'sticky', top: '80px' }}>
                <div style={{ background: 'linear-gradient(135deg, #CCFBF1, #EFF6FF)', padding: '20px 24px', borderBottom: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '11px', background: tc.bg, color: tc.color, padding: '3px 10px', borderRadius: '8px', fontWeight: 700 }}>{selected.type}</span>
                    <span style={{ fontSize: '11px', background: '#D1FAE5', color: '#059669', padding: '3px 10px', borderRadius: '8px', fontWeight: 700 }}>FREE SERVICE</span>
                  </div>
                  <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '20px', fontWeight: 700, color: '#1A2332', lineHeight: 1.3 }}>{selected.name}</h2>
                </div>
                <div style={{ padding: '20px 24px' }}>
                  <div style={{ padding: '12px 14px', background: '#F0F4F8', borderRadius: '10px', borderLeft: '3px solid #0F766E', marginBottom: '12px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#0F766E', marginBottom: '4px' }}>ADDRESS</div>
                    <p style={{ fontSize: '13px', color: '#1A2332', lineHeight: 1.5 }}>📍 {selected.address}</p>
                  </div>
                  <div style={{ padding: '12px 14px', background: '#F0F4F8', borderRadius: '10px', borderLeft: '3px solid #059669', marginBottom: '12px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#059669', marginBottom: '4px' }}>CONTACT</div>
                    <p style={{ fontSize: '20px', fontWeight: 700, color: '#1A2332', fontFamily: 'Cormorant Garamond, serif' }}>📞 {selected.phone}</p>
                    {selected.helpline && selected.helpline !== selected.phone && (
                      <p style={{ fontSize: '13px', color: '#059669', marginTop: '4px' }}>Helpline: {selected.helpline}</p>
                    )}
                  </div>
                  <div style={{ padding: '14px', background: '#FEF3C7', borderRadius: '10px', border: '1px solid rgba(217,119,6,0.2)', marginBottom: '12px' }}>
                    <p style={{ fontSize: '12px', color: '#D97706', fontWeight: 600, marginBottom: '6px' }}>✅ Who is eligible for FREE legal aid?</p>
                    {['SC/ST persons', 'Women and children', 'Persons with disabilities', 'Industrial workmen', 'Persons in custody', 'Income below Rs.1 lakh/year'].map((item, i) => (
                      <div key={i} style={{ fontSize: '12px', color: '#64748B', display: 'flex', gap: '6px', marginBottom: '3px' }}>
                        <span style={{ color: '#059669' }}>✓</span>{item}
                      </div>
                    ))}
                  </div>
                  <button onClick={() => window.open(`https://www.google.com/maps/search/${encodeURIComponent(selected.name + ' ' + selected.city)}`, '_blank')}
                    style={{ width: '100%', padding: '12px', background: '#0F766E', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                    🗺️ Open in Google Maps
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ───
export default function App() {
  const [page, setPage] = useState('home');

  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = globalStyles;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [page]);

  return (
    <div>
      <Navbar page={page} setPage={setPage} />
      {page === 'home' && <HomePage setPage={setPage} />}
      {page === 'analyze' && <AnalyzePage setPage={setPage} />}
      {page === 'dashboard' && <DashboardPage setPage={setPage} />}
      {page === 'about' && <AboutPage />}
      {page === 'ipc' && <IPCPage />}
      {page === 'legalaid' && <LegalAidPage />}
    </div>
  );
}

