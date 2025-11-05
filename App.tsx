

import React, { useState, useEffect, useCallback, useRef, FC } from 'react';
import { GoogleGenAI, Chat, Type } from '@google/genai';

// --- CONSTANTS ---
const EMOTIONAL_KEY_THRESHOLD = 40; // High speed typing
const EMOTIONAL_ERROR_RATIO_MAX = 0.05; // Low error rate (5%)


// --- SENSITIVITY THRESHOLDS ---
const SENSITIVITY_LEVELS = {
    1: { keys: 30, errorRatio: 0.3, label: 'Relaxed' },    // Requires intense typing with many errors
    2: { keys: 20, errorRatio: 0.2, label: 'Balanced' },  // Default, balanced detection
    3: { keys: 15, errorRatio: 0.1, label: 'Strict' },     // More sensitive to signs of fatigue
};

const SENSITIVITY_LABELS = { 1: 'Relaxed', 2: 'Balanced', 3: 'Strict' };

// --- VOICE CONSTANTS ---
const VOICES = [
    // American Accents
    { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', description: 'Calm, American' },
    { id: 'pNInz6obpgDQGcFmaJgB', name: 'Adam', description: 'Deep, Narrative' },
    { id: 'EXAVITQu4Tvr4xnSDxMaL', name: 'Bella', description: 'Clear, American' },
    { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli', description: 'Emotional, Young' },
    { id: 'TxGEqnHWFrWFTVcgV1eT', name: 'Josh', description: 'Deep, American' },

    // British Accents
    { id: 'jsCqWAovK2LkecY7zXl4', name: 'Freya', description: 'Crisp, British' },
    { id: 'pMsXgVXv3BLzUgSXRplE', name: 'Serena', description: 'Pleasant, British' },
    
    // Other Accents
    { id: 'piTKgcLEGmPE4e6mEKli', name: 'Nicole', description: 'Calm, Australian' },
];


// --- HELPER FUNCTIONS ---
const getInitialValue = <T,>(key: string, defaultValue: T, parser: (value: string) => T): T => {
    try {
        const storedValue = localStorage.getItem(key);
        return storedValue !== null ? parser(storedValue) : defaultValue;
    } catch (error) {
        console.error(`Error reading from localStorage: ${key}`, error);
        return defaultValue;
    }
};

// --- SVG ICONS ---
const MoonIcon: FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-3.51 1.71-6.635 4.397-8.552a.75.75 0 01.819.162z" clipRule="evenodd" />
  </svg>
);

const XCircleIcon: FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 00-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clipRule="evenodd" />
  </svg>
);

const BrainIcon: FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M14.25 6.375a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 3.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15.75 3.75a.75.75 0 100-1.5.75.75 0 000 1.5zM17.25 6.375a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM15.75 9a.75.75 0 100-1.5.75.75 0 000 1.5zM15 15.75a.75.75 0 11.75-.75.75.75 0 01-.75.75zM12 11.25a.75.75 0 10-1.5 0 .75.75 0 001.5 0zM11.25 13.5a.75.75 0 110 1.5.75.75 0 010-1.5zM9.75 15.75a.75.75 0 10.75.75.75.75 0 00-.75-.75zM9 9a.75.75 0 11.75-.75.75.75 0 01-.75.75zM6.75 6.375a.75.75 0 10-1.5 0 .75.75 0 001.5 0zM8.25 3.75a.75.75 0 110 1.5.75.75 0 010-1.5zM9.75 2.25a.75.75 0 10-1.5 0 .75.75 0 001.5 0zM12 2.25a.75.75 0 10-1.5 0 .75.75 0 001.5 0z" />
        <path fillRule="evenodd" d="M12 1.5c-5.83 0-10.5 3.96-10.5 8.625 0 4.02 2.62 7.552 6.287 8.567.368.102.75.102 1.118 0 1.32-.365 2.56-1.02 3.66-1.895.385-.314.86-.314 1.246 0 1.1 1.018 2.34 1.674 3.66 1.895.368.102.75.102 1.118 0 3.667-1.015 6.287-4.547 6.287-8.567C22.5 5.46 17.83 1.5 12 1.5zM9.75 12.75a.75.75 0 000 1.5h4.5a.75.75 0 000-1.5h-4.5z" clipRule="evenodd" />
    </svg>
);

const BeakerIcon: FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M3.375 3C2.339 3 1.5 3.84 1.5 4.875v.512c1.352.074 2.68.397 3.952.975a.75.75 0 01.473 1.09L4.2 12.75a.75.75 0 01-1.299-.75l1.725-5.325c-1.3-1.013-2.125-2.58-2.125-4.325V4.875C2.5 3.84 3.339 3 4.375 3H19.625c1.036 0 1.875.84 1.875 1.875v.001c0 1.745-.826 3.312-2.125 4.325l1.725 5.325a.75.75 0 01-1.3.75L18.075 8.44a.75.75 0 01.473-1.09c1.272-.578 2.6-.901 3.952-.975v-.513C22.5 3.84 21.661 3 20.625 3H3.375z" clipRule="evenodd" />
      <path d="M12 12.75a.75.75 0 00-1.125-.632l-3 1.5a.75.75 0 00-.375.632V21a.75.75 0 00.75.75h7.5a.75.75 0 00.75-.75v-6.75a.75.75 0 00-.375-.632l-3-1.5A.75.75 0 0012 12.75z" />
    </svg>
);

const ExclamationTriangleIcon: FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
  </svg>
);

const DocumentTextIcon: FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a.375.375 0 01-.375-.375V6.75A3.75 3.75 0 009 3H5.625zM7.5 15a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H8.25z" clipRule="evenodd" />
        <path d="M12.971 1.816A5.23 5.23 0 0114.25 1.5c.646 0 1.27.126 1.846.368l-5.116 5.116V1.816z" />
    </svg>
);

const ChartBarIcon: FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
);

const LightBulbIcon: FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 2.25a.75.75 0 01.75.75v.518c.95.15 1.84.46 2.64.884a.75.75 0 01-.46 1.352 6.75 6.75 0 00-4.86 4.86.75.75 0 01-1.352.46A8.25 8.25 0 019.482 3.52v-.518a.75.75 0 01.75-.75z" />
        <path fillRule="evenodd" d="M12 21a8.25 8.25 0 01-8.25-8.25c0-3.322 1.965-6.133 4.797-7.41a.75.75 0 01.753 1.292 5.25 5.25 0 003.4 3.4.75.75 0 011.292.753A8.25 8.25 0 0112 21z" clipRule="evenodd" />
    </svg>
);

const FireIcon: FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M12.963 2.286a.75.75 0 00-1.071 1.052A9.75 9.75 0 0110.5 18.75a8.25 8.25 0 01-3.427-.923 1.5 1.5 0 00-1.025.275 1.5 1.5 0 00-.733.883 1.5 1.5 0 00.513 1.574 1.5 1.5 0 001.372.238 9.752 9.752 0 0011.566-6.918 9.75 9.75 0 00-2.03-9.522.75.75 0 00-1.052-1.071zM10.5 16.5c0-1.034.223-2.036.64-2.952a.75.75 0 00-1.2-.75A8.25 8.25 0 009 18.75a6.75 6.75 0 006.75-6.75 6.75 6.75 0 00-1.88-4.535.75.75 0 00-1.127.942A5.25 5.25 0 0115 12a5.25 5.25 0 01-5.25 5.25.75.75 0 00-.75.75c0 .414.336.75.75.75A6.75 6.75 0 0015.75 12a.75.75 0 00-.75-.75H10.5z" clipRule="evenodd" />
    </svg>
);

const ClipboardDocumentListIcon: FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M10.5 3A2.25 2.25 0 008.25 5.25v.057a3.743 3.743 0 014.5 0V5.25A2.25 2.25 0 0010.5 3zM6 5.25a3.75 3.75 0 007.5 0V5.25a2.25 2.25 0 012.25-2.25H18a3.75 3.75 0 013.75 3.75v10.5A3.75 3.75 0 0118 21H6a3.75 3.75 0 01-3.75-3.75V9A3.75 3.75 0 016 5.25zM12 9a.75.75 0 01.75.75v.008a.75.75 0 01-1.5 0V9.75A.75.75 0 0112 9z" clipRule="evenodd" />
        <path d="M11.24 12.006a.75.75 0 10-1.06-1.06l-2.25 2.25a.75.75 0 001.06 1.06l2.25-2.25zM15.74 12.006a.75.75 0 10-1.06-1.06l-2.25 2.25a.75.75 0 001.06 1.06l2.25-2.25zM11.24 16.506a.75.75 0 10-1.06-1.06l-2.25 2.25a.75.75 0 001.06 1.06l2.25-2.25zM15.74 16.506a.75.75 0 10-1.06-1.06l-2.25 2.25a.75.75 0 001.06 1.06l2.25-2.25z" />
    </svg>
);

