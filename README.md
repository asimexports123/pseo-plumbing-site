# PSEO Plumbing Site - Dynamic City Pages

A Next.js application with dynamic city pages powered by Supabase for plumbing services.

## Features

- **Dynamic City Pages**: Automatically generates pages for each city from Supabase database
- **SEO Optimized**: Includes meta tags, Open Graph, Twitter cards, and structured data
- **ISR Performance**: Uses Incremental Static Regeneration for fast page loads
- **Dynamic Sitemap**: Automatically generates XML sitemap for all city pages
- **Search Functionality**: Home page with city search and filtering

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to your project settings → API
3. Copy your project URL and anon key

### 3. Configure Environment Variables

Edit `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_KEY=your_supabase_anon_key
NEXT_PUBLIC_DOMAIN=https://yourdomain.com
```

Replace:
- `your_supabase_project_url` with your Supabase project URL
- `your_supabase_anon_key` with your Supabase anon/public key
- `https://yourdomain.com` with your actual domain

### 4. Set Up Database Schema

Run the SQL schema in your Supabase SQL editor:

1. Go to your Supabase project → SQL Editor
2. Open `supabase-schema.sql` from this project
3. Execute the SQL script

This will:
- Create the `cities_data` table
- Set up indexes for performance
- Configure Row Level Security (RLS)
- Insert sample city data

### 5. Database Schema

The `cities_data` table requires these fields:

- `id` (bigint, primary key)
- `slug` (text, unique, indexed) - URL-friendly city identifier
- `city_name` (text) - Display name of the city
- `state` (text, optional) - State abbreviation
- `content` (text) - Page content
- `meta_title` (text, optional) - Custom SEO title
- `meta_description` (text, optional) - Custom SEO description
- `population` (integer, optional) - City population
- `is_active` (boolean) - Whether the city page is active
- `created_at` (timestamp) - Creation timestamp
- `updated_at` (timestamp) - Last update timestamp

### 6. Add City Data

Add cities to your Supabase `cities_data` table. Each city needs at minimum:

```sql
INSERT INTO cities_data (slug, city_name, state, content) VALUES
  ('your-city-123', 'Your City', 'ST', 'Your city content here...');
```

The slug format should be: `cityname-number` (e.g., `adjuntas-107`)

### 7. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see your site.

### 8. Build for Production

```bash
npm run build
npm start
```

## File Structure

```
pages/
├── index.js          # Home page with city search
├── [slug].js         # Dynamic city page
└── sitemap.xml.js    # Dynamic sitemap generator
```

## How It Works

### Dynamic Routing

- `pages/[slug].js` handles all city pages
- Uses `getStaticPaths` to pre-generate pages for cities
- Uses `getStaticProps` with ISR to fetch city data
- Falls back to on-demand generation for new cities

### Home Page

- Fetches all active cities from Supabase
- Provides search functionality
- Displays available cities as clickable links

### Sitemap

- Automatically generates XML sitemap
- Includes all city pages with proper metadata
- Updates dynamically as cities are added

## SEO Features

- Dynamic meta titles and descriptions
- Open Graph tags for social sharing
- Twitter card support
- Structured data (JSON-LD) for local business
- Canonical URLs
- XML sitemap for search engines

## Performance

- ISR with 1-hour revalidation
- Pre-generates pages for top 100 cities
- On-demand generation for additional cities
- Optimized database queries with indexes

## Troubleshooting

### Supabase Connection Issues

- Verify your `.env.local` file has correct credentials
- Check that RLS policies allow public read access
- Ensure the `cities_data` table exists

### Pages Not Generating

- Check that cities have `is_active = true`
- Verify slug format is correct
- Check browser console for errors

### Build Errors

- Ensure all environment variables are set
- Verify Supabase connection is working
- Check that Node.js version is compatible

## Customization

### Update Domain

Change the `NEXT_PUBLIC_DOMAIN` in `.env.local` to match your domain.

### Modify Page Template

Edit `pages/[slug].js` to customize the city page layout and content.

### Add More Fields

Add columns to the `cities_data` table and update the query in `pages/[slug].js`.

## Support

For issues or questions, check the Supabase documentation at [supabase.com/docs](https://supabase.com/docs).
