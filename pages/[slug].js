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
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center' }}>Expert Plumbing in {data.slug.replace(/-/g, ' ')}</h1>
      
      {/* Bina container ke, direct image aur form */}
      <img 
        src="https://images.unsplash.com/photo-1581244277943-fe4a9c7d717a?auto=format&fit=crop&w=1200&q=80" 
        alt="Plumbing" 
        style={{ width: '100%', height: 'auto', borderRadius: '10px', marginBottom: '20px' }} 
      />

      <div style={{ background: '#f4f4f4', padding: '20px', borderRadius: '10px' }}>
        <h3>Get a Free Quote</h3>
        <form style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input type="text" placeholder="Name" style={{ padding: '10px' }} />
          <input type="email" placeholder="Email" style={{ padding: '10px' }} />
          <textarea placeholder="Problem Description" style={{ padding: '10px', height: '80px' }}></textarea>
          <button style={{ padding: '15px', background: 'green', color: 'white', border: 'none', cursor: 'pointer' }}>
            Send Request
          </button>
        </form>
      </div>
    </div>
  );
}
