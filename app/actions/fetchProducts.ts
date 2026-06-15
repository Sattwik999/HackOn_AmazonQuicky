'use server'

interface Product {
  id: string
  name: string
  category: string
  price: number
  originalPrice?: number
  image?: string
  rating: number
  reviews: number
  stock: 'in-stock' | 'low-stock' | 'out-of-stock'
  deliveryTime?: string
  prime?: boolean
  tags: string[]
  discount?: number
}

// Mock Indian household and popular products data (using fake ASINs for ID)
const MOCK_PRODUCTS: Product[] = [
  {
    id: 'B08L5WH111',
    name: 'Dettol Antiseptic Liquid 1000ml',
    category: 'Health & Hygiene',
    price: 249,
    originalPrice: 349,
    rating: 4.5,
    reviews: 3245,
    stock: 'in-stock',
    deliveryTime: '1-2 days',
    prime: true,
    tags: ['Bestseller', 'Fast Delivery'],
    discount: 28,
  },
  {
    id: 'B08L5WH222',
    name: 'Anker PowerBank 20000mAh',
    category: 'Electronics',
    price: 1899,
    originalPrice: 2499,
    rating: 4.6,
    reviews: 5823,
    stock: 'in-stock',
    deliveryTime: '2-3 days',
    prime: true,
    tags: ['Bestseller', 'Great Value'],
    discount: 24,
  },
  {
    id: 'B08L5WH333',
    name: 'Burnol Antiseptic Ointment 75g',
    category: 'Beauty & Personal Care',
    price: 89,
    originalPrice: 129,
    rating: 4.4,
    reviews: 1856,
    stock: 'in-stock',
    deliveryTime: '1-2 days',
    prime: true,
    tags: ['Fast Delivery'],
  },
  {
    id: 'B08L5WH444',
    name: 'Himalaya Honey & Tulsi Body Wash 500ml',
    category: 'Beauty & Personal Care',
    price: 199,
    originalPrice: 299,
    rating: 4.3,
    reviews: 2341,
    stock: 'in-stock',
    deliveryTime: '1-2 days',
    tags: ['Natural Ingredients'],
    discount: 33,
  },
  {
    id: 'B08L5WH555',
    name: 'Patanjali Atta (Wheat Flour) 5kg',
    category: 'Grocery',
    price: 189,
    originalPrice: 249,
    rating: 4.5,
    reviews: 892,
    stock: 'low-stock',
    deliveryTime: '2-3 days',
    tags: ['Organic'],
    discount: 24,
  },
  {
    id: 'B08L5WH666',
    name: 'Kindle Paperwhite (11th Gen) 32GB',
    category: 'Electronics',
    price: 13999,
    originalPrice: 15999,
    rating: 4.7,
    reviews: 4523,
    stock: 'in-stock',
    deliveryTime: '2-3 days',
    prime: true,
    tags: ['Bestseller'],
    discount: 12,
  },
  {
    id: 'B08L5WH777',
    name: 'MI Band 7 Smartwatch',
    category: 'Electronics',
    price: 2499,
    originalPrice: 3299,
    rating: 4.4,
    reviews: 6234,
    stock: 'in-stock',
    deliveryTime: '1-2 days',
    prime: true,
    tags: ['Trending', 'Smart Device'],
    discount: 24,
  },
  {
    id: 'B08L5WH888',
    name: 'Philips Dry Iron (GC1660)',
    category: 'Home Appliances',
    price: 1299,
    originalPrice: 1899,
    rating: 4.2,
    reviews: 1567,
    stock: 'in-stock',
    deliveryTime: '2-3 days',
    tags: ['Durable'],
    discount: 31,
  },
  {
    id: 'B08L5WH999',
    name: 'Boult Audio AirBass Pro Earbuds',
    category: 'Electronics',
    price: 1499,
    originalPrice: 2999,
    rating: 4.3,
    reviews: 3456,
    stock: 'in-stock',
    deliveryTime: '1-2 days',
    prime: true,
    tags: ['Wireless', 'Great Sound'],
    discount: 50,
  },
  {
    id: 'B08L5WHA10',
    name: 'ITC Aashirvaad Whole Wheat Atta 10kg',
    category: 'Grocery',
    price: 349,
    originalPrice: 449,
    rating: 4.6,
    reviews: 2145,
    stock: 'in-stock',
    deliveryTime: '2-3 days',
    tags: ['Staple'],
    discount: 22,
  },
  {
    id: 'B08L5WHB11',
    name: 'Samsung 32-inch Full HD Smart TV',
    category: 'Electronics',
    price: 12999,
    originalPrice: 18999,
    rating: 4.5,
    reviews: 2834,
    stock: 'low-stock',
    deliveryTime: '3-4 days',
    prime: true,
    tags: ['Bestseller', '4K Ready'],
    discount: 31,
  },
  {
    id: 'B08L5WHC12',
    name: 'Marigold Nitrile Gloves (100 pcs)',
    category: 'Home & Kitchen',
    price: 299,
    originalPrice: 399,
    rating: 4.2,
    reviews: 876,
    stock: 'in-stock',
    deliveryTime: '1-2 days',
    tags: ['Essential'],
    discount: 25,
  },
]

