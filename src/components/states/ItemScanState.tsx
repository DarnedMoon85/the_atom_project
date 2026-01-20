'use client';

/**
 * ItemScanState - Pure presentation component
 * NO business logic - only displays UI and calls AtomicEngine methods
 */

interface ItemScanStateProps {
  lpn: string;
  orderId: string;
  prefix: string;
  onItemScan: (itemId: string) => void;
  onComplete: () => void;
  isLoading: boolean;
  error: string | null;
}

export default function ItemScanState({ 
  lpn, 
  orderId, 
  prefix, 
  onItemScan, 
  onComplete, 
  isLoading, 
  error 
}: ItemScanStateProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const itemId = formData.get('itemId') as string;
    if (itemId) {
      onItemScan(itemId);
      // Clear the input after scanning
      e.currentTarget.reset();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-4xl">
        <div className="mb-6 text-center">
          <p className="text-4xl text-safety-lime mb-2">LPN: {lpn}</p>
          <p className="text-3xl text-gray-400 mb-2">ORDER: {orderId}</p>
          <p className="text-3xl text-gray-400 mb-2">PREFIX: {prefix}</p>
          <p className="text-3xl text-gray-400">STATE: ITEM SCAN</p>
        </div>

        <div className="bg-gray-900 rounded-lg p-8 border-2 border-gray-800">
          <h2 className="text-5xl mb-6 text-center text-safety-orange">
            SCAN ITEMS
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="itemId" className="block text-4xl mb-4 text-white">
                ITEM ID:
              </label>
              <input
                type="text"
                id="itemId"
                name="itemId"
                autoFocus
                disabled={isLoading}
                className="w-full px-6 py-4 text-4xl bg-gray-800 border-2 border-gray-700 rounded-lg text-white focus:border-safety-orange focus:outline-none disabled:opacity-50"
                placeholder="Scan item barcode"
              />
            </div>
            
            {error && (
              <div className="bg-red-900 border-2 border-red-700 rounded-lg p-4">
                <p className="text-3xl text-red-200">{error}</p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <button
                type="submit"
                disabled={isLoading}
                className="py-6 text-4xl font-bold bg-safety-orange text-black rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'PROCESSING...' : 'SCAN ITEM'}
              </button>
              
              <button
                type="button"
                onClick={onComplete}
                disabled={isLoading}
                className="py-6 text-4xl font-bold bg-terminal-green text-black rounded-lg hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                COMPLETE
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
