import { useParams } from 'wouter'
import { useQuery } from '@tanstack/react-query'
import { useWebSocket } from '@/hooks/use-websocket'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import PropertyImageSlider from '@/components/property/property-image-slider'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Phone, MessageCircle, Bed, Bath, Square, MapPin, Calendar, Heart, Share2 } from 'lucide-react'
import { formatCurrency, generateWhatsAppUrl, formatDate } from '@/lib/utils'
import type { Property, Settings } from '@shared/schema'

export default function PropertyDetail() {
  const { slug } = useParams<{ slug: string }>()
  
  // Connect to WebSocket for real-time updates
  useWebSocket()
  
  const { data: property, isLoading, error } = useQuery<Property>({
    queryKey: ['/api/properties/slug', slug],
  })
  
  const { data: settings } = useQuery<Settings>({
    queryKey: ['/api/settings'],
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-96 bg-gray-300 rounded-lg mb-8"></div>
            <div className="h-8 bg-gray-300 rounded w-1/2 mb-4"></div>
            <div className="h-6 bg-gray-300 rounded w-1/3 mb-8"></div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Property Not Found</h1>
            <p className="text-muted-foreground">The property you're looking for doesn't exist or has been removed.</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const phoneNumber = settings?.phoneNumber || '0974408281'
  const whatsappNumber = settings?.whatsappNumber || '0974408281'
  const propertyUrl = `${window.location.origin}/property/${property.slug}`
  
  const whatsappMessage = settings?.whatsappTemplate
    ?.replace('{propertyTitle}', property.title)
    ?.replace('{propertyPrice}', formatCurrency(property.priceETB))
    ?.replace('{propertyLink}', propertyUrl) || 
    `I'm interested in ${property.title} - ${formatCurrency(property.priceETB)}. Property link: ${propertyUrl}`
  
  // Format WhatsApp number - add Ethiopia country code if not present
  const formatWhatsAppNumber = (number: string) => {
    const cleanNumber = number.replace(/[^0-9]/g, '')
    if (cleanNumber.startsWith('251')) {
      return cleanNumber
    }
    if (cleanNumber.startsWith('0')) {
      return '251' + cleanNumber.substring(1)
    }
    return '251' + cleanNumber
  }
  
  const whatsappUrl = `https://wa.me/${formatWhatsAppNumber(whatsappNumber)}?text=${encodeURIComponent(whatsappMessage)}`
  const callUrl = `tel:${phoneNumber}`

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-primary'
      case 'sold': return 'bg-red-500'
      case 'rented': return 'bg-blue-500'
      default: return 'bg-orange-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'For Sale'
      case 'sold': return 'Sold'
      case 'rented': return 'Rented'
      default: return 'New Offer'
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-2">
        {/* Image Gallery */}
        <div className="relative mb-3">
          <PropertyImageSlider 
            property={property} 
            className="h-48 md:h-56 lg:h-64"
          />
          
          {/* Status Badge */}
          <div className="absolute top-4 left-4">
            <Badge 
              className={`${getStatusColor(property.status)} text-white`}
              data-testid="property-status"
            >
              {getStatusText(property.status)}
            </Badge>
          </div>
          
          {/* Action Buttons */}
          <div className="absolute top-4 right-4 flex space-x-2">
            <Button variant="secondary" size="icon" data-testid="button-favorite">
              <Heart className="h-4 w-4" />
            </Button>
            <Button variant="secondary" size="icon" data-testid="button-share">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Title and Location */}
            <div className="mb-3">
              <h1 className="text-xl md:text-2xl font-bold text-foreground mb-1" data-testid="property-title">
                {property.title}
              </h1>
              <div className="flex items-center text-muted-foreground mb-2" data-testid="property-location">
                <MapPin className="h-4 w-4 mr-2" />
                {property.location}
              </div>
              <div className="text-xl md:text-2xl font-bold text-primary" data-testid="property-price">
                {formatCurrency(property.priceETB)}
              </div>
            </div>

            {/* Key Details */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {property.bedrooms && (
                <div className="text-center p-2 bg-muted rounded-lg" data-testid="property-bedrooms">
                  <Bed className="h-4 w-4 mx-auto mb-1 text-primary" />
                  <div className="font-semibold text-sm">{property.bedrooms}</div>
                  <div className="text-xs text-muted-foreground">Bedrooms</div>
                </div>
              )}
              {property.bathrooms && (
                <div className="text-center p-2 bg-muted rounded-lg" data-testid="property-bathrooms">
                  <Bath className="h-4 w-4 mx-auto mb-1 text-primary" />
                  <div className="font-semibold text-sm">{property.bathrooms}</div>
                  <div className="text-xs text-muted-foreground">Bathrooms</div>
                </div>
              )}
              <div className="text-center p-2 bg-muted rounded-lg" data-testid="property-size">
                <Square className="h-4 w-4 mx-auto mb-1 text-primary" />
                <div className="font-semibold text-sm">{property.sizeSqm}</div>
                <div className="text-xs text-muted-foreground">Square Meters</div>
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="description" className="mb-4">
              <TabsList className="grid w-full grid-cols-3 h-9">
                <TabsTrigger value="description" data-testid="tab-description" className="text-sm">Description</TabsTrigger>
                <TabsTrigger value="amenities" data-testid="tab-amenities" className="text-sm">Amenities</TabsTrigger>
                <TabsTrigger value="location" data-testid="tab-location" className="text-sm">Location</TabsTrigger>
              </TabsList>
              
              <TabsContent value="description" className="mt-3">
                <div className="prose max-w-none text-sm" data-testid="property-description">
                  <p>{property.description}</p>
                </div>
              </TabsContent>
              
              <TabsContent value="amenities" className="mt-3">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm" data-testid="property-amenities">
                  {property.amenities.length > 0 ? (
                    property.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                        <span>{amenity}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No amenities listed for this property.</p>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="location" className="mt-3">
                <div data-testid="property-location-details">
                  <p className="text-muted-foreground mb-3 text-sm">
                    This property is located in {property.location}
                  </p>
                  {property.coordinates && (
                    <div className="h-48 bg-muted rounded-lg flex items-center justify-center">
                      <p className="text-muted-foreground text-sm">Map integration would be displayed here</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Contact Card */}
            <Card className="mb-4">
              <CardContent className="p-4">
                <h3 className="text-base font-semibold mb-3">Interested in this property?</h3>
                
                <div className="space-y-3">
                  <a 
                    href={callUrl}
                    className="w-full"
                  >
                    <Button size="sm" className="w-full bg-primary hover:bg-primary/90" data-testid="button-call-property">
                      <Phone className="h-3 w-3 mr-2" />
                      Call {phoneNumber}
                    </Button>
                  </a>
                  
                  <a 
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full"
                  >
                    <Button size="sm" className="w-full bg-green-500 hover:bg-green-600 text-white" data-testid="button-whatsapp-property">
                      <MessageCircle className="h-3 w-3 mr-2" />
                      WhatsApp {whatsappNumber}
                    </Button>
                  </a>
                  
                  <Button variant="outline" size="sm" className="w-full" data-testid="button-schedule-viewing">
                    <Calendar className="h-3 w-3 mr-2" />
                    Schedule Viewing
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Property Info */}
            <Card>
              <CardContent className="p-4">
                <h3 className="text-base font-semibold mb-3">Property Information</h3>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Property Type:</span>
                    <span className="capitalize" data-testid="property-type">{property.propertyType}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Size:</span>
                    <span data-testid="property-size-info">{property.sizeSqm} m²</span>
                  </div>
                  
                  {property.project && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Project:</span>
                      <span data-testid="property-project">{property.project}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Listed:</span>
                    <span data-testid="property-listed-date">
                      {property.createdAt ? formatDate(property.createdAt) : 'Recently'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
