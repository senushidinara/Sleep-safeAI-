
# Sleep Safe 😴🛡️✨

### An Advanced Cognitive & Behavioral Analysis Engine

> An innovative application that leverages granular sentiment detection and behavioral typing analysis to calculate a user's real-time **Cognitive Load**. It provides a proactive, context-aware AI chat experience, dynamic data visualizations, and a deeply personalized wellness plan.

Sleep Safe is your personal guardian for digital wellness. 🌙 It has evolved into a sophisticated analysis engine that moves beyond simple metrics to provide a holistic understanding of your state of mind. By synthesizing *what* you say with *how* you say it, it generates powerful, actionable insights to help you build healthier digital habits.

---

## ✨ Key Features

*   **🔬 Granular Emotional Analysis (New!):** The AI now detects a wide spectrum of emotions—such as **Anxious, Frustrated, Calm, or Content**—providing a much richer emotional context than simple positive/negative analysis.
*   **📈 Cognitive Load Monitoring (New!):** A new, core metric that synthesizes granular sentiment, emotional intensity, and behavioral typing patterns into a single, powerful score (0-100). This allows for at-a-glance identification of moments of high stress or mental fatigue.
*   **🧠 Advanced AI-Powered Insights:**
    *   **Proactive Shift Detection:** The app's AI actively monitors your Cognitive Load score for sharp increases, presenting a gentle, actionable insight to help you explore your feelings in the moment.
    *   **Hyper Context-Aware Chatbot:** The AI assistant receives the specific emotion *and* the Cognitive Load score with every message, allowing it to provide dramatically more precise, empathetic, and relevant responses.
*   **📊 Dynamic Cognitive Load Trend Chart:** The primary data visualization now tracks your Cognitive Load over time, providing a clear and immediate overview of your session's cognitive and emotional journey.
*   **🚀 Comprehensive Final Analysis & Sleep Plan:** At the end of your session, the app synthesizes all the rich data points using the powerful **`gemini-2.5-pro`** model to generate a holistic analysis and a personalized, actionable sleep plan.
*   **💾 Full User Control & Privacy:** Export your entire session as a `.txt` file, reset anytime, and rest assured that all analysis happens in your browser via `localStorage` for complete privacy.

---

## 🏛️ Architectural Overview

Sleep Safe operates on a modular, multi-layered architecture designed for real-time analysis, proactive intervention, and holistic synthesis.

```
                                       ┌───────────────────────────┐
                                       │        UI Layer 🎨        │
                                       │ (React Components, Theming) │
                                       └─────────────▲─────────────┘
                                                     │ (Renders)
                                       ┌─────────────┴─────────────┐
                                       │  State Management Core ⚙️  │
                                       │   (useState, useEffect,     │
                                       │      useRef, localStorage)  │
                                       └──────┬─────────┬──────────┘
                                              │         │ (Updates)
               (Triggers) ┌───────────────────┘         └──────────────────┐
                        │                                                 │
                        ▼                                                 ▼
┌───────────────────────────────────┐                        ┌──────────────────────────────────┐
│     Real-Time Analysis Engine     │                        │      Proactive Insight Engine      │
│  - Typing Pattern Detector        │                        │   - Cognitive Shift Detector     │
│  - Granular Sentiment API Call    │                        │   - Fires UI Insight Card        │
│  - Cognitive Load Calculator      │                        └──────────────────────────────────┘
└──────────────┬────────────────────┘
               │ (Provides Context)
               ▼
┌───────────────────────────────────┐                        ┌──────────────────────────────────┐
│      Context-Aware AI Core 🤖     │                        │    Session Synthesis Engine 🚀     │
│   - Receives enriched context     │ (User Trigger) ──────▶ │   - Aggregates All Session Data  │
│   - Generates empathetic response │                        │   - Calls Gemini 2.5 Pro         │
└───────────────────────────────────┘                        │   - Generates Final Markdown Plan│
                                                             └──────────────────────────────────┘
```

---

## 🌊 Data Flow & Analysis Pipeline

This diagram illustrates how a single user message is processed through the entire real-time analysis pipeline to generate multi-faceted insights.

```
[User Input] ────▶ "I'm so stressed about work."
     │
     │ 1. BEHAVIOR CAPTURE
     │   (onKeyDown listener)
     │
     ├─▶ Typing Stats: {keys: 30, backspaces: 5, errorRatio: 0.16}
     │
     └─▶ Typing Pattern Analysis: 'fatigue' (based on thresholds)
     
              │
              │ 2. CONTENT ANALYSIS
              │   (async API call)
              │
              ├─▶ Gemini API Call: "Analyze sentiment: '...'"
              │
              └─▶ Granular Sentiment: 'Anxious'
     
                       │
                       │ 3. COGNITIVE SYNTHESIS
                       │   (local calculation)
                       │
                       ├─▶ Cognitive Load Calculation:
                       │     - Sentiment Score ('Anxious') => 75
                       │     - Pattern Multiplier ('fatigue') => 1.1
                       │
                       └─▶ Cognitive Load: 83 / 100
     
                                │
                                │ 4. STATE UPDATE & RENDER
                                │   (React setState)
                                │
                                ├─▶ Update `analysisHistory` state
                                │
                                ├─▶ Re-render UI:
                                │     - Update Cognitive Load Chart
                                │     - Add entry to Session Journal
                                │
                                └─▶ Trigger Proactive Engine (checks history for shifts)
     
                                         │
                                         │ 5. AI CONTEXTUALIZATION
                                         │
                                         ├─▶ Construct Enriched Prompt:
                                         │   "[CONTEXT: sentiment=Anxious, pattern=fatigue, load=83]
                                         │    I'm so stressed about work."
                                         │
                                         └─▶ Send to Gemini Chat API
     
                                                  │
                                                  │ 6. AI RESPONSE
                                                  │
                                                  └─▶ Bot Message: "It sounds like work is really weighing
                                                                     heavily on you right now. I'm here to listen."
```

This sophisticated, multi-layered approach provides immediate feedback, proactive guidance, a more intelligent conversational partner, and a powerful, holistic conclusion when you're ready for it.
```

## 🖼️ App Preview

A glimpse into the intelligent, proactive, and powerful new interface of Sleep Safe.

### ✨ The Advanced Cognitive Load Dashboard

The main view, featuring the new "Cognitive Load Trend" chart, which provides a powerful, at-a-glance visualization of your mental state throughout the session.

*(Screenshot description: The main view of the app. The side panel prominently features the new "Cognitive Load Trend" chart. The chart's Y-axis is labeled "High" at the top and "Low" at the bottom, and a line graph plots the user's cognitive load score over time.)*

### 🔬 Granular, Real-Time Analysis

Each message is now analyzed for nuanced sentiment and a composite Cognitive Load score, displayed instantly below the chat and logged in the Session Journal.

*(Screenshot description: A close-up of the area below the chat input. The "Last Message Analysis" section now shows three metrics: Typing Pattern, a granular Sentiment like "Anxious," and the "Cognitive Load" score.)*
