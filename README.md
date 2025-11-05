# Sleep Safe 😴🛡️✨

### Your intelligent and proactive digital wellness dashboard.

> An innovative application that analyzes conversational patterns to provide proactive cognitive insights, a context-aware AI chat experience, visual trend summaries, and a personalized, actionable wellness plan.

Sleep Safe is your personal guardian for digital wellness. 🌙 It uses a **smart, privacy-first, behavior-based approach** to help you understand your state of mind. It now features a proactive AI that detects shifts in your emotional state, providing real-time insights to guide your conversation toward greater self-awareness.

---

## ✨ Key Features

*   **🧠 Advanced AI-Powered Insights (New!):**
    *   **Cognitive Shift Detection:** The app's AI now actively monitors your conversation for significant shifts in tone and typing patterns.
    *   **Proactive Insights:** When a negative cognitive shift is detected, the app presents a gentle, actionable insight to help you explore your feelings in the moment.
    *   **Context-Aware Chatbot:** The AI assistant receives real-time context about your detected emotional state, allowing it to provide significantly more empathetic and relevant responses.
*   **📊 Dynamic Sentiment Trend Chart (New!):** Get a rich, at-a-glance overview of your session's emotional journey with a dynamic line chart that visualizes:
    *   **Sentiment Arc:** Tracks your sentiment (Positive, Negative, Neutral) from message to message.
    *   **Typing Pattern Overlays:** Each point is color-coded to show the dominant typing pattern (Stable, Fatigue, or Emotion) for that moment.
*   **🚀 Comprehensive Final Analysis & Sleep Plan:** After your conversation, the app synthesizes all session data using the powerful **`gemini-2.5-pro`** model to generate:
    *   A **holistic analysis** of your session, rendered in beautiful Markdown.
    *   A **personalized, actionable sleep plan** with concrete steps.
*   **🎨 Dynamic Theming:** Your space, your style. Choose from multiple warm themes like "Sunset," "Ocean," or "Twilight" to personalize your experience.
*   **💾 Full User Control:**
    *   **Export Session:** Download a complete `.txt` file of your entire session.
    *   **Reset Session:** Start fresh at any time with a confirmation-protected reset button.
*   **🔒 Completely Private:** All analysis happens in your browser. Your data is managed via `localStorage`, ensuring your complete privacy.

---

## 🖼️ App Preview

A glimpse into the intelligent, proactive, and powerful new interface of Sleep Safe.

### ✨ The Proactive Wellness Dashboard

The app now features a proactive "Cognitive Insight" card that appears below the chat when the AI detects a significant shift in your emotional state, offering a chance for deeper reflection.

*(Screenshot description: The main view of the app. Below the main chat window, a new "Cognitive Insight" card is displayed, featuring a lightbulb icon and a gentle message about a detected shift in tone, with a clickable prompt suggestion.)*

### 🔬 The Advanced Sentiment Trend Chart

The former summary has been replaced by a dynamic trend chart, plotting sentiment over time with color-coded overlays for typing patterns.

*(Screenshot description: A close-up of the new "Sentiment Trend" chart in the side panel. It shows a line graph moving between "Positive," "Neutral," and "Negative" levels, with colored dots on the line indicating different typing patterns.)*

### ⚙️ The Context-Aware Conversation

The AI's responses are now more empathetic and relevant, as it receives and interprets your real-time psychological state with every message you send.

