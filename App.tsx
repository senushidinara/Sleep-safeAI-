import React, { useState, useEffect, useMemo, useCallback, useRef, FC } from 'react';

// --- CONSTANTS ---
const ACTIVITY_THRESHOLD = 25;
const ACTIVITY_RESET_TIMEOUT = 3000; // 3 seconds
const SNOOZE_DURATION_MS = 5 * 60 * 1000; // 5 minutes
const TYPING_ANALYSIS_WINDOW = 4000; // 4 seconds
const SCROLL_ANALYSIS_WINDOW = 2000; // 2 seconds
const EMOTIONAL_KEY_THRESHOLD = 40; // High speed typing
const EMOTIONAL_ERROR_RATIO_MAX = 0.05; // Low error rate (5%)


// --- SENSITIVITY THRESHOLDS ---
const SENSITIVITY_LEVELS = {
    1: { keys: 30, errorRatio: 0.3, label: 'Relaxed' },    // Requires intense typing with many errors
    2: { keys: 20, errorRatio: 0.2, label: 'Balanced' },  // Default, balanced detection
    3: { keys: 15, errorRatio: 0.1, label: 'Strict' },     // More sensitive to signs of fatigue
};

const SCROLL_SENSITIVITY_LEVELS = {
    1: { distance: 4000, label: 'Relaxed' },    // Requires very fast scrolling
    2: { distance: 3000, label: 'Balanced' },  // Default, balanced detection
    3: { distance: 2000, label: 'Strict' },     // More sensitive to scrolling
};


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

const ShieldCheckIcon: FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3A5.25 5.25 0 0012 1.5zM9 6.75A2.25 2.25 0 0111.25 4.5h1.5A2.25 2.25 0 0115 6.75v3H9v-3zM10.09 15.16L8.22 13.29a.75.75 0 00-1.06 1.06l2.5 2.5a.75.75 0 001.06 0l5-5a.75.75 0 10-1.06-1.06l-4.47 4.47z" clipRule="evenodd" />
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

const ArrowsUpDownIcon: FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path fillRule="evenodd" d="M11.47 2.47a.75.75 0 011.06 0l3.75 3.75a.75.75 0 01-1.06 1.06L12 4.06l-3.22 3.22a.75.75 0 01-1.06-1.06l3.75-3.75zm-3.75 14.25a.75.75 0 011.06 0L12 19.94l3.22-3.22a.75.75 0 111.06 1.06l-3.75 3.75a.75.75 0 01-1.06 0l-3.75-3.75a.75.75 0 010-1.06z" clipRule="evenodd" />
  </svg>
);


// --- UI COMPONENTS ---

type BlockType = 'none' | 'activity' | 'fatigue' | 'emotion' | 'scroll';

interface BlockingOverlayProps {
  onSnooze: () => void;
  blockType: BlockType;
}

