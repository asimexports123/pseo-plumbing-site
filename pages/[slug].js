// ... (up ka logic waisa hi rahega)

export default function Page({ data }) {
  if (!data) return <h1>Loading...</h1>;

  return (
    <div style={{ fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <header style={{ padding: '20px', borderBottom: '2px solid #1e40af' }}>
        <strong>Apex Plumbing</strong>
      </header>

      <main style={{ padding: '20px' }}>
        <h1 style={{ color: '#1e40af' }}>Emergency Plumber in {data.slug.replace(/-/g, ' ')}</h1>
        
        {/* Main CTA */}
        <a href="tel:+18005550199" style={{ display: 'block', padding: '20px', background: '#1d4ed8', color: '#fff', textAlign: 'center', fontSize: '1.5rem', borderRadius: '10px', textDecoration: 'none', fontWeight: 'bold' }}>
          📞 CALL NOW: 1-800-555-0199
        </a>

        {/* SEO CONTENT SECTION - Yahan keywords daalo */}
        <article style={{ marginTop: '40px', lineHeight: '1.7', color: '#333' }}>
          <h2>Professional Plumbing Services in {data.slug.replace(/-/g, ' ')}</h2>
          <p>
            Are you facing a plumbing emergency in <strong>{data.slug.replace(/-/g, ' ')}</strong>? 
            We provide 24/7 expert assistance for burst pipes, clogged drains, and water heater repairs. 
            Our licensed team is dedicated to providing fast, reliable, and affordable service to all residents of <strong>{data.slug.replace(/-/g, ' ')}</strong>.
          </p>
          
          <h3>Why Trust Our {data.slug.replace(/-/g, ' ')} Plumbing Team?</h3>
          <ul>
            <li><strong>Local Expertise:</strong> We know the infrastructure of {data.slug.replace(/-/g, ' ')} inside out.</li>
            <li><strong>Available 24/7:</strong> Emergencies don't wait, and neither do we.</li>
            <li><strong>Affordable Rates:</strong> Quality plumbing shouldn't cost a fortune.</li>
          </ul>
        </article>

        {/* AdSense Slot */}
        <div style={{ margin: '40px 0', padding: '20px', background: '#f0f0f0', border: '1px dashed #999', textAlign: 'center' }}>
          [Place AdSense Ad Here]
        </div>
      </main>

      {/* Footer */}
      <footer style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
        <p>&copy; 2026 Apex Plumbing. Serving {data.slug.replace(/-/g, ' ')}.</p>
      </footer>
    </div>
  );
}
