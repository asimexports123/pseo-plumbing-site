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
    <div style={{ fontFamily: "'Inter', sans-serif", backgroundColor: '#ffffff', maxWidth: '800px', margin: '0 auto' }}>
      {/* 1. Header */}
      <nav style={{ padding: '20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#1a365d' }}>Apex Plumbing</h2>
        <a href="tel:+18005550199" style={{ background: '#3182ce', color: 'white', padding: '8px 16px', borderRadius: '5px', textDecoration: 'none', fontWeight: 'bold' }}>Call Now</a>
      </nav>

      {/* 2. Hero Section */}
      <section style={{ padding: '40px 20px', background: '#f7fafc', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>Plumbing Services in {data.slug.replace(/-/g, ' ')}</h1>
        <a href="tel:+18005550199" style={{ display: 'inline-block', background: '#e53e3e', color: 'white', padding: '15px 30px', fontSize: '1.2rem', borderRadius: '50px', textDecoration: 'none', fontWeight: '800' }}>
          📞 TAP TO CALL NOW
        </a>
      </section>

      {/* 3. Main Content (SEO Rich) */}
      <main style={{ padding: '20px', lineHeight: '1.8' }}>
        <h2>Emergency Plumbers in {data.slug.replace(/-/g, ' ')}</h2>
        <p>Looking for a reliable plumber? We serve the <strong>{data.slug.replace(/-/g, ' ')}</strong> area with 24/7 expert services. Whether it's a small leak or a major pipe burst, our team is ready to arrive quickly.</p>
        
        <h3>Our Primary Services:</h3>
        <ul style={{ paddingLeft: '20px' }}>
          <li><strong>Drain Cleaning:</strong> Clearing stubborn clogs using professional tools.</li>
          <li><strong>Water Heater Repair:</strong> Ensuring your home has hot water round the clock.</li>
          <li><strong>Pipe Leak Detection:</strong> Identifying hidden leaks before they cause damage.</li>
          <li><strong>Emergency Repairs:</strong> Rapid response for any plumbing crisis in {data.slug.replace(/-/g, ' ')}.</li>
        </ul>
      </main>

      {/* 4. Footer */}
      <footer style={{ padding: '30px', background: '#2d3748', color: 'white', textAlign: 'center' }}>
        <p>© 2026 Apex Plumbing. Serving {data.slug.replace(/-/g, ' ')}.</p>
      </footer>
    </div>
  );
}