const SparklesIcon: FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M9.315 7.584C12.195 3.883 16.695 1.5 21.75 1.5a.75.75 0 01.75.75c0 5.056-2.383 9.555-6.084 12.436A6.75 6.75 0 019.75 22.5a.75.75 0 01-.75-.75v-7.19c0-1.767.96-3.364 2.47-4.116zM14.25 10.5a.75.75 0 00-1.5 0v2.69a.75.75 0 001.5 0v-2.69z" clipRule="evenodd" />
        <path d="M3.75 12.75a.75.75 0 000 1.5h.75a.75.75 0 000-1.5h-.75zM8.25 8.625a.75.75 0 000 1.5h.75a.75.75 0 000-1.5h-.75zM3.75 17.25a.75.75 0 000 1.5h.75a.75.75 0 000-1.5h-.75zM8.25 13.125a.75.75 0 000 1.5h.75a.75.75 0 000-1.5h-.75zM12.75 8.625a.75.75 0 000 1.5h.75a.75.75 0 000-1.5h-.75zM12.75 17.25a.75.75 0 000 1.5h.75a.75.75 0 000-1.5h-.75z" />
    </svg>
);

const SpeakerWaveIcon: FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.348 2.595.341 1.24 1.518 1.905 2.66 1.905H6.44l4.5 4.5c.945.945 2.56.276 2.56-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.099 3.099 3.099 8.191 0 11.29a.75.75 0 11-1.06-1.06 6.75 6.75 0 000-9.172.75.75 0 010-1.06z" />
        <path d="M16.082 7.608a.75.75 0 011.06 0c1.88 1.88 1.88 4.916 0 6.795a.75.75 0 11-1.06-1.06 3.75 3.75 0 000-4.675.75.75 0 010-1.06z" />
    </svg>
);

const PlayIcon: FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.647c1.295.748 1.295 2.539 0 3.286L7.279 20.99c-1.25.722-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
    </svg>
);

const StopIcon: FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M4.5 7.5a3 3 0 013-3h9a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9z" clipRule="evenodd" />
    </svg>
);

const SaveIcon: FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M3 5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25v13.5A2.25 2.25 0 0118.75 21H5.25A2.25 2.25 0 013 18.75V5.25zM12 18a.75.75 0 00.75-.75V12.75h1.25a.75.75 0 000-1.5H12V9.75a.75.75 0 00-1.5 0V11.25H9.25a.75.75 0 000 1.5H10.5v4.5a.75.75 0 001.5 0z" />
    </svg>
);

const TrashIcon: FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-2.005 13.5a.75.75 0 01-.732.656H6.88a.75.75 0 01-.732-.656l-2.005-13.5-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.9h1.368c1.603 0 2.816 1.336 2.816 2.9zM10.5 6h3a.75.75 0 01.75.75v.5a.75.75 0 01-1.5 0v-.5h-3v.5a.75.75 0 01-1.5 0v-.5A.75.75 0 0110.5 6z" clipRule="evenodd" />
    </svg>
);

const CheckIcon: FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
    </svg>
);


// --- UI COMPONENTS ---

const Card: FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
    <div className={`w-full bg-[--bg-secondary] p-6 rounded-2xl shadow-lg ${className}`} style={{boxShadow: '0 10px 25px -5px var(--shadow-color)'}}>
        {children}
    </div>
);

const ErrorBanner: FC<{ message: string | null; onDismiss: () => void; }> = ({ message, onDismiss }) => {
  if (!message) return null;
  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm w-full bg-red-500 text-white p-4 rounded-lg shadow-lg flex items-start animate-fade-in" role="alert">
      <div className="flex-shrink-0"><ExclamationTriangleIcon className="w-6 h-6" /></div>
      <div className="ml-3">
        <p className="font-bold text-lg">Error</p>
        <p className="text-base mt-1">{message}</p>
      </div>
      <button onClick={onDismiss} className="ml-auto -mr-1 -mt-1 p-1 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-white" aria-label="Dismiss">
        <XCircleIcon className="w-5 h-5" />
      </button>
    </div>
  );
};

const Toast: FC<{ message: string | null }> = ({ message }) => {
  if (!message) return null;
  return (
    <div className="fixed bottom-20 right-4 z-50 max-w-sm w-full bg-green-600 text-white p-4 rounded-lg shadow-lg flex items-center animate-fade-in" role="status">
      <CheckIcon className="w-6 h-6 mr-3" />
      <p className="font-semibold text-base">{message}</p>
    </div>
  );
};

const Header: FC<{theme: string, setTheme: (theme: string) => void}> = ({theme, setTheme}) => (
  <header className="w-full text-center p-6 relative col-span-12">
    <div className="flex items-center justify-center gap-4">
      <MoonIcon className="w-10 h-10 text-[--accent-primary]" />
      <h1 className="text-5xl md:text-6xl font-bold text-[--text-primary] tracking-tight">Sleep Safe</h1>
    </div>
    <p className="text-[--text-secondary] mt-4 text-lg md:text-xl max-w-prose mx-auto">An AI-Powered Dynamic Cognitive Co-Pilot.</p>
    <ThemeSwitcher currentTheme={theme} onChangeTheme={setTheme} />
  </header>
);

const ThemeSwitcher: FC<{currentTheme: string, onChangeTheme: (theme: string) => void}> = ({ currentTheme, onChangeTheme }) => {
    const themes = [ { name: 'sunset', color: 'bg-orange-500' }, { name: 'ocean', color: 'bg-sky-500' }, { name: 'twilight', color: 'bg-indigo-500' } ];
    return (
        <div className="absolute top-6 right-0 md:right-6 flex items-center gap-2 bg-[--bg-secondary] p-2 rounded-full border border-[--border-color] shadow-sm">
            {themes.map(theme => (
                <button
                    key={theme.name}
                    onClick={() => onChangeTheme(`theme-${theme.name}`)}
                    className={`w-8 h-8 rounded-full ${theme.color} transition-transform duration-200 ${currentTheme === `theme-${theme.name}` ? 'ring-2 ring-offset-2 ring-[--accent-primary] ring-offset-[--bg-secondary]' : 'hover:scale-110'}`}
                    aria-label={`Switch to ${theme.name} theme`}
                />
            ))}
        </div>
    )
};


// --- TYPES ---
type Message = { author: 'bot' | 'user'; text: string; };
type Sentiment = string; // More granular: 'Calm', 'Anxious', 'Frustrated', etc.
type TypingPattern = 'fatigue' | 'emotion' | 'stable';
type VoiceSettings = { stability: number; style: number; };
type VoicePreset = { name: string; stability: number; style: number; };
type VoiceMode = 'dynamic' | 'custom';
type AnalysisResult = {
  id: string;
  timestamp: string;
  typingPattern: TypingPattern;
  typingConfidence: number | null;
  sentiment: Sentiment;
  theme: string; // New: 'Work', 'Relationships', 'Health'
  cognitiveLoad: number; // New metric: 0-100
  stats: { keys: number; backspaces: number; errorRatio: number; };
};
type ActiveTab = 'analysis' | 'settings';
type CognitiveInsight = { insight: string; suggestion: string; };

// --- ADVANCED AI COMPONENTS ---

interface CognitiveInsightCardProps {
    insight: string;
    suggestion: string;
    onAcceptSuggestion: () => void;
    onDismiss: () => void;
}

const CognitiveInsightCard: FC<CognitiveInsightCardProps> = ({ insight, suggestion, onAcceptSuggestion, onDismiss }) => (
    <div className="flex items-start gap-3 p-4 mb-3 bg-indigo-100 border border-indigo-200 rounded-lg animate-fade-in">
        <LightBulbIcon className="w-8 h-8 text-indigo-500 flex-shrink-0 mt-1" />
        <div className="flex-grow">
            <h4 className="font-semibold text-indigo-800">Cognitive Insight</h4>
            <p className="text-indigo-700 text-base">{insight}</p>
            <button
                onClick={onAcceptSuggestion}
                className="mt-2 text-left text-base font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
                "{suggestion}"
            </button>
        </div>
        <button onClick={onDismiss} aria-label="Dismiss insight">
            <XCircleIcon className="w-6 h-6 text-indigo-400 hover:text-indigo-600" />
        </button>
    </div>
);

