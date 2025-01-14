interface ChatCompletionResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export const generateSVG = async (
  prompt: string,
  model: 'gpt-3.5-turbo' | 'gpt-4' | 'gpt-4-turbo-preview' | 'o1-mini' | 'o1-preview'
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
            role: 'user',
            content: `Create an SVG drawing of: ${prompt}. Create SVG illustrations using minimalist and abstract designs. Use simple geometric shapes like circles, ovals, rectangles, and thin lines. Keep the designs playful and whimsical with an emphasis on childlike simplicity. Avoid symmetry and overly detailed patterns. Use a limited color palette with pastel tones and small color accents (e.g., pinks, yellows, and purples). Ensure characters have soft, organic shapes and a surreal but charming aesthetic. Avoid backgrounds, gradients, text, or photorealistic details. Answer with only SVG code, no other text or markdown.`
          }
        ],

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