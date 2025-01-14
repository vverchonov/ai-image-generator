interface ChatCompletionResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export const generateSVG = async (
  prompt: string,
  model: 'gpt-3.5-turbo' | 'gpt-4' | 'gpt-4-turbo-preview'
): Promise<string> => {
  const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key is not configured');
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: 'You are an SVG generation expert. Create a simple, clean SVG code for the given prompt.'
          },
          {
            role: 'user',
            content: `Create an SVG drawing of: ${prompt}. Answer with only SVG code, no other text or markdown.`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to generate SVG');
    }

    const data: ChatCompletionResponse = await response.json();
    const content = data.choices[0]?.message.content.trim();
    if (!content) {
      throw new Error('Empty response from API');
    }

    // Extract SVG code
    const svgMatch = content.match(/<svg[\s\S]*?<\/svg>/);
    if (!svgMatch) {
      throw new Error('No valid SVG code found in response');
    }

    const svgCode = svgMatch[0];
    const svgDataUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgCode)))}`;
    return svgDataUrl;
  } catch (error) {
    console.error('Error generating SVG:', error);
    throw error;
  }
}; 