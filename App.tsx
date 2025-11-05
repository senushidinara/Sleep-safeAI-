import React, { useState, useEffect, useMemo, useCallback, useRef, FC } from 'react';

// --- CONSTANTS ---
const ACTIVITY_THRESHOLD = 25;
const ACTIVITY_RESET_TIMEOUT = 3000; // 3 seconds
const SNOOZE_DURATION_MS = 5 * 60 * 1000; // 5 minutes
const TYPING_ANALYSIS_WINDOW = 4000; // 4 seconds

// --- SENSITIVITY THRESHOLDS ---
const SENSITIVITY_LEVELS = {
    1: { keys: 30, errorRatio: 0.3, label: 'Relaxed' },    // Requires intense typing with many errors
    2: { keys: 20, errorRatio: 0.2, label: 'Balanced' },  // Default, balanced detection
    3: { keys: 15, errorRatio: 0.1, label: 'Strict' },     // More sensitive to signs of fatigue
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


// --- UI COMPONENTS ---

type BlockType = 'none' | 'activity' | 'fatigue';

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
    }
  };
  
  const { title, body } = messages[blockType];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center border border-slate-700 transform transition-all animate-scale-in">
        <MoonIcon className="w-16 h-16 text-violet-400 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-slate-100 mb-2">{title}</h2>
        <p className="text-slate-400 mb-8">{body}</p>
        <button
          onClick={onSnooze}
          className="w-full bg-violet-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-colors duration-200"
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
    <div className="flex items-center justify-center gap-3">
      <MoonIcon className="w-8 h-8 text-violet-400" />
      <h1 className="text-4xl font-bold text-slate-100 tracking-tight">Sleep Safe</h1>
    </div>
    <p className="text-slate-400 mt-2 max-w-prose">Block addictive apps and protect your sleep from late-night digital habits.</p>
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
}

