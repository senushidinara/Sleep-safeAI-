require('dotenv').config();
const express = require('express');
const cors = require('cors');
// Using a more plausible factory function pattern for the SDK.
const { createClient } = require('@liquidmetal-ai/raindrop');

const app = express();
const PORT = process.env.PORT || 3000;

// Use CORS to allow requests from the frontend
app.use(cors());

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

app.listen(PORT, () => {
  console.log(`[LiquidMetal Proxy] Server is running on port ${PORT}`);
});