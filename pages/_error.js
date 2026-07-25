import Head from 'next/head';

function Error({ statusCode }) {
  const title = statusCode === 404 ? 'Page Not Found' : 'Error';
  return (
    <>
      <Head>
        <title>{title} | YoHomeFix</title>
        <meta name="robots" content="noindex" />
      </Head>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-blue-900 mb-4">
            {statusCode === 404 ? '404 — Page Not Found' : `Error ${statusCode}`}
          </h1>
          <p className="text-gray-600 mb-6">
            {statusCode === 404
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
  // Cache 404 responses at the Vercel edge for one hour so repeated bot scans
  // of non-existent paths don't keep hitting the origin and generating
  // Fast Origin Transfer.
  if (res && statusCode === 404) {
    res.setHeader(
      'Cache-Control',
      'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400, must-revalidate'
    );
  }
  return { statusCode };
};

export default Error;
