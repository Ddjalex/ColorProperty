import { useQuery } from "@tanstack/react-query";

export default function Home() {
  const { data: heroSlides = [], isLoading } = useQuery({
    queryKey: ["/hero-slides"],
  });

  const { data: featuredProperties = [] } = useQuery({
    queryKey: ["/properties/featured"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-gradient text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Find Your Dream Property</h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Discover apartments, houses, commercial spaces, and land for sale and rent in Ethiopia
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="/properties"
              className="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              data-testid="button-view-properties"
            >
              View Properties
            </a>
            <a
              href="/contact"
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary transition-colors"
              data-testid="button-contact-us"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Featured Properties</h2>
          {featuredProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProperties.slice(0, 6).map((property) => (
                <div
                  key={property._id}
                  className="bg-white rounded-lg shadow-lg overflow-hidden property-card-hover"
                  data-testid={`card-property-${property._id}`}
                >
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">Property Image</span>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{property.title}</h3>
                    <p className="text-gray-600 mb-2">{property.location}</p>
                    <p className="text-2xl font-bold text-primary">
                      ETB {property.priceETB?.toLocaleString()}
                    </p>
                    <div className="mt-4 flex gap-2">
                      {property.bedrooms && (
                        <span className="bg-gray-100 px-2 py-1 rounded text-sm">
                          {property.bedrooms} beds
                        </span>
                      )}
                      {property.bathrooms && (
                        <span className="bg-gray-100 px-2 py-1 rounded text-sm">
                          {property.bathrooms} baths
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No featured properties available</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}