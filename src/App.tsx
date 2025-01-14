import React, { useState } from 'react';
import './App.css';
import DrawingPrompt from './components/DrawingPrompt.tsx';
import DrawingResults, { ModelResult } from './components/DrawingResults.tsx';
import { generateSVG } from './services/openai.ts';
import { generateSVGWithClaude } from './services/anthropic.ts';
import { generateSVGWithGemini } from './services/gemini.ts';

// Define model groups for different APIs
const OPENAI_MODELS = ['gpt-3.5-turbo', 'gpt-4', 'o1-mini', 'o1-preview'] as const;
const ANTHROPIC_MODELS = ['claude-3-opus-20240229', 'claude-3-sonnet-20240229'] as const;
const GEMINI_MODELS = ['gemini-1.5-pro'] as const;

// Combine all models
const AI_MODELS = [...OPENAI_MODELS, ...ANTHROPIC_MODELS, ...GEMINI_MODELS] as const;

type AIModel = typeof AI_MODELS[number];

function App() {
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [results, setResults] = useState(() => [] as ModelResult[]);

  const generateWithModel = async (prompt: string, model: AIModel, index: number) => {
    try {
      let svgDataUrl: string;
      
      if (ANTHROPIC_MODELS.includes(model as any)) {
        svgDataUrl = await generateSVGWithClaude(
          prompt, 
          model as 'claude-3-opus-20240229' | 'claude-3-sonnet-20240229'
        );
      } else if (GEMINI_MODELS.includes(model as any)) {
        svgDataUrl = await generateSVGWithGemini(
          prompt,
          model as 'gemini-1.5-pro'
        );
      } else {
        svgDataUrl = await generateSVG(prompt, model as any);
      }

      setResults(prevResults => {
        const newResults = [...prevResults];
        newResults[index] = {
          modelName: model,
          imageUrl: svgDataUrl,
          isLoading: false
        };
        return newResults;
      });
    } catch (error) {
      console.error(`Error with ${model}:`, error);
      setResults(prevResults => {
        const newResults = [...prevResults];
        newResults[index] = {
          modelName: model,
          imageUrl: null,
          isLoading: false
        };
        return newResults;
      });
    }
  };

  const handleSubmit = async (prompt: string) => {
    setCurrentPrompt(prompt);
    
    // Create initial loading state for all models
    const initialResults: ModelResult[] = AI_MODELS.map(model => ({
      modelName: model,
      imageUrl: null,
      isLoading: true
    }));
    setResults(initialResults);

    // Generate SVGs using different models
    AI_MODELS.forEach((model, index) => {
      generateWithModel(prompt, model, index);
    });
  };
  return (
    <div className="App min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <DrawingPrompt onSubmit={handleSubmit} />
        {results.length > 0 && (
          <DrawingResults prompt={currentPrompt} results={results} />
        )}
      </div>
    </div>
  );
}

export default App;
