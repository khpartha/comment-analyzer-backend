const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Comment Analyzer API is running' });
});

// Comment analysis endpoint
app.post('/api/analyze-comments', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const prompt = `Analyze these social media comments for toxic content. Return a JSON array:
[{"text": "exact quote", "type": "category", "confidence": 0.8}]

Categories:
- "sexual": Sexual references, objectification, explicit content about bodies/appearance
- "hate": Hostile labeling, dehumanizing language, group hatred  
- "harassment": Personal attacks, bullying, threatening behavior
- "racist": Racial slurs, ethnic discrimination, racial stereotypes

Comments to analyze:
${text}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Return the same format your Android app expects
    res.json(data);

  } catch (error) {
    console.error('Error analyzing comments:', error);
    res.status(500).json({ 
      error: 'Analysis failed',
      details: error.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Comment Analyzer API running on port ${PORT}`);
});