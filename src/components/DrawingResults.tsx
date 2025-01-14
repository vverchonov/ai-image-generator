import React from 'react';

export interface ModelResult {
  modelName: string;
  imageUrl: string | null;
  isLoading: boolean;
}

export interface DrawingResultsProps {
  prompt: string;
  results: ModelResult[];
}

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-48">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
  </div>
);

const DrawingResults = ({ prompt, results }: DrawingResultsProps) => {
  return (
    <div className="max-w-7xl mx-auto p-4">
      <h3 className="text-xl font-semibold mb-4">You asked to draw: "{prompt}"</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((result, index) => (
          <div key={`${result.modelName}-${index}`} className="bg-white rounded-lg shadow-md p-4">
            <div className="text-sm text-gray-600 mb-2">Model: {result.modelName}</div>
            <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden">
              {result.isLoading ? (
                <LoadingSpinner />
              ) : result.imageUrl ? (
                <img
                  src={result.imageUrl}
                  alt={`AI generated ${prompt} by ${result.modelName}`}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  Failed to generate image
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DrawingResults; 