*(Screenshot description: A chat conversation where the user has expressed frustration. The AI's response is gentle and supportive, demonstrating its enhanced contextual awareness, e.g., "It sounds like that's really weighing on you. Let's talk through it." )*

---

## ⚙️ How It Works

### 🏗️ High-Level Architecture

Sleep Safe now operates on an advanced, multi-loop architecture: a real-time analysis loop, a proactive cognitive detection loop, and a final, session-wide synthesis step.

```
                                  ┌───────────────────────────┐
                                  │   Sleep Safe UI/UX 🎨     │
                                  │  (Dashboard + Insights)   │
                                  └─────────────▲─────────────┘
                                                │ Renders State
                                  ┌─────────────┴─────────────┐
                                  │      Core App Logic ⚙️      │
                                  │ (React State, Hooks, Logic) │
                                  └─────────────┬─────────────┘
                                                │
                 ┌──────────────────────────────┼────────────────────────────────┐
                 │                              │                                │
                 ▼                              ▼                                ▼
┌───────────────────────────┐   ┌───────────────────────────┐     ┌───────────────────────────────┐
│  Real-Time Analysis Loop  │   │ Proactive Detection Loop  │     │    Session-Wide Synthesis   │
│(Per-Message Typing+Senti) │   │ (Monitors history for shifts) │   │ (User-Triggered Final Plan) │
└───────────┬───────────────┘   └─────────────┬─────────────┘     └───────────────────────────────┘
            │                                 │
            └───────────────┬─────────────────┘
                            │
                            ▼
            ┌───────────────────────────┐
            │ Context-Aware Chat AI 🤖  │
            │(Receives analysis data to │
            │  inform its responses)    │
            └───────────────────────────┘
```

<details>
<summary><strong>🧠 The Advanced Analysis Suite (Click to Expand)</strong></summary>

The new suite adds a layer of proactive intelligence to the existing analysis flow.

### **🔢 Analysis Flow Breakdown**

#### Phase 1: Real-time, Per-Message Analysis (The Inner Loop)

This happens every time you send a message, feeding the Trend Chart and Session Journal.

```
[ User Action: Clicks "Send" 💬 ]
            │
            ▼
┌──────────────────────────────────┐
│ 1. Local Typing & API Sentiment  │
│           Analysis               │
└───────────┬────────────────────┘
            │
            ▼
┌──────────────────────────────────┐
│ 2. Contextualize AI Prompt       │
│ (Prepend analysis data for bot)  │
└───────────┬────────────────────┘
            │
            ▼
┌──────────────────────────────────┐
│ 3. Send to Context-Aware AI      │
│ (Bot uses context for empathy)   │
└───────────┬────────────────────┘
            │
            ▼
┌──────────────────────────────────┐
│ 4. Log Insight & Update UI       │
│ (Add to Journal, update Chart)   │
└──────────────────────────────────┘
```

#### Phase 2: Proactive Cognitive Detection (The Outer Loop)

This new process runs in the background, constantly monitoring the analysis history.

```
[ Analysis History is Updated ]
            │
            ▼
┌──────────────────────────┐
│ 1. Scan Last ~3 Entries  │
│   in Analysis History    │
└───────────┬────────────┘
            │
            ▼
┌──────────────────────────┐
│ 2. Detect Pattern Shift? │
│  (e.g., Positive -> Negative)│
└───────────┬────────────┘
            │
            ▼ (If Shift Detected)
┌──────────────────────────┐
│ 3. Trigger Cognitive     │
│       Insight UI         │
└──────────────────────────┘
```

#### Phase 3: Final, Session-Wide Analysis (The Conclusion)

This remains the user-initiated process that provides the ultimate value of the session:

```
[ User Action: Clicks "Generate Final Plan" 🚀 ]
            │
            ▼
┌──────────────────────────┐
│ 1. Synthesize All Data   │
│ - Entire Chat Transcript │
│ - Full Session Journal   │
└───────────┬────────────┘
            │
            ▼
┌──────────────────────────┐
│ 2. Send to Gemini 2.5 Pro│
│ (Leverage powerful model │
│ for deep analysis)       │
└───────────┬────────────┘
            │
            ▼
    ┌───────────────────┐
    │ Render Markdown   ├─▶ Show Final Analysis &
    │      Report       │    Personalized Sleep Plan
    └───────────────────┘

```
This advanced, multi-layered approach provides immediate feedback, proactive guidance, a more intelligent conversational partner, and a powerful, holistic conclusion when you're ready for it.
</details>
