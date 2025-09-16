import { useAuth } from '@/lib/auth'
import { useLocation } from 'wouter'
import { useEffect } from 'react'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth()
  const [, setLocation] = useLocation()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation('/login')
    }
  }, [isAuthenticated, isLoading, setLocation])

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // Only render children if authenticated
  if (!isAuthenticated) {
    return null // Will redirect to login
  }

  return children
}