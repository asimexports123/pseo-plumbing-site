import { createClient } from '@supabase/supabase-js'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_KEY)

export async function getStaticPaths() {
  const { data: cities } = await supabase.from('cities_data').select('slug')
  const paths = cities?.map((city) => ({ params: { slug: city.slug } })) || []
  return { paths, fallback: 'blocking' }
}

export async function getStaticProps({ params }) {
  const { data: cityData } = await supabase
    .from('cities_data')
    .select('*')
    .eq('slug', params.slug)
    .maybeSingle()
  return { props: { cityData }, revalidate: 3600 }
}

export default function CityPage({ cityData }) {
  if (!cityData) return <div>Loading...</div>
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Emergency Plumber in {cityData.city}</h1>
      <p>Expert local plumbing services in {cityData.city}, {cityData.state}.</p>
    </div>
  )
}
