import type { ClinicalRecord } from '../types';

const STORAGE_KEY = 'pediatric_health_records';

// Generates a mock history of clinical records for the last 7 days relative to June 30, 2026
const SEED_DATA: ClinicalRecord[] = [
  {
    id_registro: 'rec-1',
    fecha_registro: '2026-06-24T14:30:00Z',
    sintoma: 'dolor_abdominal',
    intensidad: 'moderada',
    momento_dia: 'postprandial',
    notas_adicionales: 'El paciente reportó dolor abdominal tipo cólico posterior a la ingesta de comida rápida (pizza).'
  },
  {
    id_registro: 'rec-2',
    fecha_registro: '2026-06-25T17:15:00Z',
    sintoma: 'cefalea',
    intensidad: 'leve',
    momento_dia: 'vespertino',
    notas_adicionales: 'Dolor leve en región frontal, mejoró de forma espontánea tras 1 hora de reposo.'
  },
  {
    id_registro: 'rec-3',
    fecha_registro: '2026-06-26T03:40:00Z',
    sintoma: 'fiebre',
    intensidad: 'severa',
    momento_dia: 'nocturno',
    notas_adicionales: 'Pico febril medido con termómetro digital en 38.8°C durante la madrugada, acompañado de sudoración.'
  },
  {
    id_registro: 'rec-4',
    fecha_registro: '2026-06-27T08:15:00Z',
    sintoma: 'fiebre',
    intensidad: 'leve',
    momento_dia: 'matutino',
    notas_adicionales: 'Temperatura de 37.4°C al despertar. El paciente se muestra con mejor semblante y mayor energía.'
  },
  {
    id_registro: 'rec-5',
    fecha_registro: '2026-06-28T12:00:00Z',
    sintoma: 'tos_seca',
    intensidad: 'moderada',
    momento_dia: 'continuo',
    notas_adicionales: 'Tos seca persistente que aumenta con el esfuerzo físico leve, dificultando el juego.'
  },
  {
    id_registro: 'rec-6',
    fecha_registro: '2026-06-29T19:00:00Z',
    sintoma: 'tos_seca',
    intensidad: 'leve',
    momento_dia: 'vespertino',
    notas_adicionales: 'Accesos ocasionales de tos seca. Sin picos de fiebre ni dolor reportados.'
  }
];

export const db = {
  getRecords(): ClinicalRecord[] {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      this.saveRecords(SEED_DATA);
      return SEED_DATA;
    }
    try {
      return JSON.parse(data);
    } catch {
      return SEED_DATA;
    }
  },

  saveRecords(records: ClinicalRecord[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  },

  addRecord(record: Omit<ClinicalRecord, 'id_registro' | 'fecha_registro'>): ClinicalRecord {
    const newRecord: ClinicalRecord = {
      ...record,
      id_registro: `rec-${crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9)}`,
      fecha_registro: new Date().toISOString()
    };
    const current = this.getRecords();
    current.push(newRecord);
    this.saveRecords(current);
    return newRecord;
  },

  updateRecord(updated: ClinicalRecord): void {
    const current = this.getRecords();
    const index = current.findIndex(r => r.id_registro === updated.id_registro);
    if (index !== -1) {
      current[index] = updated;
      this.saveRecords(current);
    }
  },

  deleteRecord(id: string): void {
    const current = this.getRecords();
    const filtered = current.filter(r => r.id_registro !== id);
    this.saveRecords(filtered);
  },

  reset(): void {
    this.saveRecords(SEED_DATA);
  },

  clear(): void {
    this.saveRecords([]);
  }
};
