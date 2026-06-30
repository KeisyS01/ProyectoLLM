import { useState } from 'react';
import { InterviewContainer } from './modules/module1_interview/InterviewContainer';
import { DebugTranslator } from './modules/module2_translator/DebugTranslator';
import { ReportDashboard } from './modules/module3_synthesizer/ReportDashboard';
import { translateFreeTextToClinicalRecord } from './modules/module2_translator/clinicalTranslator';
import type { ClinicalRecord } from './types';
import { 
  Heart, MessageSquare, ClipboardList, Shield, 
  Settings, Key, AlertCircle, CheckCircle2 
} from 'lucide-react';

type TabType = 'interview' | 'debug_translation' | 'dashboard';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('interview');
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('gemini_api_key') || '';
  });
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [testKeyStatus, setTestKeyStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');

  // Translation states
  const [rawTranscript, setRawTranscript] = useState<string>('');
  const [structuredData, setStructuredData] = useState<Omit<ClinicalRecord, 'id_registro' | 'fecha_registro'> | null>(null);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const handleSaveApiKey = (key: string) => {
    const trimmed = key.trim();
    setApiKey(trimmed);
    localStorage.setItem('gemini_api_key', trimmed);
    if (trimmed.length > 20) {
      setTestKeyStatus('valid');
    } else if (trimmed === '') {
      setTestKeyStatus('idle');
    } else {
      setTestKeyStatus('invalid');
    }
  };

  const handleRecordCreated = async (rawText: string) => {
    setRawTranscript(rawText);
    setIsTranslating(true);
    setActiveTab('debug_translation');
    
    try {
      const result = await translateFreeTextToClinicalRecord(rawText, apiKey);
      setStructuredData(result);
    } catch (e) {
      console.error('Translation error', e);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleRecordSaved = () => {
    setRawTranscript('');
    setStructuredData(null);
    setRefreshTrigger(prev => prev + 1);
    setActiveTab('dashboard');
  };

  const handleCancelTranslation = () => {
    setRawTranscript('');
    setStructuredData(null);
    setActiveTab('interview');
  };

  return (
    <div className="app-container">
      
      {/* Premium Header */}
      <header className="app-header no-print">
        <div className="header-inner">
          <div className="brand-section">
            <div className="brand-logo-container">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h1 className="brand-title">PediatraAI</h1>
              <span className="brand-subtitle">Seguimiento de Salud Infantil</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="nav-tabs">
            <button
              onClick={() => setActiveTab('interview')}
              className={`tab-btn ${activeTab === 'interview' ? 'active' : ''}`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Entrevista
            </button>
            
            {rawTranscript && (
              <button
                onClick={() => setActiveTab('debug_translation')}
                className={`tab-btn ${activeTab === 'debug_translation' ? 'active' : ''}`}
              >
                <Shield className="w-3.5 h-3.5" />
                Traductor
              </button>
            )}

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            >
              <ClipboardList className="w-3.5 h-3.5" />
              Historial y Reporte
            </button>
          </nav>

          {/* Settings API button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="btn-icon"
              style={{
                background: apiKey ? 'rgba(0, 184, 148, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                color: apiKey ? '#55efc4' : '#94a3b8',
                borderColor: apiKey ? 'rgba(0, 184, 148, 0.2)' : 'rgba(255, 255, 255, 0.08)'
              }}
              title="Configuración de IA"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Settings / API Key Overlay Panel */}
      {showSettings && (
        <div className="api-bar no-print animate-fade-in">
          <div className="api-bar-info">
            <h3>
              <Key className="w-4 h-4 text-indigo-400" />
              Motor de Inteligencia Artificial (Gemini)
            </h3>
            <p>
              Configura tu clave de API de Gemini para usar análisis clínico interactivo real.
              Si se deja vacío, la aplicación funcionará utilizando nuestro <strong>Mock AI Engine</strong> local basado en heurísticas.
            </p>
          </div>

          <div className="api-input-group">
            <div className="api-input-wrapper">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => handleSaveApiKey(e.target.value)}
                placeholder="Ingresar Gemini API Key..."
                className="api-input"
              />
              {apiKey && (
                <span className="api-status-icon">
                  {testKeyStatus === 'valid' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-400" />
                  )}
                </span>
              )}
            </div>
            
            <button
              onClick={() => setShowSettings(false)}
              className="btn btn-primary"
            >
              Confirmar
            </button>
          </div>
        </div>
      )}

      {/* Main App Workspace */}
      <main className="main-content">
        {activeTab === 'interview' && (
          <InterviewContainer 
            onRecordCreated={handleRecordCreated}
            isProcessing={isTranslating}
          />
        )}

        {activeTab === 'debug_translation' && (
          <div style={{ width: '100%' }}>
            {isTranslating ? (
              <div className="card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '6rem 2rem', gap: '1rem', textAlign: 'center' }}>
                <span style={{ position: 'relative', display: 'flex', height: '2rem', width: '2rem' }}>
                  <span className="animate-pulse" style={{ position: 'absolute', height: '100%', width: '100%', borderRadius: '9999px', backgroundColor: 'var(--color-primary)', opacity: 0.6 }}></span>
                </span>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#a29bfe' }}>
                  Extrayendo variables médicas del diálogo mediante IA...
                </span>
              </div>
            ) : (
              <DebugTranslator
                rawText={rawTranscript}
                structuredData={structuredData}
                onSaved={handleRecordSaved}
                onCancel={handleCancelTranslation}
              />
            )}
          </div>
        )}

        {activeTab === 'dashboard' && (
          <ReportDashboard 
            apiKey={apiKey}
            refreshTrigger={refreshTrigger}
            onNavigateToInterview={() => setActiveTab('interview')}
          />
        )}
      </main>

      {/* Premium Footer */}
      <footer className="no-print" style={{ marginTop: '3rem', padding: '1.5rem 0', borderTop: '1px solid rgba(255, 255, 255, 0.05)', background: 'rgba(11, 19, 41, 0.1)', textAlign: 'center', fontSize: '0.65rem', color: 'var(--text-sub)' }}>
        <p>© 2026 PediatraAI. Desarrollado con Inteligencia Artificial Pediátrica Local / Gemini.</p>
        <p style={{ marginTop: '0.25rem' }}>Toda la información personal está cifrada y almacenada localmente en tu dispositivo.</p>
      </footer>
    </div>
  );
}
