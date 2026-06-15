import type { CartItem } from '@/components/cart-context'
import type { SerpProduct } from '@/components/product-card'

export const QUICKY_MODEL = process.env.HUGGINGFACE_MODEL || 'Qwen/Qwen3-32B'

export type QuickySchedule = 'daily' | 'every_7_days' | 'every_14_days' | 'monthly_first'
export type QuickyCartTier = 'economy' | 'balanced' | 'premium'

// Context is no longer a hardcoded enum. It is infinitely dynamic based on user intent.
export type QuickyShoppingContext = string

export interface QuickyIntent {
  occasion: QuickyShoppingContext
  people_count: number | null
  budget: number | null
  dietary_preferences: string[]
  shopping_categories: string[]
  refinements: string[]
  urgency: 'normal' | 'emergency'
  purchase_type: 'immediate' | 'replenishment' | 'goal' | 'event'
}

export interface QuickyPlan {
  query: string
  intent: QuickyIntent
  headline: string
  reason: string
  needs: string[]
  categories: string[]
  suggested_items: string[]
  optional_addons: string[]
  question: string
}

export interface QuickyNeedInference {
  needs: string[]
  categories: string[]
  addons: string[]
  explanation: string
}

export interface QuickyCartItem {
  product_id: string
  title: string
  quantity: number
  unit_price: number
  total_price: number
  image: string
  rationale: string
  delivery_estimate?: string
  ai_badge?: string
  savings_badge?: string
  quality_tier?: 'value' | 'standard' | 'premium'
  replaced_item?: {
    title: string
    image: string
    unit_price: number
  }
}

export interface QuickyAlternative {
  target_product_id: string
  product_id: string
  title: string
  quantity: number
  unit_price: number
  total_price: number
  image: string
  rationale: string
  price_delta: number
  quality_comparison: 'lower' | 'similar' | 'higher'
}

export interface QuickySavingsInsight {
  type: 'substitution' | 'bundle' | 'bulk_pack'
  title: string
  description: string
  potential_savings: number
}

export interface QuickySubscriptionSuggestion {
  product_id: string
  title: string
  schedule: QuickySchedule
  reason: string
}

export interface QuickyScores {
  value: number
  quality: number
  budget_efficiency: number
}

export interface QuickyCartVariant {
  tier: QuickyCartTier
  title: string
  summary: string
  cart_items: QuickyCartItem[]
  total_cost: number
  scores: QuickyScores
  savings: QuickySavingsInsight[]
  cart_story: string
  confidence_score: number
}

export interface QuickyResponse {
  message: string
  context: QuickyShoppingContext
  budget: number | null
  cart_items: QuickyCartItem[]
  alternatives: QuickyAlternative[]
  total_cost: number
  scores: QuickyScores
  savings: QuickySavingsInsight[]
  variants: Record<QuickyCartTier, QuickyCartVariant>
  intent: QuickyIntent
  cart_story: string
  confidence_score: number
  subscription_suggestions: QuickySubscriptionSuggestion[]
  estimated_time?: string
}

export interface QuickySubscription {
  id: string
  createdAt: string
  schedule: QuickySchedule
  totalCost: number
  cartItems: CartItem[]
}

export const QUICKY_SYSTEM_PROMPT = `
You are Quicky, an autonomous AI quick commerce agent for an Amazon-like app. 
You operate on an Intent-First shopping model. Do not ask users to search for products; instead, translate their desired outcomes (e.g., "Movie night", "Baby has fever", "Weekly meal prep") into immediate, pre-built cart suggestions.

Your directives:
1. Intent Agent: Map the user's open-ended prompt to a dynamic shopping context.
2. Need Inference Agent: Infer concrete needs before products. Never repeat the user's sentence as a product name.
3. Category Agent: Convert needs into searchable commerce categories. Do not generate labels like "premium {occasion}", "value {occasion}", "instant delivery items", or "relief products".
4. Context First: If the user gives a strong context like fever, birthday, party, baby care, travel, ingredients, or weekly restock and no budget, prioritize the context and infer the essentials before considering price.
5. Emergency Mode: If the prompt implies illness, injury, or urgent need (e.g., fever, headache, ran out of diapers), set 'urgency' to 'emergency' and prioritize delivery speed and immediate-use essentials.
6. Cart Generation: Customers should see complete solutions, not search terms. Every item must solve one inferred need.
7. Variant Generation: Output exactly three fully built carts. Economy is the lowest-cost acceptable solution. Balanced is the best value. Premium is the best brands and quality. If no budget is present, still output the three carts using context and catalog fit as the primary ranking signal.
8. Confidence Layer: Provide explicit 'rationale' for every product choice so the customer understands *why* it fits their intent without needing to browse.
9. Select ONLY from the supplied product_catalog. Do not hallucinate IDs or prices. Total cost must exactly equal sum of quantities * unit prices.

Required JSON schema:
{
  "message": "string",
  "context": "dynamic_string_based_on_intent",
  "budget": 0,
  "estimated_time": "e.g., 9 min",
  "variants": {
    "economy": { "tier": "economy", "title": "string", "summary": "string", "cart_items": [], "total_cost": 0, "scores": { "value": 0, "quality": 0, "budget_efficiency": 0 }, "savings": [] },
    "balanced": { "tier": "balanced", "title": "string", "summary": "string", "cart_items": [], "total_cost": 0, "scores": { "value": 0, "quality": 0, "budget_efficiency": 0 }, "savings": [] },
    "premium": { "tier": "premium", "title": "string", "summary": "string", "cart_items": [], "total_cost": 0, "scores": { "value": 0, "quality": 0, "budget_efficiency": 0 }, "savings": [] }
  },
  "cart_items": [],
  "alternatives": [],
  "total_cost": 0,
  "scores": { "value": 0, "quality": 0, "budget_efficiency": 0 },
  "savings": [],
  "intent": { 
    "occasion": "string", 
    "people_count": null, 
    "budget": null, 
    "dietary_preferences": [], 
    "shopping_categories": [], 
    "refinements": [],
    "urgency": "normal | emergency",
    "purchase_type": "immediate | replenishment | goal | event"
  },
  "cart_story": "string",
  "confidence_score": 0,
  "subscription_suggestions": []
}
`.trim()

