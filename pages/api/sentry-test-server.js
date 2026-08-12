import * as Sentry from '@sentry/nextjs';

export default function handler(req, res) {
  Sentry.captureException(new Error('Sentry server-side test exception'));
  return res.status(200).json({
    ok: true,
    message: 'Server-side exception captured. Check your Sentry dashboard.',
  });
}
