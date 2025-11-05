# Sleep Safe 😴🛡️✨

### Your intelligent digital wellness dashboard.

> An innovative application that analyzes conversational patterns—both typing mechanics and sentiment—to provide a comprehensive psychological analysis, visual trend summaries, and a personalized, actionable wellness plan.

Sleep Safe is your personal guardian for digital wellness. 🌙 It uses a **smart, privacy-first, behavior-based approach** to help you understand your state of mind. It now provides a full suite of tools, from real-time analysis to a final, comprehensive report, all wrapped in a beautiful and intuitive interface.

---

## ✨ Key Features

*   **🎨 Dynamic Theming:** Your space, your style. Choose from multiple warm themes like "Sunset," "Ocean," or "Twilight" to personalize your experience.
*   **🧠 Dual-Layer Psychological Analysis:** The core of the app. It goes beyond simple metrics.
    *   **Typing Pattern Analysis:** Analyzes *how* you type to detect patterns of fatigue or emotional agitation.
    *   **Sentiment Analysis:** Powered by the Gemini API, it analyzes the emotional tone of your messages (Positive, Negative, or Neutral).
*   **📊 Session Summary & Trend Analysis (New!):** Get an at-a-glance overview of your entire session with a dynamic summary card that includes:
    *   **Overall Sentiment & Dominant Typing Pattern:** Understand your main tendencies.
    *   **Visual Sentiment Chart:** A simple bar chart visually breaks down your emotional trends.
*   **🚀 Comprehensive Final Analysis & Sleep Plan:** This is the ultimate goal of your session. After your conversation, the app synthesizes the entire chat transcript and all your psychological data, using the powerful **`gemini-2.5-pro`** model to generate:
    *   A **holistic analysis** of your session, rendered in beautiful Markdown.
    *   A **personalized, actionable sleep plan** with concrete steps.
*   **💾 Full User Control (New!):**
    *   **Export Session:** Download a complete `.txt` file of your entire session, including the chat, journal, and final plan.
    *   **Reset Session:** Start fresh at any time with a confirmation-protected reset button.
*   **📓 Session Journal:** Track your per-message analysis history. Reflect on your conversations and gain a deeper understanding of your digital habits in the moment.
*   **🔒 Completely Private:** All analysis happens in your browser. Your data is managed via `localStorage`, ensuring your complete privacy.

---

## 🖼️ App Preview

A glimpse into the clean, spacious, and powerful new interface of Sleep Safe.

### ✨ The Complete Wellness Dashboard

The app now features a professional two-column layout. The immersive chat session is on the left, with all your analysis tools and settings neatly organized in a tabbed panel on the right.

*(Screenshot description: The main view of the app showing the two-column layout. On the left is a large chat interface. On the right is a side panel with tabs for "Analysis" and "Settings". The "Analysis" tab is active, showing the new Session Summary card with a sentiment bar chart at the top.)*

### 🔬 The Formatted Analysis & Personalized Plan

The culmination of your session. The final report is now rendered with beautiful Markdown formatting, making it easy to read and act upon.

*(Screenshot description: A close-up of the "Final Analysis & Sleep Plan" section, which displays a generated report with proper headings, bold text, and numbered lists, making it look like a professional document.)*

### ⚙️ Full Control & Journaling

Easily switch between viewing your final plan, reviewing your per-message journal, and fine-tuning the analysis settings. New controls for exporting and resetting your session are clearly accessible.

*(Screenshot description: The right-side panel showing the "Settings" tab with toggles, the sensitivity slider, and the new "Reset Session" button. Another view shows the "Analysis" tab with the "Export Session" button.)*

---

## ⚙️ How It Works

### 🏗️ High-Level Architecture

Sleep Safe operates on a powerful two-part structure: a real-time, per-message analysis loop, and a final, session-wide synthesis step, now with added data management controls.

```
                                  ┌───────────────────────────┐
                                  │   Sleep Safe UI/UX 🎨     │
                                  │ (Dashboard: Chat + Panel) │
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
│  Per-Message Analysis Loop│   │    Session-Wide Synthesis   │     │      Data Management &        │
│  (Typing + Sentiment)     │   │ (User-Triggered Final Plan) │     │  Storage (Export, Reset, LS)  │
└───────────────────────────┘   └───────────────────────────┘     └───────────────────────────────┘
```

<details>
<summary><strong>🧠 The Psychological Analysis Suite (Click to Expand)</strong></summary>

This suite is a two-stage process: continuous insight followed by a conclusive summary.

### **🤔 Identifying Human Patterns**

*   **😴 Fatigue Typing:** High typing intensity + high correction rate.
*   **😠 Agitated Typing:** Very high typing speed + low correction rate.
*   **😊 Sentiment & Tone:** The underlying emotional content of the text.

### **🔢 Analysis Flow Breakdown**

The process has two distinct phases:

#### Phase 1: Real-time, Per-Message Analysis (The Loop)

This happens every time you send a message, feeding the Session Summary and Journal.

```
[ User Action: Clicks "Send" 💬 ]
            │
            ▼
┌──────────────────────────┐
│ 1. Local Typing Analysis │
│  (Count Keys/Backspaces) │
└───────────┬────────────┘
            │
            ▼
┌──────────────────────────┐
│ 2. API Sentiment Analysis│
│  (Sends message to Gemini)│
└───────────┬────────────┘
            │
            ▼
┌──────────────────────────┐
│    Display & Log Insight │
│ (Show in chat, add to   │
│ Journal, update Summary) │
└──────────────────────────┘
```

#### Phase 2: Final, Session-Wide Analysis (The Conclusion)

This is a user-initiated process that provides the ultimate value of the session:

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
│ 2. Construct Master Prompt │
│ (Instruct AI to act as a │
│   wellness coach)        │
└───────────┬────────────┘
            │
            ▼
┌──────────────────────────┐
│ 3. Send to Gemini 2.5 Pro│
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

1.  **Synthesizing Data:** When you request the final plan, the app gathers every piece of data from your session: every message from you and the bot, and every single analysis entry from the journal.

2.  **Constructing the Prompt:** This data is compiled into a single, comprehensive prompt that instructs the `gemini-2.5-pro` model to act as a wellness expert and generate a final analysis and actionable plan.

3.  **Generating the Plan:** The powerful model processes the entire context of your session to provide insights and suggestions that are far more nuanced and personalized than a single-message analysis could ever be.

4.  **Displaying the Result:** The final report is rendered using a Markdown parser into a clean, readable format, giving you a clear takeaway and concrete steps to improve your well-being.

This two-phase approach provides the best of both worlds: immediate, granular feedback during your conversation, and a powerful, holistic conclusion when you're ready for it.
</details>
