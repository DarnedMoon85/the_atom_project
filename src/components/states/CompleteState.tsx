'use client';

/**
 * CompleteState - Pure presentation component
 * NO business logic - only displays UI and calls AtomicEngine methods
 */

interface CompleteStateProps {
  lpn: string;
  orderId: string;
  prefix: string;
  onReset: () => void;
}

export default function CompleteState({ lpn, orderId, prefix, onReset }: CompleteStateProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-4xl">
        <div className="bg-gray-900 rounded-lg p-8 border-2 border-terminal-green">
          <h1 className="text-6xl font-bold mb-8 text-center text-terminal-green">
            SESSION COMPLETE
          </h1>
        
        <div className="space-y-6 mb-8">
          <div className="text-center">
            <p className="text-4xl text-safety-lime mb-2">LPN: {lpn}</p>
            <p className="text-3xl text-gray-400 mb-2">ORDER: {orderId}</p>
            <p className="text-3xl text-gray-400">PREFIX: {prefix}</p>
          </div>
          
          <div className="bg-terminal-green bg-opacity-20 border-2 border-terminal-green rounded-lg p-6 text-center">
            <p className="text-5xl text-terminal-green font-bold">
              SUCCESS
            </p>
          </div>
        </div>
        
        <button
          onClick={onReset}
          className="w-full py-6 text-4xl font-bold bg-safety-orange text-black rounded-lg hover:bg-orange-600 transition-colors"
        >
          START NEW SESSION
        </button>
        </div>
      </div>
    </div>
  );
}
