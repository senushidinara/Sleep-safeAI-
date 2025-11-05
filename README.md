# Sleep Safe 😴🛡️✨

### A Dynamic Cognitive Co-Pilot with a Liquid AI Core

> An innovative platform built on a sophisticated, multi-layered architecture. It leverages a central **Liquid Cognitive Engine** to provide a real-time, holistic understanding of a user's cognitive state through dynamic interventions, on-demand AI-generated summaries, and a deeply personalized wellness plan.

Sleep Safe is your personal co-pilot for digital wellness. 🌙 It operates as an intelligent system that moves beyond *if* you are stressed to understand *why*. By synthesizing *what* you say, *how* you say it, and the core topics you discuss, its Liquid Cognitive Engine generates powerful, actionable insights to help you build healthier digital habits and provides intelligent assistance along a-way.

---

## ✨ Key Features

*   **✨ Dynamic AI Interventions:** When the system detects a significant cognitive shift, it generates a unique, context-aware follow-up question in real-time to help you explore your feelings more deeply.
*   **📄 AI-Powered Session Summary:** Generate a concise, bulleted summary of your session's key topics and emotional turning points at any time, providing a quick "at a glance" overview.
*   **📤 Comprehensive Session Export:** Download a complete record of your session, including the full transcript, detailed analysis journal, AI-generated summary, and your personalized final plan.
*   **🧠 Thematic Analysis Engine:** Identifies the central theme of every message (e.g., **Work, Relationships, Health**), adding a crucial layer of contextual understanding.
*   **🔥 Cognitive Hotspots Visualization:** An intuitive heatmap that displays the key themes from your session, color-coded by the average Cognitive Load you experienced while discussing them.
*   **📈 Cognitive Load Monitoring:** A core metric that synthesizes granular sentiment, emotional intensity, and behavioral typing patterns into a single, powerful score (0-100).

---

## Our Tech Stack & Architecture 🚀

We built Sleep Safe on a modern, robust architecture designed for security, scalability, and seamless integration, mirroring the principles of sophisticated AI deployment platforms like LiquidMetal's Raindrop. Here’s an explicit breakdown of how we used each component to bring this platform to life.

### High-Level System Design

This diagram shows the secure, three-tiered structure of the application. The frontend in the browser never communicates directly with the external API, ensuring our access tokens remain confidential.

```
+------------------+         +----------------------------+         +--------------------------+
|                  |         |                            |         |                          |
|   User's Browser |         |     Vultr Cloud Server     |         |    Liquidmetal Raindrop  |
| (Frontend App)   |         |    (Nginx + Node.js API)   |         |        API Service       |
|                  |         |                            |         |                          |
+------------------+         +----------------------------+         +--------------------------+
        |                                A                                A
        |  1. Makes API Request          |  2. Proxies Request            |
        |  (e.g., /api/liquidraindrops)  |  (Adds Secure Token)           |
        +------------------------------> |                                |
                                         +------------------------------> |
                                         <------------------------------+ |  3. Returns Data
                                         |                                |
        <------------------------------+ |  4. Returns Data to Frontend   |
        |                                |                                |

```

### Detailed Data Flow

This diagram illustrates the step-by-step journey of a single API request, from the user's click to the data rendering on the screen.

```
[ User Browser ]                                [ Vultr Server ]                                     [ Raindrop.io API ]
-----------------                               ------------------                                   -------------------
      |                                                 |                                                      |
      | 1. fetch('/api/liquidraindrops')                |                                                      |
      |------------------------------------------------>|                                                      |
      |                                                 | 2. Nginx routes to Node.js App                       |
      |                                                 |--------------------------+                           |
      |                                                 |                          |                           |
      |                                                 |                          v                           |
      |                                                 |               [ Node.js/Express Server ]             |
      |                                                 |               --------------------------             |
      |                                                 |               | 3. Reads RAINDROP_ACCESS_TOKEN       |
      |                                                 |               |    from process.env                  |
      |                                                 |               |                                      |
      |                                                 |               | 4. Uses @liquidmetal-ai/raindrop SDK |
      |                                                 |               |    to make secure API call           |
      |                                                 |               |------------------------------------->|
      |                                                 |               |                                      | 5. Validates token
      |                                                 |               |                                      |    and returns data
      |                                                 |               |<-------------------------------------|
      |                                                 |               | 6. Receives data from API            |
      |                                                 |               |                                      |
      |                                                 |               | 7. Sends JSON response back to client|
      |<------------------------------------------------|               |                                      |
      |                                                 |               +--------------------------------------+
      |                                                 |
      | 8. Receives data and updates UI                 |
      |                                                 |
      v
```

### 1. High-Performance Hosting on Vultr 💻

The entire application **was deployed** on a **Vultr Cloud Compute** instance. We selected Vultr for its high-performance infrastructure, which provides the speed and reliability necessary for a responsive user experience. This setup conceptually aligns with how platforms like LiquidMetal leverage Vultr's specialized resources (like Cloud GPUs) for demanding AI workloads, ensuring our application has a solid, scalable foundation.

### 2. LiquidMetal Raindrop Integration: A Claude-Native Backend Proxy 🔖

To securely interact with external services, **we built and deployed** a dedicated backend proxy using **Node.js and Express**. This backend is the core of our "Liquid AI" approach, abstracting away direct API communication from the frontend—a critical security practice.

*   **The Core Component:** Instead of a generic HTTP client, **we integrated** the specialized **`@liquidmetal-ai/raindrop`** NPM package. This SDK acts as our interface to the data source, providing an optimized and structured method for data retrieval. Our use of this specialized tool reflects the modern practice of using platform-specific SDKs to simplify DevOps and focus on application logic.

*   **Secure API Orchestration:** The Raindrop.io Access Token **was stored** safely as an environment variable on our Vultr server. Our Node.js server is the only component with access to this key. This mirrors how platforms like LiquidMetal Raindrop would use a Vultr API Key to securely orchestrate resources on behalf of the user, ensuring credentials are never exposed.

*   **The Data Flow We Engineered:**
    1.  The Gemini-built frontend **makes** a `fetch` request to our own secure endpoint (`/api/liquidraindrops`).
    2.  Our Node.js backend **receives** this request.
    3.  The backend then **initializes** the `@liquidmetal-ai/raindrop` client using the secret token.
    4.  It **uses** the client's methods to retrieve bookmark data, which is then passed safely back to the frontend.

This proxy architecture **ensured** that our API keys remained confidential while leveraging a powerful, specialized library for data integration, allowing us to build a Claude-native infrastructure for our application.

### 3. The Frontend (Gemini AI Studio) ✨

The beautiful and interactive user interface **was prototyped and built** using **Gemini AI Studio**. The generated frontend code (React, HTML, Tailwind CSS) **handled** all the UI logic, state management, and data visualization.

To bring in external data, **we modified** the generated frontend JavaScript to make simple `fetch` calls to our own secure backend API hosted on Vultr. This integration method **allowed us** to populate the UI with rich data from services like Raindrop.io without ever compromising on security.
