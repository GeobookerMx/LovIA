import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from './stores/authStore'
import ProtectedRoute from './components/auth/ProtectedRoute'
import UserLayout from './components/layout/UserLayout'
import Landing from './features/auth/Landing'
import Login from './features/auth/Login'
import Register from './features/auth/Register'
import OnboardingFlow from './features/onboarding/OnboardingFlow'
import Home from './features/user-dashboard/Home'
import MatchesList from './features/user-dashboard/MatchesList'
import MatchDetail from './features/user-dashboard/MatchDetail'
import ImprovementPage from './features/user-dashboard/ImprovementPage'
import SparkPage from './features/user-dashboard/SparkPage'
import CommunityPage from './features/user-dashboard/CommunityPage'
import ProfilePage from './features/user-dashboard/ProfilePage'
import VideoCall from './components/matching/VideoCall'
import MeetingPlan from './components/matching/MeetingPlan'
import PostEncounterReview from './components/matching/PostEncounterReview'
import PricingPage from './features/subscription/PricingPage'
import VerificationFlow from './features/verification/VerificationFlow'
import FrustrationTolerance from './features/evaluations/FrustrationTolerance'
import EmotionalRegulation from './features/evaluations/EmotionalRegulation'
import MentalCheckIn from './components/shared/MentalCheckIn'
import AdminLayout from './features/admin-dashboard/AdminLayout'
import Overview from './features/admin-dashboard/Overview'
import UsersManager from './features/admin-dashboard/UsersManager'
import ContentManager from './features/admin-dashboard/ContentManager'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
})

function AppRoutes() {
  const initialize = useAuthStore((s) => s.initialize)

  useEffect(() => {
    initialize()
  }, [initialize])

  return (
    <>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected */}
        <Route element={<ProtectedRoute />}>
          <Route path="/onboarding" element={<OnboardingFlow />} />

          {/* Full-screen overlays (no tab bar) */}
          <Route path="/matches/:id/call" element={<VideoCall />} />

          {/* User Dashboard (with tab bar) */}
          <Route element={<UserLayout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/matches" element={<MatchesList />} />
            <Route path="/matches/:id" element={<MatchDetail />} />
            <Route path="/matches/:id/meeting" element={<MeetingPlan />} />
            <Route path="/matches/:id/review" element={<PostEncounterReview />} />
            <Route path="/spark" element={<SparkPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/improvement" element={<ImprovementPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/verification" element={<VerificationFlow />} />
            <Route path="/evaluations/frustration" element={<FrustrationTolerance />} />
            <Route path="/evaluations/regulation" element={<EmotionalRegulation />} />
          </Route>

          {/* Admin Dashboard */}
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<Overview />} />
            <Route path="/admin/users" element={<UsersManager />} />
            <Route path="/admin/content" element={<ContentManager />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Global overlays */}
      <MentalCheckIn />
    </>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App


