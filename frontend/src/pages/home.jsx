import { useQuery } from '@tanstack/react-query'
import HeroSlider from '@/components/property/hero-slider'
import PropertyCard from '@/components/property/property-card'
import { Button } from '@/components/ui/button'

export default function Home() {
  const { data: featuredProperties = [], isLoading } = useQuery({
    queryKey: ['/api/properties/featured'],
  })

  return (
    <div className="min-h-screen">
      <HeroSlider />
      
      {/* Featured Properties Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Properties</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover our handpicked selection of premium properties in Ethiopia
            </p>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-gray-200 animate-pulse rounded-lg h-64"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProperties.slice(0, 6).map((property) => (
                <PropertyCard key={property._id} property={property} />
              ))}
            </div>
          )}
          
          <div className="text-center mt-12">
            <Button 
              size="lg"
              onClick={() => window.location.href = '/properties'}
              data-testid="button-view-all-properties"
            >
              View All Properties
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}