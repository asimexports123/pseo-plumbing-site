import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

export default function SentryTestClient() {
  useEffect(() => {
    Sentry.captureException(new Error('Sentry client-side test exception'));
  }, []);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">Sentry Client-Side Test</h1>
      <p className="mt-2 text-gray-700">
        A client-side exception has been captured and sent to Sentry. Check your Sentry dashboard.
      </p>
    </main>
  );
}