export const formatRupees = (amount: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)

export function extractBudget(query: string) {
  const match = query.match(/(?:under|below|within|less than|upto|up to|budget(?: of)?|₹)\s*(?:rs\.?|inr|₹)?\s*([\d,]+)/i)
  if (!match) return null
  const amount = Number(match[1].replace(/,/g, ''))
  return Number.isFinite(amount) ? amount : null
}

export function extractPeopleCount(query: string) {
  const normalized = query.toLowerCase()
  const direct = normalized.match(/(?:for|serves?|serving|team of|party of)\s+(\d{1,3})\s*(?:people|persons|guests|friends|members|team|kids|students)?/)
  const suffix = normalized.match(/(\d{1,3})\s*(?:people|persons|guests|friends|members|students|kids)/)
  const count = Number(direct?.[1] || suffix?.[1])
  return Number.isFinite(count) && count > 0 ? count : null
}

export function extractAge(query: string) {
  const normalized = query.toLowerCase()
  const match = normalized.match(/(?:age(?:d)?|turning|for)\s*(\d{1,2})\b/) || normalized.match(/\b(\d{1,2})\s*(?:year old|years old|yo)\b/)
  const age = Number(match?.[1])
  return Number.isFinite(age) && age > 0 ? age : null
}

export function extractDietaryPreferences(query: string) {
  const normalized = query.toLowerCase()
  const preferences: string[] = []
  if (/veg|vegetarian|jain/.test(normalized)) preferences.push('vegetarian')
  if (/vegan/.test(normalized)) preferences.push('vegan')
  if (/healthy|low sugar|sugar free|diet/.test(normalized)) preferences.push('health-conscious')
  if (/protein|gym|fitness/.test(normalized)) preferences.push('high-protein')
  if (/gluten free/.test(normalized)) preferences.push('gluten-free')
  return [...new Set(preferences)]
}

export function extractRefinements(query: string) {
  const normalized = query.toLowerCase()
  const refinements: string[] = []
  if (/reduce cost|cheaper|budget|save|less expensive/.test(normalized)) refinements.push('reduce_cost')
  if (/premium|best|upgrade/.test(normalized)) refinements.push('premium_version')
  if (/vegetarian|veg|jain/.test(normalized)) refinements.push('make_vegetarian')
  if (/dessert|sweet|chocolate/.test(normalized)) refinements.push('add_desserts')
  if (/under|below|within|fit/.test(normalized)) refinements.push('fit_budget')
  return refinements
}

