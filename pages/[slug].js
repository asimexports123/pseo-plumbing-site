import { createClient } from '@supabase/supabase-js';

// Supabase details yahan hardcode karke check karlo ki chalta hai ya nahi
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_KEY
);

export async function getServerSideProps({ params }) {
  // getStaticProps ki jagah getServerSideProps use kar rahe hain taaki live data mile
  const { data, error } = await supabase
    .from('cities_data')
    .select('*')
    .eq('slug', params.slug)
    .single();

  if (error || !data) {
    return { props: { data: null } };
  }

  return { props: { data } };
}

export default function Page({ data }) {
  if (!data) return <h1 style={{textAlign: 'center', marginTop: '50px'}}>Data nahi mila... check karo slug sahi hai ya nahi.</h1>;

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <header style={{ padding: '10px 0', borderBottom: '1px solid #ccc' }}>
        <strong>Apex Plumbing</strong>
      </header>

      <main style={{ marginTop: '20px' }}>
        <h1 style={{ color: '#1e40af' }}>Emergency Plumber in {data.slug.replace(/-/g, ' ')}</h1>
        
        <a href="tel:+18005550199" style={{ display: 'block', padding: '20px', background: '#1d4ed8', color: '#fff', textAlign: 'center', fontSize: '1.5rem', borderRadius: '10px', textDecoration: 'none', fontWeight: 'bold' }}>
          📞 CALL NOW: 1-800-555-0199
        </a>

        <article style={{ marginTop: '30px', lineHeight: '1.6' }}>
          <p>Looking for expert plumbing in <strong>{data.slug.replace(/-/g, ' ')}</strong>? We are here to help 24/7.</p>
        </article>

        <div style={{ margin: '30px 0', height: '100px', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          [AdSense Ad Slot]
        </div>
      </main>

      <footer style={{ marginTop: '50px', borderTop: '1px solid #ccc', paddingTop: '20px', textAlign: 'center' }}>
        <p>&copy; 2026 Apex Plumbing</p>
      </footer>
    </div>
  );
}
