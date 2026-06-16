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
    <div style={{ textAlign: 'center', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Plumbing Services in {data.slug.replace(/-/g, ' ')}</h1>
      
      {/* Fixed Image Tag */}
      <img 
        src="https://images.unsplash.com/photo-1585704032915-c3400ca199e8?auto=format&fit=crop&w=800&q=80" 
        alt="Plumbing Service" 
        style={{ width: '100%', maxWidth: '600px', borderRadius: '10px', margin: '20px auto' }} 
      />

      <div style={{ marginTop: '20px' }}>
        <a href="tel:+18005550199" style={{ 
          background: '#e53e3e', color: 'white', padding: '20px 40px', 
          fontSize: '1.5rem', textDecoration: 'none', borderRadius: '8px', fontWeight: 'bold' 
        }}>
          CALL NOW
        </a>
      </div>
    </div>
  );
}
