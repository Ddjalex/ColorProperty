import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/lib/auth'
import AdminSidebar from '@/components/admin/sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Building, Users, FileText, MessageSquare, Plus, Eye, Edit, Trash2 } from 'lucide-react'
import { Link } from 'wouter'
import { formatCurrency, formatDate, getImageUrl } from '@/lib/utils'
import type { Property, Lead, TeamMember, BlogPost } from '@shared/schema'

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth()

  const { data: propertiesData } = useQuery<{ properties: Property[], total: number }>({
    queryKey: ['/api/properties', { includeAllStatuses: 'true' }],
    enabled: isAuthenticated,
  })
  
  const properties = propertiesData?.properties || []

  const { data: leads = [] } = useQuery<Lead[]>({
    queryKey: ['/api/leads'],
    enabled: isAuthenticated,
  })

  const { data: teamMembers = [] } = useQuery<TeamMember[]>({
    queryKey: ['/api/team'],
    enabled: isAuthenticated,
  })

  const { data: blogPosts = [] } = useQuery<BlogPost[]>({
    queryKey: ['/api/blog'],
    enabled: isAuthenticated,
  })

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground mb-4">Access Denied</h1>
              <p className="text-muted-foreground mb-6">
                Please log in to access the admin dashboard.
              </p>
              <Link href="/login">
                <Button>Login</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const activeProperties = properties.filter(p => p.status === 'active')
  const newLeads = leads.filter(l => {
    const createdAt = new Date(l.createdAt!)
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    return createdAt > dayAgo
  })
  const recentProperties = properties.slice(0, 5)

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />
      
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard Overview</h1>
            <p className="text-muted-foreground">Welcome back, {user?.name}</p>
          </div>
          <Link href="/admin/properties">
            <Button data-testid="button-add-property">
              <Plus className="h-4 w-4 mr-2" />
              Add Property
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-total-properties">{properties.length}</div>
              <p className="text-xs text-muted-foreground">
                {activeProperties.length} active listings
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-team-members">{teamMembers.length}</div>
              <p className="text-xs text-muted-foreground">
                {teamMembers.filter(m => m.roleType === 'officer').length} officers, {teamMembers.filter(m => m.roleType === 'agent').length} agents
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Inquiries</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-new-inquiries">{newLeads.length}</div>
              <p className="text-xs text-muted-foreground">
                Last 24 hours
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Blog Posts</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid="stat-blog-posts">{blogPosts.length}</div>
              <p className="text-xs text-muted-foreground">
                {blogPosts.filter(p => p.status === 'published').length} published
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Properties Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Properties</CardTitle>
              <Link href="/admin/properties">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentProperties.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 text-muted-foreground font-medium">Property</th>
                      <th className="text-left py-3 text-muted-foreground font-medium">Location</th>
                      <th className="text-left py-3 text-muted-foreground font-medium">Price</th>
                      <th className="text-left py-3 text-muted-foreground font-medium">Status</th>
                      <th className="text-left py-3 text-muted-foreground font-medium">Created</th>
                      <th className="text-left py-3 text-muted-foreground font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentProperties.map((property) => (
                      <tr key={property._id} className="border-b border-border">
                        <td className="py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-muted rounded-lg overflow-hidden">
                              {property.images[0] && (
                                <img 
                                  src={getImageUrl(property.images[0], Math.abs(property._id?.charCodeAt(0) || 0))} 
                                  alt={property.title}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-foreground">{property.title}</div>
                              <div className="text-sm text-muted-foreground">
                                {property.bedrooms && `${property.bedrooms} beds`} • {property.sizeSqm} m²
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 text-muted-foreground">{property.location}</td>
                        <td className="py-4 font-medium text-foreground">{formatCurrency(property.priceETB)}</td>
                        <td className="py-4">
                          <Badge 
                            variant={property.status === 'active' ? 'default' : 'secondary'}
                            className={property.status === 'active' ? 'bg-primary' : ''}
                          >
                            {property.status}
                          </Badge>
                        </td>
                        <td className="py-4 text-muted-foreground">
                          {property.createdAt ? formatDate(property.createdAt) : 'N/A'}
                        </td>
                        <td className="py-4">
                          <div className="flex items-center space-x-2">
                            <Button variant="ghost" size="sm" data-testid={`button-view-${property._id}`}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" data-testid={`button-edit-${property._id}`}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" data-testid={`button-delete-${property._id}`}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No properties yet</p>
                <Link href="/admin/properties">
                  <Button className="mt-4">Add First Property</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
