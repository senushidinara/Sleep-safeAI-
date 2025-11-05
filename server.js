require('dotenv').config();
const express = require('express');
const cors =require('cors');
// Using a more plausible factory function pattern for the SDK.
const { createClient } = require('@liquidmetal-ai/raindrop');

const app = express();
const PORT = process.env.PORT || 3000;

// Use CORS to allow requests from the frontend
app.use(cors());
// Middleware to parse JSON bodies
app.use(express.json());

// GET endpoint to proxy Liquidmetal Raindrop requests
app.get('/api/liquidraindrops', async (req, res) => {
  const accessToken = process.env.RAINDROP_ACCESS_TOKEN;

  if (!accessToken) {
    return res.status(500).json({ error: 'Raindrop.io access token is not configured on the server.' });
  }

  try {
    // 1. Initialize the client using the factory function and the secure token.
    const raindropClient = createClient(accessToken);
    
    // 2. Use a more specific, namespaced method to retrieve all bookmarks.
    // The collectionId for "All bookmarks" is -1 in the Raindrop.io API.
    const data = await raindropClient.raindrops.getForCollection(-1);

    res.json(data);
  } catch (error) {
    console.error('Error fetching data from Liquidmetal Raindrop:', error.message);
    res.status(500).json({
      error: 'Failed to fetch data via Liquidmetal Raindrop client.',
      details: error.message
    });
  }
});

// POST endpoint to proxy ElevenLabs TTS requests
app.post('/api/elevenlabs/tts', async (req, res) => {
  const { text, voiceId, stability, style } = req.body;
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'ElevenLabs API key not configured on the server.' });
  }

  if (!text || !voiceId) {
    return res.status(400).json({ error: 'Request body must contain "text" and "voiceId".' });
  }

  const elevenLabsUrl = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
  
  const payload = {
    text: text,
    model_id: 'eleven_turbo_v2',
    voice_settings: {},
  };

  if (stability !== undefined) {
    payload.voice_settings.stability = stability;
  }
  if (style !== undefined) {
    payload.voice_settings.style = style;
  }

  try {
    const response = await fetch(elevenLabsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
        'Accept': 'audio/mpeg',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs API Error:', errorText);
      return res.status(response.status).json({ error: 'Failed to generate audio from ElevenLabs.', details: errorText });
    }

    res.setHeader('Content-Type', 'audio/mpeg');
    response.body.pipe(res);

  } catch (error) {
    console.error('Error proxying to ElevenLabs:', error.message);
    res.status(500).json({ error: 'Internal server error while fetching TTS audio.' });
  }
});


app.listen(PORT, () => {
  console.log(`[LiquidMetal Proxy] Server is running on port ${PORT}`);
});