const BlockingOverlay: FC<BlockingOverlayProps> = ({ onSnooze, blockType }) => {
  if (blockType === 'none') return null;

  const messages = {
    activity: {
      title: "It's time to rest.",
      body: "You've been active late at night on a blocked app. Good sleep is important for your health and well-being."
    },
    fatigue: {
      title: "You seem tired.",
      body: "Your typing patterns suggest it might be time to rest. Protecting your sleep helps you recharge for tomorrow."
    },
    emotion: {
      title: "Take a deep breath.",
      body: "Your typing suggests you might be feeling agitated. Stepping away for a moment can help. A calm mind leads to better sleep."
    },
    scroll: {
      title: "Fast scrolling detected.",
      body: "Scrolling quickly can be a sign of distraction. Take a moment to rest your eyes and mind."
    }
  };
  
  const { title, body } = messages[blockType];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center border border-slate-700 transform transition-all animate-scale-in">
        <MoonIcon className="w-16 h-16 text-violet-400 mx-auto mb-6" />
        <h2 className="text-4xl font-bold text-slate-100 mb-3">{title}</h2>
        <p className="text-slate-400 mb-8 text-lg">{body}</p>
        <button
          onClick={onSnooze}
          className="w-full bg-violet-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-colors duration-200 text-lg"
        >
          Snooze for 5 minutes
        </button>
      </div>
      <style>{`
        @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        @keyframes scale-in { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .animate-scale-in { animation: scale-in 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
};

const Header: FC = () => (
  <header className="text-center p-6">
    <div className="flex items-center justify-center gap-4">
      <MoonIcon className="w-10 h-10 text-violet-400" />
      <h1 className="text-5xl font-bold text-slate-100 tracking-tight">Sleep Safe</h1>
    </div>
    <p className="text-slate-400 mt-4 text-lg max-w-prose">Block addictive apps and protect your sleep from late-night digital habits.</p>
  </header>
);

interface DashboardProps {
  currentTime: Date;
  sleepTime: string;
  wakeTime: string;
  isSleepTime: boolean;
  isSnoozed: boolean;
  blockedAppsCount: number;
  isTypingAnalysisOn: boolean;
  isEmotionalGuardOn: boolean;
  isScrollAnalysisOn: boolean;
}

const Dashboard: FC<DashboardProps> = ({ currentTime, sleepTime, wakeTime, isSleepTime, isSnoozed, blockedAppsCount, isTypingAnalysisOn, isEmotionalGuardOn, isScrollAnalysisOn }) => {
  const status = isSnoozed ? { text: "Snoozed", color: "bg-yellow-400" } :
                 isSleepTime ? { text: "Sleep Time Active", color: "bg-green-400" } :
                 { text: "Monitoring", color: "bg-blue-400" };

  const analysisStatus = useMemo(() => {
    const onCount = [isTypingAnalysisOn, isEmotionalGuardOn, isScrollAnalysisOn].filter(Boolean).length;
    if (onCount === 3) {
      return { text: "On", color: "text-green-400" };
    }
    if (onCount > 0) {
      return { text: "Partial", color: "text-yellow-400" };
    }
    return { text: "Off", color: "text-slate-500" };
  }, [isTypingAnalysisOn, isEmotionalGuardOn, isScrollAnalysisOn]);

  return (
    <div className="w-full max-w-2xl bg-slate-800/50 p-8 rounded-2xl border border-slate-700 backdrop-blur-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-semibold text-slate-100">Status</h2>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${status.color} animate-pulse`}></div>
          <span className="text-slate-300 font-medium text-lg">{status.text}</span>
        </div>
      </div>
      <div className="text-center mb-6">
        <p className="text-7xl font-mono font-bold text-slate-50 tracking-wider">
          {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        <div className="flex flex-col items-center">
          <p className="text-slate-400">Bedtime</p>
          <div className="flex items-center gap-2 mt-1">
            <MoonIcon className="w-6 h-6 text-slate-500" />
            <p className="text-2xl font-semibold text-slate-200">{sleepTime}</p>
          </div>
        </div>
        <div className="flex flex-col items-center">
          <p className="text-slate-400">Wake up</p>
          <div className="flex items-center gap-2 mt-1">
            <SunIcon className="w-6 h-6 text-slate-500" />
            <p className="text-2xl font-semibold text-slate-200">{wakeTime}</p>
          </div>
        </div>
        <div className="flex flex-col items-center">
          <p className="text-slate-400">Blocked Apps</p>
          <div className="flex items-center gap-2 mt-1">
            <ShieldCheckIcon className="w-6 h-6 text-slate-500" />
            <p className="text-2xl font-semibold text-slate-200">{blockedAppsCount}</p>
          </div>
        </div>
        <div className="flex flex-col items-center">
          <p className="text-slate-400">Behavioral Analysis</p>
          <div className="flex items-center gap-2 mt-1">
            <BrainIcon className="w-6 h-6 text-slate-500" />
            <p className={`text-2xl font-semibold ${analysisStatus.color}`}>{analysisStatus.text}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

interface SettingsProps {
  sleepTime: string;
  wakeTime: string;
  onSleepTimeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onWakeTimeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Settings: FC<SettingsProps> = ({ sleepTime, wakeTime, onSleepTimeChange, onWakeTimeChange }) => (
  <div className="w-full max-w-2xl bg-slate-800/50 p-8 rounded-2xl border border-slate-700 backdrop-blur-lg">
    <h2 className="text-3xl font-semibold text-slate-100 mb-6">Your Schedule</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <div>
        <label htmlFor="sleepTime" className="block text-base font-medium text-slate-400 mb-2">Bedtime</label>
        <input
          type="time"
          id="sleepTime"
          value={sleepTime}
          onChange={onSleepTimeChange}
          className="w-full bg-slate-700 border border-slate-600 text-slate-200 rounded-lg p-3 text-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
        />
      </div>
      <div>
        <label htmlFor="wakeTime" className="block text-base font-medium text-slate-400 mb-2">Wake up</label>
        <input
          type="time"
          id="wakeTime"
          value={wakeTime}
          onChange={onWakeTimeChange}
          className="w-full bg-slate-700 border border-slate-600 text-slate-200 rounded-lg p-3 text-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
        />
      </div>
    </div>
  </div>
);

interface BlocklistSettingsProps {
  blockedApps: string[];
  onAddApp: (appName: string) => void;
  onRemoveApp: (appName: string) => void;
}

const BlocklistSettings: FC<BlocklistSettingsProps> = ({ blockedApps, onAddApp, onRemoveApp }) => {
    const [newApp, setNewApp] = useState('');

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (newApp.trim()) {
            onAddApp(newApp.trim());
            setNewApp('');
        }
    };

    return (
        <div className="w-full max-w-2xl bg-slate-800/50 p-8 rounded-2xl border border-slate-700 backdrop-blur-lg">
            <h2 className="text-3xl font-semibold text-slate-100 mb-6">App Blocklist</h2>
            <form onSubmit={handleAdd} className="flex gap-3 mb-4">
                <input
                    type="text"
                    value={newApp}
                    onChange={(e) => setNewApp(e.target.value)}
                    placeholder="e.g., 'YouTube', 'Reddit'"
                    className="flex-grow bg-slate-700 border border-slate-600 text-slate-200 rounded-lg p-3 text-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                    aria-label="Add app to blocklist"
                />
                <button type="submit" className="bg-violet-600 text-white font-semibold py-3 px-5 rounded-lg hover:bg-violet-700 transition-colors duration-200 text-lg">
                    Add
                </button>
            </form>
            <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                {blockedApps.length > 0 ? (
                    blockedApps.map((app) => (
                        <div key={app} className="flex items-center justify-between bg-slate-700/50 p-3 rounded-lg animate-fade-in">
                            <span className="text-slate-300 text-lg break-all">{app}</span>
                            <button onClick={() => onRemoveApp(app)} className="text-slate-500 hover:text-red-400 ml-3" aria-label={`Remove ${app} from blocklist`}>
                                <XCircleIcon className="w-7 h-7 flex-shrink-0" />
                            </button>
                        </div>
                    ))
                ) : (
                    <p className="text-slate-500 text-center py-4 text-lg">No apps on your blocklist.</p>
                )}
            </div>
        </div>
    );
};

interface TypingSandboxProps {
    typingSensitivity: number;
    isTypingAnalysisOn: boolean;
    isEmotionalGuardOn: boolean;
}

type AnalysisStats = {
  keys: number;
  backspaces: number;
  errorRatio: number;
  pattern: 'fatigue' | 'emotion' | null;
  confidence: number | null;
};

const TypingSandbox: FC<TypingSandboxProps> = ({ typingSensitivity, isTypingAnalysisOn, isEmotionalGuardOn }) => {
    const [text, setText] = useState('');
    const [visualTypingStats, setVisualTypingStats] = useState({ keys: 0, backspaces: 0 });
    const [analysisResult, setAnalysisResult] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [lastAnalysisStats, setLastAnalysisStats] = useState<AnalysisStats | null>(null);
    
    const typingStats = useRef({ keys: 0, backspaces: 0 });
    const typingAnalysisTimer = useRef<number | null>(null);
    const resultTimer = useRef<number | null>(null);

    const threshold = SENSITIVITY_LEVELS[typingSensitivity as keyof typeof SENSITIVITY_LEVELS];

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

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (!isTypingAnalysisOn && !isEmotionalGuardOn) return;

        if (resultTimer.current) clearTimeout(resultTimer.current);
        setAnalysisResult(null);
        setIsAnalyzing(true);

        const isBackspace = event.key === 'Backspace';

        typingStats.current.keys += 1;
        if (isBackspace) {
            typingStats.current.backspaces += 1;
        }

        setVisualTypingStats({ ...typingStats.current });

        if (typingAnalysisTimer.current) {
            clearTimeout(typingAnalysisTimer.current);
        }

        typingAnalysisTimer.current = window.setTimeout(() => {
            const { keys, backspaces } = typingStats.current;
            const errorRatio = keys > 0 ? backspaces / keys : 0;
            
            let resultMessage = "Analysis complete. Keep typing to start a new session.";
            let detectedPattern: 'fatigue' | 'emotion' | null = null;
            let confidence: number | null = null;

            if (isEmotionalGuardOn && keys >= EMOTIONAL_KEY_THRESHOLD && errorRatio <= EMOTIONAL_ERROR_RATIO_MAX) {
                resultMessage = "Emotional Pattern Detected: High speed with low errors.";
                detectedPattern = 'emotion';
                confidence = calculateEmotionConfidence(keys, errorRatio);
            } else if (isTypingAnalysisOn && keys >= threshold.keys && errorRatio >= threshold.errorRatio) {
                resultMessage = "Fatigue Pattern Detected: High intensity with high error rate.";
                detectedPattern = 'fatigue';
                confidence = calculateFatigueConfidence(keys, errorRatio);
            }
            
            setAnalysisResult(resultMessage);
            setLastAnalysisStats({ keys, backspaces, errorRatio, pattern: detectedPattern, confidence });

            typingStats.current = { keys: 0, backspaces: 0 };
            setVisualTypingStats({ keys: 0, backspaces: 0 });
            typingAnalysisTimer.current = null;
            setIsAnalyzing(false);
            
            resultTimer.current = window.setTimeout(() => {
                setAnalysisResult(null);
                setLastAnalysisStats(null);
            }, 5000);

        }, TYPING_ANALYSIS_WINDOW);
    };

    const intensityPercent = Math.min(100, (visualTypingStats.keys / threshold.keys) * 100);
    const errorRate = visualTypingStats.keys > 0 ? (visualTypingStats.backspaces / visualTypingStats.keys) : 0;
    const errorPercent = threshold.errorRatio > 0 ? Math.min(100, (errorRate / threshold.errorRatio) * 100) : 0;

    const intensityBarColor = intensityPercent >= 100 ? 'bg-red-500' : intensityPercent >= 75 ? 'bg-yellow-500' : 'bg-violet-500';
    const errorBarColor = errorPercent >= 100 ? 'bg-red-500' : errorPercent >= 75 ? 'bg-yellow-500' : 'bg-pink-500';

    return (
        <div className="w-full max-w-2xl bg-slate-800/50 p-8 rounded-2xl border border-slate-700 backdrop-blur-lg">
            <div className="flex items-center gap-3 mb-4">
                <BeakerIcon className="w-8 h-8 text-slate-400" />
                <h2 className="text-3xl font-semibold text-slate-100">Analysis Sandbox</h2>
            </div>
            <p className="text-slate-400 text-base mb-6">
                Type in the box below to see how the behavioral analysis works in real-time. This is a safe test area and will not trigger the block screen.
            </p>
            <textarea
                id="typing-sandbox"
                value={text}
                onChange={handleTextChange}
                onKeyDown={handleKeyDown}
                placeholder={(!isTypingAnalysisOn && !isEmotionalGuardOn) ? "Enable an analysis to begin..." : "Start typing here..."}
                className="w-full h-28 bg-slate-700 border border-slate-600 text-slate-200 rounded-lg p-3 text-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 mb-6 resize-none disabled:opacity-50"
                aria-label="Typing analysis sandbox"
                disabled={!isTypingAnalysisOn && !isEmotionalGuardOn}
            />
             <div className="grid grid-cols-2 gap-4 text-center mb-6 border-b border-slate-700/50 pb-6">
                <div>
                    <p className="text-slate-400 text-sm font-medium">Keys Pressed</p>
                    <p className="text-4xl font-bold text-slate-100 font-mono mt-1">{visualTypingStats.keys}</p>
                </div>
                <div>
                    <p className="text-slate-400 text-sm font-medium">Backspaces</p>
                    <p className="text-4xl font-bold text-slate-100 font-mono mt-1">{visualTypingStats.backspaces}</p>
                </div>
            </div>
             <div className="space-y-4">
                 <div>
                     <div className="flex justify-between items-center text-base mb-1">
                         <div className="flex items-center gap-2">
                            <span className="text-slate-400">Typing Intensity</span>
                            {isAnalyzing && <span className="text-blue-400 text-sm animate-pulse">Analyzing...</span>}
                         </div>
                         <span className="text-slate-300 font-mono">{visualTypingStats.keys} / {threshold.keys}</span>
                     </div>
                     <div className="w-full bg-slate-700 rounded-full h-3">
                         <div className={`${intensityBarColor} h-3 rounded-full transition-all duration-200`} style={{ width: `${intensityPercent}%` }}></div>
                     </div>
                 </div>
                 <div>
                     <div className="flex justify-between items-center text-base mb-1">
                         <span className="text-slate-400">Error Rate</span>
                         <span className="text-slate-300 font-mono">{(errorRate * 100).toFixed(0)}% / {(threshold.errorRatio * 100).toFixed(0)}%</span>
                     </div>
                     <div className="w-full bg-slate-700 rounded-full h-3">
                         <div className={`${errorBarColor} h-3 rounded-full transition-all duration-200`} style={{ width: `${errorPercent}%` }}></div>
                     </div>
                 </div>
                 {analysisResult && (
                    <div className="mt-4 text-center p-4 bg-slate-700/50 rounded-lg animate-fade-in">
                        <p className="text-violet-300 font-medium text-base">{analysisResult}</p>
                        {lastAnalysisStats?.confidence != null && (
                            <div className="mt-2">
                                <span className="text-slate-400 text-sm">Confidence: </span>
                                <span className="text-2xl font-bold text-white">{lastAnalysisStats.confidence}%</span>
                            </div>
                        )}
                    </div>
                 )}
                 {lastAnalysisStats && (
                    <div className="mt-6 pt-4 border-t border-slate-700/50 animate-fade-in">
                        <h3 className="text-lg font-semibold text-slate-300 mb-3 text-center">Detailed Analysis (Last 4s)</h3>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="text-slate-400 text-sm">Keys Pressed</p>
                                <p className="text-2xl font-bold text-slate-100">{lastAnalysisStats.keys}</p>
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm">Backspaces</p>
                                <p className="text-2xl font-bold text-slate-100">{lastAnalysisStats.backspaces}</p>
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm">Error Ratio</p>
                                <p className="text-2xl font-bold text-slate-100">{(lastAnalysisStats.errorRatio * 100).toFixed(1)}%</p>
                            </div>
                        </div>
                    </div>
                 )}
            </div>
        </div>
    );
};

interface TypingAnalysisSettingsProps {
    isTypingAnalysisOn: boolean;
    onToggle: (enabled: boolean) => void;
    typingSensitivity: number;
    onSensitivityChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const TypingAnalysisSettings: FC<TypingAnalysisSettingsProps> = ({ 
    isTypingAnalysisOn, 
    onToggle, 
    typingSensitivity, 
    onSensitivityChange,
}) => {
    const sensitivityLabel = SENSITIVITY_LEVELS[typingSensitivity as keyof typeof SENSITIVITY_LEVELS]?.label || 'Balanced';

    return (
        <div className="w-full max-w-2xl bg-slate-800/50 p-8 rounded-2xl border border-slate-700 backdrop-blur-lg">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-3xl font-semibold text-slate-100">Fatigue Analysis</h2>
                <button
                    onClick={() => onToggle(!isTypingAnalysisOn)}
                    className={`${
                        isTypingAnalysisOn ? 'bg-violet-600' : 'bg-slate-700'
                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                    aria-pressed={isTypingAnalysisOn}
                >
                    <span className={`${
                        isTypingAnalysisOn ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                </button>
            </div>
            <p className="text-slate-400 text-base mb-6">
                Analyzes typing for high speed and error rates to detect potential fatigue.
            </p>
            <div className={`space-y-4 pt-6 border-t border-slate-700/50 ${!isTypingAnalysisOn ? 'opacity-50 transition-opacity' : 'transition-opacity'}`}>
                <div>
                    <label htmlFor="sensitivity" className="block text-base font-medium text-slate-400 mb-2">
                        Sensitivity: <span className="font-bold text-slate-300">{sensitivityLabel}</span>
                    </label>
                    <input
                        type="range"
                        id="sensitivity"
                        min="1"
                        max="3"
                        step="1"
                        value={typingSensitivity}
                        onChange={onSensitivityChange}
                        disabled={!isTypingAnalysisOn}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-500 disabled:accent-slate-600"
                    />
                </div>
            </div>
        </div>
    );
};

interface ScrollAnalysisSettingsProps {
    isScrollAnalysisOn: boolean;
    onToggle: (enabled: boolean) => void;
    scrollSensitivity: number;
    onSensitivityChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ScrollAnalysisSettings: FC<ScrollAnalysisSettingsProps> = ({ 
    isScrollAnalysisOn, 
    onToggle, 
    scrollSensitivity, 
    onSensitivityChange,
}) => {
    const sensitivityLabel = SCROLL_SENSITIVITY_LEVELS[scrollSensitivity as keyof typeof SCROLL_SENSITIVITY_LEVELS]?.label || 'Balanced';

    return (
        <div className="w-full max-w-2xl bg-slate-800/50 p-8 rounded-2xl border border-slate-700 backdrop-blur-lg">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                    <ArrowsUpDownIcon className="w-8 h-8 text-slate-400" />
                    <h2 className="text-3xl font-semibold text-slate-100">Scroll Analysis</h2>
                </div>
                <button
                    onClick={() => onToggle(!isScrollAnalysisOn)}
                    className={`${
                        isScrollAnalysisOn ? 'bg-violet-600' : 'bg-slate-700'
                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                    aria-pressed={isScrollAnalysisOn}
                >
                    <span className={`${
                        isScrollAnalysisOn ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                </button>
            </div>
            <p className="text-slate-400 text-base mb-6">
                Analyzes scroll speed to detect frantic scrolling that can indicate late-night distraction.
            </p>
            <div className={`space-y-4 pt-6 border-t border-slate-700/50 ${!isScrollAnalysisOn ? 'opacity-50 transition-opacity' : 'transition-opacity'}`}>
                <div>
                    <label htmlFor="scroll-sensitivity" className="block text-base font-medium text-slate-400 mb-2">
                        Sensitivity: <span className="font-bold text-slate-300">{sensitivityLabel}</span>
                    </label>
                    <input
                        type="range"
                        id="scroll-sensitivity"
                        min="1"
                        max="3"
                        step="1"
                        value={scrollSensitivity}
                        onChange={onSensitivityChange}
                        disabled={!isScrollAnalysisOn}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-500 disabled:accent-slate-600"
                    />
                </div>
            </div>
        </div>
    );
};


interface EmotionalGuardSettingsProps {
    isEmotionalGuardOn: boolean;
    onToggle: (enabled: boolean) => void;
}

const EmotionalGuardSettings: FC<EmotionalGuardSettingsProps> = ({ isEmotionalGuardOn, onToggle }) => {
    return (
        <div className="w-full max-w-2xl bg-slate-800/50 p-8 rounded-2xl border border-slate-700 backdrop-blur-lg">
            <div className="flex justify-between items-center mb-4">
                 <div className="flex items-center gap-3">
                    <BrainIcon className="w-8 h-8 text-slate-400" />
                    <h2 className="text-3xl font-semibold text-slate-100">Emotional Guard</h2>
                </div>
                <button
                    onClick={() => onToggle(!isEmotionalGuardOn)}
                    className={`${
                        isEmotionalGuardOn ? 'bg-violet-600' : 'bg-slate-700'
                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                    aria-pressed={isEmotionalGuardOn}
                >
                    <span className={`${
                        isEmotionalGuardOn ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                </button>
            </div>
            <p className="text-slate-400 text-base">
                Analyzes typing for very high speed with low errors to detect potential agitation and suggest a break.
            </p>
        </div>
    );
};


// --- MAIN APP COMPONENT ---

export default function App() {
  const [sleepTime, setSleepTime] = useState(() => getInitialValue('sleepTime', '22:00', String));
  const [wakeTime, setWakeTime] = useState(() => getInitialValue('wakeTime', '06:00', String));
  const [blockedApps, setBlockedApps] = useState(() => getInitialValue('blockedApps', ['YouTube', 'Twitter', 'Reddit', 'Facebook', 'Instagram'], JSON.parse));
  const [isTypingAnalysisOn, setIsTypingAnalysisOn] = useState(() => getInitialValue('isTypingAnalysisOn', true, (v) => v === 'true'));
  const [isEmotionalGuardOn, setIsEmotionalGuardOn] = useState(() => getInitialValue('isEmotionalGuardOn', true, (v) => v === 'true'));
  const [isScrollAnalysisOn, setIsScrollAnalysisOn] = useState(() => getInitialValue('isScrollAnalysisOn', true, (v) => v === 'true'));
  const [typingSensitivity, setTypingSensitivity] = useState(() => getInitialValue('typingSensitivity', 2, Number));
  const [scrollSensitivity, setScrollSensitivity] = useState(() => getInitialValue('scrollSensitivity', 2, Number));

  const [currentTime, setCurrentTime] = useState(new Date());
  const [isActivityBlocked, setIsActivityBlocked] = useState(false);
  const [isFatigueBlocked, setIsFatigueBlocked] = useState(false);
  const [isEmotionBlocked, setIsEmotionBlocked] = useState(false);
  const [isScrollBlocked, setIsScrollBlocked] = useState(false);
  const [snoozeUntil, setSnoozeUntil] = useState<Date | null>(null);

  const activityCount = useRef(0);
  const activityTimer = useRef<number | null>(null);
  const typingStats = useRef({ keys: 0, backspaces: 0 });
  const typingAnalysisTimer = useRef<number | null>(null);
  const scrollDelta = useRef(0);
  const lastScrollY = useRef(window.scrollY);
  const scrollAnalysisTimer = useRef<number | null>(null);
  
  // Persist settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sleepTime', sleepTime);
      localStorage.setItem('wakeTime', wakeTime);
      localStorage.setItem('blockedApps', JSON.stringify(blockedApps));
      localStorage.setItem('isTypingAnalysisOn', String(isTypingAnalysisOn));
      localStorage.setItem('isEmotionalGuardOn', String(isEmotionalGuardOn));
      localStorage.setItem('isScrollAnalysisOn', String(isScrollAnalysisOn));
      localStorage.setItem('typingSensitivity', String(typingSensitivity));
      localStorage.setItem('scrollSensitivity', String(scrollSensitivity));
    } catch (error) {
      console.error('Failed to save to localStorage', error);
    }
  }, [sleepTime, wakeTime, blockedApps, isTypingAnalysisOn, isEmotionalGuardOn, isScrollAnalysisOn, typingSensitivity, scrollSensitivity]);
  
  // Clock effect
  useEffect(() => {
    const timerId = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);

  const isSleepTime = useMemo(() => {
    const [sleepHour, sleepMinute] = sleepTime.split(':').map(Number);
    const [wakeHour, wakeMinute] = wakeTime.split(':').map(Number);
    
    const sleepTotalMinutes = sleepHour * 60 + sleepMinute;
    const wakeTotalMinutes = wakeHour * 60 + wakeMinute;
    
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    const currentTotalMinutes = currentHour * 60 + currentMinute;
    
    if (sleepTotalMinutes > wakeTotalMinutes) { // Overnight schedule
      return currentTotalMinutes >= sleepTotalMinutes || currentTotalMinutes < wakeTotalMinutes;
    } else { // Same day schedule
      return currentTotalMinutes >= sleepTotalMinutes && currentTotalMinutes < wakeTotalMinutes;
    }
  }, [currentTime, sleepTime, wakeTime]);
  
  const isSnoozed = useMemo(() => {
    if (!snoozeUntil) return false;
    return snoozeUntil > currentTime;
  }, [snoozeUntil, currentTime]);

  const blockType: BlockType = useMemo(() => {
    if (isEmotionBlocked) return 'emotion';
    if (isFatigueBlocked) return 'fatigue';
    if (isScrollBlocked) return 'scroll';
    if (isActivityBlocked) return 'activity';
    return 'none';
  }, [isEmotionBlocked, isFatigueBlocked, isScrollBlocked, isActivityBlocked]);

  const handleSnooze = useCallback(() => {
    setSnoozeUntil(new Date(Date.now() + SNOOZE_DURATION_MS));
    setIsActivityBlocked(false);
    setIsFatigueBlocked(false);
    setIsEmotionBlocked(false);
    setIsScrollBlocked(false);
    activityCount.current = 0;
    typingStats.current = { keys: 0, backspaces: 0 };
    if (typingAnalysisTimer.current) clearTimeout(typingAnalysisTimer.current);
    if (scrollAnalysisTimer.current) clearTimeout(scrollAnalysisTimer.current);
    typingAnalysisTimer.current = null;
    scrollAnalysisTimer.current = null;
    scrollDelta.current = 0;
  }, []);

  const handleAddApp = useCallback((appName: string) => {
    const lowerCaseAppName = appName.toLowerCase();
    if (!blockedApps.find(app => app.toLowerCase() === lowerCaseAppName)) {
        setBlockedApps(prev => [...prev, appName].sort((a,b) => a.localeCompare(b)));
    }
  }, [blockedApps]);

  const handleRemoveApp = useCallback((appName: string) => {
    setBlockedApps(prev => prev.filter(app => app !== appName));
  }, []);

  const handleActivity = useCallback(() => {
     if (!isSleepTime || isSnoozed || blockType !== 'none') return;
     
     const isAppCurrentlyBlocked = blockedApps.some(app => document.title.toLowerCase().includes(app.toLowerCase()));
     if (isAppCurrentlyBlocked && blockedApps.length > 0) {
        if (activityTimer.current) clearTimeout(activityTimer.current);
        activityCount.current += 1;
        if (activityCount.current >= ACTIVITY_THRESHOLD) {
          setIsActivityBlocked(true);
          activityCount.current = 0;
        } else {
          activityTimer.current = window.setTimeout(() => { activityCount.current = 0; }, ACTIVITY_RESET_TIMEOUT);
        }
     }
  }, [isSleepTime, isSnoozed, blockType, blockedApps]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if ((event.target as HTMLElement).id === 'typing-sandbox') return;
    if ((!isTypingAnalysisOn && !isEmotionalGuardOn) || !isSleepTime || isSnoozed || blockType !== 'none') return;

    const isBackspace = event.key === 'Backspace';
    
    typingStats.current.keys += 1;
    if (isBackspace) {
        typingStats.current.backspaces += 1;
    }

    if (!typingAnalysisTimer.current) {
        typingAnalysisTimer.current = window.setTimeout(() => {
            const { keys, backspaces } = typingStats.current;
            const errorRatio = keys > 0 ? backspaces / keys : 0;
            
            // Check for emotional agitation first
            if (isEmotionalGuardOn && keys >= EMOTIONAL_KEY_THRESHOLD && errorRatio <= EMOTIONAL_ERROR_RATIO_MAX) {
                setIsEmotionBlocked(true);
            } 
            // Then check for fatigue
            else if (isTypingAnalysisOn) {
                const threshold = SENSITIVITY_LEVELS[typingSensitivity as keyof typeof SENSITIVITY_LEVELS];
                if (keys >= threshold.keys && errorRatio >= threshold.errorRatio) {
                    setIsFatigueBlocked(true);
                }
            }
            
            typingStats.current = { keys: 0, backspaces: 0 };
            typingAnalysisTimer.current = null;
        }, TYPING_ANALYSIS_WINDOW);
    }
  }, [isSleepTime, isSnoozed, blockType, isTypingAnalysisOn, isEmotionalGuardOn, typingSensitivity]);

  const handleScroll = useCallback(() => {
    if (!isScrollAnalysisOn || !isSleepTime || isSnoozed || blockType !== 'none') return;
    
    const currentScrollY = window.scrollY;
    const delta = Math.abs(currentScrollY - lastScrollY.current);
    lastScrollY.current = currentScrollY;
    scrollDelta.current += delta;

    if (!scrollAnalysisTimer.current) {
        scrollAnalysisTimer.current = window.setTimeout(() => {
            const threshold = SCROLL_SENSITIVITY_LEVELS[scrollSensitivity as keyof typeof SCROLL_SENSITIVITY_LEVELS];
            if (scrollDelta.current >= threshold.distance) {
                setIsScrollBlocked(true);
            }
            scrollDelta.current = 0;
            scrollAnalysisTimer.current = null;
        }, SCROLL_ANALYSIS_WINDOW);
    }
  }, [isSleepTime, isSnoozed, blockType, isScrollAnalysisOn, scrollSensitivity]);

  useEffect(() => {
    window.addEventListener('scroll', handleActivity);
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('scroll', handleActivity);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('keydown', handleKeyDown);
      if (activityTimer.current) clearTimeout(activityTimer.current);
      if (typingAnalysisTimer.current) clearTimeout(typingAnalysisTimer.current);
      if (scrollAnalysisTimer.current) clearTimeout(scrollAnalysisTimer.current);
    };
  }, [handleActivity, handleKeyDown, handleScroll]);

  return (
    <main className="min-h-screen text-slate-200 flex flex-col items-center p-4 sm:p-6 md:p-8">
      <div className="w-full flex flex-col items-center space-y-8 max-w-2xl">
        <Header />
        <Dashboard
          currentTime={currentTime}
          sleepTime={sleepTime}
          wakeTime={wakeTime}
          isSleepTime={isSleepTime}
          isSnoozed={isSnoozed}
          blockedAppsCount={blockedApps.length}
          isTypingAnalysisOn={isTypingAnalysisOn}
          isEmotionalGuardOn={isEmotionalGuardOn}
          isScrollAnalysisOn={isScrollAnalysisOn}
        />
        <TypingSandbox
            isTypingAnalysisOn={isTypingAnalysisOn}
            isEmotionalGuardOn={isEmotionalGuardOn}
            typingSensitivity={typingSensitivity}
        />
        <Settings
          sleepTime={sleepTime}
          wakeTime={wakeTime}
          onSleepTimeChange={(e) => setSleepTime(e.target.value)}
          onWakeTimeChange={(e) => setWakeTime(e.target.value)}
        />
        <TypingAnalysisSettings
            isTypingAnalysisOn={isTypingAnalysisOn}
            onToggle={setIsTypingAnalysisOn}
            typingSensitivity={typingSensitivity}
            onSensitivityChange={(e) => setTypingSensitivity(Number(e.target.value))}
        />
        <ScrollAnalysisSettings
            isScrollAnalysisOn={isScrollAnalysisOn}
            onToggle={setIsScrollAnalysisOn}
            scrollSensitivity={scrollSensitivity}
            onSensitivityChange={(e) => setScrollSensitivity(Number(e.target.value))}
        />
        <EmotionalGuardSettings
            isEmotionalGuardOn={isEmotionalGuardOn}
            onToggle={setIsEmotionalGuardOn}
        />
        <BlocklistSettings
            blockedApps={blockedApps}
            onAddApp={handleAddApp}
            onRemoveApp={handleRemoveApp}
        />
      </div>
      <BlockingOverlay blockType={blockType} onSnooze={handleSnooze} />
    </main>
  );
}
