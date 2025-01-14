interface ChatCompletionResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

const extractSVGCode = (content: string): string => {
  // Try to find SVG code between XML or SVG code block markers
  const svgMatch = content.match(/```(?:xml|svg)?\s*(<svg[\s\S]*?<\/svg>)\s*```/);
  if (svgMatch) {
    return svgMatch[1];
  }

  // If no code blocks, try to find just the SVG tags
  const rawSvgMatch = content.match(/<svg[\s\S]*?<\/svg>/);
  if (rawSvgMatch) {
    return rawSvgMatch[0];
  }

  throw new Error('No valid SVG code found in the response');
};

export const generateSVG = async (
  prompt: string,
  model: 'gpt-3.5-turbo' | 'gpt-4' | 'gpt-4-turbo-preview' | 'o1-mini' | 'o1-preview'
): Promise<string> => {
  const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key is not configured');
  }

  const systemPrompt = `You are an SVG generation expert. Create a simple, clean SVG code for the given prompt.
    - Generate the SVG code wrapped in \`\`\`xml code blocks
    - Use a 512x512 viewBox
    - Keep the design minimal and clean
    - Use appropriate colors
    - Make sure the SVG is valid and can be rendered directly
    - Include helpful comments in the SVG code
    - You may include a brief description of what you created`;

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
          { role: 'user', content: `Create an SVG drawing of: ${prompt}. Answer with only SVG code, no other text or markdown.` }
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

    const svgCode = extractSVGCode(content);
    
    // Create a data URL from the SVG code
    const svgDataUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgCode)))}`;
    return svgDataUrl;
  } catch (error) {
    console.error('Error generating SVG:', error);
    throw error;
  }
}; 