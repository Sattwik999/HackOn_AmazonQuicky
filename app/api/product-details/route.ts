import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const asin = searchParams.get('asin');
  const apiKey = process.env.SERPAPI_KEY;

  if (!asin || !apiKey) {
    return NextResponse.json({ error: 'Missing ASIN or API Key' }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://serpapi.com/search.json?engine=amazon_product&asin=${asin}&amazon_domain=amazon.in&api_key=${apiKey}`
    );
    const data = await res.json();
    
    if (data.error) {
      return NextResponse.json({ error: data.error }, { status: 400 });
    }

    return NextResponse.json(data.product || {});
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch product details' }, { status: 500 });
  }
}