import React, { useState, useEffect, useMemo, useCallback, useRef, FC } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';

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

const SunIcon: FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.106a.75.75 0 010 1.06l-1.591 1.59a.75.75 0 11-1.06-1.06l1.59-1.591a.75.75 0 011.06 0zM21.75 12a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0v-2.25A.75.75 0 0121.75 12zM18.894 17.894a.75.75 0 011.06 0l1.59 1.59a.75.75 0 11-1.06 1.06l-1.59-1.591a.75.75 0 010-1.06zM12 18a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM5.106 17.894a.75.75 0 010-1.06l1.59-1.591a.75.75 0 111.06 1.06l-1.59 1.59a.75.75 0 01-1.06 0zM3 12a.75.75 0 01.75-.75h2.25a.75.75 0 010 1.5H3.75A.75.75 0 013 12zM5.106 6.106a.75.75 0 011.06 0l1.591 1.59a.75.75 0 01-1.06 1.06L6.167 7.167a.75.75 0 010-1.06z" />
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

const PaletteIcon: FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 2.25a.75.75 0 01.75.75v1.875a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75z" />
        <path fillRule="evenodd" d="M8.266 3.122A.75.75 0 019.25 3.878l1.04 1.04a.75.75 0 01-1.06 1.06L8.19 4.938a.75.75 0 01.076-1.06l-.002-.002zm6.528 1.04l1.04-1.04a.75.75 0 111.06 1.06l-1.04 1.04a.75.75 0 11-1.06-1.06z" clipRule="evenodd" />
        <path d="M10.5 12a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
        <path d="M5.25 12a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM15.75 12a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
        <path fillRule="evenodd" d="M12 21a9 9 0 006.144-15.862C16.892 4.14 15.014 3.75 13.5 3.75c-1.232 0-2.395.27-3.413.738a.75.75 0 01-.84-1.161C10.42 2.13 11.678 1.5 13.5 1.5c2.09 0 4.25.6 5.922 1.932A9.001 9.001 0 0112 21z" clipRule="evenodd" />
    </svg>
);


// --- UI COMPONENTS ---

const Card: FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
    <div className={`w-full bg-[--bg-secondary] p-8 rounded-2xl shadow-lg ${className}`} style={{boxShadow: '0 10px 25px -5px var(--shadow-color)'}}>
        {children}
    </div>
);

interface ErrorBannerProps {
    message: string | null;
    onDismiss: () => void;
}

const ErrorBanner: FC<ErrorBannerProps> = ({ message, onDismiss }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm w-full bg-red-500 text-white p-4 rounded-lg shadow-lg flex items-start animate-fade-in" role="alert">
      <div className="flex-shrink-0">
        <ExclamationTriangleIcon className="w-6 h-6" />
      </div>
      <div className="ml-3">
        <p className="font-bold text-lg">Could Not Save Settings</p>
        <p className="text-base mt-1">{message}</p>
      </div>
      <button 
        onClick={onDismiss} 
        className="ml-auto -mr-1 -mt-1 p-1 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-white"
        aria-label="Dismiss"
      >
        <XCircleIcon className="w-5 h-5" />
      </button>
    </div>
  );
};

const Header: FC<{theme: string, setTheme: (theme: string) => void}> = ({theme, setTheme}) => (
  <header className="w-full max-w-5xl text-center p-6 relative">
    <div className="flex items-center justify-center gap-4">
      <MoonIcon className="w-10 h-10 text-[--accent-primary]" />
      <h1 className="text-6xl font-bold text-[--text-primary] tracking-tight">Sleep Safe</h1>
    </div>
    <p className="text-[--text-secondary] mt-4 text-xl max-w-prose mx-auto">An interactive wellness journal to analyze typing patterns and promote healthier digital habits.</p>
    <ThemeSwitcher currentTheme={theme} onChangeTheme={setTheme} />
  </header>
);

