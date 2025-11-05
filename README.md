# Sleep Safe 😴🛡️✨

### Your intelligent guardian against late-night digital habits.

> An innovative application that monitors late-night digital activity and analyzes behavioral patterns to encourage healthier sleep habits.

Sleep Safe is a revolutionary guardian for your sleep. 🌙 It goes beyond simple timers by using a **smart, privacy-first, behavior-based approach** to gently remind you when it's time to rest, all wrapped in a polished, intuitive interface.

---

## ✨ Key Features

*   **🎨 Polished & Readable UI:** A clean, modern design with a spacious layout makes the app easy and pleasant to use.
*   **⏰ Customizable Sleep Schedule:** Easily set your desired bedtime and wake-up time to define your protected sleep window.
*   **🚫 Smart App Blocklist:** Create a personalized list of distracting websites (e.g., YouTube, Twitter, Reddit). The app intervenes if you're active on these sites during your sleep hours.
*   **🧠 Revolutionary Behavioral Analysis Suite:** The core innovation of Sleep Safe.
    *   **Fatigue Analysis:** Analyzes *how* you type—not *what* you type—to detect patterns of fatigue.
    *   **Emotional Guard:** Detects agitated typing patterns and suggests taking a calming break.
    *   **Scroll Analysis:** Identifies frantic, unfocused scrolling to curb mindless browsing.
*   **🔬 Interactive Analysis Sandbox:** See the magic in action! A dedicated sandbox lets you type and get immediate, real-time visual feedback on your typing patterns, making the entire process transparent and fun.
*   **💤 Snooze Functionality:** If you need a few more minutes, a simple snooze button lets you temporarily pause the overlay.

---

## 🖼️ App Preview

A glimpse into the clean, intuitive, and powerful interface of Sleep Safe.

### ✨ The Dashboard

Your mission control for a good night's sleep. At a glance, see the current time, your sleep schedule, and the status of the behavioral analysis engine.

![Sleep Safe Dashboard showing the current time, sleep schedule, and active monitoring status.](./assets/screenshot-dashboard.png)

### 🔬 The Analysis Sandbox

See the magic happen in real-time! The sandbox provides instant visual feedback on your typing patterns, making the complex analysis transparent and easy to understand.

![The Analysis Sandbox in action, with progress bars for Typing Intensity and Signs of Exhaustion filling up as the user types.](./assets/screenshot-sandbox.png)

### ⚙️ Powerful & Simple Settings

Tailor Sleep Safe to your needs. Adjust your sleep schedule, manage your app blocklist, and fine-tune the sensitivity of the behavioral analysis with simple, clear controls.

![Sleep Safe settings page, showing toggles for Fatigue Analysis, Scroll Analysis, and the App Blocklist.](./assets/screenshot-settings.png)

### 🛌 The Gentle Nudge

When late-night activity is detected, Sleep Safe displays a calm, non-intrusive overlay, gently reminding you that it's time to rest.

![The Sleep Safe blocking overlay with a moon icon, displaying the message 'You seem tired' and a button to snooze for 5 minutes.](./assets/screenshot-overlay.png)

---

## ⚙️ How It Works

### 🏗️ High-Level Architecture

Sleep Safe operates through a cohesive system of event listeners, a central logic core, and a reactive UI. This diagram illustrates how user actions are captured, analyzed, and acted upon.

```
                                  ┌───────────────────────────┐
                                  │   Sleep Safe UI/UX 🎨     │
                                  │ (Dashboard, Settings, etc.) │
                                  └─────────────▲─────────────┘
                                                │ Renders State
                                  ┌─────────────┴─────────────┐
                                  │      Core App Logic ⚙️      │
                                  │ (React State, Hooks, Logic) │
                                  └─────────────┬─────────────┘
                                                │
                 ┌──────────────────────────────┼──────────────────────────────┐
                 │                              │                              │
                 ▼                              ▼                              ▼
┌───────────────────────────┐   ┌───────────────────────────┐   ┌───────────────────────────┐
│ Global Event Listeners 📡 │   │  Behavioral Analysis 🧠   │   │   Browser Storage 💾    │
│  (scroll, keydown)        │──▶│   (Statistical Engine)    │   │   (localStorage)        │
└───────────────────────────┘   └─────────────┬─────────────┘   └───────────────────────────┘
                                              │ Triggers Block
                                              ▼
                                  ┌───────────────────────────┐
                                  │  Blocking Overlay UI 🛌   │
                                  │  (Snooze functionality)   │
                                  └───────────────────────────┘
```

