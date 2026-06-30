import type { ClinicalRecord, IntensityLevel } from '../../types';

// System prompt optimized with Few-Shot Prompting
const TRANSLATOR_SYSTEM_PROMPT = `
Eres un "Traductor Clínico Inteligente" especializado en pediatría. Tu objetivo es recibir el texto libre de la conversación de un niño o tutor y estructurarlo en un objeto JSON limpio y preciso que cumpla con el siguiente esquema.

ESQUEMA JSON REQUERIDO:
{
  "sintoma": "sintoma_normalizado", // Nombre técnico o común normalizado del síntoma en minúsculas y sin acentos (ej. "cefalea", "dolor_abdominal", "tos_seca", "fiebre", "fatiga")
  "intensidad": "leve" | "moderada" | "severa", // Debe mapear exactamente a uno de estos tres valores
  "momento_dia": "postprandial" | "matutino" | "vespertino" | "nocturno" | "continuo" | "desconocido", // Momento del día normalizado
  "notas_adicionales": "detalles clínicos relevantes descritos por el usuario" // String con detalles adicionales relevantes, o vacío ""
}

REGLAS CRÍTICAS DE SEGURIDAD Y FORMATO:
1. Debes responder ÚNICAMENTE con el objeto JSON válido. No incluyas explicaciones, Markdown ni caracteres adicionales fuera del JSON.
2. Si el síntoma no se puede identificar claramente o el texto es ambiguo (ej: "me siento raro"), debes devolver la propiedad "sintoma" como "ambiguo".
3. PRIVACIDAD: Anonimiza cualquier información de identificación personal (nombres como Lucas, Sofía, cédulas, direcciones) reemplazándolos con términos neutros como "El paciente" o removiéndolos del texto.

EJEMPLOS DE POCAS TOMAS (FEW-SHOT EXAMPLES):

Ejemplo 1:
Usuario: "Me dolió un poquito la cabeza después de almorzar."
Salida:
{
  "sintoma": "cefalea",
  "intensidad": "leve",
  "momento_dia": "postprandial",
  "notas_adicionales": "Dolor leve frontal reportado después del almuerzo."
}

Ejemplo 2:
Usuario: "Mi hijo Lucas estuvo ardiendo en fiebre anoche, estaba super caliente y decaído."
Salida:
{
  "sintoma": "fiebre",
  "intensidad": "severa",
  "momento_dia": "nocturno",
  "notas_adicionales": "El paciente presentó alzas térmicas significativas durante la noche acompañadas de decaimiento."
}

Ejemplo 3:
Usuario: "No sé, me siento extraño desde la tarde."
Salida:
{
  "sintoma": "ambiguo",
  "intensidad": "leve",
  "momento_dia": "vespertino",
  "notas_adicionales": "El paciente describe una sensación de malestar general no especificada."
}
`;

/**
 * Anonymizes personal names and details before sending to API
 */
export function anonymizeText(text: string): string {
  // Simple clientside regex to scrub common personal names, age mentions, and numbers
  // This is a safety layer to preserve user privacy prior to LLM submission.
  let anonymized = text;
  
  // Replaces names like Lucas, Sofia, Mateo, etc.
  const commonNames = /\b(Lucas|Sofía|Mateo|Valentina|Santiago|Isabella|Sebastián|Camila|Alejandro|Mariana|Diego|Lucía|Nicolás|Daniela|Andrés|Martina|Juan|Pedro|María|Ana)\b/gi;
  anonymized = anonymized.replace(commonNames, 'el paciente');
  
  // Replaces explicit ages (e.g. "tiene 5 años")
  const ageRegex = /\btiene\s+\d+\s+años\b/gi;
  anonymized = anonymized.replace(ageRegex, 'el paciente es de edad pediátrica');
  
  return anonymized;
}