const Dashboard: FC<DashboardProps> = ({ currentTime, sleepTime, wakeTime, isSleepTime, isSnoozed, blockedAppsCount, isTypingAnalysisOn }) => {
  const status = isSnoozed ? { text: "Snoozed", color: "bg-yellow-400" } :
                 isSleepTime ? { text: "Sleep Time Active", color: "bg-green-400" } :
                 { text: "Monitoring", color: "bg-blue-400" };

  return (
    <div className="w-full max-w-md bg-slate-800/50 p-6 rounded-2xl border border-slate-700 backdrop-blur-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-slate-100">Status</h2>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${status.color} animate-pulse`}></div>
          <span className="text-slate-300 font-medium">{status.text}</span>
        </div>
      </div>
      <div className="text-center mb-6">
        <p className="text-6xl font-mono font-bold text-slate-50 tracking-wider">
          {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        <div className="flex flex-col items-center">
          <p className="text-slate-400 text-sm">Bedtime</p>
          <div className="flex items-center gap-2 mt-1">
            <MoonIcon className="w-5 h-5 text-slate-500" />
            <p className="text-xl font-semibold text-slate-200">{sleepTime}</p>
          </div>
        </div>
        <div className="flex flex-col items-center">
          <p className="text-slate-400 text-sm">Wake up</p>
          <div className="flex items-center gap-2 mt-1">
            <SunIcon className="w-5 h-5 text-slate-500" />
            <p className="text-xl font-semibold text-slate-200">{wakeTime}</p>
          </div>
        </div>
        <div className="flex flex-col items-center">
          <p className="text-slate-400 text-sm">Blocked Apps</p>
          <div className="flex items-center gap-2 mt-1">
            <ShieldCheckIcon className="w-5 h-5 text-slate-500" />
            <p className="text-xl font-semibold text-slate-200">{blockedAppsCount}</p>
          </div>
        </div>
        <div className="flex flex-col items-center">
          <p className="text-slate-400 text-sm">Typing Analysis</p>
          <div className="flex items-center gap-2 mt-1">
            <BrainIcon className="w-5 h-5 text-slate-500" />
            <p className={`text-xl font-semibold ${isTypingAnalysisOn ? 'text-green-400' : 'text-slate-500'}`}>{isTypingAnalysisOn ? 'On' : 'Off'}</p>
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
  <div className="w-full max-w-md bg-slate-800/50 p-6 rounded-2xl border border-slate-700 backdrop-blur-lg mt-6">
    <h2 className="text-2xl font-semibold text-slate-100 mb-4">Your Schedule</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label htmlFor="sleepTime" className="block text-sm font-medium text-slate-400 mb-1">Bedtime</label>
        <input
          type="time"
          id="sleepTime"
          value={sleepTime}
          onChange={onSleepTimeChange}
          className="w-full bg-slate-700 border border-slate-600 text-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
        />
      </div>
      <div>
        <label htmlFor="wakeTime" className="block text-sm font-medium text-slate-400 mb-1">Wake up</label>
        <input
          type="time"
          id="wakeTime"
          value={wakeTime}
          onChange={onWakeTimeChange}
          className="w-full bg-slate-700 border border-slate-600 text-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
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
        <div className="w-full max-w-md bg-slate-800/50 p-6 rounded-2xl border border-slate-700 backdrop-blur-lg mt-6">
            <h2 className="text-2xl font-semibold text-slate-100 mb-4">App Blocklist</h2>
            <form onSubmit={handleAdd} className="flex gap-2 mb-4">
                <input
                    type="text"
                    value={newApp}
                    onChange={(e) => setNewApp(e.target.value)}
                    placeholder="e.g., 'YouTube', 'Reddit'"
                    className="flex-grow bg-slate-700 border border-slate-600 text-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                    aria-label="Add app to blocklist"
                />
                <button type="submit" className="bg-violet-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-violet-700 transition-colors duration-200">
                    Add
                </button>
            </form>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {blockedApps.length > 0 ? (
                    blockedApps.map((app) => (
                        <div key={app} className="flex items-center justify-between bg-slate-700/50 p-2 rounded-lg animate-fade-in">
                            <span className="text-slate-300 break-all">{app}</span>
                            <button onClick={() => onRemoveApp(app)} className="text-slate-500 hover:text-red-400 ml-2" aria-label={`Remove ${app} from blocklist`}>
                                <XCircleIcon className="w-6 h-6 flex-shrink-0" />
                            </button>
                        </div>
                    ))
                ) : (
                    <p className="text-slate-500 text-center py-4">No apps on your blocklist.</p>
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
    visualTypingStats: { keys: number; backspaces: number };
    isSleepTime: boolean;
}

const TypingAnalysisSettings: FC<TypingAnalysisSettingsProps> = ({ 
    isTypingAnalysisOn, 
    onToggle, 
    typingSensitivity, 
    onSensitivityChange,
    visualTypingStats,
    isSleepTime
}) => {
    const sensitivityLabel = SENSITIVITY_LEVELS[typingSensitivity as keyof typeof SENSITIVITY_LEVELS]?.label || 'Balanced';
    const threshold = SENSITIVITY_LEVELS[typingSensitivity as keyof typeof SENSITIVITY_LEVELS];

    const intensityPercent = Math.min(100, (visualTypingStats.keys / threshold.keys) * 100);
    const errorRate = visualTypingStats.keys > 0 ? (visualTypingStats.backspaces / visualTypingStats.keys) * 100 : 0;
    const errorPercent = threshold.errorRatio > 0 ? Math.min(100, (errorRate / (threshold.errorRatio * 100)) * 100) : 0;


    return (
        <div className="w-full max-w-md bg-slate-800/50 p-6 rounded-2xl border border-slate-700 backdrop-blur-lg mt-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-slate-100">Typing Analysis</h2>
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
            <p className="text-slate-400 text-sm mb-4">
                Analyzes typing patterns like speed and errors during sleep hours to detect potential fatigue and encourage rest.
            </p>
            <div className={`space-y-4 pt-4 border-t border-slate-700/50 ${!isTypingAnalysisOn ? 'opacity-50 transition-opacity' : 'transition-opacity'}`}>
                <div>
                    <label htmlFor="sensitivity" className="block text-sm font-medium text-slate-400 mb-1">
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
                <div className="mt-4">
                    <h3 className="text-lg font-semibold text-slate-300 mb-2">Live Monitor</h3>
                    {isSleepTime && isTypingAnalysisOn ? (
                        <div className="space-y-3">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-400">Typing Intensity</span>
                                    <span className="text-slate-300">{visualTypingStats.keys} / {threshold.keys} keys</span>
                                </div>
                                <div className="w-full bg-slate-700 rounded-full h-2.5">
                                    <div className="bg-violet-500 h-2.5 rounded-full transition-all duration-200" style={{ width: `${intensityPercent}%` }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-400">Error Rate</span>
                                     <span className="text-slate-300">{errorRate.toFixed(0)}% / {(threshold.errorRatio * 100).toFixed(0)}%</span>
                                </div>
                                <div className="w-full bg-slate-700 rounded-full h-2.5">
                                     <div className="bg-pink-500 h-2.5 rounded-full transition-all duration-200" style={{ width: `${errorPercent}%` }}></div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-4 px-2 bg-slate-700/50 rounded-lg">
                           <p className="text-slate-400 text-sm">
                                {isTypingAnalysisOn ? "Live analysis will appear here during your scheduled sleep hours." : "Enable Typing Analysis to see live monitor."}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


// --- MAIN APP COMPONENT ---

export default function App() {
  const [sleepTime, setSleepTime] = useState(() => getInitialValue('sleepTime', '22:00', String));
  const [wakeTime, setWakeTime] = useState(() => getInitialValue('wakeTime', '06:00', String));
  const [blockedApps, setBlockedApps] = useState(() => getInitialValue('blockedApps', ['YouTube', 'Twitter', 'Reddit', 'Facebook', 'Instagram'], JSON.parse));
  const [isTypingAnalysisOn, setIsTypingAnalysisOn] = useState(() => getInitialValue('isTypingAnalysisOn', true, (v) => v === 'true'));
  const [typingSensitivity, setTypingSensitivity] = useState(() => getInitialValue('typingSensitivity', 2, Number));

  const [currentTime, setCurrentTime] = useState(new Date());
  const [isActivityBlocked, setIsActivityBlocked] = useState(false);
  const [isFatigueBlocked, setIsFatigueBlocked] = useState(false);
  const [snoozeUntil, setSnoozeUntil] = useState<Date | null>(null);
  const [visualTypingStats, setVisualTypingStats] = useState({ keys: 0, backspaces: 0 });

  const activityCount = useRef(0);
  const activityTimer = useRef<number | null>(null);
  const typingStats = useRef({ keys: 0, backspaces: 0 });
  const typingAnalysisTimer = useRef<number | null>(null);
  
  // Persist settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sleepTime', sleepTime);
      localStorage.setItem('wakeTime', wakeTime);
      localStorage.setItem('blockedApps', JSON.stringify(blockedApps));
      localStorage.setItem('isTypingAnalysisOn', String(isTypingAnalysisOn));
      localStorage.setItem('typingSensitivity', String(typingSensitivity));
    } catch (error) {
      console.error('Failed to save to localStorage', error);
    }
  }, [sleepTime, wakeTime, blockedApps, isTypingAnalysisOn, typingSensitivity]);
  
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

  const blockType = isFatigueBlocked ? 'fatigue' : isActivityBlocked ? 'activity' : 'none';

  const handleSnooze = useCallback(() => {
    setSnoozeUntil(new Date(Date.now() + SNOOZE_DURATION_MS));
    setIsActivityBlocked(false);
    setIsFatigueBlocked(false);
    activityCount.current = 0;
    typingStats.current = { keys: 0, backspaces: 0 };
    setVisualTypingStats({ keys: 0, backspaces: 0 });
    if (typingAnalysisTimer.current) clearTimeout(typingAnalysisTimer.current);
    typingAnalysisTimer.current = null;
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
     
     // App blocklist activity check
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
    handleActivity(); // Also check for generic activity on keydown

    if (!isTypingAnalysisOn || !isSleepTime || isSnoozed || blockType !== 'none') return;

    const isBackspace = event.key === 'Backspace';
    
    typingStats.current.keys += 1;
    if (isBackspace) {
        typingStats.current.backspaces += 1;
    }

    setVisualTypingStats(prev => ({
        keys: prev.keys + 1,
        backspaces: isBackspace ? prev.backspaces + 1 : prev.backspaces,
    }));


    if (!typingAnalysisTimer.current) {
        typingAnalysisTimer.current = window.setTimeout(() => {
            const { keys, backspaces } = typingStats.current;
            const errorRatio = keys > 0 ? backspaces / keys : 0;
            const threshold = SENSITIVITY_LEVELS[typingSensitivity as keyof typeof SENSITIVITY_LEVELS];

            if (keys >= threshold.keys && errorRatio >= threshold.errorRatio) {
                setIsFatigueBlocked(true);
            }
            
            typingStats.current = { keys: 0, backspaces: 0 };
            setVisualTypingStats({ keys: 0, backspaces: 0 });
            typingAnalysisTimer.current = null;
        }, TYPING_ANALYSIS_WINDOW);
    }
  }, [isSleepTime, isSnoozed, blockType, isTypingAnalysisOn, typingSensitivity, handleActivity]);

  useEffect(() => {
    window.addEventListener('scroll', handleActivity);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('scroll', handleActivity);
      window.removeEventListener('keydown', handleKeyDown);
      if (activityTimer.current) clearTimeout(activityTimer.current);
      if (typingAnalysisTimer.current) clearTimeout(typingAnalysisTimer.current);
    };
  }, [handleActivity, handleKeyDown]);

  return (
    <main className="min-h-screen text-slate-200 flex flex-col items-center p-4">
      <div className="w-full flex flex-col items-center space-y-6">
        <Header />
        <Dashboard
          currentTime={currentTime}
          sleepTime={sleepTime}
          wakeTime={wakeTime}
          isSleepTime={isSleepTime}
          isSnoozed={isSnoozed}
          blockedAppsCount={blockedApps.length}
          isTypingAnalysisOn={isTypingAnalysisOn}
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
            visualTypingStats={visualTypingStats}
            isSleepTime={isSleepTime}
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