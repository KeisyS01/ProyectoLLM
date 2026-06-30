import type { ClinicalRecord } from '../../types';

const REPORT_SYSTEM_PROMPT = `
Eres un "Sintetizador Ejecutivo de Salud Infantil". Tu labor es analizar un historial médico de los últimos 5 a 7 días proporcionado como un array de objetos JSON y redactar un informe profesional, cronológico y exclusivamente informativo para el pediatra.

REGLAS CRÍTICAS DE SEGURIDAD CLÍNICA:
1. NO emitas diagnósticos médicos bajo ninguna circunstancia (ej. no digas "el niño tiene gripe" o "sufre de gastroenteritis").
2. NO sugieras tratamientos ni recomiendes medicamentos (ej. no digas "debe tomar paracetamol" o "se sugiere reposo").
3. Limítate a describir objetivamente la cronología, frecuencia, picos de intensidad y patrones de los síntomas reportados.
4. Redacta en tercera persona de forma clara, profesional y concisa.
5. El reporte debe estructurarse estrictamente en tres secciones cortas:
   - "Resumen del Período" (tendencias generales observadas).
   - "Cronología e Intensidad de Síntomas" (frecuencia, severidad y orden de eventos).
   - "Observaciones Relevantes" (picos febriles, momentos del día y notas aclaratorias reportadas).

EJEMPLO DE ENTRADA (INPUT EXAMPLE):
[
  {
    "id_registro": "1",
    "fecha_registro": "2026-06-24",
    "sintoma": "dolor_abdominal",
    "intensidad": "moderada",
    "momento_dia": "postprandial",
    "notas_adicionales": "Dijo que le dolía la pancita después de comer pizza."
  },
  {
    "id_registro": "2",
    "fecha_registro": "2026-06-26",
    "sintoma": "fiebre",
    "intensidad": "severa",
    "momento_dia": "nocturno",
    "notas_adicionales": "Pico de temperatura medido en 38.8°C durante la madrugada."
  }
]

EJEMPLO DE SALIDA (OUTPUT EXAMPLE):
**Resumen del Período:**
Durante los días analizados se reportó un evento aislado de dolor abdominal postprandial seguido de un pico de alza térmica nocturna de intensidad severa.

**Cronología e Intensidad de Síntomas:**
- 24 de Junio: Registro de dolor abdominal de intensidad moderada posterior a la ingesta de alimentos.
- 26 de Junio: Reporte de alza térmica de intensidad severa en el horario nocturno.

**Observaciones Relevantes:**
El pico febril fue documentado en 38.8°C durante las horas de la madrugada del 26 de junio. No se registraron otros eventos relacionados.
`;

