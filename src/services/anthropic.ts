interface ClaudeResponse {
  content: Array<{
    text: string;
  }>;
}

export const generateSVGWithClaude = async (
  prompt: string,
  model: 'claude-3-opus-20240229' | 'claude-3-sonnet-20240229'
): Promise<string> => {
  const apiKey = process.env.REACT_APP_ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('Anthropic API key is not configured');
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
    // Use the Vercel serverless function endpoint
    const response = await fetch('/api/claude', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        content: `${systemPrompt}\n\nCreate an SVG drawing of: ${prompt}`
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to generate SVG with Claude');
    }

    const data: ClaudeResponse = await response.json();
    const content = data.content[0]?.text.trim();
    if (!content) {
      throw new Error('Empty response from Claude API');
    }

    // Use the same SVG extraction logic
    const svgMatch = content.match(/```(?:xml|svg)?\s*(<svg[\s\S]*?<\/svg>)\s*```/);
    if (svgMatch) {
      const svgCode = svgMatch[1];
      const svgDataUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgCode)))}`;
      return svgDataUrl;
    }

    // Try to find raw SVG if no code blocks
    const rawSvgMatch = content.match(/<svg[\s\S]*?<\/svg>/);
    if (rawSvgMatch) {
      const svgCode = rawSvgMatch[0];
      const svgDataUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgCode)))}`;
      return svgDataUrl;
    }

    throw new Error('No valid SVG code found in Claude response');
  } catch (error) {
    console.error('Error generating SVG with Claude:', error);
    throw error;
  }
}; 