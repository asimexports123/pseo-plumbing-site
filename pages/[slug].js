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
    <div style={{ fontFamily: 'sans-serif', maxWidth: '500px', margin: '40px auto', padding: '20px', textAlign: 'center' }}>
      
      {/* Direct Heading */}
      <h1 style={{ fontSize: '2rem', color: '#1a202c', marginBottom: '30px' }}>
        Emergency Plumber in {data.slug.replace(/-/g, ' ')}
      </h1>

      {/* Hero CTA - Sabse Important */}
      <a href="tel:+18005550199" style={{ 
        display: 'block', 
        padding: '30px', 
        background: '#e53e3e', 
        color: '#fff', 
        fontSize: '2rem', 
        textDecoration: 'none', 
        borderRadius: '15px',
        fontWeight: '900',
        boxShadow: '0 10px 20px rgba(229, 62, 62, 0.4)'
      }}>
        TAP TO CALL NOW
      </a>

      {/* Trust Points */}
      <div style={{ marginTop: '40px', textAlign: 'left', fontSize: '1.2rem', color: '#4a5568' }}>
        <p>✅ 24/7 Emergency Service</p>
        <p>✅ Fast Arrival (Local Pros)</p>
        <p>✅ Licensed & Insured</p>
      </div>

    </div>
  );
}
