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
  if (!data) return <h1>Loading...</h1>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center' }}>Expert Plumbing Services in {data.slug}</h1>
      
      {/* Flexbox container */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', alignItems: 'center', marginTop: '30px' }}>
        
        {/* Image Section */}
        <div style={{ flex: '1', minWidth: '300px' }}>
          <img 
            src="https://images.unsplash.com/photo-1585704032915-c3400ca199e8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
            alt="Plumbing Services" 
            style={{ width: '100%', borderRadius: '10px' }} 
          />
        </div>

        {/* Form Section */}
        <div style={{ flex: '1', minWidth: '300px', background: '#f4f4f4', padding: '20px', borderRadius: '10px' }}>
          <h3>Get a Free Quote</h3>
          <form style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input type="text" placeholder="Name" style={{ padding: '10px' }} />
            <input type="email" placeholder="Email" style={{ padding: '10px' }} />
            <textarea placeholder="Problem Description" style={{ padding: '10px', height: '80px' }}></textarea>
            <button style={{ padding: '10px', background: '#28a745', color: '#fff', border: 'none', cursor: 'pointer' }}>
              Send Request
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
