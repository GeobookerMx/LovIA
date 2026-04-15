/**
 * LovIA! — Database Types (generated from schema.sql)
 *
 * These types mirror the Supabase database tables for type-safe queries.
 */

export interface Database {
    public: {
        Tables: {
            public_profiles: {
                Row: PublicProfile
                Insert: Omit<PublicProfile, 'created_at' | 'updated_at'>
                Update: Partial<Omit<PublicProfile, 'id' | 'created_at'>>
            }
            private_profiles: {
                Row: PrivateProfile
                Insert: Omit<PrivateProfile, 'created_at' | 'updated_at'>
                Update: Partial<Omit<PrivateProfile, 'id' | 'created_at'>>
            }
            assessment_scores: {
                Row: AssessmentScore
                Insert: Omit<AssessmentScore, 'last_calculated_at'>
                Update: Partial<Omit<AssessmentScore, 'id'>>
            }
            evaluations: {
                Row: Evaluation
                Insert: Omit<Evaluation, 'id' | 'completed_at'>
                Update: Partial<Omit<Evaluation, 'id' | 'user_id'>>
            }
            matches: {
                Row: Match
                Insert: Omit<Match, 'id' | 'created_at' | 'last_activity' | 'expires_at'>
                Update: Partial<Omit<Match, 'id' | 'user_a_id' | 'user_b_id' | 'created_at'>>
            }
            messages: {
                Row: Message
                Insert: Omit<Message, 'id' | 'created_at' | 'read_at'>
                Update: Partial<Omit<Message, 'id' | 'created_at'>>
            }
            subscriptions: {
                Row: Subscription
                Insert: Omit<Subscription, 'id' | 'created_at' | 'updated_at'>
                Update: Partial<Omit<Subscription, 'id' | 'user_id' | 'created_at'>>
            }
            verification_steps: {
                Row: VerificationStep
                Insert: Omit<VerificationStep, 'id' | 'created_at'>
                Update: Partial<Omit<VerificationStep, 'id' | 'user_id'>>
            }
            reports: {
                Row: Report
                Insert: Omit<Report, 'id' | 'created_at'>
                Update: Partial<Omit<Report, 'id' | 'reporter_id' | 'created_at'>>
            }
            encounter_reviews: {
                Row: EncounterReview
                Insert: Omit<EncounterReview, 'id' | 'created_at'>
                Update: Partial<Omit<EncounterReview, 'id' | 'reviewer_id' | 'created_at'>>
            }
            emotional_logs: {
                Row: EmotionalLog
                Insert: Omit<EmotionalLog, 'id' | 'created_at'>
                Update: Partial<Omit<EmotionalLog, 'id' | 'user_id' | 'created_at'>>
            }
        }
    }
}

// ── Table Row Types ──

export interface PublicProfile {
    id: string
    alias: string
    avatar_url: string
    age: number | null
    gender: string
    seeking: string[]
    city: string
    relationship_intent: 'long_term' | 'casual' | 'friendship' | 'explore'
    trust_level: 'bronze' | 'silver' | 'gold' | 'diamond'
    tier: 'free' | 'arquitecto' | 'ingeniero' | 'diamante'
    visibility_mode: 'classic' | 'gradual' | 'essence'
    onboarding_completed: boolean
    created_at: string
    updated_at: string
}

export interface PrivateProfile {
    id: string
    full_name: string
    has_children: boolean | null
    lives_with_dependents: boolean | null
    willing_to_relocate: boolean | null
    max_distance_km: number
    accepts_children: boolean
    lat: number | null
    lng: number | null
    verified_email: boolean
    verified_ine: boolean
    verified_selfie: boolean
    account_status: 'active' | 'paused' | 'review' | 'banned'
    emergency_contact_1_name: string | null
    emergency_contact_1_phone: string | null
    emergency_contact_2_name: string | null
    emergency_contact_2_phone: string | null
    created_at: string
    updated_at: string
}

export interface AssessmentScore {
    id: string
    readiness_score: number
    compatibility_factors: Record<string, number>
    risk_flags: string[]
    needs_support: boolean
    last_calculated_at: string
}

export interface Evaluation {
    id: string
    user_id: string
    test_type: 'stroop' | 'digit_span' | 'frustration_tolerance' | 'emotional_regulation'
    score: number
    passed: boolean
    details: Record<string, number | string>
    completed_at: string
}

export interface Match {
    id: string
    user_a_id: string
    user_b_id: string
    current_level: 1 | 2 | 3 | 4 | 5
    user_a_accepted: boolean
    user_b_accepted: boolean
    compatibility_score: number
    status: 'active' | 'archived' | 'completed' | 'declined'
    created_at: string
    last_activity: string
    expires_at: string
}

export interface Message {
    id: string
    match_id: string
    sender_id: string
    content: string
    read_at: string | null
    created_at: string
}

export interface Subscription {
    id: string
    user_id: string
    tier: 'free' | 'arquitecto' | 'ingeniero' | 'diamante'
    stripe_customer_id: string | null
    stripe_subscription_id: string | null
    current_period_start: string | null
    current_period_end: string | null
    cancel_at_period_end: boolean
    status: 'active' | 'past_due' | 'canceled' | 'incomplete'
    created_at: string
    updated_at: string
}

export interface VerificationStep {
    id: string
    user_id: string
    step_type: 'email' | 'selfie' | 'ine' | 'video'
    status: 'pending' | 'in_review' | 'approved' | 'rejected'
    document_url: string | null
    reviewed_by: string | null
    reviewed_at: string | null
    created_at: string
}

export interface Report {
    id: string
    reporter_id: string
    reported_id: string
    match_id: string | null
    reason: string
    details: string | null
    status: 'pending' | 'investigating' | 'resolved' | 'dismissed'
    resolved_by: string | null
    resolved_at: string | null
    created_at: string
}

export interface EncounterReview {
    id: string
    match_id: string
    reviewer_id: string
    rating: number
    felt_safe: boolean
    feedback: string | null
    created_at: string
}

export interface EmotionalLog {
    id: string
    user_id: string
    mood: string
    score: number
    context: string
    notes: string | null
    created_at: string
}

