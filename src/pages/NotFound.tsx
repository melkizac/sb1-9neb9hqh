import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-nexius-navy to-nexius-navy/95 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <img
          src="https://tunidbyclygzipvbfzee.supabase.co/storage/v1/object/public/website-images/m04h4fs8wns-1739784195705.png"
          alt="NEXIUS Labs"
          className="h-16 w-16 mx-auto mb-8"
        />
        <h1 className="text-6xl font-display font-bold text-white mb-4">404</h1>
        <h2 className="text-2xl font-display font-semibold text-white mb-4">Page Not Found</h2>
        <p className="text-white/80 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 bg-nexius-teal text-white rounded-lg hover:bg-nexius-teal/90 transition-colors font-display font-semibold tracking-wide text-sm"
          >
            <Home className="h-5 w-5 mr-2" />
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors font-display font-semibold tracking-wide text-sm"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}