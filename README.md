# Sleep Safe 😴🛡️✨

### Your intelligent digital wellness journal.

> An innovative application that analyzes conversational patterns—both typing mechanics and sentiment—to provide insights into your digital well-being and promote healthier habits.

Sleep Safe is your personal guardian for digital wellness. 🌙 It uses a **smart, privacy-first, behavior-based approach** to help you understand your state of mind during digital interactions, all wrapped in a beautiful, customizable, and intuitive interface.

---

## ✨ Key Features

*   **🎨 Dynamic Theming:** Your space, your style. Choose from multiple warm and inviting themes like "Sunset," "Ocean," or "Twilight" to personalize your experience.
*   **🧠 Dual-Layer Psychological Analysis:** The core of the app. It goes beyond simple metrics.
    *   **Typing Pattern Analysis:** Analyzes *how* you type—not *what* you type—to detect patterns of fatigue (high correction rate) or emotional agitation (rapid, error-free typing).
    *   **Sentiment Analysis (New!):** Powered by the Gemini API, it analyzes the emotional tone of your messages, identifying them as Positive, Negative, or Neutral.
*   **📊 Instant, Combined Insights:** After every message, receive a comprehensive analysis card showing your typing pattern and sentiment, giving you a holistic snapshot of your mindset in that moment.
*   **📓 Persistent Session Journal (New!):** Your analysis history is now automatically saved to a journal. Track your patterns over time, reflect on your conversations, and gain a deeper understanding of your digital habits.
*   **💬 AI-Powered Conversation:** Engage in a thoughtful conversation with a sleep and wellness-focused AI that helps guide the session and provides a context for the analysis.
*   **🔒 Completely Private:** All analysis happens in your browser. Your conversations and typing data are never stored on a server or sent anywhere, ensuring your complete privacy.

---

## 🖼️ App Preview

A glimpse into the clean, intuitive, and powerful interface of Sleep Safe.

### ✨ The Interactive Analysis Session

Your mission control for digital wellness. Engage with the AI, and see instant psychological feedback after every message you send.

*(Screenshot description: The main view of the app showing the chat interface next to the analysis settings. The UI has a warm, sunset-themed color palette.)*

### 🔬 The Insight Card

See the magic happen in real-time! After each message, a card appears showing the dual-layer analysis: your typing pattern (e.g., "Fatigue") and the message's sentiment (e.g., "Negative").

*(Screenshot description: A close-up of the analysis card, displaying "Typing Pattern: Fatigue" and "Sentiment: Neutral" with confidence bars.)*

### 🎨 Personalize Your Experience

Tailor Sleep Safe to your mood with the new theme switcher. Fine-tune the sensitivity of the behavioral analysis with simple, clear controls.

*(Screenshot description: The settings area, showing toggles for Fatigue Analysis and Emotional Typing, along with the sensitivity slider and the new theme selection buttons.)*

### 📓 Your Session Journal

Track your progress and reflect on your mindset over time. The journal provides a log of all analyses from your session, creating a valuable record of your digital well-being journey.

*(Screenshot description: The "Session Journal" section, displaying a list of past analysis entries, each with a timestamp, typing pattern, and sentiment.)*

---

## ⚙️ How It Works

### 🏗️ High-Level Architecture

Sleep Safe operates through a cohesive system of a conversational UI, a dual-layer analysis engine, and a reactive interface that includes persistent state.

```
                                  ┌───────────────────────────┐
                                  │   Sleep Safe UI/UX 🎨     │
                                  │ (Chat, Settings, Journal) │
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
│  Real-time Event Capture  │   │  Psychological Analysis 🧠  │   │   Browser Storage 💾    │
│  (Typing within chat)     │──▶│  (Typing + Sentiment)     │──▶│ (localStorage for state)│
└───────────────────────────┘   └─────────────┬─────────────┘   └───────────────────────────┘
                                              │
                                              ▼
                                  ┌───────────────────────────┐
                                  │  Insight Card & Journal   │
                                  │  (Displays results)       │
                                  └───────────────────────────┘
```

<details>
<summary><strong>🧠 The Psychological Analysis Suite (Click to Expand)</strong></summary>

This is the feature that makes the app truly intelligent. It provides a multi-faceted view of your digital interactions.

### **🔒 Privacy is Paramount**

**The app does NOT record what you type for any purpose other than immediate, in-browser analysis.** The `Sentiment Analysis` sends only the current message's text to the Gemini API for processing and the result is immediately returned—the text is not stored by Google. The typing analysis is purely statistical, happens **entirely within your browser**, and is immediately discarded after each message.

### **🤔 Identifying Human Patterns**

*   **😴 Fatigue Typing:** When we're tired, our typing often becomes frantic and error-prone. We type quickly but make more mistakes, leading to a high rate of corrections (`Backspace`).
*   **😠 Agitated Typing:** When we're frustrated or agitated, we tend to type very quickly but with unusual precision and fewer errors.
*   **😊 Sentiment & Tone:** The words we choose convey powerful emotional information. The app leverages a powerful language model to understand this underlying tone.

### **🔢 Analysis Flow Breakdown (Per Message)**

The process is triggered every time you send a message in the interactive session:

```
[ User Action: Clicks "Send" 💬 ]
            │
            ▼
┌──────────────────────────┐
│ 1. Local Typing Analysis │
│  (Count Keys/Backspaces  │
│    from the last input)  │
└───────────┬────────────┘
            │
            ▼
┌──────────────────────────┐
│ 2. API Sentiment Analysis│
│  (Sends message text to  │
│    Gemini for analysis)  │
└───────────┬────────────┘
            │
            ▼
┌──────────────────────────┐
│    Combine Results       │
│  (Typing Pattern +       │
│     Sentiment)           │
└───────────┬────────────┘
            │
            ▼
      ┌───────────┐
      │ Display & │
      │   Log     ├─▶ Show Insight Card
      └─────┬─────┘
            │
            ▼
┌──────────────────────────┐
│   Add to Session Journal │
│   (Save in localStorage) │
└──────────────────────────┘

```

1.  **Capturing Typing Data:** As you type your message, the app keeps a simple, in-memory count of total keystrokes and corrections for that message only.

2.  **Triggering Analysis on Send:** When you hit "Send," two processes fire simultaneously:
    *   The **local typing analysis** compares your keystroke and correction data against the sensitivity thresholds you've set to determine a "Typing Pattern" (Fatigue, Emotion, or Stable).
    *   The **sentiment analysis** sends the text of your message to the Gemini API, which returns a sentiment classification (Positive, Negative, or Neutral).

3.  **Displaying Combined Insight:** The results are combined into a single, easy-to-read "Insight Card" that shows you the analysis for the message you just sent.

4.  **Logging to the Journal:** This combined analysis object is then added to your Session Journal, which is saved in your browser's `localStorage` so you can review it anytime during your session.

The counters then reset, and the app waits for your next message. This makes a complex, dual-layer analysis feel simple, transparent, and instantaneous.
</details>
