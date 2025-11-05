import React, { useState, useEffect, useMemo, useCallback, useRef, FC } from 'react';

// --- CONSTANTS ---
const ACTIVITY_THRESHOLD = 25;
const ACTIVITY_RESET_TIMEOUT = 3000; // 3 seconds
const SNOOZE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

// --- HELPER FUNCTIONS ---
const getInitialTime = (key: string, defaultValue: string): string => {
  try {
    const storedValue = localStorage.getItem(key);
    return storedValue || defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage: ${key}`, error);
    return defaultValue;
  }
};

const getInitialList = (key: string, defaultValue: string[]): string[] => {
    try {
        const storedValue = localStorage.getItem(key);
        return storedValue ? JSON.parse(storedValue) : defaultValue;
    } catch (error) {
        console.error(`Error parsing or reading from localStorage: ${key}`, error);
        return defaultValue;
    }
}

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


// --- UI COMPONENTS ---

interface BlockingOverlayProps {
  onSnooze: () => void;
  isVisible: boolean;
}

const BlockingOverlay: FC<BlockingOverlayProps> = ({ onSnooze, isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center border border-slate-700 transform transition-all animate-scale-in">
        <MoonIcon className="w-16 h-16 text-violet-400 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-slate-100 mb-2">It's time to rest.</h2>
        <p className="text-slate-400 mb-8">
          You've been active late at night. Good sleep is important for your health and well-being.
        </p>
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
}

const Dashboard: FC<DashboardProps> = ({ currentTime, sleepTime, wakeTime, isSleepTime, isSnoozed, blockedAppsCount }) => {
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
      <div className="flex justify-around items-center text-center">
        <div>
          <p className="text-slate-400 text-sm">Bedtime</p>
          <div className="flex items-center gap-2 mt-1">
            <MoonIcon className="w-5 h-5 text-slate-500" />
            <p className="text-xl font-semibold text-slate-200">{sleepTime}</p>
          </div>
        </div>
        <div>
          <p className="text-slate-400 text-sm">Blocked Apps</p>
          <div className="flex items-center gap-2 mt-1">
            <ShieldCheckIcon className="w-5 h-5 text-slate-500" />
            <p className="text-xl font-semibold text-slate-200">{blockedAppsCount}</p>
          </div>
        </div>
        <div>
          <p className="text-slate-400 text-sm">Wake up</p>
          <div className="flex items-center gap-2 mt-1">
            <SunIcon className="w-5 h-5 text-slate-500" />
            <p className="text-xl font-semibold text-slate-200">{wakeTime}</p>
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


// --- MAIN APP COMPONENT ---

export default function App() {
  const [sleepTime, setSleepTime] = useState(() => getInitialTime('sleepTime', '22:00'));
  const [wakeTime, setWakeTime] = useState(() => getInitialTime('wakeTime', '06:00'));
  const [blockedApps, setBlockedApps] = useState(() => getInitialList('blockedApps', ['YouTube', 'Twitter', 'Reddit', 'Facebook', 'Instagram']));
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isBlocked, setIsBlocked] = useState(false);
  const [snoozeUntil, setSnoozeUntil] = useState<Date | null>(null);

  const activityCount = useRef(0);
  const activityTimer = useRef<number | null>(null);
  
  // Persist settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sleepTime', sleepTime);
      localStorage.setItem('wakeTime', wakeTime);
      localStorage.setItem('blockedApps', JSON.stringify(blockedApps));
    } catch (error) {
      console.error('Failed to save to localStorage', error);
    }
  }, [sleepTime, wakeTime, blockedApps]);
  
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

  const handleSnooze = useCallback(() => {
    setSnoozeUntil(new Date(Date.now() + SNOOZE_DURATION_MS));
    setIsBlocked(false);
    activityCount.current = 0;
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
    const isAppCurrentlyBlocked = blockedApps.some(app => 
        document.title.toLowerCase().includes(app.toLowerCase())
    );

    if (!isSleepTime || isSnoozed || isBlocked || !isAppCurrentlyBlocked || blockedApps.length === 0) {
      return;
    }

    if (activityTimer.current) {
      clearTimeout(activityTimer.current);
    }

    activityCount.current += 1;

    if (activityCount.current >= ACTIVITY_THRESHOLD) {
      setIsBlocked(true);
      activityCount.current = 0;
    } else {
      activityTimer.current = window.setTimeout(() => {
        activityCount.current = 0;
      }, ACTIVITY_RESET_TIMEOUT);
    }
  }, [isSleepTime, isSnoozed, isBlocked, blockedApps]);

  useEffect(() => {
    window.addEventListener('scroll', handleActivity);
    window.addEventListener('keydown', handleActivity);

    return () => {
      window.removeEventListener('scroll', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      if (activityTimer.current) {
        clearTimeout(activityTimer.current);
      }
    };
  }, [handleActivity]);

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
        />
        <Settings
          sleepTime={sleepTime}
          wakeTime={wakeTime}
          onSleepTimeChange={(e) => setSleepTime(e.target.value)}
          onWakeTimeChange={(e) => setWakeTime(e.target.value)}
        />
        <BlocklistSettings
            blockedApps={blockedApps}
            onAddApp={handleAddApp}
            onRemoveApp={handleRemoveApp}
        />
      </div>
      <BlockingOverlay isVisible={isBlocked} onSnooze={handleSnooze} />
    </main>
  );
}
