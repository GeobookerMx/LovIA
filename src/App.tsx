import { useEffect, Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from './stores/authStore'
import { Loader2 } from 'lucide-react'
import ErrorBoundary from './components/shared/ErrorBoundary'
import OfflineBanner from './components/shared/OfflineBanner'

// ─── Eagerly loaded (critical path) ───
import ProtectedRoute from './components/auth/ProtectedRoute'
import UserLayout from './components/layout/UserLayout'
import Landing from './features/auth/Landing'
import Login from './features/auth/Login'
import Register from './features/auth/Register'
import Home from './features/user-dashboard/Home'
import GuideChatbot from './features/guide/GuideChatbot'
const AuthCallbackPage = lazy(() => import('./features/auth/AuthCallbackPage'))
import './index.css'

// ─── Lazy loaded: Onboarding ───
const OnboardingFlow = lazy(() => import('./features/onboarding/OnboardingFlow'))

// ─── Lazy loaded: Matching & Encounters ───
const MatchesList = lazy(() => import('./features/user-dashboard/MatchesList'))
const MatchDetail = lazy(() => import('./features/user-dashboard/MatchDetail'))
const VideoCall = lazy(() => import('./components/matching/VideoCall'))
const DateReadinessCheck = lazy(() => import('./features/matching/DateReadinessCheck'))
const MeetingPlan = lazy(() => import('./components/matching/MeetingPlan'))
const PostEncounterReview = lazy(() => import('./components/matching/PostEncounterReview'))
const ChatRoom = lazy(() => import('./features/matching/ChatRoom'))
const SelfieVerification = lazy(() => import('./features/verification/SelfieVerification'))
const RadarMap = lazy(() => import('./features/user-dashboard/RadarMap'))

// ─── Lazy loaded: Profile & Charts ───
const ProfilePage = lazy(() => import('./features/user-dashboard/ProfilePage'))
const EmergencyContacts = lazy(() => import('./features/user-dashboard/EmergencyContacts'))
const ImprovementPage = lazy(() => import('./features/user-dashboard/ImprovementPage'))
const GraphPage = lazy(() => import('./features/user-dashboard/GraphPage'))
const FrequencyPage = lazy(() => import('./features/user-dashboard/FrequencyPage'))
const FactorsPage = lazy(() => import('./features/user-dashboard/FactorsPage'))
const SettingsPage = lazy(() => import('./features/user-dashboard/SettingsPage'))
const EditProfilePage = lazy(() => import('./features/user-dashboard/EditProfilePage'))
const LegalPage = lazy(() => import('./features/user-dashboard/LegalPage'))
const SciencePage = lazy(() => import('./features/user-dashboard/SciencePage'))
const AuthorPage = lazy(() => import('./features/user-dashboard/AuthorPage'))
const BookPage = lazy(() => import('./features/user-dashboard/BookPage'))

// ─── Lazy loaded: Community ───
const JournalPage = lazy(() => import('./features/user-dashboard/JournalPage'))
const CrisisScreen = lazy(() => import('./features/user-dashboard/CrisisScreen'))
const SparkPage = lazy(() => import('./features/user-dashboard/SparkPage'))
const CommunityPage = lazy(() => import('./features/user-dashboard/CommunityPage'))
const BlogList = lazy(() => import('./features/user-dashboard/BlogList'))
const BlogPost = lazy(() => import('./features/user-dashboard/BlogPost'))
const ForumList = lazy(() => import('./features/user-dashboard/ForumList'))
const ForumThread = lazy(() => import('./features/user-dashboard/ForumThread'))
const DirectoryPage = lazy(() => import('./features/user-dashboard/DirectoryPage'))
const SpecialistRegisterPage = lazy(() => import('./features/user-dashboard/SpecialistRegisterPage'))

// ─── Lazy loaded: Admin ───
const ModulesList = lazy(() => import('./features/user-dashboard/ModulesList'))
const ModuleDetail = lazy(() => import('./features/user-dashboard/ModuleDetail'))

// ─── Lazy loaded: Evaluations (heavy game components) ───
const FrustrationTolerance = lazy(() => import('./features/evaluations/FrustrationTolerance'))
const EmotionalRegulation = lazy(() => import('./features/evaluations/EmotionalRegulation'))
const StroopGame = lazy(() => import('./features/evaluations/StroopGame'))
const DigitSpanGame = lazy(() => import('./features/evaluations/DigitSpanGame'))

// ─── Lazy loaded: Subscription & Verification ───
const PricingPage = lazy(() => import('./features/subscription/PricingPage'))
const VerificationFlow = lazy(() => import('./features/verification/VerificationFlow'))

// ─── Lazy loaded: Admin Dashboard ───
const AdminGuard = lazy(() => import('./features/admin-dashboard/AdminGuard'))
const AdminLayout = lazy(() => import('./features/admin-dashboard/AdminLayout'))
const Overview = lazy(() => import('./features/admin-dashboard/Overview'))
const UsersManager = lazy(() => import('./features/admin-dashboard/UsersManager'))
const ContentManager = lazy(() => import('./features/admin-dashboard/ContentManager'))
const MatchesManager = lazy(() => import('./features/admin-dashboard/MatchesManager'))
const ModerationQueue = lazy(() => import('./features/admin-dashboard/ModerationQueue'))
const DirectoryManager = lazy(() => import('./features/admin-dashboard/DirectoryManager'))
const FinanceDashboard = lazy(() => import('./features/admin-dashboard/FinanceDashboard'))
const SystemConfig = lazy(() => import('./features/admin-dashboard/SystemConfig'))

// ─── Lazy loaded: Global overlay ───
const MentalCheckIn = lazy(() => import('./components/shared/MentalCheckIn'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
})

function LoadingFallback() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '40vh',
    }}>
      <Loader2
        className="animate-spin"
        size={28}
        color="var(--love-rose)"
        aria-label="Cargando..."
      />
    </div>
  )
}

