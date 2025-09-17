import { useState, useEffect } from 'react'
import { Link } from 'wouter'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { 
  Home, 
  Users, 
  FileText, 
  Image, 
  MessageSquare, 
  Settings,
  BarChart3,
  Plus
} from 'lucide-react'

export default function Dashboard() {
  const [stats, setStats] = useState({
    properties: 0,
    heroSlides: 0,
    teamMembers: 0,
    blogPosts: 0,
    leads: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('authToken')
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }

      // Use shared apiRequest helper for consistent API calls
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

      // Fetch optimized stats from endpoints
      const [propertiesStats, heroSlidesStats, team, blog, leads] = await Promise.all([
        apiRequest('/api/properties/stats'),
        apiRequest('/api/hero-slides/stats'),
        apiRequest('/api/team'),
        apiRequest('/api/blog'),
        apiRequest('/api/leads', { headers })
      ])

      setStats({
        properties: propertiesStats?.total || 0,
        heroSlides: heroSlidesStats?.total || 0,
        teamMembers: team?.length || 0,
        blogPosts: blog?.length || 0,
        leads: leads?.length || 0
      })
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Properties',
      value: stats.properties,
      description: 'Active property listings',
      icon: Home,
      link: '/admin/properties',
      color: 'text-blue-600'
    },
    {
      title: 'Hero Slides',
      value: stats.heroSlides,
      description: 'Homepage hero slides',
      icon: Image,
      link: '/admin/hero-slides',
      color: 'text-purple-600'
    },
    {
      title: 'Team Members',
      value: stats.teamMembers,
      description: 'Team member profiles',
      icon: Users,
      link: '/admin/team',
      color: 'text-green-600'
    },
    {
      title: 'Blog Posts',
      value: stats.blogPosts,
      description: 'Published blog posts',
      icon: FileText,
      link: '/admin/blog',
      color: 'text-orange-600'
    },
    {
      title: 'Leads',
      value: stats.leads,
      description: 'Customer inquiries',
      icon: MessageSquare,
      link: '/admin/leads',
      color: 'text-red-600'
    }
  ]

  const quickActions = [
    {
      title: 'Add New Property',
      description: 'List a new property for sale or rent',
      icon: Plus,
      link: '/admin/properties',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: 'Manage Hero Slides',
      description: 'Update homepage hero slider content',
      icon: Image,
      link: '/admin/hero-slides',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      title: 'Write Blog Post',
      description: 'Create new blog content',
      icon: FileText,
      link: '/admin/blog',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: 'Site Settings',
      description: 'Configure website settings',
      icon: Settings,
      link: '/admin/settings',
      color: 'bg-gray-500 hover:bg-gray-600'
    }
  ]

  if (loading) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Dashboard</h1>
            <p className="text-lg text-muted-foreground mb-8">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-lg text-muted-foreground">
            Welcome back! Manage your properties and content.
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const IconComponent = stat.icon
            return (
              <Link key={index} href={stat.link}>
                <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {stat.title}
                    </CardTitle>
                    <IconComponent className={`h-4 w-4 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">
                      {stat.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon
              return (
                <Link key={index} href={action.link}>
                  <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-4`}>
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-lg">{action.title}</CardTitle>
                      <CardDescription>{action.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                System Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Properties</span>
                  <span className="font-medium">{stats.properties}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Hero Slides</span>
                  <span className="font-medium">{stats.heroSlides}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Team Members</span>
                  <span className="font-medium">{stats.teamMembers}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Blog Posts</span>
                  <span className="font-medium">{stats.blogPosts}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Customer Inquiries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="text-3xl font-bold text-blue-600 mb-2">{stats.leads}</div>
                <p className="text-sm text-muted-foreground mb-4">
                  Total customer leads
                </p>
                <Link href="/admin/leads">
                  <Button>View All Leads</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}