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
    <div style={{ fontFamily: "'Georgia', serif", backgroundColor: '#ffffff', maxWidth: '800px', margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Header */}
      <nav style={{ padding: '20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#1a365d' }}>Apex Plumbing</h2>
        <a href="tel:+18005550199" style={{ background: '#3182ce', color: 'white', padding: '8px 16px', borderRadius: '5px', textDecoration: 'none', fontWeight: 'bold' }}>Call Now</a>
      </nav>

      {/* Article Header */}
      <header style={{ padding: '40px 20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.8rem', color: '#1a365d', marginBottom: '20px' }}>Expert Plumbing Solutions in {cityName}</h1>
        <p style={{ color: '#718096' }}>Published on June 2026 | Local Services Guide</p>
      </header>

      {/* Blog Content */}
      <article style={{ padding: '0 20px', lineHeight: '1.8', fontSize: '1.1rem', color: '#2d3748' }}>
        <p style={{ marginBottom: '20px' }}>
            {data.content || "Plumbing issues in " + cityName + " can be stressful. Whether you are dealing with a sudden pipe burst or a clogged drain, finding a reliable expert is key to preventing further damage to your property."}
        </p>

        <h2 style={{ color: '#1a365d' }}>Why Quality Plumbing Matters in {cityName}</h2>
        <p>A professional plumber does more than just fix leaks; they ensure your home's infrastructure is safe and efficient. From water heater installations to sewer line inspections, our network connects you with the best local talent.</p>

        <div style={{ background: '#f7fafc', padding: '20px', borderRadius: '10px', margin: '30px 0', borderLeft: '5px solid #3182ce' }}>
          <strong>Pro Tip:</strong> Don't wait for a small leak to become a massive flood. Immediate action saves thousands in potential repairs!
        </div>

        <h2 style={{ color: '#1a365d' }}>How to Book Your Service</h2>
        <p>We make it easy to get help. Simply click the button below to connect with a verified professional in {cityName} immediately.</p>
        
        <div style={{ textAlign: 'center', margin: '40px 0' }}>
            <a href="tel:+18005550199" style={{ background: '#e53e3e', color: 'white', padding: '20px 40px', fontSize: '1.5rem', borderRadius: '50px', textDecoration: 'none', fontWeight: '800' }}>
            📞 TAP TO CALL NOW
            </a>
        </div>
      </article>

      {/* Footer */}
      <footer style={{ padding: '40px 20px', background: '#2d3748', color: '#cbd5e0', textAlign: 'center' }}>
        <a href="/faq" style={{ color: '#cbd5e0', textDecoration: 'none', margin: '0 10px' }}>FAQ</a> | 
        <a href="/privacy-policy" style={{ color: '#cbd5e0', textDecoration: 'none', margin: '0 10px' }}>Privacy Policy</a> | 
        <a href="/terms" style={{ color: '#cbd5e0', textDecoration: 'none', margin: '0 10px' }}>Terms & Conditions</a>
      </footer>
    </div>
  );
}
