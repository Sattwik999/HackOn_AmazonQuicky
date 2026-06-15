// app/api/products/route.ts
// import { NextResponse } from 'next/server';

// export async function GET(request: Request) {
//   const { searchParams } = new URL(request.url);
//   // Default to 'smartphones' if no query is provided
//   const query = searchParams.get('q') || 'smartphones';
//   const apiKey = process.env.SERPAPI_KEY;



import { NextResponse } from 'next/server';

// ADD THIS LINE: Tells Next.js to NEVER cache these search results
export const dynamic = 'force-dynamic'; 

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || 'smartphones';
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'SERPAPI_KEY is missing from .env.local file.' }, { status: 500 });
  }
  try {
    // FIX 1: We MUST use 'k=' here! SerpAPI explicitly demands it for the Amazon engine.
    const url = `https://serpapi.com/search.json?engine=amazon&k=${query}&amazon_domain=amazon.in&api_key=${apiKey}`;
    
    const res = await fetch(url);
    const data = await res.json();

    // Catch explicit API errors from SerpAPI
    if (data.error) {
      return NextResponse.json({ error: `SerpAPI Error: ${data.error}` }, { status: 400 });
    }

    // FIX 2: Dynamically hunt down the results array, no matter what SerpAPI called it today
    const results = data.amazon_results || data.organic_results || data.search_results || data.shopping_results;

    if (results && Array.isArray(results) && results.length > 0) {
      return NextResponse.json(results);
    }

    // FIX 3: If it STILL fails, print the exact keys to the screen so we can see what SerpAPI is doing
    const availableKeys = Object.keys(data).join(', ');
    return NextResponse.json({ 
      error: `API connected, but couldn't find the products. SerpAPI returned these exact keys: [ ${availableKeys} ]` 
    }, { status: 404 });

  } catch (error: any) {
    console.error("Backend Error:", error);
    return NextResponse.json({ error: error.message || 'Server crashed while fetching products' }, { status: 500 });
  }
}