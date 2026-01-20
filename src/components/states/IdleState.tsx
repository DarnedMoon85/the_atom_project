'use client';

/**
 * IdleState - Pure presentation component
 * NO business logic - only displays UI and calls AtomicEngine methods
 */

interface IdleStateProps {
  onLPNSubmit: (lpn: string) => void;
  isLoading: boolean;
  error: string | null;
}

export default function IdleState({ onLPNSubmit, isLoading, error }: IdleStateProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const lpn = formData.get('lpn') as string;
    if (lpn) {
      onLPNSubmit(lpn);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-4xl">
        <h1 className="text-6xl font-bold mb-8 text-center text-safety-orange">
          ATOMIC ENGINE
        </h1>
        
        <div className="bg-gray-900 rounded-lg p-8 border-2 border-gray-800">
          <h2 className="text-5xl mb-6 text-center text-safety-lime">
            ENTER LICENSE PLATE NUMBER
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="lpn" className="block text-4xl mb-4 text-white">
                LPN:
              </label>
              <input
                type="text"
                id="lpn"
                name="lpn"
                autoFocus
                disabled={isLoading}
                className="w-full px-6 py-4 text-4xl bg-gray-800 border-2 border-gray-700 rounded-lg text-white focus:border-safety-orange focus:outline-none disabled:opacity-50"
                placeholder="Scan or enter LPN"
              />
            </div>
            
            {error && (
              <div className="bg-red-900 border-2 border-red-700 rounded-lg p-4">
                <p className="text-3xl text-red-200">{error}</p>
              </div>
            )}
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-6 text-4xl font-bold bg-safety-orange text-black rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'PROCESSING...' : 'START SESSION'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
