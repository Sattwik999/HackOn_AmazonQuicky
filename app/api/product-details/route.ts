import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const asin = searchParams.get('asin');
  const apiKey = process.env.SERPAPI_KEY;

  if (!asin) {
    return NextResponse.json({ error: 'Missing ASIN' }, { status: 400 });
  }

  // If no API key or using mock data, return mock response
  if (!apiKey || apiKey === 'your_serpapi_key_here') {
    return NextResponse.json({
      title: `Product ${asin}`,
      asin: asin,
      price: { value: 999, currency: 'INR' },
      rating: 4.5,
      reviews: 1234,
      images: [
        { link: `https://placehold.co/600x600/e5e7eb/1f2937?text=Product+${asin}` }
      ],
      feature_bullets: [
        'Premium quality product',
        'Durable and long-lasting',
        'Customer satisfaction guaranteed',
        'Free delivery available'
      ],
      is_prime: true,
      availability_status: 'In Stock'
    });
  }

  try {
    const res = await fetch(
      `https://serpapi.com/search.json?engine=amazon_product&asin=${asin}&amazon_domain=amazon.in&api_key=${apiKey}`
    );
    
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch from SerpAPI' }, { status: res.status });
    }
    
    const data = await res.json();
    
    if (data.error) {
      return NextResponse.json({ error: data.error }, { status: 400 });
    }

    // Return the product_results object
    const productData = data.product_results || data.product || {};
    
    if (!productData || Object.keys(productData).length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(productData);
  } catch (error: any) {
    console.error('Product details API error:', error);
    return NextResponse.json({ error: 'Failed to fetch product details' }, { status: 500 });
  }
}