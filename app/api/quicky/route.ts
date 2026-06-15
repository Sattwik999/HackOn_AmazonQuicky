import { NextResponse } from 'next/server'
import type { SerpProduct } from '@/components/product-card'
import {
  QUICKY_MODEL,
  QUICKY_SYSTEM_PROMPT,
  buildCategorySearchQueries,
  buildFallbackResponse,
  buildScenarioPlan,
  extractBudget,
  extractJsonObject,
  extractIntent,
  rankProducts,
  sanitizeQuickyResponse,
  toQuickyCatalog,
  type QuickyPlan,
  type QuickyResponse,
} from '@/lib/quicky'

export const dynamic = 'force-dynamic'

interface QuickyRequestBody {
  query?: string
  budget?: number | null
  previousCart?: QuickyResponse | null
  history?: Array<{ sender: 'user' | 'assistant'; text: string }>
  profile?: unknown
  mode?: 'plan' | 'cart' | 'add_item'
  plan?: QuickyPlan | null
}

function buildSearchQuery(query: string) {
  return query
    .replace(/(?:under|below|within|less than)\s*(?:rs\.?|inr|₹)?\s*[\d,]+/gi, '')
    .replace(/\s+/g, ' ')
    .replace(/\b(add|remove|replace|swap|make it|under|cheaper|premium|healthy|more|less)\b/gi, '')
    .trim() || query || 'groceries'
}

function isCapabilityQuery(query: string) {
  return /what can you do|help|how (do|can) you work|options|examples/i.test(query)
}

function isCartConfirmation(query: string) {
  return /^(yes|yep|yeah|ok|okay|sure|create|make|build|go ahead|do it|cart)$/i.test(query.trim())
    || /create.*cart|build.*cart|make.*cart/i.test(query)
}

function isDirectCartRequest(query: string) {
  return /checkout|buy all|create cart now|build cart now|make cart now/i.test(query)
}

function needsClarification(query: string) {
  const normalized = query.toLowerCase()
  
  // 1. Birthday Clarification
  const isBirthdayGift = /birthday|gift|present/.test(normalized) && /14|teen|kid|child|year old|years old/.test(normalized)
  const hasInterestSignal = /tech|electronics|books|gaming|games|sports|fashion|music|art|stationery|toy/.test(normalized)
  if (isBirthdayGift && !hasInterestSignal) return true

  // 2. Hostel Clarification (New)
  const isHostel = /hostel|dorm|pg/.test(normalized)
  const hasHostelCategories = /electronics|snacks|food|medical|medicines|study|toiletries|laundry|grooming|first aid/.test(normalized)
  if (isHostel && !hasHostelCategories) return true

  // 3. Biryani Clarification (New)
  const isBiryani = /biryani/.test(normalized)
  const peopleCount = query.match(/(?:for|serves?|serving)\s+(\d{1,3})/) || query.match(/(\d{1,3})\s*(?:people|persons|guests|friends)/)
  if (isBiryani && !peopleCount) return true

  return false
}

function isExplicitAddItem(query: string) {
  return /^add\s+(.+)/i.test(query.trim())
}

function extractAddItemQuery(query: string) {
  return query
    .replace(/^add\s+/i, '')
    .replace(/\b(to|in)\s+(the\s+)?cart\b/gi, '')
    .replace(/\bplease\b/gi, '')
    .trim()
}

function getCapabilityMessage() {
  return [
    'I can turn a shopping situation into ready-to-checkout carts.',
    '',
    'Try one of these:',
    '- Birthday party for 10 under ₹1500',
    '- Diwali snacks and gifts under ₹2500',
    '- Movie night for 5 under ₹800',
    '- Make my current cart cheaper',
    '- Add snacks',
    '- Remove chips',
    '',
    'I infer the needs, search the catalog, and build Economy, Balanced and Premium carts you can edit or buy.',
  ].join('\n')
}

function formatPlanMessage(plan: QuickyPlan) {
  const needs = plan.needs.map((item) => `- ${item}`).join('\n')
  const addons = plan.optional_addons.length ? `\n\nUseful add-ons: ${plan.optional_addons.join(', ')}.` : ''
  return `${plan.headline}\n${plan.reason}\n\nNeeds covered:\n${needs}${addons}\n\n${plan.question}`
}

async function fetchAmazonProducts(query: string) {
  const apiKey = process.env.SERPAPI_KEY
  if (!apiKey) {
    throw new Error('SERPAPI_KEY is missing.')
  }

  const url = `https://serpapi.com/search.json?engine=amazon&amazon_domain=amazon.in&k=${encodeURIComponent(query)}&api_key=${apiKey}`
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`SerpAPI request failed with status ${response.status}.`)
  }

  const data = await response.json()
  const results = data.amazon_results || data.organic_results || data.search_results || data.shopping_results

  if (!Array.isArray(results) || results.length === 0) {
    throw new Error('No candidate products returned from SerpAPI.')
  }

  return results.filter((item: SerpProduct) => (item.asin || item.product_id) && item.extracted_price)
}