export function extractSubject(query: string): string {
  const normalized = query.toLowerCase()
  if (/fever|temperature|sick/.test(normalized)) return 'fever care'
  if (/movie|film|netflix|watch party/.test(normalized)) return 'movie night'
  if (/biryani/.test(normalized)) return 'biryani ingredients'
  if (/birthday/.test(normalized)) return 'birthday party'
  if (/diwali|festival|puja/.test(normalized)) return 'festival shopping'
  if (/travel|trip|journey/.test(normalized)) return 'travel essentials'
  if (/hostel|dorm|pg/.test(normalized)) return 'hostel essentials'

  // 1. Strip out the budget
  let text = query.replace(/(?:within|under|below|less than|upto|up to|budget(?: of)?|₹)\s*(?:rs\.?|inr|₹)?\s*[\d,]+/i, '').trim()

  // 2. Catch missing/urgent items mid-sentence
  const missingItemMatch = text.match(/(?:don'?t have|without|lack|need to buy|out of|ran out of)(?:\s+any|\s+good|\s+a|\s+an)?\s+([a-zA-Z\s]+?)(?:,|$|\s+and|\s+can\s+you)/i)
  if (missingItemMatch && missingItemMatch[1]) {
     return missingItemMatch[1].trim()
  }

  // 3. Clean conversational wrappers
  text = text.replace(/^(?:can you suggest|suggest|find|need|want|looking for|create a cart for|show me|i will go to|i want to|i need to|i am going to)(?:\s+me)?(?:\s+to\s+play|\s+play)?\s+/i, '').trim()
  text = text.replace(/(?:,?\s*can you suggest(?: me)?|,?\s*please suggest|,?\s*what should i buy)\s*$/i, '').trim()
  text = text.replace(/,$/, '').trim()

  return text.length > 0 && text.length <= 50 ? text : 'essentials'
}

export function inferUrgency(query: string): 'normal' | 'emergency' {
  const emergencyKeywords = /fever|pain|headache|sick|emergency|ran out|baby|urgent|fast|quick|stomach ache|cramp/i
  return emergencyKeywords.test(query) ? 'emergency' : 'normal'
}

export function inferPurchaseType(query: string): 'immediate' | 'replenishment' | 'goal' | 'event' {
  const normalized = query.toLowerCase()
  if (/diet|gym|weight loss|prep|plan/.test(normalized)) return 'goal'
  if (/weekly|monthly|restock|groceries|ran out/.test(normalized)) return 'replenishment'
  if (/party|night|match|birthday|puja|diwali|festival/.test(normalized)) return 'event'
  return 'immediate'
}

export function extractIntent(query: string, budgetOverride?: number | null): QuickyIntent {
  const occasion = extractSubject(query)
  const budget = typeof budgetOverride === 'number' ? budgetOverride : extractBudget(query)
  const dietaryPreferences = extractDietaryPreferences(query)

  return {
    occasion,
    people_count: extractPeopleCount(query),
    budget,
    dietary_preferences: dietaryPreferences,
    shopping_categories: planCategories(occasion, query, dietaryPreferences),
    refinements: extractRefinements(query),
    urgency: inferUrgency(query),
    purchase_type: inferPurchaseType(query)
  }
}

export function planCategories(subject: string, query: string, dietaryPreferences: string[]) {
  const inferred = inferNeeds(query)
  const categories = inferred.categories.length ? inferred.categories : [subject, 'essentials']

  // Dietary add-ons
  const normalized = query.toLowerCase()
  if (/dessert|sweet/.test(normalized)) categories.push('dessert')
  if (/drink|beverage|cold drink|juice/.test(normalized)) categories.push('beverages')
  if (dietaryPreferences.includes('vegetarian')) categories.push('vegetarian items')
  if (dietaryPreferences.includes('high-protein')) categories.push('high protein foods')
  
  return [...new Set(categories)].slice(0, 6)
}

export function inferNeeds(query: string, intent?: Pick<QuickyIntent, 'occasion' | 'urgency' | 'purchase_type' | 'dietary_preferences'>): QuickyNeedInference {
  const normalized = query.toLowerCase()
  const isVegetarian = intent?.dietary_preferences?.includes('vegetarian') || /vegetarian|veg|jain/.test(normalized)

  if (/fever|temperature|sick/.test(normalized)) {
    return {
      needs: ['pain relief', 'hydration', 'monitoring'],
      categories: ['medicine', 'electrolytes', 'thermometer', 'tissues'],
      addons: ['light food', 'cooling patches', 'sanitizer'],
      explanation: 'Fever care needs fast delivery, hydration support, temperature monitoring, and comfort essentials.',
    }
  }

  if (/movie|film|netflix|watch party/.test(normalized)) {
    return {
      needs: ['snacks', 'drinks', 'dessert'],
      categories: ['chips', 'popcorn', 'soft drinks', 'ice cream'],
      addons: ['dip', 'paper cups', 'chocolate'],
      explanation: 'Movie nights work best with shareable snacks, easy drinks, and one sweet finish.',
    }
  }

  if (/biryani/.test(normalized)) {
    return {
      needs: ['rice', 'spices', 'vegetables', 'protein'],
      categories: ['basmati rice', 'biryani masala', 'onions', isVegetarian ? 'paneer' : 'chicken'],
      addons: ['curd', 'mint leaves', 'fried onions'],
      explanation: 'Biryani needs long-grain rice, masala, aromatics, and a protein base before any optional garnish.',
    }
  }

  if (/birthday/.test(normalized)) {
    const age = extractAge(query)
    const teenGift = age !== null && age >= 12 && age <= 17
    return {
      needs: teenGift ? ['gift', 'tech accessory', 'fun item'] : ['cake', 'snacks', 'drinks', 'serving supplies'],
      categories: teenGift
        ? ['wireless earbuds', 'bluetooth speaker', 'power bank', 'books', 'sports gear']
        : ['cake', 'candles', 'chips', 'soft drinks', 'paper plates'],
      addons: teenGift ? ['gift wrap', 'gift card', 'desk accessories'] : ['balloons', 'chocolate', 'party cups'],
      explanation: teenGift
        ? 'A teen birthday gift needs a mix of practical tech, fun items, and a fallback gift choice when preferences are unclear.'
        : 'A birthday cart should cover the celebration centerpiece, quick snacks, drinks, and disposable serving basics.',
    }
  }

  if (/diwali|festival|puja/.test(normalized)) {
    return {
      needs: ['sweets', 'snacks', 'decor', 'gifting'],
      categories: ['mithai', 'namkeen', 'diya', 'dry fruits'],
      addons: ['gift boxes', 'pooja oil', 'rangoli colors'],
      explanation: 'Festival shopping usually combines sweets, savory snacks, decor, and small gifting options.',
    }
  }

  if (/travel|trip|journey/.test(normalized)) {
    return {
      needs: ['hydration', 'snacks', 'hygiene', 'backup essentials'],
      categories: ['water bottle', 'protein bars', 'wet wipes', 'toiletries'],
      addons: ['power bank', 'hand sanitizer', 'travel pouch'],
      explanation: 'Travel carts should favor compact, reliable items that reduce stops and cover common needs on the move.',
    }
  }

  if (/hostel|dorm|pg/.test(normalized)) {
    return {
      needs: ['snacks', 'toiletries', 'laundry basics', 'instant food'],
      categories: ['biscuits', 'soap', 'detergent', 'noodles'],
      addons: ['extension board', 'first aid kit', 'electric kettle'],
      explanation: 'Hostel living requires quick snacks, daily hygiene items, and practical room utilities.',
    }
  }

  if (intent?.purchase_type === 'goal' || /diet|gym|fitness|protein|weight loss|meal prep/.test(normalized)) {
    return {
      needs: ['staples', 'protein', 'healthy snacks', 'breakfast'],
      categories: ['oats', 'protein foods', 'peanut butter', 'muesli'],
      addons: ['nuts', 'seeds', 'green tea'],
      explanation: 'Goal-based carts should prioritize repeatable nutrition, protein, and easy daily staples.',
    }
  }

  if (intent?.purchase_type === 'replenishment' || /weekly|monthly|restock|groceries|essentials/.test(normalized)) {
    return {
      needs: ['staples', 'fresh basics', 'pantry', 'snacks'],
      categories: ['atta', 'rice', 'dal', 'oil', 'milk'],
      addons: ['tea', 'sugar', 'biscuits'],
      explanation: 'Restock carts should cover the staples people run through most often before adding extras.',
    }
  }

  return {
    needs: ['core items', 'supporting essentials', 'value options'],
    categories: [intent?.occasion || 'daily essentials', 'pantry essentials', 'household essentials'],
    addons: ['healthier swaps', 'bulk packs', 'premium upgrades'],
    explanation: 'Quicky inferred a practical essentials cart from the shopping context and available catalog.',
  }
}

export function buildCategorySearchQueries(query: string, intent = extractIntent(query)) {
  const preferences = intent.dietary_preferences.join(' ')
  const inferred = inferNeeds(query, intent)
  return [...new Set([...inferred.categories, ...intent.shopping_categories])].map((category) =>
    [category, preferences, 'amazon india'].filter(Boolean).join(' '),
  )
}

function getIntentHeadline(query: string, intent: QuickyIntent) {
  const normalized = query.toLowerCase()
  if (/fever|temperature|sick/.test(normalized)) return '🚑 Emergency Fever Essentials'
  if (/movie|film|netflix|watch party/.test(normalized)) return '🍿 Movie Night Essentials'
  if (/biryani/.test(normalized)) return '🍲 Biryani Ingredients'
  if (/birthday/.test(normalized)) return '🎂 Birthday Party Essentials'
  if (/diwali|festival|puja/.test(normalized)) return '🪔 Festival Essentials'
  if (/travel|trip|journey/.test(normalized)) return '🎒 Travel Essentials'
  if (/hostel|dorm|pg/.test(normalized)) return '📦 Hostel Essentials'
  if (intent.purchase_type === 'goal') return 'Goal-Focused Grocery Plan'
  if (intent.purchase_type === 'replenishment') return 'Weekly Restock Essentials'
  return `${titleCase(intent.occasion)} Essentials`
}

export function buildScenarioPlan(query: string, budget: number | null): QuickyPlan {
  const intent = extractIntent(query, budget)
  const people = intent.people_count ? ` for ${intent.people_count}` : ''
  const budgetText = intent.budget ? ` within ${formatRupees(intent.budget)}` : ''
  const inferred = inferNeeds(query, intent)
  const age = extractAge(query)
  const normalized = query.toLowerCase()
  
  const headline = getIntentHeadline(query, intent)
  const reason = `${inferred.explanation}${people || budgetText ? ` Planned${people}${budgetText}.` : ''}`
  
  let question = 'I can build Economy, Balanced and Premium carts from this now.'
  
  if (/birthday/.test(normalized) && age !== null && age >= 12 && age <= 17 && !/tech|electronics|books|gaming|sports/.test(normalized)) {
    question = 'Before I build the cart, do you want me to aim for tech, fun, books, or mixed gifts for the teen?'
  } else if (/hostel|dorm|pg/.test(normalized) && !/electronics|snacks|food|medical|medicine|toiletries|first aid/.test(normalized)) {
    question = 'I understand! What specific essentials are you looking for? (e.g., Electronics, Food & Snacks, Medical & First Aid, or Toiletries?)'
  } else if (/biryani/.test(normalized) && !intent.people_count) {
    question = 'Before I suggest the ingredients, roughly how many people are you cooking for?'
  }

  return {
    query,
    intent,
    headline,
    reason,
    needs: inferred.needs,
    categories: inferred.categories,
    suggested_items: inferred.needs,
    optional_addons: inferred.addons,
    question,
  }
}

export function toQuickyCatalog(products: SerpProduct[]) {
  return products.map((product) => ({
    product_id: getProductId(product),
    title: product.title,
    unit_price: product.extracted_price || 0,
    image: product.thumbnail,
    rating: product.rating || null,
    reviews: product.reviews || null,
    delivery: product.delivery || null,
  }))
}

export function rankProducts(products: SerpProduct[], intent: QuickyIntent, tier: QuickyCartTier = 'balanced') {
  const priced = dedupeProducts(getPricedProducts(products))
  const targetPrice = intent.budget ? intent.budget / (tier === 'economy' ? 5 : tier === 'premium' ? 4 : 5) : medianPrice(priced)

  return priced
    .map((product) => ({ product, score: productRankScore(product, targetPrice, intent) }))
    .sort((a, b) => b.score - a.score)
    .map(({ product }) => product)
}

export function productRankScore(product: SerpProduct, targetPrice: number, intent: QuickyIntent) {
  const relevanceWeight = intent.urgency === 'emergency' ? 30 : 40
  const deliveryWeight = intent.urgency === 'emergency' ? 35 : 25
  const relevanceScore = needRelevanceScore(product, intent) * relevanceWeight
  const deliveryScore = deliverySpeedScore(product) * deliveryWeight
  const ratingScore = Math.min((product.rating || 3.8) / 5, 1) * 15
  const reviewScore = Math.min(Math.log10((product.reviews || 20) + 1) / 5, 1) * 10
  const price = product.extracted_price || targetPrice || 1
  const budgetFitScore = Math.max(0, 1 - Math.abs(price - targetPrice) / Math.max(targetPrice, 1)) * 10

  return relevanceScore + deliveryScore + ratingScore + reviewScore + budgetFitScore
}

function needRelevanceScore(product: SerpProduct, intent: QuickyIntent) {
  const inferred = inferNeeds(intent.occasion, intent)
  const title = product.title.toLowerCase()
  const phrases = [...inferred.needs, ...inferred.categories, ...intent.shopping_categories]
  const phraseMatch = phrases.some((phrase) => title.includes(phrase.toLowerCase()))
  if (phraseMatch) return 1

  const tokens = phrases
    .flatMap((phrase) => phrase.toLowerCase().split(/\s+/))
    .filter((token) => token.length > 2)
  const matches = tokens.filter((token) => title.includes(token)).length
  return Math.min(matches / Math.max(Math.min(tokens.length, 4), 1), 1)
}

function deliverySpeedScore(product: SerpProduct) {
  const delivery = product.delivery || ''
  if (/minute|today|same day|fast|quick/i.test(delivery)) return 1
  if (/tomorrow|1 day|one day|prime|free/i.test(delivery)) return 0.78
  if (/2 days|two days/i.test(delivery)) return 0.55
  return 0.35
}

export function mapQuickyItemsToCart(items: QuickyCartItem[]): CartItem[] {
  return items.map((item) => ({
    id: item.product_id,
    name: item.title,
    price: item.unit_price,
    image: item.image,
    qty: item.quantity,
  }))
}

export function extractJsonObject(content: string) {
  const firstBrace = content.indexOf('{')
  const lastBrace = content.lastIndexOf('}')
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error('Model response did not contain JSON.')
  }
  return content.slice(firstBrace, lastBrace + 1)
}

export function buildFallbackResponse(query: string, products: SerpProduct[], budget: number | null): QuickyResponse {
  const intent = extractIntent(query, budget)
  const context = intent.occasion
  const plan = buildScenarioPlan(query, budget)
  const candidates = rankProducts(products, intent)
  const economy = buildVariant('economy', candidates, intent)
  const balanced = buildVariant('balanced', candidates, intent)
  const premium = buildVariant('premium', candidates, intent)
  const variants = { economy, balanced, premium }
  const active = balanced.cart_items.length ? balanced : economy.cart_items.length ? economy : premium
  const subscriptionSuggestions = buildSubscriptionSuggestions(active.cart_items)
  const cartStory = buildCartStory(intent, active)
  const confidenceScore = calculateConfidence(active.cart_items, candidates, intent.budget)

  return {
    message: `${plan.headline}\n${plan.reason}`,
    context,
    budget,
    cart_items: active.cart_items,
    alternatives: buildAlternatives(active.cart_items, candidates),
    total_cost: active.total_cost,
    scores: active.scores,
    savings: active.savings,
    variants,
    intent,
    cart_story: cartStory,
    confidence_score: confidenceScore,
    subscription_suggestions: subscriptionSuggestions,
  }
}

export function sanitizeQuickyResponse(response: QuickyResponse, products: SerpProduct[], budget: number | null): QuickyResponse {
  const fallbackIntent = extractIntent(response.message || 'shopping cart', budget)
  const intent: QuickyIntent = {
    ...fallbackIntent,
    ...(response.intent || {}),
    dietary_preferences: response.intent?.dietary_preferences?.length ? response.intent.dietary_preferences : fallbackIntent.dietary_preferences,
    shopping_categories: response.intent?.shopping_categories?.length ? response.intent.shopping_categories : fallbackIntent.shopping_categories,
    refinements: response.intent?.refinements?.length ? response.intent.refinements : fallbackIntent.refinements,
  }
  const context = response.context || intent.occasion
  const candidates = rankProducts(products, intent)
  const productMap = new Map(candidates.map((product) => [getProductId(product), product]))
  const fallback = buildFallbackResponse(response.message || 'shopping cart', products, budget)

  const variants = (['economy', 'balanced', 'premium'] as QuickyCartTier[]).reduce(
    (acc, tier) => {
      const rawVariant = response.variants?.[tier]
      const safeItems = sanitizeItems(rawVariant?.cart_items || [], productMap, budget)
      const fallbackVariant = fallback.variants[tier]
      const cartItems = safeItems.length ? safeItems : fallbackVariant.cart_items
      const totalCost = getTotal(cartItems)

      acc[tier] = {
        tier,
        title: rawVariant?.title || fallbackVariant.title,
        summary: rawVariant?.summary || fallbackVariant.summary,
        cart_items: cartItems,
        total_cost: totalCost,
        scores: normalizeScores(rawVariant?.scores, totalCost, budget, tier),
        savings: sanitizeSavings(rawVariant?.savings, cartItems, candidates),
        cart_story: rawVariant?.cart_story || buildCartStory(intent, fallbackVariant),
        confidence_score: clampScore(rawVariant?.confidence_score ?? calculateConfidence(cartItems, candidates, budget)),
      }

      return acc
    },
    {} as Record<QuickyCartTier, QuickyCartVariant>,
  )

  const balanced = variants.balanced.cart_items.length ? variants.balanced : variants.economy
  const alternatives = buildAlternatives(balanced.cart_items, candidates, response.alternatives)
  const subscriptionSuggestions = response.subscription_suggestions?.length
    ? sanitizeSubscriptionSuggestions(response.subscription_suggestions, balanced.cart_items)
    : buildSubscriptionSuggestions(balanced.cart_items)

  return {
    message: response.message || fallback.message,
    context,
    budget,
    variants,
    cart_items: balanced.cart_items,
    alternatives,
    total_cost: balanced.total_cost,
    scores: balanced.scores,
    savings: balanced.savings,
    intent,
    cart_story: response.cart_story || balanced.cart_story || buildCartStory(intent, balanced),
    confidence_score: clampScore(response.confidence_score ?? balanced.confidence_score ?? calculateConfidence(balanced.cart_items, candidates, budget)),
    subscription_suggestions: subscriptionSuggestions,
  }
}

function getProductId(product: SerpProduct) {
  return product.asin || product.product_id || String(product.position)
}

function getPricedProducts(products: SerpProduct[]) {
  return products.filter((product) => (product.extracted_price || 0) > 0)
}

function dedupeProducts(products: SerpProduct[]) {
  const seen = new Set<string>()
  return products.filter((product) => {
    const id = getProductId(product)
    if (seen.has(id)) return false
    seen.add(id)
    return true
  })
}

function medianPrice(products: SerpProduct[]) {
  const prices = products.map((product) => product.extracted_price || 0).filter(Boolean).sort((a, b) => a - b)
  return prices[Math.floor(prices.length / 2)] || 250
}

function buildVariant(tier: QuickyCartTier, products: SerpProduct[], intent: QuickyIntent): QuickyCartVariant {
  const targetPrice = intent.budget ? intent.budget / (tier === 'economy' ? 5 : tier === 'premium' ? 4 : 5) : medianPrice(products)
  const sorted = [...products].sort((a, b) => {
    if (tier === 'economy') {
      const relevanceDelta = needRelevanceScore(b, intent) - needRelevanceScore(a, intent)
      if (Math.abs(relevanceDelta) > 0.3) return relevanceDelta
      return (a.extracted_price || 0) - (b.extracted_price || 0)
    }
    if (tier === 'premium') {
      const qualityDelta = ((b.rating || 3.8) * 15 + Math.log10((b.reviews || 20) + 1) * 8) - ((a.rating || 3.8) * 15 + Math.log10((a.reviews || 20) + 1) * 8)
      if (Math.abs(qualityDelta) > 1) return qualityDelta
      return productRankScore(b, targetPrice, intent) - productRankScore(a, targetPrice, intent)
    }
    return productRankScore(b, targetPrice, intent) - productRankScore(a, targetPrice, intent)
  })

  const cartItems: QuickyCartItem[] = []
  let runningTotal = 0
  const maxItems = tier === 'premium' ? 6 : 5

  for (const product of sorted) {
    const price = product.extracted_price || 0
    const tierBudget = getTierBudget(tier, intent.budget)
    if (tierBudget && runningTotal + price > tierBudget && cartItems.length > 0) continue
    if (tierBudget && price > tierBudget && cartItems.length === 0) continue

    cartItems.push(toCartItem(product, tier))
    runningTotal += price
    if (cartItems.length >= maxItems || (tierBudget && runningTotal >= tierBudget * (tier === 'economy' ? 0.96 : 0.9))) break
  }

  const totalCost = getTotal(cartItems)
  const scores = normalizeScores(undefined, totalCost, intent.budget, tier)
  return {
    tier,
    title: `${capitalize(tier)} cart`,
    summary: getVariantSummary(tier),
    cart_items: cartItems,
    total_cost: totalCost,
    scores,
    savings: buildSavings(cartItems, products),
    cart_story: buildCartStory(intent, {
      tier,
      cart_items: cartItems,
      total_cost: totalCost,
    }),
    confidence_score: calculateConfidence(cartItems, products, intent.budget),
  }
}

function getTierBudget(tier: QuickyCartTier, budget: number | null) {
  if (!budget) return null
  if (tier === 'economy') return budget * 0.72
  if (tier === 'premium') return budget * 1.5
  return budget
}

function toCartItem(product: SerpProduct, tier: QuickyCartTier): QuickyCartItem {
  const price = product.extracted_price || 0
  return {
    product_id: getProductId(product),
    title: product.title,
    quantity: 1,
    unit_price: price,
    total_price: price,
    image: product.thumbnail,
    rationale: tier === 'economy'
      ? 'Chosen as a sharp value pick for this request.'
      : tier === 'premium'
        ? 'Chosen for stronger quality signals and premium fit.'
        : 'Chosen for the best balance of price, quality and relevance.',
    delivery_estimate: product.delivery || 'Fast delivery available',
    ai_badge: tier === 'premium' ? 'Premium pick' : tier === 'economy' ? 'Best value' : 'AI recommended',
    savings_badge: tier === 'economy' ? 'Saves more' : undefined,
    quality_tier: tier === 'premium' ? 'premium' : tier === 'economy' ? 'value' : 'standard',
  }
}

function sanitizeItems(items: QuickyCartItem[], productMap: Map<string, SerpProduct>, budget: number | null) {
  const safeItems: QuickyCartItem[] = []
  let runningTotal = 0

  for (const rawItem of items) {
    const product = productMap.get(rawItem.product_id)
    if (!product) continue

    const quantity = Math.max(1, Math.min(10, Number(rawItem.quantity) || 1))
    const unitPrice = product.extracted_price || Number(rawItem.unit_price) || 0
    const totalPrice = unitPrice * quantity
    if (budget && runningTotal + totalPrice > budget && safeItems.length > 0) continue

    safeItems.push({
      product_id: getProductId(product),
      title: product.title,
      quantity,
      unit_price: unitPrice,
      total_price: totalPrice,
      image: product.thumbnail,
      rationale: rawItem.rationale || 'Chosen for value and fit.',
      delivery_estimate: product.delivery || rawItem.delivery_estimate || 'Fast delivery available',
      ai_badge: rawItem.ai_badge || 'AI recommended',
      savings_badge: rawItem.savings_badge,
      quality_tier: rawItem.quality_tier || 'standard',
    })
    runningTotal += totalPrice
  }

  return safeItems
}

function buildAlternatives(
  cartItems: QuickyCartItem[],
  products: SerpProduct[],
  modelAlternatives: QuickyAlternative[] = [],
): QuickyAlternative[] {
  const alternatives: QuickyAlternative[] = []
  const usedIds = new Set(cartItems.map((item) => item.product_id))

  for (const item of cartItems) {
    const rawMatches = modelAlternatives.filter((alternative) => alternative.target_product_id === item.product_id)
    for (const raw of rawMatches) {
      if (!usedIds.has(raw.product_id)) alternatives.push(normalizeAlternative(item, raw))
    }

    const candidates = products
      .filter((product) => !usedIds.has(getProductId(product)) && getProductId(product) !== item.product_id)
      .sort((a, b) => Math.abs((a.extracted_price || 0) - item.unit_price) - Math.abs((b.extracted_price || 0) - item.unit_price))
      .slice(0, 5)

    for (const product of candidates) {
      if (alternatives.filter((alternative) => alternative.target_product_id === item.product_id).length >= 3) break
      const unitPrice = product.extracted_price || 0
      alternatives.push({
        target_product_id: item.product_id,
        product_id: getProductId(product),
        title: product.title,
        quantity: item.quantity,
        unit_price: unitPrice,
        total_price: unitPrice * item.quantity,
        image: product.thumbnail,
        rationale: unitPrice < item.unit_price ? 'Lower-cost substitution for budget optimization.' : 'Comparable upgrade or variety swap.',
        price_delta: unitPrice * item.quantity - item.total_price,
        quality_comparison: compareQuality(product, item),
      })
      usedIds.add(getProductId(product))
    }
  }

  return alternatives
}

function normalizeAlternative(target: QuickyCartItem, alternative: QuickyAlternative): QuickyAlternative {
  const totalPrice = Number(alternative.total_price) || Number(alternative.unit_price) * target.quantity || target.total_price
  return {
    ...alternative,
    quantity: Math.max(1, Math.min(10, Number(alternative.quantity) || target.quantity)),
    total_price: totalPrice,
    price_delta: totalPrice - target.total_price,
    quality_comparison: alternative.quality_comparison || 'similar',
  }
}

function compareQuality(product: SerpProduct, item: QuickyCartItem): QuickyAlternative['quality_comparison'] {
  if ((product.rating || 0) >= 4.3 || (product.extracted_price || 0) > item.unit_price * 1.12) return 'higher'
  if ((product.extracted_price || 0) < item.unit_price * 0.88) return 'lower'
  return 'similar'
}

function buildSavings(cartItems: QuickyCartItem[], products: SerpProduct[]): QuickySavingsInsight[] {
  const total = getTotal(cartItems)
  const cheapest = [...products].sort((a, b) => (a.extracted_price || 0) - (b.extracted_price || 0))[0]
  const substitutionSavings = Math.max(0, total - (cheapest?.extracted_price || total))

  const insights: QuickySavingsInsight[] = [
    {
      type: 'substitution',
      title: 'Smart substitutions',
      description: 'Swap premium-priced items with close value matches.',
      potential_savings: Math.round(substitutionSavings * 0.2),
    },
    {
      type: 'bundle',
      title: 'Bundle nearby needs',
      description: 'Combine related pantry or snack items to reduce repeat delivery costs.',
      potential_savings: Math.round(total * 0.06),
    },
    {
      type: 'bulk_pack',
      title: 'Bulk pack advantage',
      description: 'Use larger packs for repeat-use essentials where shelf life allows.',
      potential_savings: Math.round(total * 0.08),
    },
  ]

  return insights.filter((saving) => saving.potential_savings > 0)
}

function sanitizeSavings(savings: QuickySavingsInsight[] | undefined, cartItems: QuickyCartItem[], products: SerpProduct[]) {
  const fallback = buildSavings(cartItems, products)
  if (!savings?.length) return fallback
  return savings.slice(0, 4).map((saving, index) => ({
    type: normalizeSavingsType(saving.type || fallback[index]?.type),
    title: saving.title || fallback[index]?.title || 'Savings opportunity',
    description: saving.description || fallback[index]?.description || 'Quicky found a way to reduce spend.',
    potential_savings: Math.max(0, Math.round(Number(saving.potential_savings) || fallback[index]?.potential_savings || 0)),
  }))
}

function normalizeSavingsType(type: QuickySavingsInsight['type'] | undefined): QuickySavingsInsight['type'] {
  if (type === 'bundle' || type === 'bulk_pack' || type === 'substitution') return type
  return 'substitution'
}

function normalizeScores(scores: Partial<QuickyScores> | undefined, total: number, budget: number | null, tier: QuickyCartTier): QuickyScores {
  const efficiency = budget ? Math.round(Math.max(0, Math.min(100, 100 - Math.abs(budget - total) / budget * 100))) : 86
  const defaults: Record<QuickyCartTier, QuickyScores> = {
    economy: { value: 94, quality: 74, budget_efficiency: Math.max(efficiency, 88) },
    balanced: { value: 88, quality: 86, budget_efficiency: efficiency },
    premium: { value: 76, quality: 94, budget_efficiency: Math.max(60, efficiency - 10) },
  }

  return {
    value: clampScore(scores?.value ?? defaults[tier].value),
    quality: clampScore(scores?.quality ?? defaults[tier].quality),
    budget_efficiency: clampScore(scores?.budget_efficiency ?? defaults[tier].budget_efficiency),
  }
}

export function buildCartStory(intent: QuickyIntent, variant: Pick<QuickyCartVariant, 'tier' | 'cart_items' | 'total_cost'>) {
  const people = intent.people_count ? ` for ${intent.people_count}` : ''
  const lead = `${capitalize(variant.tier)} cart for ${intent.occasion}${people}`
  const categoryText = intent.shopping_categories.slice(0, 3).join(', ') || 'essentials'
  const spendText = intent.budget ? `${formatRupees(variant.total_cost)} against ${formatRupees(intent.budget)}` : formatRupees(variant.total_cost)
  
  let pattern = 'Balanced basket with best value products.'
  if (intent.urgency === 'emergency') pattern = 'Prioritized ultra-fast delivery and relief essentials.'
  if (intent.purchase_type === 'goal') pattern = 'Selected items mapped strictly to dietary and nutrition goals.'
  
  return `${lead}: covers ${categoryText} at ${spendText}. ${pattern}`
}

export function calculateConfidence(items: QuickyCartItem[], products: SerpProduct[], budget: number | null) {
  if (!items.length) return 35
  const catalogCoverage = Math.min(products.length / Math.max(items.length * 3, 1), 1) * 25
  const averageQuality = items.reduce((sum, item) => {
    const source = products.find((product) => getProductId(product) === item.product_id)
    return sum + Math.min((source?.rating || 4) / 5, 1)
  }, 0) / items.length * 35
  const budgetFit = budget ? Math.max(0, 1 - Math.abs(budget - getTotal(items)) / budget) * 25 : 20
  const rationaleCoverage = items.filter((item) => item.rationale).length / items.length * 15
  return clampScore(catalogCoverage + averageQuality + budgetFit + rationaleCoverage)
}

export function buildSubscriptionSuggestions(items: QuickyCartItem[]): QuickySubscriptionSuggestion[] {
  return items
    .map((item) => {
      const title = item.title.toLowerCase()
      const schedule = inferSchedule(title)
      if (!schedule) return null
      return {
        product_id: item.product_id,
        title: item.title,
        schedule,
        reason: getSubscriptionReason(title, schedule),
      }
    })
    .filter((suggestion): suggestion is QuickySubscriptionSuggestion => Boolean(suggestion))
    .slice(0, 4)
}

function sanitizeSubscriptionSuggestions(suggestions: QuickySubscriptionSuggestion[], items: QuickyCartItem[]) {
  const itemMap = new Map(items.map((item) => [item.product_id, item]))
  return suggestions
    .filter((suggestion) => itemMap.has(suggestion.product_id))
    .map((suggestion) => ({
      ...suggestion,
      title: itemMap.get(suggestion.product_id)?.title || suggestion.title,
      schedule: normalizeSchedule(suggestion.schedule),
      reason: suggestion.reason || 'Useful recurring essential.',
    }))
}

function inferSchedule(title: string): QuickySchedule | null {
  if (/milk|bread|curd|eggs/.test(title)) return 'every_7_days'
  if (/rice|atta|dal|oil|tea|coffee|sugar/.test(title)) return 'monthly_first'
  if (/protein|oats|muesli|peanut butter/.test(title)) return 'monthly_first'
  if (/biscuit|snack|namkeen/.test(title)) return 'every_14_days'
  return null
}

function normalizeSchedule(schedule: QuickySchedule): QuickySchedule {
  if (schedule === 'daily' || schedule === 'every_7_days' || schedule === 'every_14_days' || schedule === 'monthly_first') return schedule
  return 'every_7_days'
}

function getSubscriptionReason(title: string, schedule: QuickySchedule) {
  if (/milk|bread/.test(title)) return 'Fresh staple that is usually replenished weekly.'
  if (/rice|atta|dal|oil/.test(title)) return 'Pantry staple suited to a monthly auto-restock.'
  if (/protein/.test(title)) return 'Fitness staple that works well as a monthly repeat.'
  if (schedule === 'every_14_days') return 'Snack rotation that can be restocked fortnightly.'
  return 'Repeat-use item Quicky can reorder automatically.'
}

function getTotal(items: QuickyCartItem[]) {
  return items.reduce((sum, item) => sum + item.total_price, 0)
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)))
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function titleCase(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => capitalize(word))
    .join(' ')
}

function getVariantSummary(tier: QuickyCartTier) {
  if (tier === 'economy') return 'Lowest practical spend with essentials prioritized.'
  if (tier === 'premium') return 'Higher quality signals, stronger brands and richer choices.'
  return 'Best all-round balance of price, quality and coverage.'
}