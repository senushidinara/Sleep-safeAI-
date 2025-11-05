# Sleep Safe 😴🛡️

> An intelligent application that monitors late-night digital activity and analyzes behavioral patterns to encourage healthier sleep habits.

Sleep Safe is designed to be your personal guardian against sleep deprivation caused by late-night screen time. It goes beyond simple timers by using a smart, behavior-based approach to gently remind you when it's time to rest, all wrapped in a polished, intuitive interface.

---

## ✨ Key Features

*   **🎨 Polished & Readable UI:** A clean, modern design with increased font sizes and a spacious layout makes the app easy and pleasant to use.
*   **⏰ Customizable Sleep Schedule:** Easily set your desired bedtime and wake-up time to define your protected sleep window.
*   **🚫 App Blocklist:** Create a personalized list of distracting websites and apps (e.g., YouTube, Twitter, Reddit). The app will intervene if you're scrolling on these sites during your sleep hours.
*   **🧠 Behavioral Analysis Suite:** The core innovation of Sleep Safe.
    *   **Typing Analysis:** Analyzes *how* you type—not *what* you type—to detect patterns of fatigue or agitation.
    *   **Scroll Speed Analysis:** Detects unusually fast or frantic scrolling, another common sign of late-night distraction.
*   **🔬 Interactive Analysis Sandbox:** See the typing analysis in action! A dedicated sandbox lets you type and get immediate, real-time visual feedback on your typing patterns, making the entire process transparent and easy to understand.
*   **💤 Snooze Functionality:** If you need a few more minutes, a simple snooze button lets you temporarily pause the overlay.

---

## ⚙️ How It Works

### 🏗️ Architecture Diagram

This diagram shows the flow of how Sleep Safe analyzes activity and decides when to intervene.

```
            +---------------------------+
            |      User Interface       |
            | (Dashboard, Settings)     |
            +-------------+-------------+
                          |
            +-------------+-------------+
            |      User Interaction     |
            | (Typing, Scrolling, etc.) |
            +-------------+-------------+
                          |
           +--------------v--------------+
           |    Global Event Listeners   |
           | (keydown, scroll) on window |
           +--------------+--------------+
                          |
          +---------------v---------------+
          |        Core App Logic         |
          |  (Checks `isSleepTime`, etc.) |
          +---------------+---------------+
                          |
         +----------------+----------------+----------------+
         |                                                 |
+--------v----------+                      +---------------v-------+
|  Typing Analysis  |                      |   Scroll Analysis   |
| (4s window)       |                      | (2s window)         |
| - Key counts      |                      | - Scroll distance   |
| - Backspace ratio |                      |                     |
+--------+----------+                      +---------------+-------+
         |                                                 |
         +----------------+----------------+----------------+
                          |
              +-----------v------------+
              |  Threshold Comparison  |
              |(Fatigue, Emotion, etc.)|
              +-----------+------------+
                          |
              +-----------v------------+
              |  Trigger Block Screen? |
              |      (Yes / No)        |
              +-----------+------------+
                          | (if Yes)
            +-------------v-------------+
            |    Blocking Overlay UI    |
            |     (Snooze option)       |
            +---------------------------+

```

<details>
<summary><strong>🧠 The Behavioral Analysis Suite (Click to Expand)</strong></summary>

This is the feature that makes Sleep Safe truly intelligent. It identifies signs of tired, agitated, or unfocused digital activity to protect your sleep.

### **🔒 Privacy is Paramount**

**Sleep Safe does NOT record your activity.** It has no "keylogger" functionality and doesn't track your browsing history. The analysis is purely statistical and happens entirely within your browser.

### **🤔 Identifying Fatigue & Agitation Patterns**

*   **Fatigue Typing:** When we're tired, our typing often becomes frantic and error-prone. We type quickly but make more mistakes, leading to a high rate of corrections.
*   **Agitated Typing:** When we're frustrated or angry, we tend to type very quickly but with unusual precision and fewer errors.
*   **Distracted Scrolling:** When we're aimlessly browsing, we often scroll very quickly and erratically without stopping to engage with content.

Sleep Safe is designed to spot all of these patterns.

### **🔢 A Step-by-Step Breakdown (Typing Analysis)**

The process is made completely transparent in the **Analysis Sandbox**. Here's what happens when you type in it, or anywhere else while the feature is active during sleep hours:

1.  **Listening for Activity:** The moment you press a key, the app starts a 4-second analysis timer. You'll see an "Analyzing..." indicator in the sandbox.

2.  **Analyzing in 4-Second Windows:** For the next 4 seconds, the app keeps a simple count of:
    *   **Total Keystrokes:** Every key you press.
    *   **Corrections:** Every time you press `Backspace`.
    *   **Real-time Feedback:** The sandbox provides a detailed, live breakdown of your typing:
        *   **Live Counts:** Prominently displays your `Keys Pressed` and `Backspaces` as you type, so you can see the raw data being analyzed.
        *   **Visual Progress Bars:** The "Typing Intensity" and "Error Rate" bars fill up instantly with every keypress, visually representing your progress towards the detection thresholds.

3.  **Measuring Against Thresholds:** After the 4-second window ends, the app checks your activity against the **Sensitivity** level you've set ("Relaxed", "Balanced", or "Strict"). For fatigue, it asks two questions:
    *   Did you type *more* than the required number of keys?
    *   Was your *error ratio* (backspaces divided by total keys) *higher* than the threshold?

4.  **Triggering the Gentle Nudge:** If the pattern matches a defined state (like fatigue or agitation), the app concludes that it's a good time for a break. It then displays a relevant overlay, such as "You seem tired" or "Take a deep breath," encouraging you to rest.

The counters then reset, and the app waits for the next burst of typing to begin a new analysis. This entire process is visualized for you, making a complex feature simple and understandable.
</details>