<details>
<summary><strong>🧠 The Behavioral Analysis Suite (Click to Expand)</strong></summary>

This is the feature that makes Sleep Safe truly intelligent. It identifies signs of tired, agitated, or unfocused digital activity to protect your sleep.

### **🔒 Privacy is Paramount**

**Sleep Safe does NOT record your activity.** It has no "keylogger" functionality and doesn't track your browsing history. The analysis is purely statistical, happens **entirely within your browser**, and is immediately discarded after each analysis window. Your data never leaves your device. Period.

### **🤔 Identifying Human Patterns**

*   **😴 Fatigue Typing:** When we're tired, our typing often becomes frantic and error-prone. We type quickly but make more mistakes, leading to a high rate of corrections (`Backspace`).
*   **😠 Agitated Typing:** When we're frustrated, we tend to type very quickly but with unusual precision and fewer errors.
*   **😵 Distracted Scrolling:** When we're aimlessly browsing, we often scroll very quickly and erratically without stopping to engage with content.

Sleep Safe is tuned to spot all of these subtle, human patterns.

### **🔢 Analysis Flow Breakdown (Typing)**

The process is made completely transparent in the **Analysis Sandbox**. Here's a diagram of what happens when you type anywhere while the feature is active during sleep hours:

```
[ User Action: Typing... ⌨️ ]
            │
            ▼
┌──────────────────────────┐
│ Start 4s Analysis Window │
└───────────┬────────────┘
            │
            ▼
┌──────────────────────────┐
│  Count Keys & Backspaces │
│   (In-Memory Stats) 📊   │
└───────────┬────────────┘
            │
            ▼
┌──────────────────────────┐
│      Window Ends ⏱️      │
└───────────┬────────────┘
            │
            ▼
┌──────────────────────────┐
│ Compare vs. Thresholds   │
│ (Fatigue/Emotion Logic)  │
└───────────┬────────────┘
            │
            ▼
      ┌───────────┐
      │  Match?   ├─ (No) ─▶ Reset & Wait
      └─────┬─────┘
            │ (Yes)
            ▼
┌──────────────────────────┐
│   Show Blocking Screen   │
│ ("You seem tired." etc.) │
└──────────────────────────┘

```

1.  **Listening for Activity:** The moment you press a key, the app starts a 4-second analysis timer. You'll see an "Analyzing..." indicator in the sandbox.

2.  **Analyzing in 4-Second Windows:** For the next 4 seconds, the app keeps a simple, in-memory count of:
    *   **Total Keystrokes:** Every key you press.
    *   **Corrections:** Every time you press `Backspace`.
    *   **Real-time Feedback:** The sandbox provides a detailed, live breakdown:
        *   **Live Counts:** Prominently displays your `Keys Pressed` and `Backspaces`.
        *   **Visual Progress Bars:** The "Typing Intensity" and "Signs of Exhaustion" bars fill up instantly with every keypress, showing your progress towards the detection thresholds.

3.  **Measuring Against Thresholds:** After 4 seconds, the app checks your activity against the **Sensitivity** level you've set ("Relaxed", "Balanced", or "Strict"). It asks: does this pattern match fatigue or agitation?

4.  **Triggering the Gentle Nudge:** If a pattern is detected, the app displays a relevant overlay, like "You seem tired" or "Take a deep breath," encouraging you to rest.

The counters then reset, and the app waits for the next burst of typing. This entire process is visualized for you, making a complex feature simple and understandable.
</details>
