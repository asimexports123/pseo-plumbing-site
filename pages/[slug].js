import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_KEY
);

export async function getStaticPaths() { return { paths: [], fallback: 'blocking' }; }
export async function getStaticProps({ params }) {
  const { data } = await supabase.from('cities_data').select('*').eq('slug', params.slug).maybeSingle();
  return { props: { data: data || null }, revalidate: 60 };
}

export default function Page({ data }) {
  if (!data) return <h1>Loading...</h1>;

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      
      {/* 1. Header (Navigation) */}
      <header style={{ padding: '20px', borderBottom: '2px solid #1e40af', display: 'flex', justifyContent: 'space-between' }}>
        <strong>Apex Plumbing</strong>
        <nav>Home | Services | Contact</nav>
      </header>

      {/* 2. Hero Section (SEO Title + CTA) */}
      <main style={{ padding: '20px' }}>
        <h1 style={{ color: '#1e40af' }}>Emergency Plumber in {data.slug.replace(/-/g, ' ')}</h1>
        <a href="tel:+18005550199" style={{ display: 'block', padding: '20px', background: '#1d4ed8', color: '#fff', textAlign: 'center', fontSize: '1.5rem', borderRadius: '10px', textDecoration: 'none', fontWeight: 'bold' }}>
          📞 CALL NOW: 1-800-555-0199
        </a>

        {/* 3. Content Area for SEO (Yahan tumhare location specific keywords aayenge) */}
        <section style={{ marginTop: '30px', lineHeight: '1.8' }}>
          <h2>Why Choose Our {data.slug.replace(/-/g, ' ')} Plumbers?</h2>
          <p>Looking for reliable plumbing services in {data.slug.replace(/-/g, ' ')}? Our local team is available 24/7...</p>
          {/* AdSense Placement Slot */}
          <div style={{ margin: '20px 0', height: '100px', background: '#eee', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            [AdSense Banner Slot]
          </div>
        </section>
      </main>

      {/* 4. Footer */}
      <footer style={{ marginTop: '50px', padding: '20px', background: '#f8fafc', textAlign: 'center', borderTop: '1px solid #ddd' }}>
        <p>&copy; 2026 Apex Plumbing Services. All rights reserved.</p>
        <p>Serving {data.slug.replace(/-/g, ' ')} and surrounding zip codes.</p>
      </footer>
    </div>
  );
}
