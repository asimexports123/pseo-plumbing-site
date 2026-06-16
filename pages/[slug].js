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
  if (!data) return <h1 style={{textAlign: 'center', marginTop: '50px'}}>Loading...</h1>;

  return (
    <div style={{ fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif", maxWidth: '500px', margin: '40px auto', padding: '20px', textAlign: 'center' }}>
      
      {/* Heading with Blue Theme */}
      <h1 style={{ fontSize: '2.2rem', color: '#1e40af', marginBottom: '30px', fontWeight: '800' }}>
        Emergency Plumber in {data.slug.replace(/-/g, ' ')}
      </h1>

      {/* Blue "Call Now" Button */}
      <a href="tel:+18005550199" style={{ 
        display: 'block', 
        padding: '25px', 
        background: '#1d4ed8', 
        color: '#fff', 
        fontSize: '1.8rem', 
        textDecoration: 'none', 
        borderRadius: '12px',
        fontWeight: '700',
        boxShadow: '0 8px 20px rgba(29, 78, 216, 0.3)',
        transition: 'transform 0.2s'
      }}>
        📞 TAP TO CALL NOW
      </a>

      {/* Trust Section */}
      <div style={{ marginTop: '40px', textAlign: 'left', background: '#eff6ff', padding: '20px', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
        <p style={{ margin: '10px 0', color: '#1e3a8a', fontWeight: '600' }}>✅ 24/7 Emergency Service</p>
        <p style={{ margin: '10px 0', color: '#1e3a8a', fontWeight: '600' }}>✅ Fast Arrival (Local Pros)</p>
        <p style={{ margin: '10px 0', color: '#1e3a8a', fontWeight: '600' }}>✅ Licensed & Insured</p>
      </div>

    </div>
  );
}
