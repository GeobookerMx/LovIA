import { Navigate } from 'react-router-dom'

// Legacy article URLs cannot expose unreviewed scientific claims.
export default function BlogPost() {
  return <Navigate to="/community/blog" replace />
}
