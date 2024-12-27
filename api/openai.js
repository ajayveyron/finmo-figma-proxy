// api/openai.js (Node.js serverless function)
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  // 1. Retrieve prompt or other data from the request body
  const { prompt, model, ...otherData } = req.body || {};
  if (!prompt) {
    return res.status(400).json({ error: 'No prompt provided' });
  }

  // 2. Securely read your OpenAI key from environment variables
  //    (In Vercel, set OPENAI_API_KEY in Project Settings → Environment Variables)
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  // 3. Make the call to OpenAI
  try {
    const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model || 'gpt-3.5-turbo', 
        messages: [
          { role: 'user', content: prompt }
        ],
        ...otherData
      })
    });

    if (!openAiResponse.ok) {
      const errorText = await openAiResponse.text();
      return res.status(openAiResponse.status).json({ error: errorText });
    }
    const data = await openAiResponse.json();
    return res.status(200).json(data);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Something went wrong calling OpenAI' });
  }
}
