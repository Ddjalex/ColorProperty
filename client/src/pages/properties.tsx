import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import PropertyCard from '@/components/property/property-card'
import PropertyPagination from '@/components/property/pagination'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Grid, Map } from 'lucide-react'
import type { Property } from '@shared/schema'

export default function Properties() {
  const [searchTerm, setSearchTerm] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [bedroomsFilter, setBedroomsFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid')
  const [sortBy, setSortBy] = useState('latest')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12

  // Build query parameters
  const queryParams = useMemo(() => {
    const params: any = {
      page: currentPage,
      limit: itemsPerPage,
    }
    
    if (searchTerm) params.search = searchTerm
    if (locationFilter) params.location = locationFilter
    if (typeFilter && typeFilter !== 'all') params.propertyType = typeFilter
    if (bedroomsFilter && bedroomsFilter !== 'any') params.bedrooms = bedroomsFilter
    if (statusFilter && statusFilter !== 'all') params.status = statusFilter
    if (minPrice) params.minPrice = minPrice
    if (maxPrice) params.maxPrice = maxPrice
    
    return params
  }, [currentPage, searchTerm, locationFilter, typeFilter, bedroomsFilter, statusFilter, minPrice, maxPrice])

  const { data, isLoading } = useQuery<{ properties: Property[], total: number }>({
    queryKey: ['/api/properties', queryParams],
  })

  const properties = data?.properties || []
  const totalProperties = data?.total || 0
  const totalPages = Math.ceil(totalProperties / itemsPerPage)

  // Reset to page 1 when filters change
  const handleFilterChange = (filterType: string, value: string) => {
    setCurrentPage(1)
    switch (filterType) {
      case 'search':
        setSearchTerm(value)
        break
      case 'location':
        setLocationFilter(value)
        break
      case 'type':
        setTypeFilter(value)
        break
      case 'bedrooms':
        setBedroomsFilter(value)
        break
      case 'status':
        setStatusFilter(value)
        break
      case 'minPrice':
        setMinPrice(value)
        break
      case 'maxPrice':
        setMaxPrice(value)
        break
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleFiltersChange = () => {
    // This function is kept for compatibility but filters are now applied automatically
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">Browse Properties</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Find your perfect property with our advanced search and filtering options.
          </p>
        </div>

        {/* Real-time Search and Filters */}
        <div className="bg-card rounded-xl shadow-lg p-6 border border-border mb-8">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Search</label>
              <Input
                placeholder="Search properties..."
                value={searchTerm}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                data-testid="input-search"
                className="focus:ring-2 focus:ring-primary"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Location</label>
              <Input
                placeholder="Enter location..."
                value={locationFilter}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                data-testid="filter-location"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Type</label>
              <Select value={typeFilter} onValueChange={(value) => handleFilterChange('type', value)}>
                <SelectTrigger data-testid="filter-property-type">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="apartment">Apartment</SelectItem>
                  <SelectItem value="house">House</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                  <SelectItem value="shop">Shop</SelectItem>
                  <SelectItem value="land">Land</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Bedrooms</label>
              <Select value={bedroomsFilter} onValueChange={(value) => handleFilterChange('bedrooms', value)}>
                <SelectTrigger data-testid="filter-bedrooms">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="1">1+</SelectItem>
                  <SelectItem value="2">2+</SelectItem>
                  <SelectItem value="3">3+</SelectItem>
                  <SelectItem value="4">4+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Min Price</label>
              <Input
                type="number"
                placeholder="Min price"
                value={minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                data-testid="filter-min-price"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">Max Price</label>
              <Input
                type="number"
                placeholder="Max price"
                value={maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                data-testid="filter-max-price"
              />
            </div>
          </div>
        </div>

        {/* View Controls */}
        <div className="flex items-center justify-between mb-8">
          <p className="text-muted-foreground" data-testid="properties-count">
            {isLoading ? 'Loading...' : `Showing ${properties.length} of ${totalProperties} properties`}
          </p>
          <div className="flex items-center space-x-4">
            <div className="flex bg-muted rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                data-testid="button-grid-view"
              >
                <Grid className="h-4 w-4 mr-2" />
                Grid
              </Button>
              <Button
                variant={viewMode === 'map' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('map')}
                data-testid="button-map-view"
              >
                <Map className="h-4 w-4 mr-2" />
                Map
              </Button>
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48" data-testid="select-sort-by">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">Sort by: Latest</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="size-large">Size: Large to Small</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Properties Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-card rounded-xl shadow-lg h-96 animate-pulse" />
            ))}
          </div>
        ) : properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property: Property) => (
              <PropertyCard key={property._id} property={property} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No properties found matching your criteria.</p>
            <p className="text-muted-foreground">Try adjusting your filters to see more results.</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <PropertyPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            className="mt-12"
          />
        )}
      </div>

      <Footer />
    </div>
  )
}
