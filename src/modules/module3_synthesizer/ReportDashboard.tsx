import React, { useState, useEffect } from 'react';
import type { ClinicalRecord } from '../../types';
import { generateClinicalReport } from './reportGenerator';
import { db } from '../../services/db';
import { 
  FileText, Copy, Printer, Calendar, ShieldAlert, 
  Trash2, Plus, BarChart2, CheckCircle2, RotateCcw,
  Sparkles, TrendingUp, Info
} from 'lucide-react';

interface ReportDashboardProps {
  apiKey: string;
  refreshTrigger: number;
  onNavigateToInterview: () => void;
}

export const ReportDashboard: React.FC<ReportDashboardProps> = ({
  apiKey,
  refreshTrigger,
  onNavigateToInterview
}) => {
  const [records, setRecords] = useState<ClinicalRecord[]>([]);
  const [report, setReport] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Load records from LocalStorage
  useEffect(() => {
    setRecords(db.getRecords());
  }, [refreshTrigger]);

  // Generate narrative report whenever records or API key changes
  useEffect(() => {
    if (records.length > 0) {
      handleGenerateReport();
    } else {
      setReport('No hay registros de salud para analizar. Por favor, realiza la entrevista infantil.');
    }
  }, [records, apiKey]);

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      const generatedReport = await generateClinicalReport(records, apiKey);
      setReport(generatedReport);
    } catch (e) {
      console.error(e);
      setReport('Ocurrió un error al generar el reporte de salud.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDeleteRecord = (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este registro clínico?')) {
      db.deleteRecord(id);
      setRecords(db.getRecords());
    }
  };

  const handleResetDb = () => {
    if (confirm('¿Deseas restaurar el historial clínico de demostración (últimos 7 días)?')) {
      db.reset();
      setRecords(db.getRecords());
    }
  };

  const handleClearDb = () => {
    if (confirm('¿Estás seguro de que deseas borrar TODOS los registros del historial?')) {
      db.clear();
      setRecords([]);
    }
  };

  // Analytics Math
  const totalLogs = records.length;
  const severeLogs = records.filter(r => r.intensidad === 'severa').length;
  const uniqueSymptoms = Array.from(new Set(records.map(r => r.sintoma)));
  
  // Calculate symptom counts for custom bar chart
  const symptomDistribution = records.reduce((acc, curr) => {
    acc[curr.sintoma] = (acc[curr.sintoma] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const symptomLabels: Record<string, string> = {
    cefalea: 'Cefalea',
    dolor_abdominal: 'Dolor Abdominal',
    fiebre: 'Fiebre',
    tos_seca: 'Tos Seca',
    fatiga: 'Fatiga',
    ambiguo: 'Ambiguo / No clasificado'
  };

  // Process markdown into HTML structures simply for rendering
  const renderFormattedReport = () => {
    if (!report) return null;
    
    // Parse the 3 expected markdown sections:
    const sections = report.split(/###/);
    return sections.map((sect, idx) => {
      if (!sect.trim()) return null;
      
      const lines = sect.split('\n');
      const title = lines[0].trim();
      const bodyLines = lines.slice(1).join('\n').trim();

      // Replace bold markdown with HTML tags
      const formattedBody = bodyLines
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/-\s\*\*(.*?)\*\*:\s(.*)/g, '<li><strong>$1</strong>: $2</li>')
        .replace(/\n/g, '<br/>');

      return (
        <div key={idx} style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '0.9rem', color: 'white', borderLeft: '3px solid var(--color-primary)', paddingLeft: '0.5rem', marginBottom: '0.5rem', fontWeight: 700 }}>
            {title}
          </h3>
          <p 
            style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.6' }}
            dangerouslySetInnerHTML={{ __html: formattedBody }}
          />
        </div>
      );
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
      
      {/* Overview Stats Row */}
      <div className="metric-row no-print">
        <div className="metric-card">
          <div>
            <span style={{ fontSize: '0.6rem', color: 'var(--text-sub)', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>Total Registros (7 días)</span>
            <span className="metric-card-val" style={{ color: 'white' }}>{totalLogs}</span>
            <span style={{ fontSize: '0.6rem', color: 'var(--text-sub)', marginTop: '0.25rem', display: 'block' }}>Entrevistas completadas</span>
          </div>
          <div style={{ background: 'var(--color-primary-glow)', padding: '0.65rem', borderRadius: '0.75rem', color: '#a29bfe', display: 'flex', alignItems: 'center' }}>
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className="metric-card">
          <div>
            <span style={{ fontSize: '0.6rem', color: 'var(--text-sub)', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>Eventos Severos</span>
            <span className="metric-card-val" style={{ color: 'var(--color-danger)' }}>{severeLogs}</span>
            <span style={{ fontSize: '0.6rem', color: 'var(--text-sub)', marginTop: '0.25rem', display: 'block' }}>Picos críticos de síntomas</span>
          </div>
          <div style={{ background: 'var(--color-danger-glow)', padding: '0.65rem', borderRadius: '0.75rem', color: 'var(--color-danger)', display: 'flex', alignItems: 'center' }}>
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        <div className="metric-card">
          <div>
            <span style={{ fontSize: '0.6rem', color: 'var(--text-sub)', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>Diversidad de Síntomas</span>
            <span className="metric-card-val" style={{ color: 'var(--color-success)' }}>{uniqueSymptoms.length}</span>
            <span style={{ fontSize: '0.6rem', color: 'var(--text-sub)', marginTop: '0.25rem', display: 'block' }}>Categorías clínicas</span>
          </div>
          <div style={{ background: 'var(--color-success-glow)', padding: '0.65rem', borderRadius: '0.75rem', color: 'var(--color-success)', display: 'flex', alignItems: 'center' }}>
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Analytical Chart & Synthesized PDF View */}
      <div className="dashboard-grid">
        
        {/* Left Side: Charts & Metrics (Timeline and Frequencies) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="no-print">
          
          {/* Chart Card */}
          <div className="card" style={{ flex: 1 }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'white', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <BarChart2 className="w-4.5 h-4.5 text-indigo-400" />
              Frecuencia de Síntomas
            </h3>
            
            {totalLogs === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 0', fontSize: '0.75rem', color: 'var(--text-sub)' }}>No hay datos clínicos.</div>
            ) : (
              <div className="chart-bar-group">
                {Object.entries(symptomDistribution).map(([symptom, count]) => {
                  const percentage = Math.round((count / totalLogs) * 100);
                  return (
                    <div key={symptom} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <div className="chart-bar-label">
                        <span style={{ fontWeight: 600 }}>{symptomLabels[symptom] || symptom}</span>
                        <span>{count} {count === 1 ? 'vez' : 'veces'} ({percentage}%)</span>
                      </div>
                      <div className="chart-bar-bg">
                        <div 
                          className="chart-bar-fill"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div style={{ marginTop: '1.5rem', padding: '0.75rem', background: 'var(--color-primary-glow)', borderRadius: '1rem', display: 'flex', gap: '0.5rem', fontSize: '0.65rem', color: '#a29bfe' }}>
              <Info className="w-4 h-4" style={{ flexShrink: 0, marginTop: '1px' }} />
              <p>
                Los síntomas se extraen mediante el traductor clínico (Módulo 2) a partir del texto libre de la entrevista infantil.
              </p>
            </div>
          </div>

          {/* Timeline Visual Card */}
          <div className="card">
            <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'white', marginBottom: '1rem' }}>Línea de Tiempo de Intensidad</h3>
            {records.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '1rem 0', fontSize: '0.75rem', color: 'var(--text-sub)' }}>Sin datos.</div>
            ) : (
              <div className="timeline">
                {records.map((r, idx) => (
                  <div key={idx} className="timeline-node">
                    <span className={`timeline-dot ${r.intensidad}`} />
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-sub)', fontWeight: 700, display: 'block' }}>
                      {new Date(r.fecha_registro).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'white', fontWeight: 600, display: 'block', textTransform: 'capitalize' }}>
                      {symptomLabels[r.sintoma] || r.sintoma}
                    </span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-sub)', fontStyle: 'italic', display: 'block' }}>
                      {r.momento_dia}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Narrative Executive Pediatric Report */}
        <div className="report-paper print-container">
          
          {/* Report Toolbar */}
          <div className="code-header no-print-toolbar" style={{ borderBottom: '1px solid var(--card-border)', background: 'rgba(11, 19, 41, 0.4)', padding: '0.75rem 1.25rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 800, color: 'white' }}>
              <FileText className="w-4.5 h-4.5 text-indigo-400" />
              Reporte Médico Narrativo (Módulo 3)
            </span>
            
            <div style={{ display: 'flex', gap: '0.5rem' }} className="no-print">
              <button
                onClick={handleCopyToClipboard}
                disabled={records.length === 0}
                className="btn-icon"
                style={{ position: 'relative' }}
                title="Copiar reporte"
              >
                {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copied && <span style={{ position: 'absolute', top: '-25px', right: 0, fontSize: '0.55rem', background: '#1e293b', color: '#55efc4', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>Copiado</span>}
              </button>
              <button
                onClick={handlePrint}
                disabled={records.length === 0}
                className="btn-icon"
                title="Imprimir / Guardar PDF"
              >
                <Printer className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Report Output Body */}
          <div className="report-body">
            {isGenerating ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '4rem 0', gap: '0.75rem' }}>
                <Sparkles className="w-8 h-8 text-indigo-400 animate-spin" />
                <span style={{ fontSize: '0.7rem', color: '#a29bfe', fontWeight: 600 }}>Generando síntesis de salud mediante IA...</span>
              </div>
            ) : (
              renderFormattedReport()
            )}
          </div>
          
          {/* Footer warning */}
          <div style={{ padding: '0.75rem 1.25rem', background: 'rgba(11, 19, 41, 0.4)', borderTop: '1px solid var(--card-border)', display: 'flex', gap: '0.5rem', fontSize: '0.65rem', color: '#ff7675' }}>
            <ShieldAlert className="w-4.5 h-4.5 flex-shrink-0 text-red-400" />
            <p>
              <strong>AVISO DE SEGURIDAD CLÍNICA:</strong> Este reporte es descriptivo y consolida patrones de síntomas. No diagnostica enfermedades ni receta medicamentos. Presente este reporte a su pediatra para una evaluación médica formal.
            </p>
          </div>
        </div>
      </div>

      {/* Database CRUD Table */}
      <div className="card table-card no-print">
        <div className="table-header">
          <div className="table-header-info">
            <h3 style={{ fontSize: '0.9rem', color: 'white', fontWeight: 700 }}>
              Historial de Registros en Base de Datos Local
            </h3>
            <p>Todos los datos se almacenan de manera local y privada en el navegador.</p>
          </div>
          
          <div className="table-actions">
            <button
              onClick={handleResetDb}
              className="btn btn-secondary"
              style={{ fontSize: '0.65rem', padding: '0.4rem 0.75rem' }}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Cargar Ejemplo 7 Días
            </button>
            <button
              onClick={handleClearDb}
              className="btn btn-danger"
              style={{ fontSize: '0.65rem', padding: '0.4rem 0.75rem' }}
            >
              <Trash2 className="w-3.5 h-3.5" />
              Borrar Todo
            </button>
            <button
              onClick={onNavigateToInterview}
              className="btn btn-primary"
              style={{ fontSize: '0.65rem', padding: '0.4rem 0.75rem' }}
            >
              <Plus className="w-3.5 h-3.5" />
              Nueva Entrevista
            </button>
          </div>
        </div>

        {records.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-sub)' }}>
            <p style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}>No hay registros de salud en la base de datos.</p>
            <button
              onClick={onNavigateToInterview}
              className="btn btn-primary"
              style={{ padding: '0.4rem 0.85rem' }}
            >
              Comienza una entrevista infantil para agregar el primero
            </button>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Síntoma</th>
                  <th>Intensidad</th>
                  <th>Momento</th>
                  <th style={{ width: '40%' }}>Notas Clínicas Adicionales</th>
                  <th style={{ textAlign: 'right' }}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id_registro}>
                    <td style={{ fontFamily: 'monospace' }}>
                      {new Date(r.fecha_registro).toLocaleDateString('es-ES', { 
                        year: 'numeric', month: '2-digit', day: '2-digit' 
                      })}
                    </td>
                    <td style={{ textTransform: 'capitalize', fontWeight: 600 }}>
                      {symptomLabels[r.sintoma] || r.sintoma}
                    </td>
                    <td>
                      <span className={`badge ${
                        r.intensidad === 'severa' ? 'badge-danger' :
                        r.intensidad === 'moderada' ? 'badge-warning' :
                        'badge-success'
                      }`}>
                        {r.intensidad}
                      </span>
                    </td>
                    <td style={{ textTransform: 'capitalize' }}>{r.momento_dia}</td>
                    <td style={{ color: 'var(--text-muted)', fontStyle: 'italic' }} title={r.notas_adicionales}>
                      {r.notas_adicionales}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => handleDeleteRecord(r.id_registro)}
                        className="btn-icon"
                        style={{ padding: '0.4rem', background: 'rgba(255, 118, 117, 0.1)', color: 'var(--color-danger)', border: 'none' }}
                        title="Eliminar registro"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
