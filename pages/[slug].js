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
    <div style={{ fontFamily: 'sans-serif', maxWidth: '700px', margin: '0 auto', padding: '20px', lineHeight: '1.6' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#666' }}>
        <strong>Apex Plumbing</strong>
        <span>Services | Locations | Contact</span>
      </div>

      {/* Title */}
      <h1 style={{ textAlign: 'center', fontSize: '2.2rem', marginTop: '30px' }}>
        Expert Plumbing in {data.slug.replace(/-/g, ' ')}
      </h1>

      {/* Main CTA */}
      <div style={{ textAlign: 'center', margin: '40px 0' }}>
        <a href="tel:+18005550199" style={{ 
          background: '#d32f2f', color: 'white', padding: '20px 50px', 
          fontSize: '1.8rem', textDecoration: 'none', borderRadius: '50px', fontWeight: 'bold' 
        }}>
          CALL NOW
        </a>
      </div>

      {/* Features */}
      <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '10px' }}>
        <h3>Why Choose Our Local Pros?</h3>
        <ul>
          <li>24/7 Emergency Support</li>
          <li>Licensed & Insured Technicians</li>
          <li>Transparent Upfront Pricing</li>
        </ul>
      </div>

      {/* Zip Search */}
      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <p>Check if we serve your area:</p>
        <input type="text" placeholder="Enter ZIP Code" style={{ padding: '10px', width: '200px' }} />
        <button style={{ padding: '10px 20px', background: '#333', color: 'white', border: 'none' }}>Search</button>
      </div>
    </div>
  );
}
