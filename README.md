
# Sleep Safe 😴🛡️✨

### An AI-Powered Thematic Cognitive Analysis Platform

> An innovative platform that leverages a multi-layered AI approach—combining granular sentiment, behavioral typing analysis, and **thematic content extraction**—to provide a real-time, holistic understanding of a user's cognitive state. It features a proactive, context-aware AI chat, dynamic data visualizations including **Cognitive Hotspots**, and a deeply personalized wellness plan.

Sleep Safe is your personal guardian for digital wellness. 🌙 It has evolved into a sophisticated analysis platform that moves beyond *if* you are stressed to understand *why*. By synthesizing *what* you say, *how* you say it, and the **core topics** you discuss, it generates powerful, actionable insights to help you build healthier digital habits.

---

## ✨ Key Features

*   **🧠 Thematic Analysis Engine (New!):** The platform's core innovation. A dedicated AI engine now identifies the central theme of every message (e.g., **Work, Relationships, Health, Finances**), adding a crucial layer of contextual understanding.
*   **🔥 Cognitive Hotspots Visualization (New!):** A powerful, intuitive heatmap that displays the key themes from your session. The color of each theme tag corresponds to the average Cognitive Load you experienced while discussing it, instantly revealing your primary stressors.
*   **🔬 Granular Emotional Analysis:** The AI detects a wide spectrum of emotions—such as **Anxious, Frustrated, Calm, or Content**—providing a rich emotional context.
*   **📈 Cognitive Load Monitoring:** A core metric that synthesizes granular sentiment, emotional intensity, and behavioral typing patterns into a single, powerful score (0-100).
*   **🤖 Hyper Context-Aware AI:** The chatbot receives sentiment, typing patterns, *and the identified theme* with every message, allowing it to provide astonishingly perceptive and empathetic responses.
*   **🚀 Thematic, Actionable Sleep Plan:** The final analysis, powered by **`gemini-2.5-pro`**, is now built around your specific Cognitive Hotspots, providing a sleep plan with concrete steps to address your most significant stressors.

---

## 🏛️ Architectural Overview

Sleep Safe operates on a modular, multi-layered architecture designed for parallel real-time analysis, proactive intervention, and holistic, theme-driven synthesis.

```
                                       ┌───────────────────────────┐
                                       │        UI Layer 🎨        │
                                       │   (React Components,       │
                                       │    Charts, Hotspots)       │
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
│   Parallel Analysis Core (PAC)    │                        │      Proactive Insight Engine      │
│  - Typing Pattern Detector        │                        │   - Cognitive Shift Detector     │
│  - Granular Sentiment Engine      │                        │   - Fires UI Insight Card        │
│  - Thematic Analysis Engine (New!)│                        └──────────────────────────────────┘
└──────────────┬────────────────────┘
               │ (Provides Enriched Context)
               ▼
┌───────────────────────────────────┐                        ┌──────────────────────────────────┐
│      Context-Aware AI Core 🤖     │                        │    Session Synthesis Engine 🚀     │
│   - Receives full PAC context     │ (User Trigger) ──────▶ │   - Aggregates All Session Data  │
│   - Generates empathetic response │                        │   - Summarizes Cognitive Hotspots│
└───────────────────────────────────┘                        │   - Generates Final Thematic Plan│
                                                             └──────────────────────────────────┘
```

---

## 🌊 Data Flow & Analysis Pipeline

This diagram illustrates how a single user message is processed through the entire real-time analysis pipeline to generate multi-faceted, theme-aware insights.

```
[User Input] ────▶ "My boss is driving me crazy with these deadlines."
     │
     │ 1. BEHAVIOR CAPTURE
     │   (onKeyDown listener)
     │
     ├─▶ Typing Stats: {keys: 45, backspaces: 2, errorRatio: 0.04}
     │
     └─▶ Typing Pattern Analysis: 'emotion' (high speed, low error)
     
              │
              │ 2. PARALLEL CONTENT ANALYSIS (PAC)
              │   (async Promise.all)
              │
              ├─▶ (A) Gemini API Call: "Analyze sentiment..." ──▶ Granular Sentiment: 'Frustrated'
              │
              └─▶ (B) Gemini API Call: "Extract theme..." ──────▶ Theme: 'Work'
     
                       │
                       │ 3. COGNITIVE SYNTHESIS
                       │   (local calculation)
                       │
                       ├─▶ Cognitive Load Calculation:
                       │     - Sentiment Score ('Frustrated') => 85
                       │     - Pattern Multiplier ('emotion') => 1.15
                       │
                       └─▶ Cognitive Load: 98 / 100
     
                                │
                                │ 4. STATE UPDATE & RENDER
                                │
                                ├─▶ Update `analysisHistory` with {load: 98, sentiment: 'Frustrated', theme: 'Work', ...}
                                │
                                └─▶ Re-render UI:
                                     - Update Cognitive Load Chart
                                     - Update 'Work' Hotspot Tag Color
                                     - Add entry to Session Journal
     
                                         │
                                         │ 5. AI CONTEXTUALIZATION
                                         │
                                         ├─▶ Construct Enriched Prompt:
                                         │   "[CONTEXT: sentiment=Frustrated, pattern=emotion, theme=Work, load=98]
                                         │    My boss is driving me crazy with these deadlines."
                                         │
                                         └─▶ Send to Gemini Chat API
     
                                                  │
                                                  │ 6. AI RESPONSE
                                                  │
                                                  └─▶ Bot Message: "It sounds like the pressure from those
                                                                     deadlines at work is really intense right now."
```

This sophisticated, multi-layered approach provides immediate feedback, proactive guidance, a more intelligent conversational partner, and a powerful, holistic conclusion when you're ready for it.
