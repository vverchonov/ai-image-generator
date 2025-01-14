interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

export const generateSVGWithGemini = async (
  prompt: string,
  model: 'gemini-1.5-pro'
): Promise<string> => {
  const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key is not configured');
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
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemPrompt}\n\nCreate an SVG drawing of: ${prompt}` }]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2000,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to generate SVG with Gemini');
    }

    const data: GeminiResponse = await response.json();
    const content = data.candidates[0]?.content.parts[0]?.text.trim();
    if (!content) {
      throw new Error('Empty response from Gemini API');
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

    throw new Error('No valid SVG code found in Gemini response');
  } catch (error) {
    console.error('Error generating SVG with Gemini:', error);
    throw error;
  }
}; 