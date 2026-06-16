import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_KEY
);

export async function getStaticPaths() {
  const { data: cities, error } = await supabase
    .from('cities_data')
    .select('slug')
    .range(0, 500);

  if (error) {
    console.error(error);
    return { paths: [], fallback: 'blocking' };
  }

  const paths = cities?.map((city) => ({ params: { slug: city.slug } })) || [];
  return { paths, fallback: 'blocking' };
}

export async function getStaticProps({ params }) {
  const { data } = await supabase
    .from('cities_data')
    .select('*')
    .eq('slug', params.slug)
    .maybeSingle();

  return { props: { data: data || null } };
}

export default function Page({ data }) {
  if (!data) return <h1>Data nahi mila</h1>;
  return <div>{JSON.stringify(data)}</div>;
}
