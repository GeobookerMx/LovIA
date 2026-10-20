import { Navigate } from 'react-router-dom'

// Legacy links to sample threads return to the clearly labelled editorial prompts.
export default function ForumThread() {
  return <Navigate to="/community/forum" replace />
}
