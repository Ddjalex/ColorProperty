import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/lib/auth'
import { useWebSocket } from '@/hooks/use-websocket'
import AdminSidebar from '@/components/admin/sidebar'
import PropertyForm from '@/components/admin/property-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Search, Eye, Edit, Trash2 } from 'lucide-react'
import { formatCurrency, formatDate, getPropertyImageUrl } from '@/lib/utils'
import { useDeleteProperty } from '@/hooks/use-properties'
import { useToast } from '@/hooks/use-toast'
import type { Property } from '@shared/schema'

export default function AdminProperties() {
  const { isAuthenticated } = useAuth()
  const { toast } = useToast()
  
  // Connect to WebSocket for real-time updates
  useWebSocket()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [propertyTypeFilter, setPropertyTypeFilter] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingProperty, setEditingProperty] = useState<Property | null>(null)

  const { data: propertiesData, isLoading } = useQuery<{ properties: Property[], total: number }>({
    queryKey: ['/api/properties', { includeAllStatuses: 'true' }],
    enabled: isAuthenticated,
  })
  
  const properties = propertiesData?.properties || []

  const deleteProperty = useDeleteProperty()

  const filteredProperties = properties.filter(property => {
    const matchesSearch = !searchTerm || 
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.location.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = !statusFilter || statusFilter === 'all-status' || property.status === statusFilter
    const matchesType = !propertyTypeFilter || propertyTypeFilter === 'all-types' || property.propertyType === propertyTypeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })

  const handleEdit = (property: Property) => {
    setEditingProperty(property)
    setIsFormOpen(true)
  }

  const handleDelete = async (property: Property) => {
    if (window.confirm(`Are you sure you want to delete "${property.title}"?`)) {
      try {
        await deleteProperty.mutateAsync(property._id!)
        toast({
          title: "Property Deleted",
          description: "The property has been successfully deleted.",
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete property. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditingProperty(null)
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Please log in to access this page.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />
      
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Properties Management</h1>
            <p className="text-muted-foreground">Manage your property listings</p>
          </div>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-property">
                <Plus className="h-4 w-4 mr-2" />
                Add Property
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProperty ? 'Edit Property' : 'Add New Property'}
                </DialogTitle>
              </DialogHeader>
              <PropertyForm 
                property={editingProperty}
                onSuccess={handleFormClose}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search properties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-properties"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger data-testid="select-filter-status">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-status">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                  <SelectItem value="rented">Rented</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={propertyTypeFilter} onValueChange={setPropertyTypeFilter}>
                <SelectTrigger data-testid="select-filter-type">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-types">All Types</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="shop">Shop</SelectItem>
                  <SelectItem value="land">Land</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline"
                onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('all-status')
                  setPropertyTypeFilter('all-types')
                }}
                data-testid="button-clear-filters"
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Properties Table */}
        <Card>
          <CardHeader>
            <CardTitle>Properties ({filteredProperties.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading properties...</p>
              </div>
            ) : filteredProperties.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 text-muted-foreground font-medium">Property</th>
                      <th className="text-left py-3 text-muted-foreground font-medium">Type</th>
                      <th className="text-left py-3 text-muted-foreground font-medium">Location</th>
                      <th className="text-left py-3 text-muted-foreground font-medium">Price</th>
                      <th className="text-left py-3 text-muted-foreground font-medium">Status</th>
                      <th className="text-left py-3 text-muted-foreground font-medium">Created</th>
                      <th className="text-left py-3 text-muted-foreground font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProperties.map((property) => (
                      <tr key={property._id} className="border-b border-border">
                        <td className="py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-muted rounded-lg overflow-hidden">
                              {property.imageCount > 0 && (
                                <img 
                                  src={getPropertyImageUrl(property._id!, 0)} 
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
                        <td className="py-4 text-muted-foreground capitalize">{property.propertyType}</td>
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
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => window.open(`/property/${property.slug}`, '_blank')}
                              data-testid={`button-view-${property._id}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEdit(property)}
                              data-testid={`button-edit-${property._id}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDelete(property)}
                              data-testid={`button-delete-${property._id}`}
                            >
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
                <p className="text-muted-foreground">No properties found</p>
                <p className="text-muted-foreground text-sm">
                  {searchTerm || statusFilter || propertyTypeFilter 
                    ? 'Try adjusting your filters'
                    : 'Add your first property to get started'
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
