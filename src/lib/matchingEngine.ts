/**
 * LovIA! — Matching Engine
 *
 * Filtering pipeline + scoring per core_logic Sección 17.
 * Pipeline: geo → age → frequency ±15 → factor compatibility → risk → final score
 */

// ── Interfaces ──

export interface UserProfile {
    id: string
    frequency: number           // 0-100
    age: number
    city: string
    lat?: number
    lng?: number
    willing_to_relocate: boolean
    gender: string
    seeking: string[]
    relationship_intent: string  // 'long_term' | 'casual' | 'friendship' | 'self'
    factors: Record<string, number>   // factor_key → score (0-4)
    negative_factors: Record<string, number>
    trust_level: 'bronze' | 'silver' | 'gold' | 'diamond'
    verified_selfie: boolean
    verified_ine: boolean
    tier: 'free' | 'arquitecto' | 'ingeniero' | 'diamante'
}

export interface MatchCandidate {
    profile: UserProfile
    scores: MatchScores
    final_score: number
}

export interface MatchScores {
    frequency_compat: number    // 0-1
    factor_compat: number       // 0-1
    risk_penalty: number        // 0-1 (lower = riskier)
    confidence_bonus: number    // 0-1
}

export interface FilterConfig {
    max_distance_km: number
    age_range: [number, number]
    age_flexible: boolean
    frequency_tolerance: number  // default ±15
}

export interface ActiveMatch {
    id: string
    user_a_id: string
    user_b_id: string
    current_level: 1 | 2 | 3 | 4 | 5
    user_a_accepted: boolean
    user_b_accepted: boolean
    compatibility_score: number
    created_at: string
    last_activity: string
    expires_at: string
    status: 'active' | 'archived' | 'completed' | 'declined'
}

// ── Constants ──

const WEIGHTS = {
    frequency: 0.30,
    factors: 0.50,
    risk: 0.10,
    confidence: 0.10,
} as const

const MIN_FREQUENCY_FOR_MATCHING = 40

const LEVEL_COOLDOWNS_HOURS: Record<string, number> = {
    '1→2': 24,
    '2→3': 48,
    '3→4': 72,
    '4→5': 0,  // after encounter
}

const MATCH_EXPIRATION_DAYS = 30

// ── Pipeline Functions ──

/** Check if user qualifies for matching */
export function canAccessMatching(user: UserProfile): { eligible: boolean; reason?: string } {
    if (user.frequency < MIN_FREQUENCY_FOR_MATCHING) {
        return {
            eligible: false,
            reason: `Tu Frecuencia es ${user.frequency}. Necesitas ≥ ${MIN_FREQUENCY_FOR_MATCHING} para acceder al matching. ¡Trabaja en tus áreas de mejora!`,
        }
    }
    return { eligible: true }
}

/** Calculate distance between two coordinates (Haversine) */
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLng = ((lng2 - lng1) * Math.PI) / 180
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

/** Geo filter */
export function passesGeoFilter(user: UserProfile, candidate: UserProfile, config: FilterConfig): boolean {
    if (!user.lat || !user.lng || !candidate.lat || !candidate.lng) {
        // If no geo data, match by city name
        return user.city.toLowerCase() === candidate.city.toLowerCase() || candidate.willing_to_relocate
    }
    const dist = haversineKm(user.lat, user.lng, candidate.lat, candidate.lng)
    return dist <= config.max_distance_km || candidate.willing_to_relocate
}

/** Age filter */
export function passesAgeFilter(candidate: UserProfile, config: FilterConfig): boolean {
    const [min, max] = config.age_range
    if (candidate.age >= min && candidate.age <= max) return true
    if (config.age_flexible) {
        const margin = 3
        return candidate.age >= min - margin && candidate.age <= max + margin
    }
    return false
}

/** Frequency compatibility: 1.0 = perfect, 0.0 = incompatible */
export function frequencyCompatibility(freqA: number, freqB: number, tolerance: number): number {
    const diff = Math.abs(freqA - freqB)
    if (diff <= tolerance) {
        return 1 - diff / (tolerance * 2) // Linear decay within tolerance
    }
    return Math.max(0, 1 - diff / 50) // Rapid decay outside tolerance
}

