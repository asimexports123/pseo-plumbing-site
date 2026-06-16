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
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      {/* Header */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '20px', borderBottom: '1px solid #ddd' }}>
        <strong>Apex Plumbing</strong>
        <div>Service | Location | Contact</div>
      </nav>

      {/* Hero Section */}
      <header style={{ textAlign: 'center', padding: '40px 0' }}>
        <h1 style={{ fontSize: '2.5rem' }}>Premium Plumbing in {data.slug.replace(/-/g, ' ')}</h1>
        <p>Your local experts for all plumbing needs. Same-day service available.</p>
      </header>

      {/* Zip Code Search Section */}
      <section style={{ background: '#f4f4f4', padding: '30px', borderRadius: '10px', textAlign: 'center' }}>
        <h2>Check Availability</h2>
        <input type="text" placeholder="Enter ZIP Code..." style={{ padding: '15px', width: '60%', borderRadius: '5px', border: '1px solid #ccc' }} />
        <button style={{ padding: '15px 30px', background: '#333', color: '#fff', border: 'none', marginLeft: '10px', borderRadius: '5px' }}>Find Plumbers</button>
      </section>

      {/* Call to Action Section */}
      <section style={{ textAlign: 'center', padding: '50px 0' }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '20px' }}>Need an Emergency Plumber?</h2>
        <a href="tel:+18005550199" style={{ 
          display: 'inline-block', background: '#d32f2f', color: 'white', 
          padding: '25px 60px', fontSize: '1.8rem', textDecoration: 'none', 
          borderRadius: '50px', fontWeight: 'bold' 
        }}>
          CALL NOW
        </a>
      </section>

      {/* Content Section */}
      <section style={{ marginTop: '40px' }}>
        <h3>Why Choose Us?</h3>
        <ul>
          <li>24/7 Emergency Support</li>
          <li>Licensed and Insured Professionals</li>
          <li>Upfront Pricing - No Hidden Fees</li>
        </ul>
      </section>
    </div>
  );
}
