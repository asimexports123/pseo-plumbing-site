import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_KEY
);

// Yeh function automatic data fetch karega
export async function getStaticProps() {
  // Yahan apni 'default' city ka slug daalo jo database mein hai
  const { data } = await supabase.from('cities_data').select('*').eq('slug', 'adjuntas').single();
  return { props: { data: data || null } };
}

export default function Home({ data }) {
  if (!data) return <div>Loading...</div>;

  return (
    <div style={{ fontFamily: "'Georgia', serif", backgroundColor: '#ffffff', maxWidth: '800px', margin: '0 auto', minHeight: '100vh' }}>
      {/* Header */}
      <nav style={{ padding: '20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#1a365d' }}>Apex Plumbing</h2>
        <a href="tel:+18005550199" style={{ background: '#3182ce', color: 'white', padding: '8px 16px', borderRadius: '5px', textDecoration: 'none', fontWeight: 'bold' }}>Call Now</a>
      </nav>

      {/* Hero Section - Yahan wahi template aayega */}
      <header style={{ padding: '40px 20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', color: '#1a365d', marginBottom: '20px' }}>24/7 Emergency Plumbing in {data.slug.split('-')[0]}</h1>
        <div style={{ margin: '30px 0' }}>
            <a href="tel:+18005550199" style={{ display: 'inline-block', background: '#e53e3e', color: 'white', padding: '20px 40px', fontSize: '1.5rem', borderRadius: '50px', textDecoration: 'none', fontWeight: '800' }}>
            📞 TAP TO CALL NOW
            </a>
        </div>
      </header>

      {/* Content */}
      <article style={{ padding: '0 20px', lineHeight: '1.8', fontSize: '1.1rem', color: '#2d3748' }}>
        <p>{data.content}</p>
      </article>
    </div>
  );
}
