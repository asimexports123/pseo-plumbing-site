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
    <div style={{ textAlign: 'center', padding: '50px 20px', fontFamily: 'Arial, sans-serif' }}>
      {/* Heading */}
      <h1 style={{ fontSize: '3rem', marginBottom: '40px', color: '#1f2937' }}>
        Expert Plumbing Services in {data.slug.replace(/-/g, ' ')}
      </h1>
      
      {/* The Image you liked */}
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <img 
          src="https://images.unsplash.com/photo-1585704032915-c3400ca199e8?auto=format&fit=crop&w=1200&q=80" 
          alt="Professional Plumbing" 
          style={{ width: '100%', borderRadius: '15px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }} 
        />
      </div>

      {/* Simple Subtext */}
      <p style={{ marginTop: '30px', fontSize: '1.4rem', color: '#4b5563' }}>
        Reliable, fast, and professional service you can trust.
      </p>
    </div>
  );
}