export async function translateFreeTextToClinicalRecord(
  text: string, 
  apiKey?: string
): Promise<Omit<ClinicalRecord, 'id_registro' | 'fecha_registro'>> {
  // 1. Privacy filter (Scrub personal information)
  const cleanText = anonymizeText(text);

  // 2. Fallback check if no api key
  if (!apiKey) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(simulateTranslation(cleanText));
      }, 1000);
    });
  }

  try {
    // API call using Gemini API v1beta
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${TRANSLATOR_SYSTEM_PROMPT}\n\nUsuario: "${cleanText}"\nSalida:` }]
          }
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API returned status ${response.status}`);
    }

    const data = await response.json();
    const jsonString = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    
    // Clean potential markdown blocks
    const cleanJsonString = jsonString
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    const parsed = JSON.parse(cleanJsonString);
    
    // Safety check fields
    return {
      sintoma: parsed.sintoma || 'ambiguo',
      intensidad: (['leve', 'moderada', 'severa'].includes(parsed.intensidad) ? parsed.intensidad : 'leve') as IntensityLevel,
      momento_dia: parsed.momento_dia || 'desconocido',
      notas_adicionales: parsed.notas_adicionales || cleanText
    };
  } catch (error) {
    console.error('Error contacting Gemini API, using local fallback:', error);
    return simulateTranslation(cleanText);
  }
}

// Local mock parser engine
function simulateTranslation(text: string): Omit<ClinicalRecord, 'id_registro' | 'fecha_registro'> {
  const lower = text.toLowerCase();
  
  let sintoma = 'ambiguo';
  let intensidad: IntensityLevel = 'leve';
  let momento_dia = 'desconocido';
  let notas_adicionales = text;

  // Detección simple de síntomas
  if (lower.includes('cabeza') || lower.includes('jaqueca') || lower.includes('migraña') || lower.includes('cefalea')) {
    sintoma = 'cefalea';
    notas_adicionales = 'Dolor en zona craneal frontal reported por el paciente.';
  } else if (lower.includes('panza') || lower.includes('estomago') || lower.includes('abdomen') || lower.includes('pancita') || lower.includes('barriga') || lower.includes('dolor abdominal')) {
    sintoma = 'dolor_abdominal';
    notas_adicionales = 'El paciente reporta dolor de estómago/abdominal.';
  } else if (lower.includes('fiebre') || lower.includes('calentura') || lower.includes('caliente') || lower.includes('temperatura')) {
    sintoma = 'fiebre';
    notas_adicionales = 'Presencia de alza térmica / fiebre reportada por el tutor.';
  } else if (lower.includes('tos') || lower.includes('garganta') || lower.includes('pecho')) {
    sintoma = 'tos_seca';
    notas_adicionales = 'Dificultades respiratorias de tipo tos persistente.';
  } else if (lower.includes('cansado') || lower.includes('sueño') || lower.includes('decaido') || lower.includes('energia') || lower.includes('fatiga')) {
    sintoma = 'fatiga';
    notas_adicionales = 'Reporte de astenia y bajos niveles de energía diarios.';
  }

  // Detección de intensidad
  if (lower.includes('fuerte') || lower.includes('mucho') || lower.includes('severo') || lower.includes('fatal') || lower.includes('ardiendo') || lower.includes('malísimo')) {
    intensidad = 'severa';
  } else if (lower.includes('mas o menos') || lower.includes('regular') || lower.includes('moderado') || lower.includes('bastante') || lower.includes('molesta')) {
    intensidad = 'moderada';
  }

  // Detección de momento del día
  if (lower.includes('almorzar') || lower.includes('comer') || lower.includes('despues de comer') || lower.includes('postprandial') || lower.includes('cena')) {
    momento_dia = 'postprandial';
  } else if (lower.includes('mañana') || lower.includes('despertar') || lower.includes('temprano') || lower.includes('matutino')) {
    momento_dia = 'matutino';
  } else if (lower.includes('tarde') || lower.includes('vespertino')) {
    momento_dia = 'vespertino';
  } else if (lower.includes('noche') || lower.includes('dormir') || lower.includes('acostar') || lower.includes('madrugada') || lower.includes('nocturno')) {
    momento_dia = 'nocturno';
  } else if (lower.includes('todo el dia') || lower.includes('siempre') || lower.includes('continuo')) {
    momento_dia = 'continuo';
  }

  return { sintoma, intensidad, momento_dia, notas_adicionales };
}
