import { VercelRequest, VercelResponse } from '@vercel/node';

const TIMEOUT_DURATION = 50000; // 50 seconds

const fetchWithTimeout = async (url: string, options: RequestInit, timeout: number) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  // Enable CORS
  response.setHeader('Access-Control-Allow-Credentials', 'true');
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader(
    'Access-Control-Allow-Methods',
    'GET,OPTIONS,PATCH,DELETE,POST,PUT'
  );
  response.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight request
  if (request.method === 'OPTIONS') {
    response.status(200).end();
    return;
  }

  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.REACT_APP_ANTHROPIC_API_KEY;
  if (!apiKey) {
    return response.status(500).json({ error: 'API key not configured' });
  }

  try {
    const { model, content } = request.body;

    const claudeResponse = await fetchWithTimeout(
      'https://api.anthropic.com/v1/messages',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model,
          max_tokens: 2000,
          messages: [
            {
              role: 'user',
              content
            }
          ]
        })
      },
      TIMEOUT_DURATION
    );

    if (!claudeResponse.ok) {
      const error = await claudeResponse.json();
      throw new Error(error.error?.message || 'Failed to generate SVG with Claude');
    }

    const data = await claudeResponse.json();
    response.status(200).json(data);
  } catch (error: any) {
    console.error('Error proxying to Claude:', error);
    if (error.name === 'AbortError') {
      return response.status(504).json({
        error: 'Request timeout - Claude API took too long to respond'
      });
    }
    response.status(500).json({
      error: error.message || 'Failed to proxy request to Claude'
    });
  }
} 