export async function fetchProducts(category?: string): Promise<Product[]> {
  const apiKey = process.env.SERPAPI_KEY

  if (apiKey && apiKey !== 'your_serpapi_key_here') {
    try {
      const query = category || 'popular trending items'
      // Use Amazon Search Engine
      const res = await fetch(`https://serpapi.com/search.json?engine=amazon&k=${encodeURIComponent(query)}&amazon_domain=amazon.in&api_key=${apiKey}`, {
        next: { revalidate: 3600 }
      })
      
      if (!res.ok) {
        console.error('SerpAPI error:', await res.text())
        throw new Error('Failed to fetch from SerpAPI')
      }

      const data = await res.json()
      
      if (data.organic_results && data.organic_results.length > 0) {
        return data.organic_results
          .filter((item: any) => item.price && typeof item.price.value === 'number')
          .slice(0, 12)
          .map((item: any, index: number) => ({
            id: item.asin || `serp-${index}`,
            name: item.title,
            category: category || 'Trending',
            price: item.price.value,
            originalPrice: Math.round(item.price.value * 1.2),
            image: item.thumbnail,
            rating: item.rating || 4.0 + (Math.random() * 1),
            reviews: item.reviews || Math.floor(Math.random() * 5000),
            stock: 'in-stock',
            deliveryTime: item.delivery?.price?.raw || '1-3 days',
            prime: item.is_prime || Math.random() > 0.5,
            tags: [item.is_sponsored ? 'Sponsored' : 'Amazon.in'].filter(Boolean)
          }))
      }
    } catch (error) {
      console.error('Error fetching real-time products:', error)
      // Fall through to mock products
    }
  }

  // Simulate API delay if using mock data
  await new Promise((resolve) => setTimeout(resolve, 500))

  if (category) {
    return MOCK_PRODUCTS.filter(
      (p) => p.category.toLowerCase().includes(category.toLowerCase()) || p.name.toLowerCase().includes(category.toLowerCase())
    )
  }

  return MOCK_PRODUCTS
}

// Product Detailed Response type
export interface ProductDetails {
  id: string
  name: string
  price: number
  originalPrice?: number
  images: string[]
  rating: number
  reviews: number
  description: string
  features: string[]
  prime: boolean
  stock: 'in-stock' | 'low-stock' | 'out-of-stock'
  deliveryTime?: string
  brand?: string
}

export async function fetchProductDetails(asin: string): Promise<ProductDetails | null> {
  const apiKey = process.env.SERPAPI_KEY

  if (apiKey && apiKey !== 'your_serpapi_key_here' && !asin.startsWith('serp-')) {
    try {
      const res = await fetch(`https://serpapi.com/search.json?engine=amazon_product&asin=${encodeURIComponent(asin)}&amazon_domain=amazon.in&api_key=${apiKey}`, {
        next: { revalidate: 3600 }
      })

      if (res.ok) {
         const data = await res.json()
         if (data.product_results) {
           const p = data.product_results
           return {
             id: p.asin,
             name: p.title,
             price: p.price ? p.price.value : 0,
             originalPrice: p.price?.value ? Math.round(p.price.value * 1.2) : undefined, // simplified fallback
             images: p.images ? p.images.map((img: any) => img.link) : [p.image || ''],
             rating: p.rating || 4.5,
             reviews: p.reviews || 0,
             description: p.product_information || 'No description available.',
             features: p.feature_bullets || [],
             prime: p.is_prime || false,
             stock: p.availability_status?.toLowerCase().includes('in stock') ? 'in-stock' : 'low-stock',
             deliveryTime: p.delivery?.price?.raw || 'Standard Delivery',
             brand: p.brand
           }
         }
      }
    } catch (error) {
      console.error('Error fetching product details:', error)
    }
  }

  // Fallback: look up in MOCK_PRODUCTS
  const mockProduct = MOCK_PRODUCTS.find(p => p.id === asin)
  if (mockProduct) {
     return {
        id: mockProduct.id,
        name: mockProduct.name,
        price: mockProduct.price,
        originalPrice: mockProduct.originalPrice,
        images: mockProduct.image ? [mockProduct.image] : ['https://m.media-amazon.com/images/I/61vJtKbAssL._AC_UY218_.jpg'],
        rating: mockProduct.rating,
        reviews: mockProduct.reviews,
        description: 'Detailed description for this mock product. It offers excellent value and top quality material suitable for all your daily needs.',
        features: [
           'High quality manufacturing',
           'Durable and reliable',
           'Perfect for everyday use',
           'Top rated by customers'
        ],
        prime: mockProduct.prime || false,
        stock: mockProduct.stock || 'in-stock',
        deliveryTime: mockProduct.deliveryTime,
        brand: 'Generic Brand'
     }
  }

  return null
}