const ThemeSwitcher: FC<{currentTheme: string, onChangeTheme: (theme: string) => void}> = ({ currentTheme, onChangeTheme }) => {
    const themes = [
        { name: 'sunset', color: 'bg-orange-500' },
        { name: 'ocean', color: 'bg-sky-500' },
        { name: 'twilight', color: 'bg-indigo-500' },
    ];

    return (
        <div className="absolute top-6 right-6 flex items-center gap-2 bg-[--bg-secondary] p-2 rounded-full border border-[--border-color] shadow-sm">
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
type Sentiment = 'Positive' | 'Negative' | 'Neutral' | 'Unknown';
type AnalysisResult = {
  id: string;
  timestamp: string;
  typingPattern: 'fatigue' | 'emotion' | 'stable';
  typingConfidence: number | null;
  sentiment: Sentiment;
  stats: {
    keys: number;
    backspaces: number;
    errorRatio: number;
  };
};

interface ChatAnalysisSessionProps {
    sensitivity: number;
    isTypingAnalysisOn: boolean;
    isEmotionalGuardOn: boolean;
    onAnalysisComplete: (result: AnalysisResult) => void;
}

const ChatAnalysisSession: FC<ChatAnalysisSessionProps> = ({ sensitivity, isTypingAnalysisOn, isEmotionalGuardOn, onAnalysisComplete }) => {
    const [messages, setMessages] = useState<Message[]>([
        { author: 'bot', text: "Hello! To begin our session, could you tell me a little about how you slept last night?" }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isBotReplying, setIsBotReplying] = useState(false);
    const chatRef = useRef<Chat | null>(null);
    const [visualTypingStats, setVisualTypingStats] = useState({ keys: 0, backspaces: 0 });
    const [analysisResult, setAnalysisResult] = useState<string | null>(null);
    const [lastTypingAnalysis, setLastTypingAnalysis] = useState<AnalysisResult | null>(null);
    
    const typingStats = useRef({ keys: 0, backspaces: 0 });
    const resultTimer = useRef<number | null>(null);
    const ai = useRef<GoogleGenAI | null>(null);

    useEffect(() => {
        try {
            ai.current = new GoogleGenAI({ apiKey: process.env.API_KEY! });
            chatRef.current = ai.current.chats.create({
                model: 'gemini-2.5-flash',
                config: {
                    systemInstruction: 'You are a friendly and insightful assistant specializing in sleep psychology. Your goal is to engage the user in a conversation about their sleep habits. Ask thoughtful, open-ended questions. Based on their responses, provide simple, supportive analysis and gentle suggestions. Maintain a natural, empathetic, and slightly more detailed conversational flow.',
                },
            });
        } catch (error) {
            console.error("Failed to initialize Gemini AI:", error);
            setMessages(prev => [...prev, { author: 'bot', text: "Sorry, the chat service is unavailable right now." }]);
        }
    }, []);

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

    const getSentimentAnalysis = async (text: string): Promise<Sentiment> => {
        if (!ai.current) return 'Unknown';
        try {
            const response = await ai.current.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Analyze the sentiment of the following text. Respond with only a single word: 'Positive', 'Negative', or 'Neutral'. Text: "${text}"`
            });
            const sentiment = response.text.trim();
            if (['Positive', 'Negative', 'Neutral'].includes(sentiment)) {
                return sentiment as Sentiment;
            }
            return 'Unknown';
        } catch (error) {
            console.error("Sentiment analysis error:", error);
            return 'Unknown';
        }
    };
    
    const runAnalysis = async (userMessage: string) => {
        const { keys, backspaces } = typingStats.current;
        const errorRatio = keys > 0 ? backspaces / keys : 0;
        
        let detectedPattern: 'fatigue' | 'emotion' | 'stable' = 'stable';
        let confidence: number | null = null;
        let resultMessage = "Analysis Complete: Your typing pattern appears stable.";

        if (isEmotionalGuardOn && keys >= EMOTIONAL_KEY_THRESHOLD && errorRatio <= EMOTIONAL_ERROR_RATIO_MAX) {
            detectedPattern = 'emotion';
            confidence = calculateEmotionConfidence(keys, errorRatio);
            resultMessage = "Emotional Pattern Detected: High speed with low errors.";
        } else if (isTypingAnalysisOn && keys >= threshold.keys && errorRatio >= threshold.errorRatio) {
            detectedPattern = 'fatigue';
            confidence = calculateFatigueConfidence(keys, errorRatio);
            resultMessage = "Fatigue Pattern Detected: High intensity with high correction rate.";
        }
        
        const sentiment = await getSentimentAnalysis(userMessage);

        const finalResult: AnalysisResult = {
            id: new Date().toISOString(),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            typingPattern: detectedPattern,
            typingConfidence: confidence,
            sentiment,
            stats: { keys, backspaces, errorRatio },
        };

        onAnalysisComplete(finalResult);
        setLastTypingAnalysis(finalResult);
        setAnalysisResult(resultMessage);

        typingStats.current = { keys: 0, backspaces: 0 };
        setVisualTypingStats({ keys: 0, backspaces: 0 });
        
        if (resultTimer.current) clearTimeout(resultTimer.current);
        resultTimer.current = window.setTimeout(() => setAnalysisResult(null), 8000);
    };


    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const userMessage = inputValue.trim();
        if (userMessage === '' || isBotReplying) return;
        
        setMessages(prev => [...prev, { author: 'user', text: userMessage }]);
        setInputValue('');
        setIsBotReplying(true);

        await runAnalysis(userMessage);

        try {
            if (!chatRef.current) throw new Error("Chat session not initialized.");
            const response = await chatRef.current.sendMessage({ message: userMessage });
            const botResponse = response.text;
            setMessages(prev => [...prev, { author: 'bot', text: botResponse }]);
        } catch (error) {
            console.error("Gemini API error:", error);
            setMessages(prev => [...prev, { author: 'bot', text: "Oops, something went wrong. Please try again." }]);
        } finally {
            setIsBotReplying(false);
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (!isTypingAnalysisOn && !isEmotionalGuardOn) return;
        if (resultTimer.current) clearTimeout(resultTimer.current);
        setAnalysisResult(null);
        
        typingStats.current.keys += 1;
        if (event.key === 'Backspace') {
            typingStats.current.backspaces += 1;
        }
        setVisualTypingStats({ ...typingStats.current });
    };

    return (
        <div className="bg-[--bg-secondary] p-6 rounded-xl border border-[--border-color] h-full shadow-inner">
            <div className="h-64 bg-[var(--bg-primary)] p-4 rounded-lg overflow-y-auto mb-4 flex flex-col space-y-4 border border-[--border-color]">
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
            </div>
            <form onSubmit={handleSendMessage} className="flex gap-3 mb-4">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isBotReplying ? "Assistant is typing..." : ((!isTypingAnalysisOn && !isEmotionalGuardOn) ? "Enable an analysis to begin..." : "Type your response...")}
                    className="flex-grow w-full bg-[var(--bg-primary)] border border-[--border-color] text-[--text-primary] rounded-lg p-3 text-xl focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-[var(--accent-primary)] disabled:opacity-50"
                    disabled={(!isTypingAnalysisOn && !isEmotionalGuardOn) || isBotReplying}
                />
                <button 
                    type="submit" 
                    className="bg-[--accent-primary] text-white font-semibold py-3 px-5 rounded-lg hover:bg-[--accent-primary-hover] transition-colors duration-200 text-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={(!isTypingAnalysisOn && !isEmotionalGuardOn) || isBotReplying || !inputValue.trim()}
                >
                    Send
                </button>
            </form>
             {lastTypingAnalysis && (
                <div className="mt-4 text-left p-4 bg-[var(--bg-primary)] rounded-lg animate-fade-in border border-[--border-color]">
                    <h3 className="text-xl font-semibold text-[--text-primary] mb-3 text-center">Last Message Analysis</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-base text-[--text-secondary]">Typing Pattern</p>
                            <p className="text-2xl font-bold text-[--text-primary] capitalize">{lastTypingAnalysis.typingPattern}</p>
                            {lastTypingAnalysis.typingConfidence != null && (
                                <div className="w-full bg-slate-200 rounded-full h-2 mt-1">
                                    <div className="bg-green-400 h-2 rounded-full" style={{ width: `${lastTypingAnalysis.typingConfidence}%` }}></div>
                                </div>
                            )}
                        </div>
                        <div>
                           <p className="text-base text-[--text-secondary]">Sentiment</p>
                           <p className="text-2xl font-bold text-[--text-primary]">{lastTypingAnalysis.sentiment}</p>
                        </div>
                    </div>
                </div>
             )}
        </div>
    );
};

interface AnalysisHistoryProps {
    history: AnalysisResult[];
}
const AnalysisHistory: FC<AnalysisHistoryProps> = ({ history }) => {
    return (
        <Card className="max-w-5xl">
            <div className="flex items-center gap-3 mb-4">
                <BeakerIcon className="w-8 h-8 text-[--text-secondary]" />
                <h2 className="text-4xl font-semibold text-[--text-primary]">Session Journal</h2>
            </div>
            <p className="text-[--text-secondary] text-lg mb-6 max-w-3xl">
                Review the analysis from your current session. This log is cleared when you close the tab.
            </p>
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {history.length > 0 ? (
                    history.slice().reverse().map(item => (
                        <div key={item.id} className="p-4 rounded-lg bg-[--bg-primary] border border-[--border-color]">
                            <div className="flex justify-between items-center text-sm text-[--text-secondary] mb-2">
                                <span>{item.timestamp}</span>
                                <span>Keys: {item.stats.keys} | Errors: {(item.stats.errorRatio * 100).toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="font-semibold text-lg text-[--text-primary] capitalize">Typing: {item.typingPattern}</span>
                                <span className="font-semibold text-lg text-[--text-primary]">Sentiment: {item.sentiment}</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-[--text-secondary] py-8">Your analysis history will appear here once you send a message.</p>
                )}
            </div>
        </Card>
    );
};


// --- SETTINGS COMPONENTS ---

interface AnalysisSettingsProps {
  isTypingAnalysisOn: boolean;
  onTypingToggle: (enabled: boolean) => void;
  isEmotionalGuardOn: boolean;
  onEmotionalToggle: (enabled: boolean) => void;
  sensitivity: number;
  onSensitivityChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
const AnalysisSettings: FC<AnalysisSettingsProps> = ({ isTypingAnalysisOn, onTypingToggle, isEmotionalGuardOn, onEmotionalToggle, sensitivity, onSensitivityChange }) => {
    const sensitivityLabel = SENSITIVITY_LABELS[sensitivity as keyof typeof SENSITIVITY_LABELS] || 'Balanced';
    const sliderPercentage = ((sensitivity - 1) / 2) * 100;
    const isDisabled = !isTypingAnalysisOn && !isEmotionalGuardOn;

    return (
         <div className="space-y-8">
            <div className={`border-b border-[--border-color] pb-8 ${isDisabled ? 'opacity-50' : ''} transition-opacity`}>
                <h3 className="text-2xl font-semibold text-[--text-primary] mb-4">Analysis Sensitivity</h3>
                <p className="text-[--text-secondary] text-lg mb-6">
                    Adjust how sensitive the typing analysis is. 'Strict' detects patterns more easily.
                </p>
                 <div className="relative pt-6">
                    <div
                        className="absolute -top-1 mb-2 bg-[--accent-primary] text-white text-sm font-semibold px-2 py-1 rounded-md transform -translate-x-1/2 transition-all duration-150 ease-out"
                        style={{ left: `${sliderPercentage}%` }}
                    >
                        {sensitivityLabel}
                        <div className="absolute top-full left-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-[--accent-primary] transform -translate-x-1/2"></div>
                    </div>
                    <input
                        type="range"
                        min="1" max="3" step="1"
                        value={sensitivity}
                        onChange={onSensitivityChange}
                        disabled={isDisabled}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[--accent-primary] disabled:accent-slate-400"
                    />
                </div>
            </div>
            
            <div>
                <div className="flex justify-between items-center mb-4">
                     <div className="flex items-center gap-3">
                        <BeakerIcon className="w-8 h-8 text-[--text-secondary]" />
                        <h3 className="text-2xl font-semibold text-[--text-primary]">Typing Fatigue</h3>
                    </div>
                    <button
                        onClick={() => onTypingToggle(!isTypingAnalysisOn)}
                        className={`${isTypingAnalysisOn ? 'bg-[--accent-primary]' : 'bg-slate-300'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                        aria-pressed={isTypingAnalysisOn}
                    >
                        <span className={`${isTypingAnalysisOn ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                    </button>
                </div>
                <p className="text-[--text-secondary] text-lg">
                    Analyzes for high intensity and correction rates to detect potential fatigue.
                </p>
            </div>

            <div>
                <div className="flex justify-between items-center mb-4">
                     <div className="flex items-center gap-3">
                        <BrainIcon className="w-8 h-8 text-[--text-secondary]" />
                        <h3 className="text-2xl font-semibold text-[--text-primary]">Emotional Typing Patterns</h3>
                    </div>
                    <button
                        onClick={() => onEmotionalToggle(!isEmotionalGuardOn)}
                        className={`${isEmotionalGuardOn ? 'bg-[--accent-primary]' : 'bg-slate-300'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                        aria-pressed={isEmotionalGuardOn}
                    >
                        <span className={`${isEmotionalGuardOn ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                    </button>
                </div>
                <p className="text-[--text-secondary] text-lg">
                    Analyzes for very high speed with low corrections to detect potential agitation.
                </p>
            </div>
        </div>
    );
};

// --- MAIN APP COMPONENT ---

export default function App() {
  const [theme, setTheme] = useState(() => getInitialValue('theme', 'theme-sunset', String));
  const [isTypingAnalysisOn, setIsTypingAnalysisOn] = useState(() => getInitialValue('isTypingAnalysisOn', true, (v) => v === 'true'));
  const [isEmotionalGuardOn, setIsEmotionalGuardOn] = useState(() => getInitialValue('isEmotionalGuardOn', true, (v) => v === 'true'));
  const [globalSensitivity, setGlobalSensitivity] = useState(() => getInitialValue('globalSensitivity', 2, Number));
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisResult[]>(() => getInitialValue('analysisHistory', [], JSON.parse));

  const [storageError, setStorageError] = useState<string | null>(null);
  
  // Persist settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('theme', theme);
      localStorage.setItem('isTypingAnalysisOn', String(isTypingAnalysisOn));
      localStorage.setItem('isEmotionalGuardOn', String(isEmotionalGuardOn));
      localStorage.setItem('globalSensitivity', String(globalSensitivity));
      localStorage.setItem('analysisHistory', JSON.stringify(analysisHistory));

      document.body.className = theme;

      if (storageError) setStorageError(null);
    } catch (error) {
      console.error('Failed to save to localStorage', error);
      setStorageError('Your browser settings might be blocking storage. Your settings may not be saved.');
    }
  }, [theme, isTypingAnalysisOn, isEmotionalGuardOn, globalSensitivity, analysisHistory, storageError]);
  
  const handleNewAnalysis = useCallback((result: AnalysisResult) => {
    setAnalysisHistory(prev => [...prev, result]);
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center p-4 sm:p-6 md:p-8 text-lg">
      <div className="w-full flex flex-col items-center space-y-8">
        <Header theme={theme} setTheme={setTheme} />
        
        <Card className="max-w-5xl">
            <div className="flex items-center gap-3 mb-4">
                <BrainIcon className="w-8 h-8 text-[--text-secondary]" />
                <h2 className="text-4xl font-semibold text-[--text-primary]">Interactive Psychological Analysis</h2>
            </div>
            <p className="text-[--text-secondary] text-lg mb-8 max-w-3xl">
                Engage in a conversation with our AI. After you send a message, the app will analyze your typing patterns and the sentiment of your words.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
                <div className="lg:col-span-3">
                     <ChatAnalysisSession
                        isTypingAnalysisOn={isTypingAnalysisOn}
                        isEmotionalGuardOn={isEmotionalGuardOn}
                        sensitivity={globalSensitivity}
                        onAnalysisComplete={handleNewAnalysis}
                    />
                </div>
                <div className="lg:col-span-2">
                    <AnalysisSettings
                        isTypingAnalysisOn={isTypingAnalysisOn}
                        onTypingToggle={setIsTypingAnalysisOn}
                        isEmotionalGuardOn={isEmotionalGuardOn}
                        onEmotionalToggle={setIsEmotionalGuardOn}
                        sensitivity={globalSensitivity}
                        onSensitivityChange={(e) => setGlobalSensitivity(Number(e.target.value))}
                    />
                </div>
            </div>
        </Card>
        
        <AnalysisHistory history={analysisHistory} />
      </div>
      <ErrorBanner message={storageError} onDismiss={() => setStorageError(null)} />
    </main>
  );
}