async function callHuggingFace(
  query: string,
  products: SerpProduct[],
  budget: number | null,
  previousCart: QuickyResponse | null,
  history: QuickyRequestBody['history'],
  profile: QuickyRequestBody['profile'],
) {
  const token = process.env.HUGGINGFACE_API_KEY
  if (!token) {
    throw new Error('HUGGINGFACE_API_KEY is missing.')
  }
  const plan = buildScenarioPlan(query, budget)

  const response = await fetch('https://router.huggingface.co/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      model: QUICKY_MODEL,
      temperature: 0.4,
      max_tokens: 4000,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: QUICKY_SYSTEM_PROMPT },
        {
          role: 'user',
          content: JSON.stringify({
            shopper_query: query,
            budget_in_inr: budget,
            inferred_headline: plan.headline,
            inferred_reason: plan.reason,
            inferred_needs: plan.needs,
            inferred_categories: plan.categories,
            inferred_addons: plan.optional_addons,
            previous_cart: previousCart,
            recent_conversation: history?.slice(-6) || [],
            shopper_profile: profile || null,
            product_catalog: toQuickyCatalog(products).slice(0, 18),
          }),
        },
      ],
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Hugging Face request failed: ${errorText}`)
  }

  const payload = await response.json()
  const content = payload.choices?.[0]?.message?.content
  if (!content) {
    throw new Error('Hugging Face returned an empty response.')
  }

  const parsed = JSON.parse(extractJsonObject(content)) as QuickyResponse
  return sanitizeQuickyResponse(parsed, products, budget)
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as QuickyRequestBody
    const query = body.query?.trim()

    if (!query) {
      return NextResponse.json({ error: 'A shopper query is required.' }, { status: 400 })
    }

    const budget = typeof body.budget === 'number' ? body.budget : body.plan?.intent?.budget ?? extractBudget(query)
    const previousCart = body.previousCart || null
    const shouldCreateCart = body.mode === 'cart' || isCartConfirmation(query) || isDirectCartRequest(query)
    const planningQuery = body.plan && !shouldCreateCart ? `${body.plan.query} ${query}` : body.plan?.query || query

    if ((body.mode === 'add_item' || (previousCart && isExplicitAddItem(query))) && previousCart) {
      const addQuery = extractAddItemQuery(query)
      const addIntent = extractIntent(addQuery, budget)
      const products = rankProducts(await fetchAmazonProducts(`${addQuery} amazon india`), addIntent).slice(0, 6)
      const product = products[0]

      if (!product) {
        return NextResponse.json({ error: `I couldn't find ${addQuery} on Amazon India.` }, { status: 404 })
      }

      return NextResponse.json({
        ok: true,
        kind: 'add_item',
        query,
        item: {
          product_id: product.asin || product.product_id || String(product.position),
          title: product.title,
          quantity: 1,
          unit_price: product.extracted_price || 0,
          total_price: product.extracted_price || 0,
          image: product.thumbnail,
          rationale: `Added because you asked for ${addQuery}.`,
          delivery_estimate: product.delivery || 'Fast delivery available',
          ai_badge: 'Added',
          quality_tier: 'standard',
        },
      })
    }

    if (isCapabilityQuery(query) && !shouldCreateCart) {
      return NextResponse.json({
        ok: true,
        kind: 'assistant',
        message: getCapabilityMessage(),
      })
    }

    if ((body.mode === 'plan' || (!shouldCreateCart && !previousCart && needsClarification(query))) ) {
      const plan = buildScenarioPlan(planningQuery, budget)
      return NextResponse.json({
        ok: true,
        kind: 'plan',
        budget,
        query,
        plan,
        message: formatPlanMessage(plan),
      })
    }

    const intent = extractIntent(`${planningQuery} ${previousCart?.context?.replaceAll('_', ' ') || ''}`, budget)
    const searchQueries = buildCategorySearchQueries(planningQuery, intent).map(buildSearchQuery)
    const productGroups = await Promise.all(searchQueries.map((searchQuery) => fetchAmazonProducts(searchQuery).catch(() => [])))
    const products = rankProducts(productGroups.flat(), intent).slice(0, 36)

    if (!products.length) {
      throw new Error('No candidate products returned from Amazon category searches.')
    }

    let quickyResponse: QuickyResponse
    try {
      quickyResponse = await callHuggingFace(planningQuery, products, budget, previousCart, body.history, body.profile)
      if (!quickyResponse.cart_items.length) {
        quickyResponse = buildFallbackResponse(query, products, budget)
      }
    } catch {
      quickyResponse = buildFallbackResponse(query, products, budget)
    }
    const responsePlan = buildScenarioPlan(planningQuery, budget)
    quickyResponse = {
      ...quickyResponse,
      message: `${responsePlan.headline}\n${responsePlan.reason}`,
    }

    return NextResponse.json({
      ok: true,
      kind: 'cart',
      model: QUICKY_MODEL,
      budget,
      query: planningQuery,
      searchQuery: searchQueries.join(' | '),
      intent,
      result: quickyResponse,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to process Quicky request.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}