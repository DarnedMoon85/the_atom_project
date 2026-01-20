'use client';

/**
 * OrderScanState - Pure presentation component
 * NO business logic - only displays UI and calls AtomicEngine methods
 */

interface OrderScanStateProps {
  lpn: string;
  onOrderScan: (orderId: string) => void;
  isLoading: boolean;
  error: string | null;
}

export default function OrderScanState({ lpn, onOrderScan, isLoading, error }: OrderScanStateProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const orderId = formData.get('orderId') as string;
    if (orderId) {
      onOrderScan(orderId);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-4xl">
        <div className="mb-6 text-center">
          <p className="text-4xl text-safety-lime mb-2">LPN: {lpn}</p>
          <p className="text-3xl text-gray-400">STATE: ORDER SCAN</p>
        </div>

        <div className="bg-gray-900 rounded-lg p-8 border-2 border-gray-800">
          <h2 className="text-5xl mb-6 text-center text-safety-orange">
            SCAN ORDER
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="orderId" className="block text-4xl mb-4 text-white">
                ORDER ID:
              </label>
              <input
                type="text"
                id="orderId"
                name="orderId"
                autoFocus
                disabled={isLoading}
                className="w-full px-6 py-4 text-4xl bg-gray-800 border-2 border-gray-700 rounded-lg text-white focus:border-safety-orange focus:outline-none disabled:opacity-50"
                placeholder="Scan order barcode"
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
              {isLoading ? 'PROCESSING...' : 'PROCESS ORDER'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