// --- CHAT COMPONENT ---
interface ChatAnalysisSessionProps {
    messages: Message[];
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
    sensitivity: number;
    isTypingAnalysisOn: boolean;
    isEmotionalGuardOn: boolean;
    onAnalysisComplete: (result: AnalysisResult) => void;
    cognitiveInsight: CognitiveInsight | null;
    setCognitiveInsight: React.Dispatch<React.SetStateAction<CognitiveInsight | null>>;
    isVoiceOutputOn: boolean;
    selectedVoice: string;
    onBotReplyAudio: (text: string, voiceId: string, settings: VoiceSettings) => void;
    voiceMode: VoiceMode;
    customStability: number;
    customStyle: number;
}
const ChatAnalysisSession: FC<ChatAnalysisSessionProps> = ({ messages, setMessages, sensitivity, isTypingAnalysisOn, isEmotionalGuardOn, onAnalysisComplete, cognitiveInsight, setCognitiveInsight, isVoiceOutputOn, selectedVoice, onBotReplyAudio, voiceMode, customStability, customStyle }) => {
    const [inputValue, setInputValue] = useState('');
    const [isBotReplying, setIsBotReplying] = useState(false);
    const chatRef = useRef<Chat | null>(null);
    const [lastTypingAnalysis, setLastTypingAnalysis] = useState<AnalysisResult | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    
    // State for Smart Prompts feature
    const [smartPrompts, setSmartPrompts] = useState<string[]>([]);
    const [isFetchingPrompts, setIsFetchingPrompts] = useState(false);

    const typingStats = useRef({ keys: 0, backspaces: 0 });
    const ai = useRef<GoogleGenAI | null>(null);

    useEffect(() => {
        try {
            ai.current = new GoogleGenAI({ apiKey: process.env.API_KEY! });
            chatRef.current = ai.current.chats.create({
                model: 'gemini-2.5-flash',
                config: {
                    systemInstruction: "You are a friendly and insightful assistant specializing in sleep psychology. Your goal is to engage the user in a conversation. At the beginning of some user messages, you will receive a context tag like '[CONTEXT: sentiment=Anxious, pattern=fatigue, theme=Work, cognitive_load=78]'. Use this information to tailor your response to be more empathetic and relevant to the user's detected state, but do NOT mention the context tag or the analysis directly. For example, if the theme is 'Work' and load is high, you might say 'It sounds like that situation at work is really weighing on you.' to show you understand the topic of stress. You can use SSML tags like <break time='0.5s'/> for pauses or <emphasis level='strong'>...</emphasis> for emphasis to make your delivery more natural.",
                },
            });
        } catch (error) {
            console.error("Failed to initialize Gemini AI:", error);
            setMessages(prev => [...prev, { author: 'bot', text: "Sorry, the chat service is unavailable right now." }]);
        }
    }, [setMessages]);

     useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isBotReplying]);

    const threshold = SENSITIVITY_LEVELS[sensitivity as keyof typeof SENSITIVITY_LEVELS];

    const calculateFatigueConfidence = (keys: number, errorRatio: number) => {
        const keyRatio = Math.min(1, Math.max(0, (keys - threshold.keys) / (threshold.keys)));
        const errorRatioPercentage = Math.min(1, Math.max(0, (errorRatio - threshold.errorRatio) / (threshold.errorRatio)));
        return Math.min(100, Math.max(0, Math.round(((keyRatio * 0.5) + (errorRatioPercentage * 0.5)) * 100)));
    };

    const calculateEmotionConfidence = (keys: number, errorRatio: number) => {
        const keyRatio = Math.min(1, Math.max(0, (keys - EMOTIONAL_KEY_THRESHOLD) / (EMOTIONAL_KEY_THRESHOLD)));
        const errorPerfRatio = Math.max(0, (EMOTIONAL_ERROR_RATIO_MAX - errorRatio) / EMOTIONAL_ERROR_RATIO_MAX);
        return Math.min(100, Math.max(0, Math.round(((keyRatio * 0.6) + (errorPerfRatio * 0.4)) * 100)));
    };

    const GRANULAR_SENTIMENTS = ['Calm', 'Content', 'Hopeful', 'Neutral', 'Anxious', 'Frustrated', 'Sad', 'Agitated'];
    const getSentimentAnalysis = async (text: string): Promise<Sentiment> => {
        if (!ai.current) return 'Unknown';
        try {
            const response = await ai.current.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Analyze the sentiment of the following text. Respond with only a single descriptive word from this list: ${GRANULAR_SENTIMENTS.join(', ')}. Text: "${text}"`
            });
            const sentiment = response.text.trim();
            return GRANULAR_SENTIMENTS.includes(sentiment) ? sentiment : 'Neutral';
        } catch (error) {
            console.error("Sentiment analysis error:", error);
            return 'Unknown';
        }
    };
    
     const getThematicAnalysis = async (text: string): Promise<string> => {
        if (!ai.current) return 'General';
        try {
            const response = await ai.current.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `What is the main theme of this text? Respond with only one or two words (e.g., Work, Family, Health, Social, Finances, Self-reflection, General). Text: "${text}"`
            });
            return response.text.trim();
        } catch (error) {
            console.error("Thematic analysis error:", error);
            return 'General';
        }
    };
    
    const calculateCognitiveLoad = (sentiment: Sentiment, pattern: TypingPattern): number => {
        const sentimentScores: { [key: string]: number } = {
            'Agitated': 95, 'Frustrated': 85, 'Sad': 80, 'Anxious': 75,
            'Neutral': 40, 'Hopeful': 30, 'Content': 20, 'Calm': 10, 'Unknown': 50
        };
        const patternMultipliers: { [key in TypingPattern]: number } = {
            'emotion': 1.15, 'fatigue': 1.1, 'stable': 1
        };
        const baseScore = sentimentScores[sentiment] || 50;
        const finalScore = Math.min(100, Math.round(baseScore * patternMultipliers[pattern]));
        return finalScore;
    };
    
    const calculateVoiceSettings = (analysisResult: AnalysisResult): VoiceSettings => {
        if (voiceMode === 'custom') {
            return { stability: customStability, style: customStyle };
        }
    
        // Dynamic mode logic: Adjusts voice emotion based on cognitive load.
        // 'stability' controls randomness (higher = more monotonic/calm).
        // 'style' controls exaggeration (higher = more expressive/energetic).
        // This creates a more empathetic response, soothing when the user is stressed
        // and more engaging when they are calm.
        const load = analysisResult.cognitiveLoad;
        const HIGH_LOAD_THRESHOLD = 70;
        const LOW_LOAD_THRESHOLD = 30;
    
        // High cognitive load -> calm, soothing voice
        if (load >= HIGH_LOAD_THRESHOLD) {
            return { stability: 0.8, style: 0.1 };
        }
        // Low cognitive load -> energetic, positive voice
        if (load <= LOW_LOAD_THRESHOLD) {
            return { stability: 0.4, style: 0.6 };
        }
    
        // Interpolate for mid-range cognitive load
        const loadRange = HIGH_LOAD_THRESHOLD - LOW_LOAD_THRESHOLD;
        const progress = (load - LOW_LOAD_THRESHOLD) / loadRange; // Progress from low to high load (0.0 to 1.0)
    
        // As progress -> 1 (higher load), stability should increase (become calmer)
        const stability = 0.4 + (0.8 - 0.4) * progress;
        // As progress -> 1 (higher load), style should decrease (become less expressive)
        const style = 0.6 - (0.6 - 0.1) * progress;
    
        return { stability: parseFloat(stability.toFixed(2)), style: parseFloat(style.toFixed(2)) };
    };


    const runAnalysis = async (userMessage: string): Promise<AnalysisResult> => {
        const { keys, backspaces } = typingStats.current;
        const errorRatio = keys > 0 ? backspaces / keys : 0;
        
        let detectedPattern: TypingPattern = 'stable';
        let confidence: number | null = null;

        if (isEmotionalGuardOn && keys >= EMOTIONAL_KEY_THRESHOLD && errorRatio <= EMOTIONAL_ERROR_RATIO_MAX) {
            detectedPattern = 'emotion';
            confidence = calculateEmotionConfidence(keys, errorRatio);
        } else if (isTypingAnalysisOn && keys >= threshold.keys && errorRatio >= threshold.errorRatio) {
            detectedPattern = 'fatigue';
            confidence = calculateFatigueConfidence(keys, errorRatio);
        }
        
        const [sentiment, theme] = await Promise.all([
            getSentimentAnalysis(userMessage),
            getThematicAnalysis(userMessage)
        ]);
        const cognitiveLoad = calculateCognitiveLoad(sentiment, detectedPattern);

        const finalResult: AnalysisResult = {
            id: new Date().toISOString(),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            typingPattern: detectedPattern,
            typingConfidence: confidence,
            sentiment,
            theme,
            cognitiveLoad,
            stats: { keys, backspaces, errorRatio },
        };

        onAnalysisComplete(finalResult);
        setLastTypingAnalysis(finalResult);
        typingStats.current = { keys: 0, backspaces: 0 };
        return finalResult;
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const userMessage = inputValue.trim();
        if (userMessage === '' || isBotReplying) return;
        
        setSmartPrompts([]); // Clear prompts on send
        setMessages(prev => [...prev, { author: 'user', text: userMessage }]);
        setInputValue('');
        setIsBotReplying(true);

        const analysisResult = await runAnalysis(userMessage);
        const voiceSettings = calculateVoiceSettings(analysisResult);

        try {
            if (!chatRef.current) throw new Error("Chat session not initialized.");
            
            const context = `[CONTEXT: sentiment=${analysisResult.sentiment}, pattern=${analysisResult.typingPattern}, theme=${analysisResult.theme}, cognitive_load=${analysisResult.cognitiveLoad}]`;
            const messageForBot = `${context} ${userMessage}`;

            const response = await chatRef.current.sendMessage({ message: messageForBot });
            const botResponse = response.text;
            setMessages(prev => [...prev, { author: 'bot', text: botResponse }]);
            if (isVoiceOutputOn) {
                onBotReplyAudio(botResponse, selectedVoice, voiceSettings);
            }
        } catch (error) {
            console.error("Gemini API error:", error);
            setMessages(prev => [...prev, { author: 'bot', text: "Oops, something went wrong. Please try again." }]);
        } finally {
            setIsBotReplying(false);
        }
    };
    
    const generateSmartPrompts = useCallback(async () => {
        if (!ai.current) return;
        setIsFetchingPrompts(true);
        try {
            const getTimeOfDay = () => {
                const hour = new Date().getHours();
                if (hour >= 5 && hour < 12) return 'morning';
                if (hour >= 12 && hour < 18) return 'afternoon';
                if (hour >= 18 && hour < 23) return 'evening';
                return 'late night';
            };

            const timeOfDay = getTimeOfDay();
            const userStateContext = lastTypingAnalysis ?
                `The user's last detected sentiment was '${lastTypingAnalysis.sentiment}' on the topic of '${lastTypingAnalysis.theme}'. Their cognitive load was ${lastTypingAnalysis.cognitiveLoad}/100.` :
                "The user is just starting the session.";

            const prompt = `You are a creative assistant for a wellness app. Your task is to generate 3 short, gentle, and open-ended conversation starters as questions.
            Context:
            - It is currently ${timeOfDay}.
            - ${userStateContext}
            - The user is talking to a supportive AI assistant about their well-being and sleep.
            - The prompts should encourage reflection and be under 15 words.
            Return the response as a JSON array of 3 strings. Example: ["What's on your mind this evening?", "How are you feeling right now?"]`;

            const response = await ai.current.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                    },
                },
            });

            const result = JSON.parse(response.text);
            if (Array.isArray(result) && result.every(item => typeof item === 'string')) {
                setSmartPrompts(result);
            }
        } catch (error) {
            console.error("Failed to generate smart prompts:", error);
        } finally {
            setIsFetchingPrompts(false);
        }
    }, [lastTypingAnalysis]);

    useEffect(() => {
        const shouldGenerate = !isBotReplying && !inputValue && !isFetchingPrompts && smartPrompts.length === 0 && (isTypingAnalysisOn || isEmotionalGuardOn);
        if (shouldGenerate) {
            generateSmartPrompts();
        }
        if (inputValue && smartPrompts.length > 0) {
            setSmartPrompts([]);
        }
    }, [isBotReplying, inputValue, messages, generateSmartPrompts, isFetchingPrompts, smartPrompts.length, isTypingAnalysisOn, isEmotionalGuardOn]);


    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleSendMessage(event);
        }
        if (!isTypingAnalysisOn && !isEmotionalGuardOn) return;
        typingStats.current.keys += 1;
        if (event.key === 'Backspace') {
            typingStats.current.backspaces += 1;
        }
    };

    return (
        <Card className="h-full flex flex-col">
            <div className="flex items-center gap-3 mb-4">
                <BrainIcon className="w-8 h-8 text-[--text-secondary]" />
                <h2 className="text-3xl font-semibold text-[--text-primary]">Interactive Session</h2>
            </div>
            <div className="flex-grow bg-[var(--bg-primary)] p-4 rounded-lg overflow-y-auto mb-4 border border-[--border-color] min-h-[50vh]">
                <div className="flex flex-col space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.author === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`rounded-lg px-4 py-2 max-w-[80%] break-words shadow-sm ${msg.author === 'user' ? 'bg-[var(--accent-primary)] text-white' : 'bg-white text-slate-800'}`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isBotReplying && (
                        <div className="flex justify-start">
                            <div className="rounded-lg px-4 py-2 max-w-[80%] bg-white text-slate-800 shadow-sm">
                                <div className="flex items-center space-x-1">
                                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>
             {cognitiveInsight && (
                <CognitiveInsightCard
                    insight={cognitiveInsight.insight}
                    suggestion={cognitiveInsight.suggestion}
                    onAcceptSuggestion={() => {
                        setInputValue(prev => prev ? `${prev} ${cognitiveInsight.suggestion}` : cognitiveInsight.suggestion);
                        setCognitiveInsight(null);
                    }}
                    onDismiss={() => setCognitiveInsight(null)}
                />
            )}
             {smartPrompts.length > 0 && !inputValue && !isBotReplying && (
                <div className="mb-4 animate-fade-in">
                    <div className="flex items-center gap-2 mb-2">
                        <SparklesIcon className="w-5 h-5 text-[--accent-primary]" />
                        <h4 className="text-base font-semibold text-[--text-secondary]">Feeling stuck? Try one of these:</h4>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {smartPrompts.map((prompt, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    setInputValue(prompt);
                                    setSmartPrompts([]);
                                }}
                                className="px-3 py-1.5 bg-[--bg-primary] text-[--text-primary] rounded-full text-base border border-[--border-color] hover:bg-[--accent-primary] hover:text-white hover:border-[--accent-primary] transition-colors"
                            >
                                {prompt}
                            </button>
                        ))}
                    </div>
                </div>
            )}
            <form onSubmit={handleSendMessage} className="flex gap-3 mb-2">
                <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isBotReplying ? "Assistant is typing..." : ((!isTypingAnalysisOn && !isEmotionalGuardOn) ? "Enable an analysis to begin..." : "Type your response...")}
                    className="flex-grow w-full bg-[var(--bg-primary)] border border-[--border-color] text-[--text-primary] rounded-lg p-3 text-lg focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)] disabled:opacity-50 resize-none"
                    rows={2}
                    disabled={(!isTypingAnalysisOn && !isEmotionalGuardOn) || isBotReplying}
                />
                <button 
                    type="submit" 
                    className="bg-[--accent-primary] text-white font-semibold py-3 px-5 rounded-lg hover:bg-[--accent-primary-hover] transition-colors duration-200 text-xl disabled:opacity-50 disabled:cursor-not-allowed self-end"
                    disabled={(!isTypingAnalysisOn && !isEmotionalGuardOn) || isBotReplying || !inputValue.trim()}
                >
                    Send
                </button>
            </form>
             {lastTypingAnalysis && (
                <div className="mt-2 text-left p-3 bg-[var(--bg-primary)] rounded-lg animate-fade-in border border-[--border-color]">
                    <h3 className="text-lg font-semibold text-[--text-primary] mb-2 text-center">Last Message Analysis</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-center">
                        <div>
                            <p className="text-sm text-[--text-secondary]">Typing Pattern</p>
                            <p className="text-xl font-bold text-[--text-primary] capitalize">{lastTypingAnalysis.typingPattern}</p>
                        </div>
                        <div>
                           <p className="text-sm text-[--text-secondary]">Sentiment</p>
                           <p className="text-xl font-bold text-[--text-primary]">{lastTypingAnalysis.sentiment}</p>
                        </div>
                        <div>
                           <p className="text-sm text-[--text-secondary]">Theme</p>
                           <p className="text-xl font-bold text-[--text-primary]">{lastTypingAnalysis.theme}</p>
                        </div>
                         <div>
                           <p className="text-sm text-[--text-secondary]">Cognitive Load</p>
                           <p className="text-xl font-bold text-[--text-primary]">{lastTypingAnalysis.cognitiveLoad} / 100</p>
                        </div>
                    </div>
                </div>
             )}
        </Card>
    );
};