/** Factor compatibility: cosine-similarity-like on shared factor keys */
export function factorCompatibility(factorsA: Record<string, number>, factorsB: Record<string, number>): number {
    const keys = new Set([...Object.keys(factorsA), ...Object.keys(factorsB)])
    if (keys.size === 0) return 0.5

    let dotProduct = 0
    let magA = 0
    let magB = 0

    keys.forEach((key) => {
        const a = factorsA[key] ?? 2 // default mid-range
        const b = factorsB[key] ?? 2
        dotProduct += a * b
        magA += a * a
        magB += b * b
    })

    if (magA === 0 || magB === 0) return 0.5
    return dotProduct / (Math.sqrt(magA) * Math.sqrt(magB))
}

/** Risk penalty: overlap in negative factors = higher risk → lower score */
export function riskPenalty(negA: Record<string, number>, negB: Record<string, number>): number {
    const keys = new Set([...Object.keys(negA), ...Object.keys(negB)])
    if (keys.size === 0) return 1 // no risk

    let totalRisk = 0
    keys.forEach((key) => {
        const a = negA[key] ?? 0
        const b = negB[key] ?? 0
        totalRisk += Math.max(a, b) // worst of both
    })

    const maxPossible = keys.size * 4
    return 1 - totalRisk / maxPossible // 1 = zero risk, 0 = max risk
}

/** Confidence bonus based on verification + profile completeness */
export function confidenceBonus(user: UserProfile): number {
    let score = 0
    if (user.verified_selfie) score += 0.3
    if (user.verified_ine) score += 0.3
    const factorCount = Object.keys(user.factors).length
    score += Math.min(0.2, factorCount / 50) // up to 0.2 for profile completeness
    if (user.trust_level === 'diamond') score += 0.2
    else if (user.trust_level === 'gold') score += 0.15
    else if (user.trust_level === 'silver') score += 0.1
    return Math.min(1, score)
}

/** Full pipeline: filter + score */
export function runMatchingPipeline(
    user: UserProfile,
    candidates: UserProfile[],
    config: FilterConfig,
): MatchCandidate[] {
    return candidates
        .filter((c) => c.id !== user.id)
        .filter((c) => passesGeoFilter(user, c, config))
        .filter((c) => passesAgeFilter(c, config))
        .filter((c) => frequencyCompatibility(user.frequency, c.frequency, config.frequency_tolerance) > 0.3)
        .map((c) => {
            const scores: MatchScores = {
                frequency_compat: frequencyCompatibility(user.frequency, c.frequency, config.frequency_tolerance),
                factor_compat: factorCompatibility(user.factors, c.factors),
                risk_penalty: riskPenalty(user.negative_factors, c.negative_factors),
                confidence_bonus: (confidenceBonus(user) + confidenceBonus(c)) / 2,
            }

            const final_score = Math.round(
                (WEIGHTS.frequency * scores.frequency_compat +
                    WEIGHTS.factors * scores.factor_compat +
                    WEIGHTS.risk * scores.risk_penalty +
                    WEIGHTS.confidence * scores.confidence_bonus) * 100
            )

            return { profile: c, scores, final_score }
        })
        .sort((a, b) => b.final_score - a.final_score)
}

/** Check if level progression cooldown has passed */
export function canProgressLevel(match: ActiveMatch): { can: boolean; hoursRemaining?: number } {
    const key = `${match.current_level}→${match.current_level + 1}` as string
    const cooldownHours = LEVEL_COOLDOWNS_HOURS[key]
    if (cooldownHours === undefined || cooldownHours === 0) return { can: true }

    const lastActivity = new Date(match.last_activity).getTime()
    const now = Date.now()
    const elapsed = (now - lastActivity) / (1000 * 60 * 60)

    if (elapsed >= cooldownHours) return { can: true }
    return { can: false, hoursRemaining: Math.ceil(cooldownHours - elapsed) }
}

/** Check if match is expired */
export function isMatchExpired(match: ActiveMatch): boolean {
    return new Date(match.expires_at).getTime() < Date.now()
}

export { LEVEL_COOLDOWNS_HOURS, MATCH_EXPIRATION_DAYS, MIN_FREQUENCY_FOR_MATCHING }
