import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useLocation } from 'wouter'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import HeroSlider from '@/components/property/hero-slider'
import PropertyCard from '@/components/property/property-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Award, Handshake, Clock, MapPin } from 'lucide-react'
import { useWebSocket } from '@/hooks/use-websocket'
import type { Property } from '@shared/schema'

export default function Home() {
  const [, setLocation] = useLocation()
  const [searchLocation, setSearchLocation] = useState('')
  const [searchType, setSearchType] = useState('')
  const [searchBedrooms, setSearchBedrooms] = useState('')
  
  // Connect to WebSocket for real-time updates
  useWebSocket()
  
  const { data: featuredProperties = [], isLoading } = useQuery<Property[]>({
    queryKey: ['/api/properties/featured'],
  })
  
  const { data: propertiesData, isLoading: isLoadingAll } = useQuery<{ properties: Property[], total: number }>({
    queryKey: ['/api/properties', { limit: 6 }],
  })
  
  const allProperties = propertiesData?.properties || []
  
  const handleSearch = () => {
    const params = new URLSearchParams()
    if (searchLocation) params.append('location', searchLocation)
    if (searchType && searchType !== 'all') params.append('type', searchType)
    if (searchBedrooms && searchBedrooms !== 'any') params.append('bedrooms', searchBedrooms)
    
    const queryString = params.toString()
    setLocation(`/properties${queryString ? `?${queryString}` : ''}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative">
        <HeroSlider />
        
        {/* Quick Search Bar */}
        <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 w-full max-w-6xl px-4">
          <div className="bg-card rounded-xl shadow-2xl p-6 border border-border">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Location</label>
                <Input 
                  placeholder="Enter location..." 
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="focus:ring-2 focus:ring-primary focus:border-transparent"
                  data-testid="input-location"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Property Type</label>
                <Select value={searchType} onValueChange={setSearchType}>
                  <SelectTrigger data-testid="select-property-type">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="shop">Shop</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Bedrooms</label>
                <Select value={searchBedrooms} onValueChange={setSearchBedrooms}>
                  <SelectTrigger data-testid="select-bedrooms">
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="1">1 Bedroom</SelectItem>
                    <SelectItem value="2">2 Bedrooms</SelectItem>
                    <SelectItem value="3">3 Bedrooms</SelectItem>
                    <SelectItem value="4">4+ Bedrooms</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button 
                  className="w-full" 
                  onClick={handleSearch}
                  data-testid="button-search-properties"
                >
                  🔍 Search Properties
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Properties Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Latest Properties</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Explore our newest property listings featuring modern amenities and prime locations across Ethiopia.
            </p>
          </div>

          {isLoadingAll ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-card rounded-xl shadow-lg h-96 animate-pulse" />
              ))}
            </div>
          ) : allProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {allProperties.slice(0, 6).map((property) => (
                <PropertyCard key={property._id} property={property} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No properties available at the moment.</p>
            </div>
          )}

          <div className="text-center mt-12">
            <Button 
              size="lg" 
              onClick={() => setLocation('/properties')}
              data-testid="button-view-all-properties"
            >
              View All Properties
            </Button>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-24 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">Why Choose Temer Properties?</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              We are committed to providing exceptional real estate services with integrity, professionalism, and local expertise.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Expert Knowledge</h3>
              <p className="text-muted-foreground">Over 10 years of experience in Ethiopian real estate market with deep local insights.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <Handshake className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Trusted Service</h3>
              <p className="text-muted-foreground">Building lasting relationships through transparency, honesty, and exceptional customer service.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">24/7 Support</h3>
              <p className="text-muted-foreground">Round-the-clock assistance for all your property needs with dedicated support team.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-4">Prime Locations</h3>
              <p className="text-muted-foreground">Carefully selected properties in the most desirable neighborhoods across Ethiopia.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