function AuthGatedGuide() {
  const user = useAuthStore((s) => s.user)
  if (!user) return null
  return <GuideChatbot />
}

function AppRoutes() {
  const initialize = useAuthStore((s) => s.initialize)

  useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />

          {/* Protected */}
          <Route element={<ProtectedRoute />}>
            <Route path="/onboarding" element={<OnboardingFlow />} />

            {/* Full-screen overlays (no tab bar) */}
            <Route path="/matches/:id/call" element={<VideoCall />} />
            <Route path="/matches/:id/chat" element={<ChatRoom />} />

            {/* User Dashboard (with tab bar) */}
            <Route element={<UserLayout />}>
              <Route path="/home" element={<Home />} />
              <Route path="/radar" element={<RadarMap />} />
              <Route path="/matches" element={<MatchesList />} />
              <Route path="/matches/:id" element={<MatchDetail />} />
              <Route path="/matches/:id/date-readiness" element={<DateReadinessCheck />} />
              <Route path="/matches/:id/meeting" element={<MeetingPlan />} />
              <Route path="/matches/:id/review" element={<PostEncounterReview />} />
              <Route path="/spark" element={<SparkPage />} />
              <Route path="/community" element={<CommunityPage />} />
              <Route path="/community/blog" element={<BlogList />} />
              <Route path="/community/blog/:postId" element={<BlogPost />} />
              <Route path="/community/forum" element={<ForumList />} />
              <Route path="/community/forum/:threadId" element={<ForumThread />} />
              <Route path="/community/directory" element={<DirectoryPage />} />
              <Route path="/community/directory/register" element={<SpecialistRegisterPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/selfie-verification" element={<SelfieVerification />} />
              <Route path="/profile/emergency-contacts" element={<EmergencyContacts />} />
              <Route path="/profile/improvement" element={<ImprovementPage />} />
              <Route path="/profile/graph" element={<GraphPage />} />
              <Route path="/profile/frequency" element={<FrequencyPage />} />
              <Route path="/profile/factors" element={<FactorsPage />} />
              <Route path="/profile/settings" element={<SettingsPage />} />
              <Route path="/profile/edit" element={<EditProfilePage />} />
              <Route path="/profile/journal" element={<JournalPage />} />
              <Route path="/crisis" element={<CrisisScreen />} />
              <Route path="/profile/legal" element={<LegalPage />} />
              <Route path="/profile/science" element={<SciencePage />} />
              <Route path="/profile/creator" element={<AuthorPage />} />
              <Route path="/book" element={<BookPage />} />
              <Route path="/modules" element={<ModulesList />} />
              <Route path="/modules/:moduleId" element={<ModuleDetail />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/verification" element={<VerificationFlow />} />
              <Route path="/evaluations/frustration" element={<FrustrationTolerance />} />
              <Route path="/evaluations/regulation" element={<EmotionalRegulation />} />
              <Route path="/evaluations/stroop" element={<StroopGame />} />
              <Route path="/evaluations/digit-span" element={<DigitSpanGame />} />
            </Route>

            {/* Admin Dashboard */}
            <Route element={<AdminGuard />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<Overview />} />
                <Route path="/admin/users" element={<UsersManager />} />
                <Route path="/admin/matches" element={<MatchesManager />} />
                <Route path="/admin/moderation" element={<ModerationQueue />} />
                <Route path="/admin/content" element={<ContentManager />} />
                <Route path="/admin/directory" element={<DirectoryManager />} />
                <Route path="/admin/finance" element={<FinanceDashboard />} />
                <Route path="/admin/system" element={<SystemConfig />} />
              </Route>
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>

      {/* Global overlays */}
      <Suspense fallback={null}>
        <MentalCheckIn />
      </Suspense>
      <AuthGatedGuide />
    </ErrorBoundary>
  )
}


function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <OfflineBanner />
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
