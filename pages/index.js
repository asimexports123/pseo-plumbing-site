import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const [city, setCity] = useState('');
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    if (city) {
      router.push(`/${city.toLowerCase().replace(/ /g, '-')}`);
    }
  };

  return (
    <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
      <h1>Find Expert Plumbing Services</h1>
      <p>Enter your city to find local help:</p>
      
      <form onSubmit={handleSearch}>
        <input 
          type="text" 
          placeholder="e.g. adjuntas-107" 
          value={city}
          onChange={(e) => setCity(e.target.value)}
          style={{ padding: '10px', width: '300px' }}
        />
        <button type="submit" style={{ padding: '10px 20px', marginLeft: '10px' }}>Search</button>
      </form>

      {/* Yahan aap links ki list dal sakte hain taaki Google crawl kare */}
      <div style={{ marginTop: '50px' }}>
        <h3>Popular Cities:</h3>
        <a href="/adjuntas-107" style={{ margin: '10px', display: 'inline-block' }}>Adjuntas</a>
        {/* Jaise-jaise cities badhein, yahan links add karte jao */}
      </div>
    </div>
  );
}
