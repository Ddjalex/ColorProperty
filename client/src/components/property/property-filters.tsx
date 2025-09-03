import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card } from '@/components/ui/card'

interface PropertyFiltersProps {
  onFiltersChange: (filters: any) => void
}

export default function PropertyFilters({ onFiltersChange }: PropertyFiltersProps) {
  const [filters, setFilters] = useState({
    location: '',
    propertyType: '',
    bedrooms: '',
    status: '',
    minPrice: '',
    maxPrice: '',
  })

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
  }

  const applyFilters = () => {
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== '')
    )
    onFiltersChange(cleanFilters)
  }

  const clearFilters = () => {
    setFilters({
      location: '',
      propertyType: '',
      bedrooms: '',
      status: '',
      minPrice: '',
      maxPrice: '',
    })
    onFiltersChange({})
  }

  return (
    <Card className="p-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Location</label>
          <Input
            placeholder="Enter location..."
            value={filters.location}
            onChange={(e) => handleFilterChange('location', e.target.value)}
            data-testid="filter-location"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Type</label>
          <Select value={filters.propertyType} onValueChange={(value) => handleFilterChange('propertyType', value)}>
            <SelectTrigger data-testid="filter-property-type">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
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
          <Select value={filters.bedrooms} onValueChange={(value) => handleFilterChange('bedrooms', value)}>
            <SelectTrigger data-testid="filter-bedrooms">
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any</SelectItem>
              <SelectItem value="1">1+</SelectItem>
              <SelectItem value="2">2+</SelectItem>
              <SelectItem value="3">3+</SelectItem>
              <SelectItem value="4">4+</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Status</label>
          <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
            <SelectTrigger data-testid="filter-status">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="sold">Sold</SelectItem>
              <SelectItem value="rented">Rented</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Min Price (ETB)</label>
          <Input
            type="number"
            placeholder="0"
            value={filters.minPrice}
            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
            data-testid="filter-min-price"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">Max Price (ETB)</label>
          <Input
            type="number"
            placeholder="No limit"
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            data-testid="filter-max-price"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-4 mt-6">
        <Button onClick={applyFilters} data-testid="button-apply-filters">
          Apply Filters
        </Button>
        <Button variant="outline" onClick={clearFilters} data-testid="button-clear-filters">
          Clear All
        </Button>
      </div>
    </Card>
  )
}
