'use client';

import { useEffect, useState } from 'react';
import { openCallbackPanel, loadMarketCallScript } from 'lib/affiliates/marketcall.js';

export default function VerticalCallbackWidget({ campaignId, vertical, city, service, zip, className = '', size = 'md' }) {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!campaignId || campaignId === '000000') {
      setError(true);
      return;
    }
    loadMarketCallScript(campaignId)
      .then(() => setReady(true))
      .catch(() => setError(true));
  }, [campaignId]);

  function handleClick() {
    openCallbackPanel(campaignId, { city, service, zip, vertical });
  }

  if (error) {
    return null;
  }

  const sizeClasses = size === 'sm'
    ? 'px-4 py-2 text-sm'
    : size === 'md'
    ? 'px-6 py-3 text-base'
    : size === 'lg'
    ? 'px-8 py-4 text-lg'
    : 'px-10 py-5 text-xl';

  return (
    <button
      onClick={handleClick}
      disabled={!ready}
      className={`inline-flex items-center justify-center bg-blue-900 hover:bg-blue-800 text-white rounded-full font-extrabold whitespace-nowrap transition-colors shadow-md hover:shadow-lg ${sizeClasses} ${className}`}
    >
      {ready ? 'Schedule a Callback' : 'Loading...'}
    </button>
  );
}
