import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, getPropertyImageUrl } from '@/lib/utils'
import { Phone, MessageCircle, MapPin, Home, Bath, Square } from 'lucide-react'

export default function PropertyCard({ property }) {
  const { data: settings } = useQuery({
    queryKey: ['/api/settings'],
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-primary'
      case 'sold': return 'bg-red-500'
      case 'rented': return 'bg-blue-500'
      default: return 'bg-orange-500'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'For Sale'
      case 'sold': return 'Sold'
      case 'rented': return 'Rented'
      default: return 'New Offer'
    }
  }

  const phoneNumber = settings?.phoneNumber || '0974408281'
  const whatsappNumber = settings?.whatsappNumber || '0974408281'
  const propertyUrl = `${window.location.origin}/property/${property.slug}`
  
  const whatsappMessage = settings?.whatsappTemplate
    ?.replace('{propertyTitle}', property.title)
    ?.replace('{propertyPrice}', formatCurrency(property.price))
    ?.replace('{propertyLink}', propertyUrl) || 
    `I'm interested in ${property.title} - ${formatCurrency(property.price)}. Property link: ${propertyUrl}`
  
  // Format WhatsApp number - add Ethiopia country code if not present
  const formatWhatsAppNumber = (number) => {
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

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow" data-testid={`property-card-${property._id}`}>
      <div className="relative">
        <img 
          src={getPropertyImageUrl(property._id, 0)} 
          alt={property.title}
          className="w-full h-48 object-cover"
          loading="lazy"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&h=300&fit=crop&auto=format'
          }}
          data-testid={`property-image-${property._id}`}
        />
        <div className="absolute top-4 left-4">
          <Badge className={`${getStatusColor(property.status)} text-white`}>
            {getStatusText(property.status)}
          </Badge>
        </div>
        {property.featured && (
          <div className="absolute top-4 right-4">
            <Badge className="bg-yellow-500 text-white">Featured</Badge>
          </div>
        )}
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2" data-testid={`property-title-${property._id}`}>
          {property.title}
        </h3>
        
        <div className="flex items-center text-muted-foreground mb-2">
          <MapPin className="w-4 h-4 mr-1" />
          <span className="text-sm">{property.location}</span>
        </div>

        <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
          {property.bedrooms && (
            <div className="flex items-center">
              <Home className="w-4 h-4 mr-1" />
              <span>{property.bedrooms} bed</span>
            </div>
          )}
          {property.bathrooms && (
            <div className="flex items-center">
              <Bath className="w-4 h-4 mr-1" />
              <span>{property.bathrooms} bath</span>
            </div>
          )}
          {property.size && (
            <div className="flex items-center">
              <Square className="w-4 h-4 mr-1" />
              <span>{property.size} m²</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mb-4">
          <div className="text-2xl font-bold text-primary" data-testid={`property-price-${property._id}`}>
            {formatCurrency(property.price)}
          </div>
        </div>

        <div className="flex space-x-2">
          <Button 
            size="sm" 
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            onClick={() => window.open(whatsappUrl, '_blank')}
            data-testid={`button-whatsapp-${property._id}`}
          >
            <MessageCircle className="w-4 h-4 mr-1" />
            WhatsApp
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1"
            onClick={() => window.open(callUrl, '_self')}
            data-testid={`button-call-${property._id}`}
          >
            <Phone className="w-4 h-4 mr-1" />
            Call
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}