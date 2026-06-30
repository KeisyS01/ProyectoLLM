export type IntensityLevel = 'leve' | 'moderada' | 'severa';

export interface ClinicalRecord {
  id_registro: string;      // UUID
  fecha_registro: string;   // ISO 8601 Date
  sintoma: string;          // Clinical term or common term (e.g. "cefalea", "dolor_abdominal")
  intensidad: IntensityLevel;
  momento_dia: string;      // e.g. "postprandial", "matutino", "vespertino", "nocturno", "continuo", "desconocido"
  notas_adicionales: string;
}

export type AvatarState = 'HAPPY' | 'ATTENTIVE' | 'EMPATHETIC' | 'THINKING';

export interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: Date;
  suggestedResponses?: string[];
}

export interface QuestionNode {
  id: string;
  text: string;
  avatarState: AvatarState;
  suggestedResponses?: string[];
  next?: (response: string) => string | null; // Dynamic flow resolver
}
