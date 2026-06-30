import React, { useState } from 'react';
import type { ClinicalRecord } from '../../types';
import { db } from '../../services/db';
import { Shield, Database, Terminal, FileCode, Check, AlertTriangle, Edit3 } from 'lucide-react';
import { anonymizeText } from './clinicalTranslator';

interface DebugTranslatorProps {
  rawText: string;
  structuredData: Omit<ClinicalRecord, 'id_registro' | 'fecha_registro'> | null;
  onSaved: () => void;
  onCancel: () => void;
}

export const DebugTranslator: React.FC<DebugTranslatorProps> = ({
  rawText,
  structuredData,
  onSaved,
  onCancel
}) => {
  const [editedRecord, setEditedRecord] = useState<Omit<ClinicalRecord, 'id_registro' | 'fecha_registro'> | null>(structuredData);
  const [showPromptDetails, setShowPromptDetails] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  if (!structuredData || !editedRecord) return null;

  const isAmbiguous = editedRecord.sintoma === 'ambiguo';
  const anonymizedText = anonymizeText(rawText);

  const handleSaveToLocalDb = () => {
    db.addRecord(editedRecord);
    onSaved();
  };

  const handleFieldChange = (key: string, value: string) => {
    setEditedRecord(prev => prev ? {
      ...prev,
      [key]: value
    } : null);
  };

  return (
    <div className="translator-container">
      {/* Header */}
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div>
          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>MÓDULO 2: EL TRADUCTOR INTELIGENTE</span>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
            <Database className="w-5 h-5 text-indigo-400" />
            Depuración y Estructuración de Datos
          </h2>
        </div>
        
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={onCancel}
            className="btn btn-secondary"
          >
            Descartar
          </button>
          <button
            onClick={handleSaveToLocalDb}
            className="btn btn-success"
          >
            <Check className="w-4 h-4" />
            Guardar en Base de Datos
          </button>
        </div>
      </div>

      {/* Warnings & Status */}
      {isAmbiguous ? (
        <div className="alert-banner amber animate-pulse">
          <AlertTriangle className="w-5 h-5" style={{ flexShrink: 0 }} />
          <div>
            <h4 style={{ fontWeight: 700 }}>Identificación de Síntoma Ambiguo</h4>
            <p style={{ marginTop: '0.25rem', opacity: 0.9 }}>
              El Módulo de IA no pudo deducir un síntoma clínico concluyente. 
              Por favor, utiliza el editor para refinar el síntoma antes de guardar el registro.
            </p>
          </div>
        </div>
      ) : (
        <div className="alert-banner green">
          <Check className="w-5 h-5" style={{ flexShrink: 0 }} />
          <div>
            <h4 style={{ fontWeight: 700 }}>Traducción Clínica Exitosa</h4>
            <p style={{ marginTop: '0.25rem', opacity: 0.9 }}>
              La IA estructuró los datos clínicos de forma determinista y consistente con los esquemas clínicos.
            </p>
          </div>
        </div>
      )}

      {/* Main Grid: Data vs JSON Code */}
      <div className="translator-grid">
        
        {/* Left Side: Text Processing & Entity Extraction */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Transcript & Privacy */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Shield className="w-3.5 h-3.5 text-indigo-400" />
              Filtro de Privacidad y Anonimización
            </h3>
            
            <div>
              <span style={{ fontSize: '0.6rem', color: 'var(--text-sub)', fontWeight: 700, display: 'block', marginBottom: '0.25rem', textTransform: 'uppercase' }}>TEXTO ENTRADA ORIGINAL</span>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', background: 'rgba(255,255,255,0.03)', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                "{rawText}"
              </p>
            </div>
            
            <div>
              <span style={{ fontSize: '0.6rem', color: 'var(--text-sub)', fontWeight: 700, display: 'block', marginBottom: '0.25rem', textTransform: 'uppercase' }}>TEXTO ANONIMIZADO EN CLIENTE (ENVIADO A IA)</span>
              <p style={{ fontSize: '0.75rem', color: '#55efc4', fontStyle: 'italic', background: 'rgba(0,184,148,0.03)', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(0,184,148,0.08)' }}>
                "{anonymizedText}"
              </p>
            </div>
          </div>

          {/* Structured Output Form Editor */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                Editar Entidades Extraídas
              </h3>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="btn btn-secondary"
                style={{ fontSize: '0.65rem', padding: '0.25rem 0.5rem' }}
              >
                {isEditing ? 'Bloquear Campos' : 'Editar Valores'}
              </button>
            </div>

            <div>
              <div className="form-group">
                <label>Síntoma Normalizado</label>
                <select
                  value={editedRecord.sintoma}
                  onChange={(e) => handleFieldChange('sintoma', e.target.value)}
                  disabled={!isEditing && !isAmbiguous}
                  className="form-select"
                >
                  <option value="cefalea">Cefalea (Dolor de cabeza)</option>
                  <option value="dolor_abdominal">Dolor abdominal (Dolor de pancita)</option>
                  <option value="fiebre">Fiebre / Alza térmica</option>
                  <option value="tos_seca">Tos Seca / Dificultad Respiratoria</option>
                  <option value="fatiga">Fatiga / Cansancio / Decaimiento</option>
                  <option value="ambiguo">Ambiguo (No clasificado)</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Intensidad</label>
                  <select
                    value={editedRecord.intensidad}
                    onChange={(e) => handleFieldChange('intensidad', e.target.value)}
                    disabled={!isEditing}
                    className="form-select"
                  >
                    <option value="leve">Leve</option>
                    <option value="moderada">Moderada</option>
                    <option value="severa">Severa</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Momento del Día</label>
                  <select
                    value={editedRecord.momento_dia}
                    onChange={(e) => handleFieldChange('momento_dia', e.target.value)}
                    disabled={!isEditing}
                    className="form-select"
                  >
                    <option value="matutino">Matutino</option>
                    <option value="vespertino">Vespertino</option>
                    <option value="nocturno">Nocturno</option>
                    <option value="postprandial">Postprandial (Tras comer)</option>
                    <option value="continuo">Continuo (Todo el día)</option>
                    <option value="desconocido">Desconocido</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Notas Clínicas Adicionales</label>
                <textarea
                  value={editedRecord.notas_adicionales}
                  onChange={(e) => handleFieldChange('notas_adicionales', e.target.value)}
                  disabled={!isEditing}
                  rows={2}
                  className="form-textarea"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Raw JSON Output */}
        <div className="code-panel">
          <div className="code-header">
            <span>
              <FileCode className="w-3.5 h-3.5 text-indigo-400" style={{ marginRight: '0.35rem', verticalAlign: 'middle' }} />
              JSON Estructurado Resultante
            </span>
            <span className="badge badge-info">
              DETERMINÍSTICO
            </span>
          </div>
          
          <pre className="code-output">
            {JSON.stringify({
              id_registro: "UUID_AUTO_GENERATED",
              fecha_registro: new Date().toISOString().split('T')[0] + "T08:19:22-06:00",
              ...editedRecord
            }, null, 2)}
          </pre>
        </div>
      </div>

      {/* Collapsible Prompt Inspector */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <button
          onClick={() => setShowPromptDetails(!showPromptDetails)}
          className="btn btn-secondary"
          style={{ width: '100%', borderRadius: 0, justifyContent: 'space-between', border: 'none', padding: '0.75rem 1.25rem' }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Terminal className="w-3.5 h-3.5 text-indigo-400" />
            Ver Prompt de Extracción de Entidades (Few-Shot Prompting)
          </span>
          <span>{showPromptDetails ? 'Ocultar' : 'Mostrar'}</span>
        </button>
        
        {showPromptDetails && (
          <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', background: '#050a15', fontFamily: 'monospace', fontSize: '0.7rem', color: 'var(--text-muted)', overflowX: 'auto', maxHeight: '300px' }}>
            <div style={{ color: 'var(--color-warning)', fontWeight: 'bold', marginBottom: '0.25rem' }}>// SYSTEM PROMPT</div>
            <pre style={{ whiteSpace: 'pre-wrap' }}>
{`Eres un "Traductor Clínico Inteligente" especializado en pediatría. Tu objetivo es recibir el texto libre de la conversación de un niño o tutor y estructurarlo en un objeto JSON limpio y preciso que cumpla con el siguiente esquema...`}
            </pre>
            <div style={{ color: 'var(--color-success)', fontWeight: 'bold', marginTop: '0.75rem', marginBottom: '0.25rem' }}>// FEW-SHOT EXAMPLES</div>
            <pre style={{ whiteSpace: 'pre-wrap' }}>
{`Ejemplo 1:
Usuario: "Me dolió un poquito la cabeza después de almorzar."
Salida:
{
  "sintoma": "cefalea",
  "intensidad": "leve",
  "momento_dia": "postprandial",
  "notas_adicionales": "Dolor leve frontal reportado después del almuerzo."
}
...`}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
