import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_KEY
);

export async function getStaticPaths() {
  return { paths: [], fallback: 'blocking' };
}

export async function getStaticProps({ params }) {
  const { data } = await supabase
    .from('cities_data')
    .select('*')
    .eq('slug', params.slug)
    .maybeSingle();

  return { props: { data: data || null }, revalidate: 60 };
}

export default function Page({ data }) {
  if (!data) return <h1>Page not found</h1>;

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', lineHeight: '1.6', maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <header style={{ textAlign: 'center', padding: '40px 0', background: '#0056b3', color: '#fff', borderRadius: '8px' }}>
        <h1>Expert Plumbing Services in {data.slug.replace(/-/g, ' ')}</h1>
        <p>Reliable and Fast Plumbing Solutions</p>
      </header>

      <section style={{ margin: '20px 0' }}>
        <h2>Why Choose Our Plumbing Services?</h2>
        <p>We provide top-notch plumbing repairs, installations, and emergency services in <strong>{data.slug.replace(/-/g, ' ')}</strong>. Our team is dedicated to solving your plumbing issues efficiently.</p>
      </section>

      <div style={{ textAlign: 'center', padding: '20px', background: '#f8f9fa', border: '1px solid #dee2e6', borderRadius: '8px' }}>
        <h3>Need Immediate Help?</h3>
        <p>Call our expert plumbers now for a quick quote.</p>
        <button style={{ padding: '15px 30px', fontSize: '18px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          Call Now
        </button>
      </div>
    </div>
  );
}
