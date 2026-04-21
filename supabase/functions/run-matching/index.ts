import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0"

// Import math logic (Haversine for distance)
function degreesToRadians(degrees: number) {
    return degrees * (Math.PI / 180)
}

function getDistanceInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371 // Radius of the earth in km
    const dLat = degreesToRadians(lat2 - lat1)
    const dLon = degreesToRadians(lon2 - lon1)
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(degreesToRadians(lat1)) * Math.cos(degreesToRadians(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
}

const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const supabase = createClient(supabaseUrl, supabaseKey)

// ── LovIA Matching Engine V2 (Readiness & Saftey First) ──
Deno.serve(async (req) => {
    try {
        console.log("Iniciando Motor de Matching V2 (Readiness-First)...")

        // 1. Fetch only users who have COMPLETE onboarding AND are active AND have high Readiness
        // We join public_profiles, private_profiles, and assessment_scores
        const { data: candidates, error: fetchError } = await supabase
            .from('public_profiles')
            .select(`
                id, 
                alias, 
                gender, 
                seeking, 
                relationship_intent,
                private_profiles ( lat, lng, account_status, max_distance_km, accepts_children, has_children ),
                assessment_scores ( readiness_score, needs_support, compatibility_factors )
            `)
            .eq('onboarding_completed', true)

        if (fetchError) throw fetchError

        // 2. Filter out anyone paused or needing support (Readiness Gate)
        const activeCandidates = candidates?.filter(c =>
            c.private_profiles?.account_status === 'active' &&
            c.assessment_scores?.needs_support === false && 
            (c.assessment_scores?.readiness_score || 0) >= 50
        ) || []

        console.log(`Candidatos aptos (Readiness Válido): ${activeCandidates.length}`)

        const newMatches: any[] = []

        // 3. Match calculation (N^2 naive for MVP)
        for (let i = 0; i < activeCandidates.length; i++) {
            for (let j = i + 1; j < activeCandidates.length; j++) {
                const userA = activeCandidates[i]
                const userB = activeCandidates[j]

                // Rule 1: Gender / Seeking 
                const aSeeksB = userA.seeking.includes(userB.gender) || userA.seeking.includes('Todos')
                const bSeeksA = userB.seeking.includes(userA.gender) || userB.seeking.includes('Todos')
                if (!aSeeksB || !bSeeksA) continue

                // Rule 2: Relationship Intent
                if (userA.relationship_intent === 'explore' && userB.relationship_intent === 'long_term' ||
                    userB.relationship_intent === 'explore' && userA.relationship_intent === 'long_term') {
                    continue
                }

                // Rule 3: Advanced Preferences (Children)
                const aAcceptsBChildren = userA.private_profiles?.accepts_children ?? true
                const bAcceptsAChildren = userB.private_profiles?.accepts_children ?? true
                if (!aAcceptsBChildren && userB.private_profiles?.has_children) continue
                if (!bAcceptsAChildren && userA.private_profiles?.has_children) continue

                // Rule 4: Distance
                const latA = userA.private_profiles?.lat
                const lngA = userA.private_profiles?.lng
                const latB = userB.private_profiles?.lat
                const lngB = userB.private_profiles?.lng
                
                const aMaxDistance = userA.private_profiles?.max_distance_km ?? 50
                const bMaxDistance = userB.private_profiles?.max_distance_km ?? 50
                
                if (latA && lngA && latB && lngB) {
                    const distance = getDistanceInKm(latA, lngA, latB, lngB)
                    // Ambas partes deben tolerar la distancia
                    if (distance > aMaxDistance || distance > bMaxDistance) continue
                }

                // Rule 4: Compatibility Score (Average of their readiness for MVP 2 baseline)
                // En un futuro tomaremos compatibility_factors para un producto escalar.
                const aReadiness = userA.assessment_scores?.readiness_score || 0
                const bReadiness = userB.assessment_scores?.readiness_score || 0
                const baseCompatibility = Math.round((aReadiness + bReadiness) / 2)

                // Minimum threshold to suggest match
                if (baseCompatibility >= 50) {
                    newMatches.push({
                        user_a_id: userA.id,
                        user_b_id: userB.id,
                        compatibility_score: baseCompatibility,
                        current_level: 1,
                        status: 'active'
                    })
                }
            }
        }

        // 4. Batch Insert Matches (Ignoring conflicts to avoid duplicates)
        if (newMatches.length > 0) {
            console.log(`Insertando ${newMatches.length} posibles matches...`)
            const { error: insertError } = await supabase
                .from('matches')
                .upsert(newMatches, { onConflict: 'user_a_id, user_b_id', ignoreDuplicates: true })
            if (insertError) throw insertError
        }

        return new Response(JSON.stringify({
            success: true,
            candidatesEvaluated: activeCandidates.length,
            matchesFound: newMatches.length
        }), {
            headers: { 'Content-Type': 'application/json' },
            status: 200
        })

    } catch (err: any) {
        console.error("Match Engine Error:", err)
        return new Response(JSON.stringify({ error: err.message }), { status: 500 })
    }
})
