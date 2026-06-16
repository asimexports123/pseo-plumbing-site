import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_KEY
);

export async function getServerSideProps({ params }) {
  const { data } = await supabase.from('cities_data').select('*').eq('slug', params.slug).single();
  return { props: { data: data || null } };
}

export default function Page({ data }) {
  if (!data) return <div style={{textAlign:'center', marginTop:'100px'}}>Loading...</div>;

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", backgroundColor: '#ffffff' }}>
      {/* 1. Header */}
      <nav style={{ padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
        <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#1a365d' }}>Apex Plumbing</h2>
        <a href="tel:+18005550199" style={{ background: '#3182ce', color: 'white', padding: '8px 16px', borderRadius: '5px', textDecoration: 'none', fontWeight: 'bold' }}>Call Now</a>
      </nav>

      {/* 2. Hero Section */}
      <section style={{ padding: '60px 20px', background: 'linear-gradient(135deg, #2b6cb0 0%, #1a365d 100%)', color: 'white', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '20px' }}>Plumbing Services in {data.slug.replace(/-/g, ' ')}</h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '30px', opacity: '0.9' }}>24/7 Emergency Support. Licensed & Insured.</p>
        <a href="tel:+18005550199" style={{ display: 'inline-block', background: '#e53e3e', color: 'white', padding: '20px 40px', fontSize: '1.5rem', borderRadius: '50px', textDecoration: 'none', fontWeight: '800', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}>
          📞 TAP TO CALL NOW
        </a>
      </section>

      {/* 3. Content Section */}
      <main style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px', lineHeight: '1.8' }}>
        <h2>Reliable Plumbers in {data.slug.replace(/-/g, ' ')}</h2>
        <p>Don't let a plumbing emergency ruin your day. Whether it's a burst pipe, a clogged drain, or a broken water heater, our local pros in <strong>{data.slug.replace(/-/g, ' ')}</strong> are ready to help immediately.</p>
        
        {/* AdSense Slot 1 */}
        <div style={{ height: '250px', background: '#edf2f7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '30px 0', border: '1px solid #cbd5e0' }}>[AdSense Display Ad]</div>

        <h3>Why Choose Us?</h3>
        <ul>
            <li>Licensed Professionals in {data.slug.replace(/-/g, ' ')}</li>
            <li>Upfront Pricing & No Hidden Fees</li>
            <li>Fastest Response Time in the Area</li>
        </ul>
      </main>

      {/* 4. Footer */}
      <footer style={{ padding: '40px', background: '#2d3748', color: 'white', textAlign: 'center' }}>
        <p>© 2026 Apex Plumbing. All rights reserved.</p>
      </footer>
    </div>
  );
}
