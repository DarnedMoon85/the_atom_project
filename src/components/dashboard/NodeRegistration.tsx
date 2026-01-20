'use client';

/**
 * NodeRegistration - Register new Sub-Atom node
 * Pure presentation component - NO business logic
 */

interface NodeRegistrationProps {
  onRegister: (nodeId: string) => void;
  isRegistering: boolean;
}

export default function NodeRegistration({ onRegister, isRegistering }: NodeRegistrationProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const nodeId = formData.get('nodeId') as string;
    if (nodeId && nodeId.trim()) {
      onRegister(nodeId.trim());
      e.currentTarget.reset();
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg p-8 border-2 border-safety-orange mb-8">
      <h2 className="text-5xl mb-6 text-center text-safety-orange">
        REGISTER NEW NODE
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="nodeId" className="block text-4xl mb-4 text-white">
            Node ID:
          </label>
          <input
            type="text"
            id="nodeId"
            name="nodeId"
            autoFocus
            disabled={isRegistering}
            className="input-industrial w-full bg-gray-800 border-2 border-gray-700 text-white focus:border-safety-orange focus:outline-none disabled:opacity-50"
            placeholder="Enter node identifier"
          />
        </div>
        <button
          type="submit"
          disabled={isRegistering}
          className="btn-industrial w-full bg-safety-orange text-black hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRegistering ? 'REGISTERING...' : 'REGISTER NODE'}
        </button>
      </form>
    </div>
  );
}