// --- SIDE PANEL COMPONENTS ---
const SessionJournal: FC<{ history: AnalysisResult[] }> = ({ history }) => (
    <div className="space-y-4 max-h-72 overflow-y-auto pr-2">
        {history.length > 0 ? (
            history.slice().reverse().map(item => (
                <div key={item.id} className="p-3 rounded-lg bg-[--bg-primary] border border-[--border-color]">
                    <div className="flex justify-between items-center text-xs text-[--text-secondary] mb-1">
                        <span>{item.timestamp}</span>
                        <span>Load: {item.cognitiveLoad}</span>
                    </div>
                    <div className="grid grid-cols-3 items-center text-center">
                        <span className="font-semibold text-base text-[--text-primary] capitalize">{item.typingPattern}</span>
                        <span className="font-semibold text-base text-[--text-primary]">{item.sentiment}</span>
                         <span className="font-semibold text-base text-[--text-primary]">{item.theme}</span>
                    </div>
                </div>
            ))
        ) : (
            <p className="text-center text-[--text-secondary] py-8">Your analysis history will appear here.</p>
        )}
    </div>
);

const AnalysisSettings: FC<{
  isTypingAnalysisOn: boolean;
  onTypingToggle: (enabled: boolean) => void;
  isEmotionalGuardOn: boolean;
  onEmotionalToggle: (enabled: boolean) => void;
  sensitivity: number;
  onSensitivityChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isVoiceOutputOn: boolean;
  onVoiceOutputToggle: (enabled: boolean) => void;
  selectedVoice: string;
  onVoiceChange: (voiceId: string) => void;
  onPreviewVoice: (voiceId: string) => void;
  previewingVoiceId: string | null;
  voiceMode: VoiceMode;
  onVoiceModeChange: (mode: VoiceMode) => void;
  customStability: number;
  onCustomStabilityChange: (value: number) => void;
  customStyle: number;
  onCustomStyleChange: (value: number) => void;
  voicePresets: VoicePreset[];
  onSavePreset: (name: string) => void;
  onDeletePreset: (name:string) => void;
  onApplyPreset: (preset: VoicePreset) => void;
  onReset: () => void;
}> = ({ 
    isTypingAnalysisOn, onTypingToggle, 
    isEmotionalGuardOn, onEmotionalToggle, 
    sensitivity, onSensitivityChange, 
    isVoiceOutputOn, onVoiceOutputToggle,
    selectedVoice, onVoiceChange,
    onPreviewVoice, previewingVoiceId,
    voiceMode, onVoiceModeChange,
    customStability, onCustomStabilityChange,
    customStyle, onCustomStyleChange,
    voicePresets, onSavePreset, onDeletePreset, onApplyPreset,
    onReset 
}) => {
    const sensitivityLabel = SENSITIVITY_LABELS[sensitivity as keyof typeof SENSITIVITY_LABELS] || 'Balanced';
    const sliderPercentage = ((sensitivity - 1) / 2) * 100;
    const isDisabled = !isTypingAnalysisOn && !isEmotionalGuardOn;
    const [isSavingPreset, setIsSavingPreset] = useState(false);
    const [newPresetName, setNewPresetName] = useState('');

    const handleSaveClick = () => {
        if (newPresetName.trim()) {
            onSavePreset(newPresetName.trim());
            setNewPresetName('');
            setIsSavingPreset(false);
        }
    };


    return (
         <div className="space-y-6 p-1">
             <div className="flex justify-between items-center mb-2">
                 <div className="flex items-center gap-3">
                    <BeakerIcon className="w-6 h-6 text-[--text-secondary]" />
                    <h3 className="text-xl font-semibold text-[--text-primary]">Typing Fatigue</h3>
                </div>
                <button onClick={() => onTypingToggle(!isTypingAnalysisOn)} className={`${isTypingAnalysisOn ? 'bg-[--accent-primary]' : 'bg-slate-300'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`} aria-pressed={isTypingAnalysisOn}>
                    <span className={`${isTypingAnalysisOn ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                </button>
            </div>
            <p className="text-[--text-secondary] -mt-4">Analyzes for high intensity and correction rates to detect potential fatigue.</p>
             <div className="flex justify-between items-center mb-2">
                 <div className="flex items-center gap-3">
                    <BrainIcon className="w-6 h-6 text-[--text-secondary]" />
                    <h3 className="text-xl font-semibold text-[--text-primary]">Emotional Typing</h3>
                </div>
                <button onClick={() => onEmotionalToggle(!isEmotionalGuardOn)} className={`${isEmotionalGuardOn ? 'bg-[--accent-primary]' : 'bg-slate-300'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`} aria-pressed={isEmotionalGuardOn}>
                    <span className={`${isEmotionalGuardOn ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                </button>
            </div>
            <p className="text-[--text-secondary] -mt-4">Analyzes for very high speed with low corrections to detect potential agitation.</p>

            <div className={`border-y border-[--border-color] py-6 ${isDisabled ? 'opacity-50' : ''} transition-opacity`}>
                <h3 className="text-xl font-semibold text-[--text-primary] mb-3">Analysis Sensitivity</h3>
                <p className="text-[--text-secondary] mb-5">Adjust how sensitive the typing analysis is. 'Strict' detects patterns more easily.</p>
                 <div className="relative pt-6">
                    <div className="absolute -top-1 mb-2 bg-[--accent-primary] text-white text-xs font-semibold px-2 py-1 rounded-md transform -translate-x-1/2 transition-all duration-150 ease-out" style={{ left: `${sliderPercentage}%` }}>
                        {sensitivityLabel}
                        <div className="absolute top-full left-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-[--accent-primary] transform -translate-x-1/2"></div>
                    </div>
                    <input type="range" min="1" max="3" step="1" value={sensitivity} onChange={onSensitivityChange} disabled={isDisabled} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[--accent-primary] disabled:accent-slate-400" />
                </div>
            </div>

            <div className="border-b border-[--border-color] pb-6">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                        <SpeakerWaveIcon className="w-6 h-6 text-[--text-secondary]" />
                        <h3 className="text-xl font-semibold text-[--text-primary]">Assistant Voice</h3>
                    </div>
                    <button onClick={() => onVoiceOutputToggle(!isVoiceOutputOn)} className={`${isVoiceOutputOn ? 'bg-[--accent-primary]' : 'bg-slate-300'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`} aria-pressed={isVoiceOutputOn}>
                        <span className={`${isVoiceOutputOn ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                    </button>
                </div>
                <div className={`space-y-3 ${!isVoiceOutputOn ? 'opacity-50' : ''} transition-opacity`}>
                    {VOICES.map(voice => (
                        <div key={voice.id} className="flex items-center justify-between p-3 bg-[--bg-primary] rounded-lg border border-[--border-color]">
                            <label htmlFor={`voice-${voice.id}`} className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="radio"
                                    id={`voice-${voice.id}`}
                                    name="voice-selection"
                                    value={voice.id}
                                    checked={selectedVoice === voice.id}
                                    onChange={() => onVoiceChange(voice.id)}
                                    disabled={!isVoiceOutputOn}
                                    className="w-5 h-5 text-[--accent-primary] focus:ring-[--accent-primary]"
                                />
                                <div>
                                    <span className="font-semibold text-base text-[--text-primary]">{voice.name}</span>
                                    <span className="block text-sm text-[--text-secondary]">{voice.description}</span>
                                </div>
                            </label>
                            <button
                                onClick={() => onPreviewVoice(voice.id)}
                                disabled={!isVoiceOutputOn}
                                className="p-2 rounded-full hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                aria-label={`Preview ${voice.name} voice`}
                            >
                                {previewingVoiceId === voice.id ? <StopIcon className="w-6 h-6 text-[--accent-primary]" /> : <PlayIcon className="w-6 h-6 text-[--text-secondary]" />}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- NEW: Voice Customization --- */}
            <div className={`border-b border-[--border-color] pb-6 ${!isVoiceOutputOn ? 'opacity-50 pointer-events-none' : ''}`}>
                <h3 className="text-xl font-semibold text-[--text-primary] mb-3">Voice Customization</h3>
                 <div className="flex items-center gap-4 bg-[--bg-primary] p-1 rounded-full border border-[--border-color] mb-4">
                    <button onClick={() => onVoiceModeChange('dynamic')} className={`flex-1 text-center py-2 rounded-full font-semibold transition-colors ${voiceMode === 'dynamic' ? 'bg-[--accent-primary] text-white' : 'text-[--text-secondary] hover:bg-slate-200'}`}>Dynamic</button>
                    <button onClick={() => onVoiceModeChange('custom')} className={`flex-1 text-center py-2 rounded-full font-semibold transition-colors ${voiceMode === 'custom' ? 'bg-[--accent-primary] text-white' : 'text-[--text-secondary] hover:bg-slate-200'}`}>Custom</button>
                </div>
                <div className={`space-y-4 transition-opacity ${voiceMode === 'custom' ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                    <div>
                        <label htmlFor="stability-slider" className="flex justify-between text-base font-medium text-[--text-primary] mb-1"><span>Stability (Calm)</span><span>{customStability.toFixed(2)}</span></label>
                        <input id="stability-slider" type="range" min="0" max="1" step="0.05" value={customStability} onChange={(e) => onCustomStabilityChange(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[--accent-primary]" />
                    </div>
                    <div>
                        <label htmlFor="style-slider" className="flex justify-between text-base font-medium text-[--text-primary] mb-1"><span>Style (Expressive)</span><span>{customStyle.toFixed(2)}</span></label>
                        <input id="style-slider" type="range" min="0" max="1" step="0.05" value={customStyle} onChange={(e) => onCustomStyleChange(Number(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[--accent-primary]" />
                    </div>
                    <div>
                        {isSavingPreset ? (
                            <div className="flex gap-2">
                                <input type="text" value={newPresetName} onChange={(e) => setNewPresetName(e.target.value)} placeholder="Preset Name..." className="flex-grow bg-white border border-[--border-color] text-[--text-primary] rounded-lg p-2 text-base focus:ring-2 focus:ring-[--accent-primary]"/>
                                <button onClick={handleSaveClick} className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600"><CheckIcon className="w-6 h-6"/></button>
                                <button onClick={() => setIsSavingPreset(false)} className="p-2 bg-slate-200 text-slate-600 rounded-lg hover:bg-slate-300"><XCircleIcon className="w-6 h-6"/></button>
                            </div>
                        ) : (
                            <button onClick={() => setIsSavingPreset(true)} className="w-full flex items-center justify-center gap-2 bg-slate-100 text-slate-700 font-semibold py-2 px-4 rounded-lg hover:bg-slate-200 border border-slate-300 transition-colors">
                                <SaveIcon className="w-5 h-5" /> Save as Preset
                            </button>
                        )}
                    </div>
                    {voicePresets.length > 0 && (
                        <div className="space-y-2 pt-2">
                             <h4 className="text-base font-semibold text-[--text-secondary]">Your Presets</h4>
                             {voicePresets.map(preset => (
                                <div key={preset.name} className="flex items-center justify-between p-2 bg-[--bg-primary] rounded-lg border border-[--border-color]">
                                    <span className="font-semibold text-base text-[--text-primary]">{preset.name}</span>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => onApplyPreset(preset)} className="text-[--accent-primary] hover:text-[--accent-primary-hover] font-bold text-sm">APPLY</button>
                                        <button onClick={() => onDeletePreset(preset.name)} className="p-1 text-red-500 hover:text-red-700"><TrashIcon className="w-5 h-5" /></button>
                                    </div>
                                </div>
                             ))}
                        </div>
                    )}
                </div>
            </div>

            <div>
                <h3 className="text-xl font-semibold text-[--text-primary] mb-3">Session Control</h3>
                <button onClick={onReset} className="w-full bg-red-500 text-white font-semibold py-3 px-5 rounded-lg hover:bg-red-600 transition-colors duration-200 text-xl flex items-center justify-center gap-2">Reset Session</button>
            </div>
        </div>
    );
};

const MarkdownRenderer: FC<{ content: string }> = ({ content }) => {
    const renderContent = () => {
        return content.split('\n').map((line, index) => {
            line = line.trim();
            if (line.startsWith('### ')) {
                return <h3 key={index} className="text-xl font-semibold text-[--text-primary] mt-4 mb-2">{line.substring(4)}</h3>;
            }
             if (line.startsWith('* ')) {
                const itemContent = line.replace(/^\*\s/, '');
                return <li key={index} className="ml-5 list-disc text-base text-[--text-secondary] mb-2">{renderInline(itemContent)}</li>;
            }
            if (line.match(/^\d+\.\s/)) {
                const itemContent = line.replace(/^\d+\.\s/, '');
                return <li key={index} className="ml-5 text-base text-[--text-secondary] mb-2">{renderInline(itemContent)}</li>;
            }
            if (line === '') {
                return <br key={index} />;
            }
            return <p key={index} className="text-base text-[--text-secondary] mb-2">{renderInline(line)}</p>;
        });
    };
    const renderInline = (text: string) => {
        const parts = text.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i} className="font-bold text-[--text-primary]">{part.slice(2, -2)}</strong>;
            }
            return part;
        });
    };
    return <div className="prose">{renderContent()}</div>;
};

const TrendChart: FC<{ history: AnalysisResult[] }> = ({ history }) => {
    if (history.length < 2) {
        return <div className="text-center text-[--text-secondary] py-8">More data needed to show trends.</div>;
    }

    const width = 300;
    const height = 120;
    const padding = 20;
    
    const cognitiveLoadToY = (load: number) => {
        return height - padding - (load / 100) * (height - 2 * padding);
    };

    const points = history.map((item, i) => ({
        x: history.length > 1 ? (i / (history.length - 1)) * (width - 2 * padding) + padding : width / 2,
        y: cognitiveLoadToY(item.cognitiveLoad),
        pattern: item.typingPattern,
        sentiment: item.sentiment,
        load: item.cognitiveLoad,
        theme: item.theme,
    }));

    const pathD = points.map((p, i) => (i === 0 ? 'M' : 'L') + `${p.x} ${p.y}`).join(' ');
    
    const patternColors: Record<TypingPattern, string> = {
        stable: '#22C55E',
        fatigue: '#F97316',
        emotion: '#EF4444',
    };

    return (
        <div className="p-4 bg-[--bg-primary] rounded-lg border border-[--border-color] mb-6">
            <div className="relative">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" aria-label="Cognitive Load trend chart">
                    <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#D1D5DB" strokeWidth="0.5" strokeDasharray="2,2" />
                    <text x={padding - 15} y={padding} dy="0.3em" fontSize="8" fill="var(--text-secondary)">High</text>
                    
                    <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#D1D5DB" strokeWidth="0.5" strokeDasharray="2,2" />
                    <text x={padding - 15} y={height-padding} dy="0.3em" fontSize="8" fill="var(--text-secondary)">Low</text>

                    <path d={pathD} fill="none" stroke="var(--accent-primary)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />

                    {points.map((p, i) => (
                        <circle key={i} cx={p.x} cy={p.y} r="3.5" fill={patternColors[p.pattern]} stroke="var(--bg-secondary)" strokeWidth="1.5">
                            <title>{`Message ${i+1}: Cognitive Load ${p.load}, Sentiment: ${p.sentiment}, Theme: ${p.theme}`}</title>
                        </circle>
                    ))}
                </svg>
            </div>
            <div className="flex justify-center gap-4 mt-3 text-xs text-[--text-secondary]">
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#22C55E]"></span>Stable</div>
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#F97316]"></span>Fatigue</div>
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]"></span>Emotion</div>
            </div>
        </div>
    );
};

const CognitiveHotspots: FC<{ history: AnalysisResult[] }> = ({ history }) => {
    const calculateHotspots = useCallback(() => {
        const themeData = new Map<string, { totalLoad: number; count: number }>();
        history.forEach(item => {
            if (item.theme && item.theme !== 'General' && item.theme !== 'Unknown') {
                const existing = themeData.get(item.theme) || { totalLoad: 0, count: 0 };
                themeData.set(item.theme, {
                    totalLoad: existing.totalLoad + item.cognitiveLoad,
                    count: existing.count + 1,
                });
            }
        });
        const hotspots = Array.from(themeData.entries()).map(([theme, data]) => ({
            theme,
            avgLoad: Math.round(data.totalLoad / data.count),
            count: data.count,
        }));
        return hotspots.sort((a, b) => b.avgLoad - a.avgLoad).slice(0, 5); // Show top 5
    }, [history]);

    const getHotspotColor = (load: number): string => {
        if (load > 80) return 'bg-red-200 text-red-800 border-red-300';
        if (load > 65) return 'bg-orange-200 text-orange-800 border-orange-300';
        if (load > 50) return 'bg-amber-200 text-amber-800 border-amber-300';
        return 'bg-green-200 text-green-800 border-green-300';
    };

    const hotspots = calculateHotspots();

    if (hotspots.length === 0) {
        return <div className="text-center text-[--text-secondary] py-4 text-base">Key topics will appear here as you chat.</div>;
    }

    return (
        <div className="p-4 bg-[--bg-primary] rounded-lg border border-[--border-color] mb-6">
            <div className="flex flex-wrap gap-2">
                {hotspots.map(({ theme, avgLoad }) => (
                    <div key={theme} className={`flex items-center gap-2 px-3 py-1 rounded-full text-base font-semibold border ${getHotspotColor(avgLoad)}`}>
                        {theme}
                        <span className="font-bold">{avgLoad}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};


const AnalysisSkeletonLoader: FC = () => (
    <div className="p-4 bg-[--bg-primary] rounded-lg border border-[--border-color] animate-pulse">
        <div className="h-6 w-2/3 bg-slate-200 rounded mb-4"></div>
        <div className="h-4 w-full bg-slate-200 rounded mb-2"></div>
        <div className="h-4 w-5/6 bg-slate-200 rounded mb-6"></div>
        <div className="h-6 w-1/2 bg-slate-200 rounded mb-4"></div>
        <div className="h-4 w-full bg-slate-200 rounded mb-2"></div>
        <div className="h-4 w-full bg-slate-200 rounded mb-2"></div>
        <div className="h-4 w-4/6 bg-slate-200 rounded"></div>
    </div>
);


// --- MAIN APP COMPONENT ---

export default function App() {
  const [theme, setTheme] = useState(() => getInitialValue('theme', 'theme-sunset', String));
  const [isTypingAnalysisOn, setIsTypingAnalysisOn] = useState(() => getInitialValue('isTypingAnalysisOn', true, (v) => v === 'true'));
  const [isEmotionalGuardOn, setIsEmotionalGuardOn] = useState(() => getInitialValue('isEmotionalGuardOn', true, (v) => v === 'true'));
  const [globalSensitivity, setGlobalSensitivity] = useState(() => getInitialValue('globalSensitivity', 2, Number));
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisResult[]>(() => getInitialValue('analysisHistory', [], JSON.parse));
  const [messages, setMessages] = useState<Message[]>(() => getInitialValue('messages', [{ author: 'bot', text: "Hello! To begin our session, could you tell me a little about how you slept last night?" }], JSON.parse));
  const [finalAnalysis, setFinalAnalysis] = useState<string | null>(() => getInitialValue('finalAnalysis', null, JSON.parse));
  const [sessionSummary, setSessionSummary] = useState<string | null>(() => getInitialValue('sessionSummary', null, JSON.parse));
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('analysis');
  const [storageError, setStorageError] = useState<string | null>(null);
  const [cognitiveInsight, setCognitiveInsight] = useState<CognitiveInsight | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);

  // New state for voice feature
  const [isVoiceOutputOn, setIsVoiceOutputOn] = useState(() => getInitialValue('isVoiceOutputOn', true, v => v === 'true'));
  const [selectedVoice, setSelectedVoice] = useState(() => getInitialValue('selectedVoice', VOICES[0].id, String));
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [previewingVoiceId, setPreviewingVoiceId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // New state for advanced voice controls
  const [voiceMode, setVoiceMode] = useState<VoiceMode>(() => getInitialValue('voiceMode', 'dynamic', v => v as VoiceMode));
  const [customStability, setCustomStability] = useState(() => getInitialValue('customStability', 0.75, Number));
  const [customStyle, setCustomStyle] = useState(() => getInitialValue('customStyle', 0.1, Number));
  const [voicePresets, setVoicePresets] = useState<VoicePreset[]>(() => getInitialValue('voicePresets', [], JSON.parse));

  const ai = useRef<GoogleGenAI | null>(null);
  const insightFiredRef = useRef(false);

  useEffect(() => {
    try {
        ai.current = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    } catch(e) {
        console.error("Failed to initialize AI", e);
        setStorageError("Could not initialize AI. Check API Key.");
    }
  }, []);

  useEffect(() => {
    if (toastMessage && toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
    }
    if (toastMessage) {
        toastTimeoutRef.current = window.setTimeout(() => {
            setToastMessage(null);
        }, 3000);
    }
    return () => {
        if (toastTimeoutRef.current) {
            clearTimeout(toastTimeoutRef.current);
        }
    };
  }, [toastMessage]);
  
  useEffect(() => {
    try {
      localStorage.setItem('theme', theme);
      document.body.className = theme;
      localStorage.setItem('isTypingAnalysisOn', String(isTypingAnalysisOn));
      localStorage.setItem('isEmotionalGuardOn', String(isEmotionalGuardOn));
      localStorage.setItem('globalSensitivity', String(globalSensitivity));
      localStorage.setItem('analysisHistory', JSON.stringify(analysisHistory));
      localStorage.setItem('messages', JSON.stringify(messages));
      localStorage.setItem('finalAnalysis', JSON.stringify(finalAnalysis));
      localStorage.setItem('sessionSummary', JSON.stringify(sessionSummary));
      localStorage.setItem('isVoiceOutputOn', String(isVoiceOutputOn));
      localStorage.setItem('selectedVoice', selectedVoice);
      localStorage.setItem('voiceMode', voiceMode);
      localStorage.setItem('customStability', String(customStability));
      localStorage.setItem('customStyle', String(customStyle));
      localStorage.setItem('voicePresets', JSON.stringify(voicePresets));
      if (storageError) setStorageError(null);
    } catch (error) {
      console.error('Failed to save to localStorage', error);
      setStorageError('Your browser settings might be blocking storage. Your settings may not be saved.');
    }
  }, [theme, isTypingAnalysisOn, isEmotionalGuardOn, globalSensitivity, analysisHistory, messages, finalAnalysis, sessionSummary, isVoiceOutputOn, selectedVoice, voiceMode, customStability, customStyle, voicePresets, storageError]);
  
    const playAudio = useCallback(async (text: string, voiceId: string, settings?: VoiceSettings, onEndCallback?: () => void) => {
        if (audioRef.current && isAudioPlaying) {
            audioRef.current.pause();
        }
        setIsAudioPlaying(true);

        try {
            const response = await fetch('/api/elevenlabs/tts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, voiceId, ...settings })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Failed to fetch audio from server.');
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);

            if (!audioRef.current) {
                audioRef.current = new Audio();
            }
            audioRef.current.src = url;
            audioRef.current.play();

            const onEnded = () => {
                setIsAudioPlaying(false);
                URL.revokeObjectURL(url);
                if (onEndCallback) onEndCallback();
                if(audioRef.current) {
                    audioRef.current.removeEventListener('ended', onEnded);
                    audioRef.current.removeEventListener('pause', onEnded);
                }
            };

            audioRef.current.addEventListener('ended', onEnded);
            audioRef.current.addEventListener('pause', onEnded);

        } catch (error: any) {
            console.error("Audio playback error:", error);
            setStorageError(`Could not play audio: ${error.message}`);
            setIsAudioPlaying(false);
            if (onEndCallback) onEndCallback();
        }
    }, [isAudioPlaying]);


  // Cognitive Shift Detector
  useEffect(() => {
    if (analysisHistory.length < 3 || cognitiveInsight || insightFiredRef.current || !ai.current) return;

    const lastThree = analysisHistory.slice(-3);
    const [thirdLast, secondLast, last] = lastThree;

    // Detect a sharp, sustained increase in cognitive load
    const isSharpIncrease = last.cognitiveLoad > secondLast.cognitiveLoad * 1.5 && secondLast.cognitiveLoad > thirdLast.cognitiveLoad;
    const wasInitialStateCalm = thirdLast.cognitiveLoad < 45; // Started from a relatively low load
    const isCurrentStateHigh = last.cognitiveLoad > 65; // Ends in a high load state

    if (wasInitialStateCalm && isSharpIncrease && isCurrentStateHigh) {
        const generateSuggestion = async () => {
            const recentMessages = messages.slice(-3).map(m => `${m.author}: ${m.text}`).join('\n');
            const prompt = `A user is chatting with a wellness bot. Their cognitive load has suddenly increased. Based on their last few messages, generate a single, gentle, open-ended question to help them explore what might be on their mind. Do not refer to the analysis. The question should be empathetic and encouraging. Respond with ONLY the question itself.
            
            Recent conversation:
            ${recentMessages}`;
            
            try {
                const response = await ai.current!.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
                const suggestion = response.text.trim().replace(/"/g, ''); // Clean up quotes
                 setCognitiveInsight({
                    insight: "It appears the intensity of our conversation has increased recently.",
                    suggestion: suggestion || "Is there something specific on your mind?" // Fallback
                });
                insightFiredRef.current = true; // Prevents it from firing again this session
            } catch(e) {
                console.error("Failed to generate dynamic suggestion:", e);
                 // Fallback to static suggestion on error
                setCognitiveInsight({
                    insight: "It appears the intensity of our conversation has increased recently.",
                    suggestion: "Is there something specific on your mind?"
                });
                insightFiredRef.current = true;
            }
        };
        generateSuggestion();
    }
  }, [analysisHistory, cognitiveInsight, messages]);


  const handleNewAnalysis = useCallback((result: AnalysisResult) => {
    setAnalysisHistory(prev => [...prev, result]);
  }, []);
  
    const handlePreviewVoice = (voiceId: string) => {
        if (previewingVoiceId === voiceId && audioRef.current) {
            audioRef.current.pause(); // This will trigger the 'pause' listener to clean up state
        } else {
            setPreviewingVoiceId(voiceId);
            playAudio("Hello, this is a preview of my voice.", voiceId, { stability: customStability, style: customStyle }, () => {
                setPreviewingVoiceId(null);
            });
        }
    };
  
    const handleSavePreset = (name: string) => {
        const newPreset: VoicePreset = { name, stability: customStability, style: customStyle };
        setVoicePresets(prev => [...prev.filter(p => p.name !== name), newPreset]);
        setToastMessage(`Preset "${name}" saved!`);
    };
    
    const handleDeletePreset = (name: string) => {
        setVoicePresets(prev => prev.filter(p => p.name !== name));
        setToastMessage(`Preset "${name}" deleted.`);
    };

    const handleApplyPreset = (preset: VoicePreset) => {
        setCustomStability(preset.stability);
        setCustomStyle(preset.style);
        setToastMessage(`Preset "${preset.name}" applied!`);
    };

  const handleGenerateSummary = async () => {
    if (!ai.current) { setStorageError("AI service is not available."); return; }
    setIsGeneratingSummary(true);
    const fullTranscript = messages.map(m => `${m.author === 'user' ? 'User' : 'Assistant'}: ${m.text}`).join('\n');
    
    const prompt = `You are a helpful wellness analyst. Read the following conversation transcript and provide a concise, bulleted summary (3-4 points) of the main topics discussed and the key emotional turning points. Focus on the user's journey. Start your response with "Here is a quick summary of your session:". Use Markdown for the bullet points (e.g., "* Point 1").
    
    **Transcript:**
    ${fullTranscript}`;
    
    try {
        const response = await ai.current.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
        setSessionSummary(response.text);
    } catch (error) {
        console.error("Session summary generation error:", error);
        setStorageError("Sorry, I couldn't generate the session summary. Please try again.");
        setSessionSummary(null);
    } finally {
        setIsGeneratingSummary(false);
    }
  };

  const handleGenerateFinalPlan = async () => {
    if (!ai.current) { setStorageError("AI service is not available."); return; }
    setIsGeneratingPlan(true); setFinalAnalysis(null);
    const fullTranscript = messages.map(m => `${m.author === 'user' ? 'User' : 'Assistant'}: ${m.text}`).join('\n');
    
    const themeData = new Map<string, { totalLoad: number; count: number }>();
    analysisHistory.forEach(item => {
        if (item.theme && item.theme !== 'General' && item.theme !== 'Unknown') {
            const existing = themeData.get(item.theme) || { totalLoad: 0, count: 0 };
            themeData.set(item.theme, { totalLoad: existing.totalLoad + item.cognitiveLoad, count: existing.count + 1 });
        }
    });
    const hotspots = Array.from(themeData.entries()).map(([theme, data]) => ({ theme, avgLoad: Math.round(data.totalLoad / data.count), count: data.count }));
    const hotspotSummary = hotspots
        .sort((a,b) => b.avgLoad - a.avgLoad)
        .map(h => `- Theme: '${h.theme}' (mentioned ${h.count} times) with an average cognitive load of ${h.avgLoad}/100.`)
        .join('\n');

    const prompt = `You are a helpful and empathetic wellness coach specializing in sleep science. Based on the following data from a user's session, provide a comprehensive final analysis and a personalized, actionable sleep plan.
**Session Data:**
**1. Full Conversation Transcript:**\n${fullTranscript}\n
**2. Thematic Cognitive Hotspots:**\nThese are the topics that correlated with the highest cognitive load:\n${hotspotSummary || 'No specific themes were detected.'}\n
**Your Task:** Generate a response in Markdown format. The response should have two main sections:
1.  **Final Analysis:** Start with a heading '### Final Analysis'. Summarize the user's potential state of mind. Be gentle and insightful. Connect their words to their cognitive load and, most importantly, to the **Thematic Hotspots**. For example, "I noticed when you discussed 'Work', your cognitive load score increased significantly, suggesting this is a major source of stress."
2.  **Your Personalized Sleep Plan:** Start with a heading '### Your Personalized Sleep Plan'. Provide 3-5 simple, concrete, and actionable steps. **Crucially, these steps must directly address the highest-load themes identified in the hotspots.** Frame these as gentle suggestions. For example, "Given that 'Finances' was a point of high cognitive load, let's try this before bed: **1. Schedule a 'Worry Time':** ...".
Keep the tone supportive, positive, and encouraging.`;
    
    try {
        const response = await ai.current.models.generateContent({ model: 'gemini-2.5-pro', contents: prompt });
        setFinalAnalysis(response.text);
    } catch (error) {
        console.error("Final analysis generation error:", error);
        setStorageError("Sorry, I couldn't generate the final analysis. Please try again.");
    } finally {
        setIsGeneratingPlan(false);
    }
  };
  
  const handleExportSession = () => {
    const sessionData = `
# Sleep Safe Session Export
## Date: ${new Date().toLocaleString()}

---

## AI-Generated Session Summary
${sessionSummary || "Not generated yet."}

---

## Conversation Transcript
${messages.map(m => `[${m.author.toUpperCase()}] ${m.text}`).join('\n')}

---

## Session Journal
${analysisHistory.map(a => `- ${a.timestamp} | Theme: ${a.theme} | Typing: ${a.typingPattern} | Sentiment: ${a.sentiment} | Cognitive Load: ${a.cognitiveLoad}/100`).join('\n')}

---

## Final Analysis & Sleep Plan
${finalAnalysis || "Not generated yet."}
`;
    const blob = new Blob([sessionData.trim()], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sleep-safe-session-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleResetSession = () => {
    if (window.confirm("Are you sure you want to reset the entire session? This will clear all messages and analysis data.")) {
        if (audioRef.current) audioRef.current.pause();
        setMessages([{ author: 'bot', text: "Hello! To begin our session, could you tell me a little about how you slept last night?" }]);
        setAnalysisHistory([]);
        setFinalAnalysis(null);
        setSessionSummary(null);
        setCognitiveInsight(null);
        insightFiredRef.current = false;
    }
  };

  const userMessagesCount = messages.filter(m => m.author === 'user').length;

  return (
    <main className="min-h-screen flex flex-col items-center p-4 sm:p-6 md:p-8 text-lg">
      <div className="w-full max-w-7xl mx-auto space-y-8">
        <Header theme={theme} setTheme={setTheme} />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
            <div className="lg:col-span-7">
                <ChatAnalysisSession messages={messages} setMessages={setMessages} isTypingAnalysisOn={isTypingAnalysisOn} isEmotionalGuardOn={isEmotionalGuardOn} sensitivity={globalSensitivity} onAnalysisComplete={handleNewAnalysis} cognitiveInsight={cognitiveInsight} setCognitiveInsight={setCognitiveInsight} isVoiceOutputOn={isVoiceOutputOn} selectedVoice={selectedVoice} onBotReplyAudio={playAudio} voiceMode={voiceMode} customStability={customStability} customStyle={customStyle} />
            </div>
            <div className="lg:col-span-5">
                 <Card className="h-full">
                    <div className="border-b border-[--border-color] mb-4">
                        <nav className="-mb-px flex space-x-6">
                            <button onClick={() => setActiveTab('analysis')} className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-xl ${activeTab === 'analysis' ? 'border-[--accent-primary] text-[--accent-primary]' : 'border-transparent text-[--text-secondary] hover:text-[--text-primary] hover:border-gray-300'}`}>Analysis</button>
                            <button onClick={() => setActiveTab('settings')} className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-xl ${activeTab === 'settings' ? 'border-[--accent-primary] text-[--accent-primary]' : 'border-transparent text-[--text-secondary] hover:text-[--text-primary] hover:border-gray-300'}`}>Settings</button>
                        </nav>
                    </div>

                    {activeTab === 'analysis' && (
                        <div className="space-y-6">
                             <div>
                                <div className="flex items-center gap-3 mb-3">
                                    <FireIcon className="w-6 h-6 text-[--text-secondary]" />
                                    <h3 className="text-xl font-semibold text-[--text-primary]">Cognitive Hotspots</h3>
                                </div>
                                <CognitiveHotspots history={analysisHistory} />
                             </div>
                             <div className="border-t border-[--border-color] pt-6">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <ChartBarIcon className="w-6 h-6 text-[--text-secondary]" />
                                        <h3 className="text-xl font-semibold text-[--text-primary]">Cognitive Load Trend</h3>
                                    </div>
                                    <button onClick={handleExportSession} disabled={analysisHistory.length === 0} className="text-sm font-medium text-[--accent-primary] hover:text-[--accent-primary-hover] disabled:opacity-50 disabled:cursor-not-allowed">Export Session</button>
                                </div>
                                <TrendChart history={analysisHistory} />
                            </div>
                            <div className="border-t border-[--border-color] pt-6">
                                <div className="flex items-center gap-3 mb-3">
                                    <ClipboardDocumentListIcon className="w-6 h-6 text-[--text-secondary]" />
                                    <h3 className="text-xl font-semibold text-[--text-primary]">Session at a Glance</h3>
                                </div>
                                {isGeneratingSummary ? (
                                    <AnalysisSkeletonLoader />
                                ) : sessionSummary ? (
                                    <div className="p-4 bg-[--bg-primary] rounded-lg border border-[--border-color] max-h-96 overflow-y-auto">
                                        <MarkdownRenderer content={sessionSummary} />
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-[--text-secondary] mb-4">Generate a quick, AI-powered summary of your conversation's key points.</p>
                                        <button onClick={handleGenerateSummary} disabled={isGeneratingSummary || userMessagesCount < 2} className="w-full bg-[--accent-primary] text-white font-semibold py-3 px-5 rounded-lg hover:bg-[--accent-primary-hover] transition-colors duration-200 text-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                            {isGeneratingSummary ? (<><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>Generating...</>) : (`Generate Summary (${userMessagesCount}/2)`)}
                                        </button>
                                    </>
                                )}
                            </div>
                            <div className="border-t border-[--border-color] pt-6">
                                <div className="flex items-center gap-3 mb-3">
                                    <DocumentTextIcon className="w-6 h-6 text-[--text-secondary]" />
                                    <h3 className="text-xl font-semibold text-[--text-primary]">Final Analysis & Sleep Plan</h3>
                                </div>
                                {isGeneratingPlan ? (
                                    <AnalysisSkeletonLoader />
                                ) : finalAnalysis ? (
                                    <div className="p-4 bg-[--bg-primary] rounded-lg border border-[--border-color] max-h-96 overflow-y-auto">
                                        <MarkdownRenderer content={finalAnalysis} />
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-[--text-secondary] mb-4">After your conversation (min. 3 replies), generate a personalized plan based on the session.</p>
                                        <button onClick={handleGenerateFinalPlan} disabled={isGeneratingPlan || userMessagesCount < 3} className="w-full bg-[--accent-primary] text-white font-semibold py-3 px-5 rounded-lg hover:bg-[--accent-primary-hover] transition-colors duration-200 text-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                            {isGeneratingPlan ? (<><span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>Generating...</>) : (`Generate Final Plan (${userMessagesCount}/3)`)}
                                        </button>
                                    </>
                                )}
                            </div>
                             <div className="border-t border-[--border-color] pt-6">
                                <div className="flex items-center gap-3 mb-3">
                                    <BeakerIcon className="w-6 h-6 text-[--text-secondary]" />
                                    <h3 className="text-xl font-semibold text-[--text-primary]">Session Journal</h3>
                                </div>
                               <SessionJournal history={analysisHistory} />
                            </div>
                        </div>
                    )}
                    
                    {activeTab === 'settings' && (
                        <AnalysisSettings 
                            isTypingAnalysisOn={isTypingAnalysisOn} onTypingToggle={setIsTypingAnalysisOn} 
                            isEmotionalGuardOn={isEmotionalGuardOn} onEmotionalToggle={setIsEmotionalGuardOn} 
                            sensitivity={globalSensitivity} onSensitivityChange={(e) => setGlobalSensitivity(Number(e.target.value))} 
                            isVoiceOutputOn={isVoiceOutputOn} onVoiceOutputToggle={setIsVoiceOutputOn}
                            selectedVoice={selectedVoice} onVoiceChange={setSelectedVoice}
                            onPreviewVoice={handlePreviewVoice} previewingVoiceId={previewingVoiceId}
                            voiceMode={voiceMode} onVoiceModeChange={setVoiceMode}
                            customStability={customStability} onCustomStabilityChange={setCustomStability}
                            customStyle={customStyle} onCustomStyleChange={setCustomStyle}
                            voicePresets={voicePresets} onSavePreset={handleSavePreset}
                            onDeletePreset={handleDeletePreset} onApplyPreset={handleApplyPreset}
                            onReset={handleResetSession} 
                        />
                    )}
                 </Card>
            </div>
        </div>
      </div>
      <ErrorBanner message={storageError} onDismiss={() => setStorageError(null)} />
      <Toast message={toastMessage} />
    </main>
  );
}