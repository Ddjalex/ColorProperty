import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import PropertyCard from '@/components/property/property-card'
import PropertyFilters from '@/components/property/property-filters'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Grid, Map } from 'lucide-react'
import type { Property } from '@shared/schema'

export default function Properties() {
  const [filters, setFilters] = useState({})
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid')
  const [sortBy, setSortBy] = useState('latest')

  const { data: properties = [], isLoading } = useQuery<Property[]>({
    queryKey: ['/api/properties', filters],
  })

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters)
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

        {/* Filters */}
        <PropertyFilters onFiltersChange={handleFiltersChange} />

        {/* View Controls */}
        <div className="flex items-center justify-between mb-8">
          <p className="text-muted-foreground" data-testid="properties-count">
            {isLoading ? 'Loading...' : `Showing ${properties.length} properties`}
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
            {properties.map((property) => (
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
        {properties.length > 0 && (
          <div className="flex justify-center mt-12">
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" data-testid="button-prev-page">
                Previous
              </Button>
              <Button variant="default" size="sm" data-testid="button-page-1">1</Button>
              <Button variant="outline" size="sm" data-testid="button-page-2">2</Button>
              <Button variant="outline" size="sm" data-testid="button-page-3">3</Button>
              <span className="text-muted-foreground">...</span>
              <Button variant="outline" size="sm" data-testid="button-page-last">13</Button>
              <Button variant="outline" size="sm" data-testid="button-next-page">
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
