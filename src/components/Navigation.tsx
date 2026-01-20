'use client';

/**
 * Navigation - Simple navigation between Scanner and Dashboard
 * Pure presentation component
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="bg-gray-900 border-b-2 border-gray-800 p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-8">
        <Link
          href="/scanner"
          className={`btn-industrial text-center ${
            pathname === '/scanner'
              ? 'bg-safety-orange text-black'
              : 'bg-gray-800 text-white hover:bg-gray-700'
          }`}
        >
          SCANNER
        </Link>
        <Link
          href="/dashboard"
          className={`btn-industrial text-center ${
            pathname === '/dashboard'
              ? 'bg-safety-orange text-black'
              : 'bg-gray-800 text-white hover:bg-gray-700'
          }`}
        >
          DASHBOARD
        </Link>
      </div>
    </nav>
  );
}
