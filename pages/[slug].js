import { useRouter } from 'next/router';

// Hamara poora Google Sheets ka data yahan ek temporary database ban gaya hai
const plumbingData = {
  "emergency-plumber-new-york": { city: "New York", state: "NY", phone: "1-800-555-0199", landmark: "Times Square", county: "New York County" },
  "emergency-plumber-los-angeles": { city: "Los Angeles", state: "CA", phone: "1-800-555-0199", landmark: "Hollywood Walk of Fame", county: "Los Angeles County" },
  "emergency-plumber-chicago": { city: "Chicago", state: "IL", phone: "1-800-555-0199", landmark: "Millennium Park", county: "Cook County" },
  "emergency-plumber-houston": { city: "Houston", state: "TX", phone: "1-800-555-0199", landmark: "Space Center Houston", county: "Harris County" },
  "emergency-plumber-phoenix": { city: "Phoenix", state: "AZ", phone: "1-800-555-0199", landmark: "Camelback Mountain", county: "Maricopa County" },
  "emergency-plumber-philadelphia": { city: "Philadelphia", state: "PA", phone: "1-800-555-0199", landmark: "Liberty Bell", county: "Philadelphia County" },
  "emergency-plumber-san-antonio": { city: "San Antonio", state: "TX", phone: "1-800-555-0199", landmark: "The Alamo", county: "Bexar County" },
  "emergency-plumber-san-diego": { city: "San Diego", state: "CA", phone: "1-800-555-0199", landmark: "Balboa Park", county: "San Diego County" },
  "emergency-plumber-dallas": { city: "Dallas", state: "TX", phone: "1-800-555-0199", landmark: "Dealey Plaza", county: "Dallas County" },
  "emergency-plumber-austin": { city: "Austin", state: "TX", phone: "1-800-555-0199", landmark: "Texas Capitol", county: "Travis County" }
};

export default function PlumberPage() {
  const router = useRouter();
  const { slug } = router.query;

  const data = plumbingData[slug];

  if (!data) {
    return <div style={{ fontFamily: 'Arial', padding: '40px', textAlign: 'center' }}><h2>Loading local plumber details...</h2></div>;
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto', padding: '20px', color: '#333' }}>
      <header style={{ borderBottom: '2px solid #0056b3', paddingBottom: '20px', marginBottom: '30px' }}>
        <h1 style={{ color: '#0056b3', margin: '0 0 10px 0' }}>24/7 Emergency Plumber Services</h1>
        <p style={{ fontSize: '18px', color: '#666', margin: 0 }}>Reliable & Fast Plumbing Experts in {data.city}, {data.state}</p>
      </header>

      <main>
        <section style={{ background: '#f8f9fa', padding: '25px', borderRadius: '8px', marginBottom: '30px', borderLeft: '5px solid #28a745' }}>
          <h2 style={{ margin: '0 0 15px 0', color: '#28a745' }}>Need Urgent Help? Call Now!</h2>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '0 0 10px 0' }}>📞 Phone: <a href={`tel:${data.phone}`} style={{ color: '#28a745', textDecoration: 'none' }}>{data.phone}</a></p>
          <p style={{ margin: 0, color: '#555' }}>Available 365 days a year for leaks, blockages, and pipe bursts.</p>
        </section>

        <section style={{ marginBottom: '30px' }}>
          <h3>Our Service Coverage in {data.city}</h3>
          <p>We provide full residential and commercial plumbing solutions across the entire <strong>{data.county}</strong> region. Whether you are located near the famous <strong>{data.landmark}</strong> or in the surrounding neighborhoods, our local technicians will reach your doorstep within 30 minutes!</p>
        </section>

        <section style={{ background: '#e9ecef', padding: '20px', borderRadius: '8px' }}>
          <h4 style={{ margin: '0 0 10px 0' }}>Why Choose Our {data.city} Plumbers?</h4>
          <ul style={{ margin: 0, paddingLeft: '20px', lineHeight: '1.6' }}>
            <li>Licensed, bonded, and fully insured technicians</li>
            <li>No hidden fees - Upfront pricing guaranteed</li>
            <li>Local experts stationed near {data.landmark} for lightning-fast response</li>
          </ul>
        </section>
      </main>

      <footer style={{ marginTop: '5px', paddingTop: '20px', borderTop: '1px solid #eee', textAlign: 'center', color: '#aaa', fontSize: '12px' }}>
        <p>&copy; 2026 Emergency Plumbing Network. All rights reserved.</p>
      </footer>
    </div>
  );
}
