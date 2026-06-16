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
  if (!data) return <div style={{height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px'}}>Loading Premium Experience...</div>;

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: '#f8fafc', minHeight: '100vh', padding: '40px 20px' }}>
      <main style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {/* Header Section */}
        <header style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h1 style={{ fontSize: '3rem', color: '#0f172a', marginBottom: '10px' }}>Plumbing Masters in <span style={{ color: '#2563eb' }}>{data.slug.replace(/-/g, ' ')}</span></h1>
          <p style={{ fontSize: '1.2rem', color: '#64748b' }}>Fast, Reliable, and Professional Plumbing Solutions at Your Doorstep.</p>
        </header>

        {/* Hero Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'center', background: '#ffffff', padding: '40px', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
          <div>
            <img src="https://images.unsplash.com/photo-1581244277943-fe4a9c7d717a?auto=format&fit=crop&w=800&q=80" alt="Professional Plumber" style={{ width: '100%', borderRadius: '16px', objectFit: 'cover' }} />
          </div>
          
          <div style={{ background: '#0f172a', padding: '40px', borderRadius: '20px', color: '#fff' }}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '20px' }}>Request a Free Quote</h2>
            <form style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input type="text" placeholder="Full Name" style={{ padding: '15px', borderRadius: '8px', border: 'none' }} />
              <input type="email" placeholder="Email Address" style={{ padding: '15px', borderRadius: '8px', border: 'none' }} />
              <textarea placeholder="Tell us about your plumbing issue..." style={{ padding: '15px', borderRadius: '8px', border: 'none', height: '100px' }}></textarea>
              <button style={{ padding: '15px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
                Get Your Quote
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