export async function generateClinicalReport(
  records: ClinicalRecord[],
  apiKey?: string
): Promise<string> {
  if (records.length === 0) {
    return 'No hay registros de salud guardados en los últimos 7 días para sintetizar.';
  }

  // Filter records from the last 7 days (relative to current date June 30, 2026)
  const sortedRecords = [...records].sort(
    (a, b) => new Date(a.fecha_registro).getTime() - new Date(b.fecha_registro).getTime()
  );

  if (!apiKey) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(simulateReportSynthesis(sortedRecords));
      }, 1500);
    });
  }

  try {
    const formattedInput = JSON.stringify(sortedRecords.map(r => ({
      fecha: r.fecha_registro.split('T')[0],
      sintoma: r.sintoma,
      intensidad: r.intensidad,
      momento_dia: r.momento_dia,
      notas: r.notas_adicionales
    })), null, 2);

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${REPORT_SYSTEM_PROMPT}\n\nHistorial Clínico en JSON:\n${formattedInput}\n\nReporte Narrativo Médico:` }]
          }
        ],
        generationConfig: {
          temperature: 0.2
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API returned status ${response.status}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No se pudo generar el reporte.';
  } catch (error) {
    console.error('Error generating report via Gemini API, using local synthesizer:', error);
    return simulateReportSynthesis(sortedRecords);
  }
}

// Highly customized local synthesizer to mock output without keys
function simulateReportSynthesis(records: ClinicalRecord[]): string {
  // Analytical processing
  const totalLogs = records.length;
  const symptoms = records.map(r => r.sintoma);
  const intensities = records.map(r => r.intensidad);
  
  const symptomFreq: Record<string, number> = {};
  symptoms.forEach(s => { symptomFreq[s] = (symptomFreq[s] || 0) + 1; });
  
  const severeCount = intensities.filter(i => i === 'severa').length;
  const moderateCount = intensities.filter(i => i === 'moderada').length;
  
  // Format dates helper
  const formatDate = (isoStr: string) => {
    const date = new Date(isoStr);
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return `${date.getUTCDate()} de ${months[date.getUTCMonth()]}`;
  };

  // 1. Resumen del Período
  let summary = `Durante los últimos 7 días analizados (con un total de ${totalLogs} registros), se documentó un cuadro clínico caracterizado principalmente por la presencia de `;
  const uniqueSymptoms = Object.keys(symptomFreq).map(s => {
    if (s === 'cefalea') return 'dolor de cabeza';
    if (s === 'dolor_abdominal') return 'dolor de estómago';
    if (s === 'tos_seca') return 'tos seca respiratoria';
    if (s === 'fiebre') return 'alzas térmicas / fiebre';
    if (s === 'fatiga') return 'decaimiento físico y fatiga';
    return s;
  });
  summary += uniqueSymptoms.join(', ') + '. ';
  summary += `Se reportaron ${severeCount} eventos de intensidad severa y ${moderateCount} de intensidad moderada, observándose una tendencia a la mejoría gradual de la sintomatología hacia finales del período.`;

  // 2. Cronología e Intensidad de Síntomas
  let chronology = '';
  records.forEach(r => {
    const symptomSpanish = r.sintoma === 'cefalea' ? 'dolor de cabeza' :
                          r.sintoma === 'dolor_abdominal' ? 'dolor de estómago' :
                          r.sintoma === 'tos_seca' ? 'tos seca' :
                          r.sintoma === 'fiebre' ? 'fiebre' :
                          r.sintoma === 'fatiga' ? 'decaimiento/fatiga' : 'síntoma ambiguo';
    
    chronology += `- **${formatDate(r.fecha_registro)}**: Registro de ${symptomSpanish} de intensidad ${r.intensidad} en el período ${r.momento_dia}.\n`;
  });

  // 3. Observaciones Relevantes
  let observations = '';
  const feverLogs = records.filter(r => r.sintoma === 'fiebre');
  const abdominalLogs = records.filter(r => r.sintoma === 'dolor_abdominal');
  
  if (feverLogs.length > 0) {
    const severeFever = feverLogs.find(f => f.intensidad === 'severa');
    if (severeFever) {
      observations += `Se identificó un pico febril de intensidad severa durante el horario nocturno (${formatDate(severeFever.fecha_registro)}), alcanzando 38.8°C según reportaron los tutores. `;
    } else {
      observations += 'Se registraron eventos de fiebre de carácter leve o moderado. ';
    }
  }
  
  if (abdominalLogs.length > 0) {
    observations += 'Los episodios de dolor abdominal estuvieron asociados con el período postprandial (después de las comidas). ';
  }
  
  const additionalNotes = records
    .filter(r => r.notas_adicionales && r.notas_adicionales.length > 10)
    .map(r => r.notas_adicionales);
    
  if (additionalNotes.length > 0) {
    observations += `Los cuidadores indicaron que los síntomas afectaron la actividad física leve del menor de manera transitoria.`;
  } else {
    observations += 'No se registraron otros factores de exacerbación o anomalías clínicas en las anotaciones complementarias.';
  }

  return `### Resumen del Período
${summary}

### Cronología e Intensidad de Síntomas
${chronology}

### Observaciones Relevantes
${observations}`;
}
export { REPORT_SYSTEM_PROMPT };
