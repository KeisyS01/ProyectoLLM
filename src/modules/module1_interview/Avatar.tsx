import React from 'react';
import type { AvatarState } from '../../types';

interface AvatarProps {
  state: AvatarState;
  size?: number;
}

export const Avatar: React.FC<AvatarProps> = ({ state, size = 180 }) => {
  // Color configuration based on emotional state
  const getColors = () => {
    switch (state) {
      case 'HAPPY':
        return {
          primary: '#6C5CE7',      // Bright Purple
          secondary: '#A29BFE',    // Light Purple
          accent: '#FF7675',       // Coral blush
          glow: 'rgba(108, 92, 231, 0.4)',
        };
      case 'EMPATHETIC':
        return {
          primary: '#00B894',      // Soft Teal
          secondary: '#55EFC4',    // Light Teal
          accent: '#FAB1A0',       // Warm Peach blush
          glow: 'rgba(0, 184, 148, 0.4)',
        };
      case 'ATTENTIVE':
        return {
          primary: '#0984E3',      // Calm Blue
          secondary: '#74B9FF',    // Light Blue
          accent: '#FFEAA7',       // Soft Yellow glow
          glow: 'rgba(9, 132, 227, 0.4)',
        };
      case 'THINKING':
        return {
          primary: '#FD9644',      // Warm Orange
          secondary: '#FBD085',    // Light Orange/Yellow
          accent: '#D2DAE2',       // Grey blush
          glow: 'rgba(253, 150, 68, 0.4)',
        };
      default:
        return {
          primary: '#6C5CE7',
          secondary: '#A29BFE',
          accent: '#FF7675',
          glow: 'rgba(108, 92, 231, 0.4)',
        };
    }
  };

  const colors = getColors();

  // Avatar eye animations and mouth path depending on state
  const renderFaceElements = () => {
    switch (state) {
      case 'HAPPY':
        return (
          <>
            {/* Happy Eyes: curved arcs ^ ^ */}
            <path
              d="M 28 45 Q 36 37 44 45"
              fill="none"
              stroke="#2D3436"
              strokeWidth="4.5"
              strokeLinecap="round"
              className="animate-avatar-happy-eyes"
            />
            <path
              d="M 56 45 Q 64 37 72 45"
              fill="none"
              stroke="#2D3436"
              strokeWidth="4.5"
              strokeLinecap="round"
              className="animate-avatar-happy-eyes"
            />
            {/* Blushes */}
            <ellipse cx="23" cy="53" rx="7" ry="4" fill={colors.accent} opacity="0.8" />
            <ellipse cx="77" cy="53" rx="7" ry="4" fill={colors.accent} opacity="0.8" />
            {/* Big Smile */}
            <path
              d="M 38 56 Q 50 68 62 56"
              fill="none"
              stroke="#2D3436"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
            {/* Happy Tongue */}
            <path
              d="M 43 59 Q 50 67 57 59 Z"
              fill="#FF7675"
            />
          </>
        );

      case 'EMPATHETIC':
        return (
          <>
            {/* Compassionate Eyes (gentle downward curves or soft circles) */}
            <circle cx="36" cy="46" r="5" fill="#2D3436" />
            <circle cx="64" cy="46" r="5" fill="#2D3436" />
            {/* Gentle slanted eyebrows for empathy */}
            <path
              d="M 28 36 Q 36 39 44 37"
              fill="none"
              stroke="#2D3436"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M 56 37 Q 64 39 72 36"
              fill="none"
              stroke="#2D3436"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Warm soft blush */}
            <ellipse cx="24" cy="54" rx="6" ry="3.5" fill={colors.accent} opacity="0.7" />
            <ellipse cx="76" cy="54" rx="6" ry="3.5" fill={colors.accent} opacity="0.7" />
            {/* Soft, warm smile */}
            <path
              d="M 41 57 Q 50 63 59 57"
              fill="none"
              stroke="#2D3436"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          </>
        );

      case 'ATTENTIVE':
        return (
          <>
            {/* Open, listening eyes */}
            <ellipse cx="36" cy="45" rx="5" ry="6" fill="#2D3436" />
            <ellipse cx="64" cy="45" rx="5" ry="6" fill="#2D3436" />
            {/* High eyebrows */}
            <path
              d="M 28 34 Q 36 31 42 34"
              fill="none"
              stroke="#2D3436"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M 58 34 Q 64 31 72 34"
              fill="none"
              stroke="#2D3436"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Small glowing blush */}
            <circle cx="23" cy="54" r="4" fill={colors.accent} opacity="0.5" />
            <circle cx="77" cy="54" r="4" fill={colors.accent} opacity="0.5" />
            {/* Attentive O mouth */}
            <circle cx="50" cy="58" r="4.5" fill="none" stroke="#2D3436" strokeWidth="3.5" />
          </>
        );

      case 'THINKING':
        return (
          <>
            {/* Eyes looking up and to the side */}
            <g transform="translate(2, -3)">
              <circle cx="34" cy="43" r="5" fill="#2D3436" />
              <circle cx="62" cy="43" r="5" fill="#2D3436" />
              {/* Highlight looking up */}
              <circle cx="35.5" cy="41.5" r="1.5" fill="#FFFFFF" />
              <circle cx="63.5" cy="41.5" r="1.5" fill="#FFFFFF" />
            </g>
            {/* Asymmetrical eyebrows */}
            <path
              d="M 28 34 Q 35 32 42 37"
              fill="none"
              stroke="#2D3436"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M 58 36 Q 65 33 72 32"
              fill="none"
              stroke="#2D3436"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {/* Flat/Wavy mouth */}
            <path
              d="M 43 59 Q 50 56 57 59"
              fill="none"
              stroke="#2D3436"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="avatar-container" style={{ width: size, height: size, position: 'relative' }}>
      <svg
        viewBox="0 0 100 100"
        width="100%"
        height="100%"
        style={{
          filter: `drop-shadow(0 8px 24px ${colors.glow})`,
          transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}
      >
        <defs>
          {/* Main Body Gradient */}
          <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.secondary} />
            <stop offset="100%" stopColor={colors.primary} />
          </linearGradient>
          
          {/* Screen Gradient */}
          <linearGradient id="screenGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#E2E8F0" />
          </linearGradient>

          {/* Ears/Antenna Gradient */}
          <linearGradient id="detailGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={colors.primary} />
            <stop offset="100%" stopColor="#2D3436" />
          </linearGradient>
        </defs>

        {/* Antenna */}
        <line
          x1="50"
          y1="22"
          x2="50"
          y2="10"
          stroke="#2D3436"
          strokeWidth="4"
          strokeLinecap="round"
        />
        {/* Antenna Bulb */}
        <circle
          cx="50"
          cy="8"
          r="5"
          fill={colors.secondary}
          stroke="#2D3436"
          strokeWidth="3"
          className={state === 'THINKING' ? 'animate-pulse' : ''}
          style={{
            fill: state === 'THINKING' ? colors.accent : colors.secondary,
            transition: 'fill 0.4s ease'
          }}
        />

        {/* Ears (Side Bolts) */}
        <rect x="7" y="42" width="6" height="16" rx="2" fill="url(#detailGrad)" stroke="#2D3436" strokeWidth="3" />
        <rect x="87" y="42" width="6" height="16" rx="2" fill="url(#detailGrad)" stroke="#2D3436" strokeWidth="3" />

        {/* Main Head Outer */}
        <rect
          x="12"
          y="20"
          width="76"
          height="62"
          rx="24"
          fill="url(#bodyGrad)"
          stroke="#2D3436"
          strokeWidth="4"
          style={{ transition: 'fill 0.6s ease' }}
          className={`avatar-body-${state.toLowerCase()}`}
        />

        {/* Face Screen Inner */}
        <rect
          x="18"
          y="26"
          width="64"
          height="48"
          rx="16"
          fill="url(#screenGrad)"
          stroke="#2D3436"
          strokeWidth="3.5"
        />

        {/* Interactive Face Group */}
        <g className={`face-group-${state.toLowerCase()}`}>
          {renderFaceElements()}
        </g>

        {/* Cute Bowtie / Emblem */}
        <path
          d="M 42 85 L 50 78 L 58 85 L 50 82 Z"
          fill={colors.accent}
          stroke="#2D3436"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <circle cx="50" cy="80" r="2.5" fill="#2D3436" />
      </svg>
      
      {/* Thinking Speech Bubble Indicator */}
      {state === 'THINKING' && (
        <div className="absolute -top-2 -right-2 flex space-x-1 bg-white border-2 border-slate-800 rounded-full px-3 py-1.5 shadow-md animate-bounce">
          <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping"></span>
          <span className="w-2.5 h-2.5 bg-amber-500 rounded-full"></span>
          <span className="w-2.5 h-2.5 bg-amber-500 rounded-full"></span>
        </div>
      )}
    </div>
  );
};
