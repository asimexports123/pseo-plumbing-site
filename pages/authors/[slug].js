import Head from 'next/head';
import Link from 'next/link';
import { PHONE_NUMBER } from '../../lib/cities';
import { buildPageSchema } from '../../lib/schemas';
import { getAllAuthors, getAuthor } from '../../lib/authors';
import { Footer } from '../../components/Footer';
import { buildPersonSchema } from '../../lib/schemas';

const domain = process.env.NEXT_PUBLIC_DOMAIN || 'https://yohomefix.com';

export async function getStaticPaths() {
  return {
    paths: getAllAuthors().map((a) => ({ params: { slug: a.slug } })),
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const author = getAuthor(params.slug);
  return { props: { author } };
}

export default function AuthorPage({ author }) {
  const title = `${author.name} — ${author.title} | YoHomeFix`;
  const description = author.bio.slice(0, 160);
  const canonical = `${domain}/authors/${author.slug}`;
  const schema = buildPageSchema({
    title,
    description,
    path: `/authors/${author.slug}`,
    breadcrumbs: [
      { name: 'Home', url: `${domain}/` },
      { name: 'Authors', url: `${domain}/authors` },
      { name: author.name, url: `${domain}/authors/${author.slug}` },
    ],
  });
  const personSchema = buildPersonSchema(author);

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={canonical} />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="profile" />
        <meta property="og:url" content={canonical} />
        <meta property="og:image" content={author.image} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={author.image} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />
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
            <li><Link href="/authors" className="text-blue-600 hover:underline no-underline">Authors</Link></li>
            <li><span className="text-gray-300 mx-1">›</span></li>
            <li><span className="text-gray-700 font-medium">{author.name}</span></li>
          </ol>
        </nav>

        <main className="max-w-3xl mx-auto w-full px-4 py-10 flex-1">
          <h1 className="text-3xl font-extrabold text-blue-900 mb-2">{author.name}</h1>
          <p className="text-gray-500 mb-6">{author.title}</p>

          <p className="text-gray-700 leading-relaxed mb-6">{author.bio}</p>

          <section className="mb-6">
            <h2 className="text-lg font-bold text-blue-900 mb-3">Expertise</h2>
            <div className="flex flex-wrap gap-2">
              {author.expertise.map((e) => (
                <span key={e} className="px-3 py-1 bg-blue-50 text-blue-800 text-sm rounded-full">{e}</span>
              ))}
            </div>
          </section>

          <section className="mb-6">
            <h2 className="text-lg font-bold text-blue-900 mb-3">Reviewed Topics</h2>
            <ul className="list-disc ml-5 space-y-1 text-sm text-gray-700">
              {author.reviewedTopics.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </section>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 text-sm text-gray-600">
            <p>
              All content reviewed by {author.name} is subject to the YoHomeFix <Link href="/editorial-policy" className="text-blue-600 hover:underline no-underline">Editorial Policy</Link> and <Link href="/sources" className="text-blue-600 hover:underline no-underline">Sources & Methodology</Link>.
            </p>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
