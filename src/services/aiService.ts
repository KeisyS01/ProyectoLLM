import { translateFreeTextToClinicalRecord } from '../modules/module2_translator/clinicalTranslator';
import { generateClinicalReport } from '../modules/module3_synthesizer/reportGenerator';

export const aiService = {
  /**
   * Translates natural language chat log to structured clinical record
   */
  async translate(text: string, apiKey?: string) {
    return translateFreeTextToClinicalRecord(text, apiKey);
  },

  /**
   * Synthesizes 7-day clinical history into narrative summary
   */
  async synthesize(records: any[], apiKey?: string) {
    return generateClinicalReport(records, apiKey);
  },

  /**
   * Helper to check if a Gemini API key is valid (simple ping or syntax check)
   */
  validateApiKey(key: string): boolean {
    if (!key) return false;
    return key.trim().length > 20;
  }
};
