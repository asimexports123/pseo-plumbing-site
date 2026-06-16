import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_KEY
);

export async function getStaticPaths() {
  return { paths: [], fallback: 'blocking' };
}

export async function getStaticProps({ params }) {
  const { data } = await supabase
    .from('cities_data')
    .select('*')
    .eq('slug', params.slug)
    .maybeSingle();

  return { props: { data: data || null }, revalidate: 60 };
}

export default function Page({ data }) {
  if (!data) return <h1>Data loading...</h1>;

  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1 style={{ color: 'blue' }}>Professional Plumbing in {data.slug}</h1>
      <p>Hum {data.slug} mein best plumbing services dete hain.</p>
      <button style={{ padding: '20px', background: 'green', color: 'white' }}>
        Call Us Now
      </button>
    </div>
  );
}
