import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_KEY
);

export async function getStaticPaths() {
  // Hum abhi paths pre-render nahi kar rahe taaki build fast ho
  return { 
    paths: [], 
    fallback: 'blocking' 
  };
}

export async function getStaticProps({ params }) {
  const { data } = await supabase
    .from('cities_data')
    .select('*')
    .eq('slug', params.slug)
    .maybeSingle();

  if (!data) {
    return { notFound: true };
  }

  return { 
    props: { data },
    revalidate: 60
  };
}

export default function Page({ data }) {
  return (
    <div>
      <h1>{data.slug}</h1>
      {/* Yahan apna baaki content dikhao */}
    </div>
  );
}
