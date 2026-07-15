import Head from 'next/head';
import Link from 'next/link';
import { PHONE_NUMBER } from '../lib/cities';
import { buildPageSchema } from '../lib/schemas';
import { getAllAuthors } from '../lib/authors';
import { Footer } from '../components/Footer';
import { Author } from '../components/Author';

const domain = process.env.NEXT_PUBLIC_DOMAIN || 'https://yohomefix.com';

export default function Authors() {
  const title = 'YoHomeFix Authors & Editorial Team';
  const description = 'Meet the YoHomeFix editorial team and reviewers who research, fact-check, and maintain our plumbing guides, cost pages, and local service content.';
  const canonical = `${domain}/authors`;
  const schema = buildPageSchema({
    title,
    description,
    path: '/authors',
    breadcrumbs: [
      { name: 'Home', url: `${domain}/` },
      { name: 'Authors', url: `${domain}/authors` },
    ],
  });
  const authors = getAllAuthors();

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={`${domain}/og-image.png`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={`${domain}/og-image.png`} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      </Head>

      <div className="font-sans bg-white min-h-screen flex flex-col">
        <nav className="bg-blue-900 text-white px-4 py-3 flex justify-between items-center sticky top-0 z-40 shadow-lg">
          <Link href="/" className="text-2xl font-extrabold text-white no-underline">YoHomeFix</Link>
          <a href={`tel:${PHONE_NUMBER}`} className="bg-red-600 text-white px-4 py-2 rounded-full font-bold text-sm" aria-label="Call emergency dispatch">📞 Call Now</a>
        </nav>

        <nav aria-label="Breadcrumb" className="max-w-3xl mx-auto w-full px-4 py-2 text-sm text-gray-500">
          <ol className="flex flex-wrap items-center gap-1">
            <li><Link href="/" className="text-blue-600 hover:underline no-underline">Home</Link></li>
            <li><span className="text-gray-300 mx-1">›</span></li>
            <li><span className="text-gray-700 font-medium">Authors</span></li>
          </ol>
        </nav>

        <main className="max-w-3xl mx-auto w-full px-4 py-10 flex-1">
          <h1 className="text-3xl font-extrabold text-blue-900 mb-4">Authors & Editorial Team</h1>
          <p className="text-gray-600 mb-8">
            YoHomeFix content is researched, reviewed, and maintained by a team of home services specialists, plumbing standards reviewers, and data researchers. Each author profile includes expertise, reviewed topics, and editorial role.
          </p>

          <div className="space-y-6">
            {authors.map((a) => (
              <div key={a.slug} className="border border-gray-200 rounded-xl p-6">
                <h2 className="text-xl font-bold text-blue-900 mb-1">
                  <Link href={`/authors/${a.slug}`} className="hover:underline no-underline text-blue-900">
                    {a.name}
                  </Link>
                </h2>
                <p className="text-sm text-gray-500 mb-3">{a.title}</p>
                <p className="text-gray-700 text-sm leading-relaxed mb-4">{a.bio}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {a.expertise.map((e) => (
                    <span key={e} className="px-2 py-1 bg-blue-50 text-blue-800 text-xs rounded-full">{e}</span>
                  ))}
                </div>
                <Link href={`/authors/${a.slug}`} className="text-sm font-semibold text-blue-600 hover:underline no-underline">
                  View profile →
                </Link>
              </div>
            ))}
          </div>

          <Author pageType="page" />
        </main>

        <Footer />
      </div>
    </>
  );
}
