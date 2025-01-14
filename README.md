# AI SVG Generator

A React application that generates SVG illustrations using multiple AI models. The app allows you to compare SVG generations from different AI providers side by side.

## Features

- Generate SVG illustrations from text prompts
- Support for multiple AI models:
  - OpenAI Models (GPT-3.5-turbo, GPT-4)
  - Anthropic Models (Claude-3 Opus, Claude-3 Sonnet)
  - Google Models (Gemini-1.5-pro)
- Real-time loading states
- Responsive grid layout
- Error handling for failed generations
- Clean, minimal SVG outputs

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-svg-generator
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add your API keys:
```env
REACT_APP_OPENAI_API_KEY=your_openai_api_key
REACT_APP_ANTHROPIC_API_KEY=your_anthropic_api_key
REACT_APP_GEMINI_API_KEY=your_gemini_api_key
```

4. Start the development server:
```bash
npm start
```

## Usage

1. Enter a text prompt describing what you want to draw
2. Click "Submit" to generate SVGs
3. View the results from different AI models in a grid layout
4. Each card shows:
   - The model name
   - Loading state while generating
   - The generated SVG or error message
   - The SVG is rendered at 512x512 pixels

## Project Structure

```
src/
├── components/
│   ├── DrawingPrompt.tsx    # Input component for prompts
│   └── DrawingResults.tsx   # Grid display of generated SVGs
├── services/
│   ├── openai.ts           # OpenAI API integration
│   ├── anthropic.ts        # Claude API integration
│   └── gemini.ts           # Gemini API integration
└── App.tsx                 # Main application component
```

## Technical Details

- Built with React and TypeScript
- Uses Tailwind CSS for styling
- Handles SVG generation through AI model APIs
- Extracts SVG code from AI responses
- Converts SVGs to data URLs for display
- Implements proper error handling and loading states

## API Requirements

You'll need API keys from:
- OpenAI: https://platform.openai.com
- Anthropic: https://console.anthropic.com
- Google AI: https://makersuite.google.com

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

MIT License - feel free to use this project for your own purposes.
