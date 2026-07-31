import Head from 'next/head';

function Error({ statusCode, err }) {
  const code = statusCode || 500;
  const is404 = code === 404;
  const title = is404 ? 'Page Not Found' : 'Error';

  if (err && !is404) {
    console.error('[Next.js runtime error]', err);
  }

  return (
    <>
      <Head>
        <title>{title} | YoHomeFix</title>
        <meta name="robots" content="noindex" />
      </Head>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-blue-900 mb-4">
            {is404 ? '404 — Page Not Found' : `Error ${code}`}
          </h1>
          <p className="text-gray-600 mb-6">
            {is404
              ? "The page you requested doesn't exist or has been moved."
              : 'Something went wrong. Please try again later.'}
          </p>
          <a href="/" className="text-blue-700 underline">Return to YoHomeFix</a>
        </div>
      </div>
    </>
  );
}

Error.getInitialProps = ({ res, err, statusCode }) => {
  const code = statusCode || (res && res.statusCode) || 500;
  if (res && code === 404) {
    res.setHeader(
      'Cache-Control',
      'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400, must-revalidate'
    );
  }
  return { statusCode: code, err: err || null };
};

export default Error;
