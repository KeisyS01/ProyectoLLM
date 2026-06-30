import type { QuestionNode } from '../../types';

export const QUESTION_FLOW: Record<string, QuestionNode> = {
  start: {
    id: 'start',
    text: '¡Hola! Soy tu amigo de salud. ¿Cómo te has sentido hoy? ¿Tienes alguna molestia o te duele algo?',
    avatarState: 'HAPPY',
    suggestedResponses: ['Me siento muy bien', 'Me duele algo', 'Tengo tos o fiebre', 'Me siento muy cansado'],
    next: (resp) => {
      if (resp.includes('bien')) return 'good_feeling';
      if (resp.includes('duele') || resp.includes('dolor')) return 'pain_location';
      if (resp.includes('tos') || resp.includes('fiebre') || resp.includes('calentura')) return 'fever_or_cough';
      if (resp.includes('cansado') || resp.includes('sueño') || resp.includes('energia')) return 'fatigue_details';
      return 'general_describe';
    }
  },
  good_feeling: {
    id: 'good_feeling',
    text: '¡Qué gran noticia! Me alegra muchísimo. ¿Hay algo en especial sobre tu salud o energía de hoy que quieras registrar?',
    avatarState: 'HAPPY',
    suggestedResponses: ['Todo súper bien', 'Dormí de maravilla', 'Tengo un dolorcito leve pero estoy bien'],
    next: (resp) => {
      if (resp.includes('dolorcito') || resp.includes('leve')) return 'pain_location';
      return 'finish_healthy';
    }
  },
  pain_location: {
    id: 'pain_location',
    text: 'Oh, lamento que te duela algo. Yo te acompaño. ¿Dónde te duele? ¿En la pancita, en la cabeza, o en otra parte?',
    avatarState: 'EMPATHETIC',
    suggestedResponses: ['En la pancita', 'En la cabeza', 'En otro lugar'],
    next: (resp) => {
      if (resp.includes('pancita') || resp.includes('barriga') || resp.includes('estómago')) return 'stomach_details';
      if (resp.includes('cabeza')) return 'head_details';
      return 'general_describe';
    }
  },
  stomach_details: {
    id: 'stomach_details',
    text: 'La pancita... entiendo. ¿Empezó a dolerte después de comer algo o comenzó de la nada?',
    avatarState: 'EMPATHETIC',
    suggestedResponses: ['Después de comer', 'Comenzó de la nada', 'Me duele desde la mañana'],
    next: () => 'intensity_ask'
  },
  head_details: {
    id: 'head_details',
    text: 'El dolor de cabeza puede ser fastidioso. ¿Sientes que te late la cabeza o es como una presión constante?',
    avatarState: 'EMPATHETIC',
    suggestedResponses: ['Siento latidos', 'Es como una presión', 'Me duele al ver pantallas'],
    next: () => 'intensity_ask'
  },
  fever_or_cough: {
    id: 'fever_or_cough',
    text: 'Comprendo. ¿Tienes calentura (fiebre) o es una tos que no te deja tranquilo?',
    avatarState: 'EMPATHETIC',
    suggestedResponses: ['Tengo fiebre / calentura', 'Tengo tos seca', 'Tengo tos con flema / mucosidad'],
    next: (resp) => {
      if (resp.includes('fiebre') || resp.includes('calentura')) return 'fever_details';
      return 'cough_details';
    }
  },
  fever_details: {
    id: 'fever_details',
    text: 'La fiebre da mucho cansancio. ¿Sientes frío y escalofríos, o estás sudando y muy calientito?',
    avatarState: 'EMPATHETIC',
    suggestedResponses: ['Tengo escalofríos', 'Estoy sudando mucho', 'Me duele el cuerpo'],
    next: () => 'intensity_ask'
  },
  cough_details: {
    id: 'cough_details',
    text: 'Esa tos es molesta. ¿Te da más fuerte por las noches al acostarte, o es todo el día?',
    avatarState: 'EMPATHETIC',
    suggestedResponses: ['Más fuerte por la noche', 'Me da durante todo el día', 'Sólo cuando corro o juego'],
    next: () => 'intensity_ask'
  },
  fatigue_details: {
    id: 'fatigue_details',
    text: 'Estar sin energías es difícil. ¿Pudiste dormir bien anoche o te despertaste varias veces?',
    avatarState: 'EMPATHETIC',
    suggestedResponses: ['No pude dormir bien', 'Dormí pero sigo muy cansado', 'Me duele el cuerpo también'],
    next: () => 'intensity_ask'
  },
  intensity_ask: {
    id: 'intensity_ask',
    text: 'Por último, ¿qué tan fuerte se siente? ¿Es un dolorcito leve que te permite jugar, moderado que te molesta, o muy severo que no te deja hacer nada?',
    avatarState: 'ATTENTIVE',
    suggestedResponses: ['Es leve (puedo jugar)', 'Es moderado (me molesta)', 'Es severo (me siento muy mal)'],
    next: () => 'finish_symptoms'
  },
  general_describe: {
    id: 'general_describe',
    text: 'Entiendo. Cuéntame con tus propias palabras qué te pasa, cuándo empezó y qué tan fuerte es.',
    avatarState: 'ATTENTIVE',
    suggestedResponses: ['Me duele la garganta', 'Me siento mareado', 'Me duele la espalda', 'Me siento raro'],
    next: () => 'finish_symptoms'
  },
  finish_healthy: {
    id: 'finish_healthy',
    text: '¡Estupendo! Guardaremos que te sientes súper bien hoy. Sigue divirtiéndote y cuidándote.',
    avatarState: 'HAPPY'
  },
  finish_symptoms: {
    id: 'finish_symptoms',
    text: 'Muchas gracias por contármelo. He guardado todo con cuidado. Voy a procesar lo que me dijiste para que tu pediatra lo pueda ver en el reporte.',
    avatarState: 'HAPPY'
  }
};
