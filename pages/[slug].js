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

  const rawName = data.slug.split('-')[0];
  const cityName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", backgroundColor: '#ffffff', maxWidth: '800px', margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <nav style={{ padding: '20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#1a365d' }}>Apex Plumbing</h2>
        <div>
          <a href="/about" style={{ marginRight: '15px', textDecoration: 'none', color: '#4a5568', fontWeight: '500' }}>About Us</a>
          <a href="tel:+18005550199" style={{ background: '#3182ce', color: 'white', padding: '10px 20px', borderRadius: '5px', textDecoration: 'none', fontWeight: 'bold' }}>Call Now</a>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: '50px 20px', background: '#f7fafc', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '15px', color: '#1a365d' }}>Plumbing Services in {cityName}</h1>
        <a href="tel:+18005550199" style={{ display: 'inline-block', background: '#e53e3e', color: 'white', padding: '18px 40px', fontSize: '1.3rem', borderRadius: '50px', textDecoration: 'none', fontWeight: '800' }}>
          📞 TAP TO CALL NOW
        </a>
      </section>

      {/* Main Content */}
      <main style={{ padding: '30px 20px', lineHeight: '1.8', flex: '1', color: '#2d3748' }}>
        <h2>Emergency Plumbers in {cityName}</h2>
        <p>Looking for a reliable plumber? We connect you with top-rated experts in the <strong>{cityName}</strong> area for 24/7 plumbing solutions.</p>
        
        <h3>Our Services:</h3>
        <ul>
          <li>Drain Cleaning</li>
          <li>Water Heater Repair</li>
          <li>Pipe Leak Detection</li>
          <li>Emergency Repairs</li>
        </ul>
      </main>

      {/* Footer */}
      <footer style={{ padding: '40px 20px', background: '#2d3748', color: '#cbd5e0', textAlign: 'center' }}>
        <div style={{ marginBottom: '15px' }}>
          <a href="/faq" style={{ color: '#cbd5e0', textDecoration: 'none', margin: '0 10px' }}>FAQ</a> | 
          <a href="/privacy-policy" style={{ color: '#cbd5e0', textDecoration: 'none', margin: '0 10px' }}>Privacy Policy</a> | 
          <a href="/terms" style={{ color: '#cbd5e0', textDecoration: 'none', margin: '0 10px' }}>Terms & Conditions</a>
        </div>
        <p style={{ fontSize: '0.8rem' }}>Apex Plumbing is a lead generation service. © 2026</p>
      </footer>
    </div>
  );
}
