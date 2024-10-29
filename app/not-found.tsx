import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-6xl font-extrabold text-white">404</h2>
          <p className="mt-2 text-3xl font-bold text-white">Oops! Page not found.</p>
          <p className="mt-2 text-xl text-white">The page you&#39;re looking for doesn&#39;t exist or has been moved.</p>
        </div>
        <div className="mt-8">
          <Link href="/" className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-300">
            Go back home
          </Link>
        </div>
      </div>
    </div>
  );
}