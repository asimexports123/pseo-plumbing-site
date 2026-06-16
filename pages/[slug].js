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
    <div style={{ textAlign: 'center', padding: '40px 20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '30px', color: '#333' }}>
        Expert Plumbing Services in {data.slug.replace(/-/g, ' ')}
      </h1>
      
      <img 
        src="https://images.unsplash.com/photo-1585704032915-c3400ca199e8?auto=format&fit=crop&w=1200&q=80" 
        alt="Professional Plumbing" 
        style={{ width: '100%', maxWidth: '900px', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} 
      />
      
      <p style={{ marginTop: '30px', fontSize: '1.2rem', color: '#666' }}>
        Providing top-notch plumbing solutions in your area.
      </p>
    </div>
  );
}
