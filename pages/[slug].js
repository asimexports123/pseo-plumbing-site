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

  // Yahan apna Tracking Number daal do
  const phoneNumber = "tel:+18005550199"; 

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto', padding: '20px', textAlign: 'center' }}>
      <h1 style={{ fontSize: '2.5rem', color: '#111', marginBottom: '15px' }}>
        Plumbing Services in {data.slug.replace(/-/g, ' ')}
      </h1>
      
      {/* Wohi Image jo tumne approve ki thi */}
      <img 
        src="https://images.unsplash.com/photo-1585704032915-c3400ca199e8?auto=format&fit=crop&w=800&q=80" 
        alt="Professional Plumber" 
        style={{ width: '100%', borderRadius: '15px', marginBottom: '30px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} 
      />

      {/* Conversion Focused CTA */}
      <a href={phoneNumber} style={{ 
        display: 'block', 
        padding: '25px', 
        background: '#d32f2f', 
        color: 'white', 
        fontSize: '2rem', 
        textDecoration: 'none', 
        borderRadius: '10px',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        boxShadow: '0 5px 15px rgba(211, 47, 47, 0.4)'
      }}>
        Call Now
      </a>
    </div>
  );
}
