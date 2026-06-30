import React, { useState, useEffect, useRef } from 'react';
import type { ChatMessage, AvatarState } from '../../types';
import { Avatar } from './Avatar';
import { QUESTION_FLOW } from './questionFlow';
import { Mic, MicOff, Send, RefreshCw, Sparkles, CheckCircle } from 'lucide-react';

interface InterviewContainerProps {
  onRecordCreated: (rawText: string) => void;
  isProcessing: boolean;
}

export const InterviewContainer: React.FC<InterviewContainerProps> = ({
  onRecordCreated,
  isProcessing
}) => {
  const [currentNodeId, setCurrentNodeId] = useState<string>('start');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [avatarState, setAvatarState] = useState<AvatarState>('HAPPY');
  const [conversationHistory, setConversationHistory] = useState<string[]>([]);
  const [showSummaryAction, setShowSummaryAction] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize conversation
  useEffect(() => {
    const startNode = QUESTION_FLOW.start;
    setMessages([
      {
        id: 'msg-start',
        sender: 'bot',
        text: startNode.text,
        timestamp: new Date(),
        suggestedResponses: startNode.suggestedResponses
      }
    ]);
    setAvatarState(startNode.avatarState);
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Speech-to-Text Initialization
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.lang = 'es-ES';
      rec.interimResults = false;

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        setIsListening(false);
      };

      rec.onerror = (e: any) => {
        console.error('Speech recognition error', e);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      // Simulation for browsers without SpeechRecognition
      setIsListening(true);
      setTimeout(() => {
        const mockPhrases = [
          'Me dolió un poquito la cabeza después de almorzar',
          'Me duele la panza muy fuerte desde anoche',
          'Tengo tos con flema que me da por la noche y frío',
          'Me siento muy decaído y con sueño todo el día'
        ];
        const randomPhrase = mockPhrases[Math.floor(Math.random() * mockPhrases.length)];
        setInputValue(randomPhrase);
        setIsListening(false);
      }, 2000);
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const handleSendMessage = (textToSend: string) => {
    if (!textToSend.trim()) return;

    // 1. Add user message
    const userMsgId = `msg-user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setConversationHistory(prev => [...prev, textToSend]);

    // 2. Determine next question node
    const currentNode = QUESTION_FLOW[currentNodeId];
    let nextNodeId: string | null = null;
    
    if (currentNode.next) {
      nextNodeId = currentNode.next(textToSend) || null;
    }

    // Set avatar state to attentive while user responds
    setAvatarState('ATTENTIVE');

    // 3. Bot response transition
    setTimeout(() => {
      if (nextNodeId && QUESTION_FLOW[nextNodeId]) {
        const nextNode = QUESTION_FLOW[nextNodeId];
        setCurrentNodeId(nextNodeId);
        setAvatarState(nextNode.avatarState);

        const botMsg: ChatMessage = {
          id: `msg-bot-${Date.now()}`,
          sender: 'bot',
          text: nextNode.text,
          timestamp: new Date(),
          suggestedResponses: nextNode.suggestedResponses
        };

        setMessages(prev => [...prev, botMsg]);

        // Check if it's a finish node
        if (nextNodeId === 'finish_healthy' || nextNodeId === 'finish_symptoms') {
          setShowSummaryAction(true);
        }
      } else {
        // Safe fallback finish
        const botMsg: ChatMessage = {
          id: `msg-bot-${Date.now()}`,
          sender: 'bot',
          text: 'Gracias por compartirlo. Tu información está lista para procesar.',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMsg]);
        setAvatarState('HAPPY');
        setShowSummaryAction(true);
      }
    }, 900);
  };

  const handleProcessConversation = () => {
    // Construct single descriptive text from dialogue
    const rawTranscript = conversationHistory.join('. ');
    onRecordCreated(rawTranscript);
  };

  const handleRestart = () => {
    setCurrentNodeId('start');
    setMessages([
      {
        id: 'msg-start',
        sender: 'bot',
        text: QUESTION_FLOW.start.text,
        timestamp: new Date(),
        suggestedResponses: QUESTION_FLOW.start.suggestedResponses
      }
    ]);
    setInputValue('');
    setConversationHistory([]);
    setAvatarState('HAPPY');
    setShowSummaryAction(false);
  };

  return (
    <div className="split-layout">
      {/* Left panel: Cute Avatar & Status */}
      <div className="card avatar-card">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem', color: 'white', marginBottom: '0.25rem' }}>
          <Sparkles className="w-5 h-5 text-indigo-400" />
          Tu Asistente Médico
        </h3>
        <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Conversa con nuestro avatar amigable para registrar tus síntomas.
        </p>
        
        <div className="avatar-wrapper">
          <Avatar state={avatarState} size={190} />
        </div>

        <div style={{ width: '100%', padding: '0.75rem', background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '1rem', marginTop: '1rem' }}>
          <span style={{ fontSize: '0.6rem', fontWeight: 700, color: 'var(--text-sub)', display: 'block', marginBottom: '0.25rem', textTransform: 'uppercase' }}>ESTADO DEL ASISTENTE</span>
          <span className="badge badge-info" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'currentColor' }} className="animate-pulse"></span>
            {avatarState === 'HAPPY' && 'Feliz / Saludando'}
            {avatarState === 'EMPATHETIC' && 'Compasivo / Empático'}
            {avatarState === 'ATTENTIVE' && 'Atento / Escuchando'}
            {avatarState === 'THINKING' && 'Procesando información'}
          </span>
        </div>
      </div>

      {/* Right panel: Conversational Chat Interface */}
      <div className="card chat-card">
        {/* Chat header */}
        <div className="chat-header">
          <div>
            <h4>Flujo de Entrevista Infantil</h4>
            <p>Las respuestas de voz se transcriben automáticamente.</p>
          </div>
          <button 
            onClick={handleRestart}
            className="btn btn-secondary"
            style={{ padding: '0.4rem 0.85rem' }}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reiniciar
          </button>
        </div>

        {/* Chat Messages scroll area */}
        <div className="chat-messages">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`message-row ${msg.sender === 'user' ? 'user' : 'bot'}`}
            >
              <div className="message-bubble">
                <p>{msg.text}</p>
                <span className="bubble-time">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          {/* Scroll target */}
          <div ref={messagesEndRef} />
        </div>

        {/* Action button if finished */}
        {showSummaryAction && (
          <div className="action-banner animate-fade-in">
            <button
              onClick={handleProcessConversation}
              disabled={isProcessing}
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem' }}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Estructurando datos clínicos por IA...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Finalizar y Estructurar Datos (Módulo 2)
                </>
              )}
            </button>
          </div>
        )}

        {/* Quick suggested responses / Bubble options */}
        {!showSummaryAction && messages[messages.length - 1]?.suggestedResponses && (
          <div className="suggested-pills">
            {messages[messages.length - 1].suggestedResponses?.map((resp, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(resp)}
                className="pill-btn"
              >
                {resp}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        {!showSummaryAction && (
          <div className="input-bar">
            <button
              onClick={toggleListening}
              className={`btn-icon ${isListening ? 'btn-mic-active' : ''}`}
              title={isListening ? 'Escuchando (click para detener)' : 'Hablar por micrófono'}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage(inputValue);
              }}
              placeholder={isListening ? 'Escuchando voz en vivo...' : 'Escribe tu respuesta aquí...'}
              className="chat-input"
              disabled={isListening}
            />

            <button
              onClick={() => handleSendMessage(inputValue)}
              disabled={!inputValue.trim() || isListening}
              className="btn btn-primary"
              style={{ padding: '0.65rem' }}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
