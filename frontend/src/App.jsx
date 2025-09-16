import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Route, Switch } from 'wouter'
import { Toaster } from '@/components/ui/toaster'
import { WhatsAppFloat } from '@/components/ui/whatsapp-float'
import { AuthProvider } from '@/lib/auth'

// Pages
import Home from '@/pages/home'
import Properties from '@/pages/properties'
import PropertyDetail from '@/pages/property-detail'
import Team from '@/pages/team'
import Blog from '@/pages/blog'
import BlogPost from '@/pages/blog-post'
import Contact from '@/pages/contact'
import Login from '@/pages/login'
import NotFound from '@/pages/not-found'

// Admin Pages
import Dashboard from '@/pages/admin/dashboard'
import AdminProperties from '@/pages/admin/properties'
import AdminTeam from '@/pages/admin/team'
import AdminBlog from '@/pages/admin/blog'
import AdminHeroSlides from '@/pages/admin/hero-slides'
import AdminLeads from '@/pages/admin/leads'
import AdminSettings from '@/pages/admin/settings'

// Layout Components
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import AdminLayout from '@/components/layout/admin-layout'
import ProtectedRoute from '@/components/protected-route'

// Global fetch function for API calls
const apiRequest = async (url, options = {}) => {
  const apiBase = import.meta.env.VITE_API_URL?.trim()
  const fullUrl = url.startsWith('http') ? url : apiBase ? `${apiBase}${url.startsWith('/') ? '' : '/'}${url}` : url
  
  const response = await fetch(fullUrl, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  
  return response.json()
}

// Query Client Setup with proper default queryFn
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: ({ queryKey }) => apiRequest(queryKey[0]),
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (updated from deprecated cacheTime)
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="min-h-screen bg-background text-foreground">
          <Switch>
            {/* Admin Routes - Protected with Admin Layout */}
            <Route path="/admin">{() => <ProtectedRoute><AdminLayout><Dashboard /></AdminLayout></ProtectedRoute>}</Route>
            <Route path="/admin/dashboard">{() => <ProtectedRoute><AdminLayout><Dashboard /></AdminLayout></ProtectedRoute>}</Route>
            <Route path="/admin/properties">{() => <ProtectedRoute><AdminLayout><AdminProperties /></AdminLayout></ProtectedRoute>}</Route>
            <Route path="/admin/team">{() => <ProtectedRoute><AdminLayout><AdminTeam /></AdminLayout></ProtectedRoute>}</Route>
            <Route path="/admin/blog">{() => <ProtectedRoute><AdminLayout><AdminBlog /></AdminLayout></ProtectedRoute>}</Route>
            <Route path="/admin/hero-slides">{() => <ProtectedRoute><AdminLayout><AdminHeroSlides /></AdminLayout></ProtectedRoute>}</Route>
            <Route path="/admin/leads">{() => <ProtectedRoute><AdminLayout><AdminLeads /></AdminLayout></ProtectedRoute>}</Route>
            <Route path="/admin/settings">{() => <ProtectedRoute><AdminLayout><AdminSettings /></AdminLayout></ProtectedRoute>}</Route>
            
            {/* Public Routes with Public Layout */}
            <Route path="/">{() => <><Header /><main><Home /></main><Footer /><WhatsAppFloat /></>}</Route>
            <Route path="/properties">{() => <><Header /><main><Properties /></main><Footer /><WhatsAppFloat /></>}</Route>
            <Route path="/property/:slug">{(params) => <><Header /><main><PropertyDetail {...params} /></main><Footer /><WhatsAppFloat /></>}</Route>
            <Route path="/team">{() => <><Header /><main><Team /></main><Footer /><WhatsAppFloat /></>}</Route>
            <Route path="/blog">{() => <><Header /><main><Blog /></main><Footer /><WhatsAppFloat /></>}</Route>
            <Route path="/blog/:slug">{(params) => <><Header /><main><BlogPost {...params} /></main><Footer /><WhatsAppFloat /></>}</Route>
            <Route path="/contact">{() => <><Header /><main><Contact /></main><Footer /><WhatsAppFloat /></>}</Route>
            <Route path="/login">{() => <><Header /><main><Login /></main><Footer /><WhatsAppFloat /></>}</Route>
            
            {/* 404 Route */}
            <Route>{() => <><Header /><main><NotFound /></main><Footer /><WhatsAppFloat /></>}</Route>
          </Switch>
          <Toaster />
        </div>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App