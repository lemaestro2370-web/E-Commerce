import { Box, Loader2 } from 'lucide-react';

export function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <Box className="w-8 h-8 text-green-600 animate-pulse mr-2" />
          <Loader2 className="w-6 h-6 text-green-600 animate-spin" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Loading CameroonMart
        </h2>
        <p className="text-gray-600">
          Preparing your shopping experience...
        </p>
      </div>
    </div>
  );
}