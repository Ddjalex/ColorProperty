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
  Plus,
  TrendingUp,
  Clock,
  MapPin,
  DollarSign,
  Activity,
  RefreshCw
} from 'lucide-react'

export default function Dashboard() {
  const [stats, setStats] = useState({
    properties: 0,
    heroSlides: 0,
    teamMembers: 0,
    blogPosts: 0,
    leads: 0
  })
  const [analytics, setAnalytics] = useState({
    summary: {
      total: 0,
      active: 0,
      sold: 0,
      rented: 0,
      availablePercentage: 0
    },
    propertyTypes: {},
    locations: [],
    priceRanges: {},
    recentProperties: []
  })
  const [loading, setLoading] = useState(true)
  const [analyticsLoading, setAnalyticsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  useEffect(() => {
    fetchStats()
    fetchAnalytics()
    
    // Set up real-time updates every 30 seconds
    const interval = setInterval(() => {
      fetchStats()
      fetchAnalytics()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('authToken')
      
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

      const data = await apiRequest('/api/properties/analytics', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      setAnalytics(data)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setAnalyticsLoading(false)
    }
  }

  const refreshData = async () => {
    setLoading(true)
    setAnalyticsLoading(true)
    await Promise.all([fetchStats(), fetchAnalytics()])
  }

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

        {/* Analytics Section */}
        <div className="space-y-8">
          {/* Header with Refresh Button */}
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Analytics & Insights</h2>
            <div className="flex items-center gap-4">
              <p className="text-sm text-muted-foreground">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
              <Button onClick={refreshData} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Property Summary Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Properties</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{analytics.summary.active}</div>
                <p className="text-xs text-muted-foreground">
                  {analytics.summary.availablePercentage}% of total inventory
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sold Properties</CardTitle>
                <DollarSign className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{analytics.summary.sold}</div>
                <p className="text-xs text-muted-foreground">
                  {analytics.summary.total > 0 ? Math.round((analytics.summary.sold / analytics.summary.total) * 100) : 0}% conversion rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rented Properties</CardTitle>
                <Home className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{analytics.summary.rented}</div>
                <p className="text-xs text-muted-foreground">
                  Rental portfolio size
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Portfolio</CardTitle>
                <BarChart3 className="h-4 w-4 text-gray-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.summary.total}</div>
                <p className="text-xs text-muted-foreground">
                  Complete inventory
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analytics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Property Types Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="h-5 w-5" />
                  Property Types
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(analytics.propertyTypes).length > 0 ? (
                      Object.entries(analytics.propertyTypes).map(([type, count]) => (
                        <div key={type} className="flex justify-between items-center">
                          <span className="text-sm font-medium capitalize">{type}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ 
                                  width: `${analytics.summary.total > 0 ? (count / analytics.summary.total) * 100 : 0}%` 
                                }}
                              ></div>
                            </div>
                            <span className="text-sm font-bold min-w-[2rem]">{count}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-center py-4">No property type data available</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Locations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Top Locations
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {analytics.locations.length > 0 ? (
                      analytics.locations.map(([location, count]) => (
                        <div key={location} className="flex justify-between items-center">
                          <span className="text-sm font-medium">{location}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-purple-600 h-2 rounded-full" 
                                style={{ 
                                  width: `${analytics.summary.total > 0 ? (count / analytics.summary.total) * 100 : 0}%` 
                                }}
                              ></div>
                            </div>
                            <span className="text-sm font-bold min-w-[2rem]">{count}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-center py-4">No location data available</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Price Range Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Price Range Distribution (ETB)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(analytics.priceRanges).map(([range, count]) => (
                      <div key={range} className="flex justify-between items-center">
                        <span className="text-sm font-medium">{range}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ 
                                width: `${analytics.summary.total > 0 ? (count / analytics.summary.total) * 100 : 0}%` 
                              }}
                            ></div>
                          </div>
                          <span className="text-sm font-bold min-w-[2rem]">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Properties Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analyticsLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {analytics.recentProperties.length > 0 ? (
                      analytics.recentProperties.map((property) => (
                        <div key={property.id} className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-sm font-medium">{property.title}</p>
                            <p className="text-xs text-muted-foreground">{property.location}</p>
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              property.status === 'active' ? 'bg-green-100 text-green-800' :
                              property.status === 'sold' ? 'bg-blue-100 text-blue-800' :
                              property.status === 'rented' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {property.status}
                            </span>
                            <p className="text-xs text-muted-foreground mt-1">
                              {property.priceETB ? `${property.priceETB.toLocaleString()} ETB` : 'Price TBD'}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-center py-4">No recent activity</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}