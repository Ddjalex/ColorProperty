import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Route, Switch } from 'wouter'
import { Toaster } from '@/components/ui/toaster'
import { WhatsAppFloat } from '@/components/ui/whatsapp-float'

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

// Query Client Setup
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
    },
  },
})

// Global fetch function for API calls
const apiRequest = async (url, options = {}) => {
  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
  const fullUrl = url.startsWith('/api') ? `${baseURL}${url.replace('/api', '')}` : `${baseURL}${url}`
  
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

// Set the default query function
queryClient.setQueryDefaults(['default'], {
  queryFn: ({ queryKey }) => apiRequest(queryKey[0]),
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-background text-foreground">
        <Header />
        <main>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/properties" component={Properties} />
            <Route path="/property/:slug" component={PropertyDetail} />
            <Route path="/team" component={Team} />
            <Route path="/blog" component={Blog} />
            <Route path="/blog/:slug" component={BlogPost} />
            <Route path="/contact" component={Contact} />
            <Route path="/login" component={Login} />
            
            {/* Admin Routes */}
            <Route path="/admin" component={Dashboard} />
            <Route path="/admin/properties" component={AdminProperties} />
            <Route path="/admin/team" component={AdminTeam} />
            <Route path="/admin/blog" component={AdminBlog} />
            <Route path="/admin/hero-slides" component={AdminHeroSlides} />
            <Route path="/admin/leads" component={AdminLeads} />
            <Route path="/admin/settings" component={AdminSettings} />
            
            <Route component={NotFound} />
          </Switch>
        </main>
        <Footer />
        <WhatsAppFloat />
        <Toaster />
      </div>
    </QueryClientProvider>
  )
}

export default App