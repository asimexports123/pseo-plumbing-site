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
      <h1 style={{ textAlign: 'center', marginBottom: '40px' }}>Expert Plumbing Services in {data.slug}</h1>
      
      {/* Container for Image and Form */}
      <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        
        {/* Left Side: Image */}
        <div style={{ flex: '1', minWidth: '400px' }}>
          <img 
            src="https://images.unsplash.com/photo-1585704032915-c3400ca199e8?auto=format&fit=crop&w=800&q=80" 
            alt="Plumbing" 
            style={{ width: '100%', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} 
          />
        </div>

        {/* Right Side: Form */}
        <div style={{ flex: '1', minWidth: '350px', background: '#f8f9fa', padding: '30px', borderRadius: '15px', border: '1px solid #ddd' }}>
          <h3>Get a Free Quote</h3>
          <form style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input type="text" placeholder="Your Name" style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ccc' }} />
            <input type="email" placeholder="Your Email" style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ccc' }} />
            <textarea placeholder="Describe your plumbing problem" style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ccc', height: '100px' }}></textarea>
            <button style={{ padding: '15px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px' }}>
              Send Request
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
