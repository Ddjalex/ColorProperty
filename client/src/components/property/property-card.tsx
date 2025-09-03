import { Link } from 'wouter'
import { Heart, Phone, MessageCircle, Bed, Bath, Square } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, generateWhatsAppUrl, getImageUrl } from '@/lib/utils'
import type { Property } from '@shared/schema'

interface PropertyCardProps {
  property: Property
}

export default function PropertyCard({ property }: PropertyCardProps) {
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

  const whatsappMessage = `I'm interested in ${property.title} - ${formatCurrency(property.priceETB)}`
  const whatsappUrl = generateWhatsAppUrl('+251911006033', whatsappMessage)

  return (
    <div className="bg-card rounded-xl shadow-lg overflow-hidden border border-border hover:shadow-xl transition-shadow" data-testid={`property-card-${property._id}`}>
      <div className="relative">
        <img 
          src={getImageUrl(property.images[0])} 
          alt={property.title}
          className="w-full h-64 object-cover"
          data-testid={`property-image-${property._id}`}
        />
        <div className="absolute top-4 left-4">
          <Badge 
            className={`${getStatusColor(property.status)} text-white`}
            data-testid={`property-status-${property._id}`}
          >
            {getStatusText(property.status)}
          </Badge>
        </div>
        {property.featured && (
          <div className="absolute top-4 right-14">
            <Badge className="bg-orange-500 text-white">
              Featured
            </Badge>
          </div>
        )}
        <div className="absolute top-4 right-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="bg-white/90 hover:bg-white text-gray-700"
            data-testid={`button-favorite-${property._id}`}
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="p-6">
        <Link href={`/property/${property.slug}`}>
          <h3 className="text-xl font-semibold text-foreground mb-2 hover:text-primary transition-colors cursor-pointer" data-testid={`property-title-${property._id}`}>
            {property.title}
          </h3>
        </Link>
        
        <p className="text-muted-foreground mb-4" data-testid={`property-location-${property._id}`}>
          📍 {property.location}
        </p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            {property.bedrooms && (
              <span data-testid={`property-bedrooms-${property._id}`}>
                <Bed className="h-4 w-4 inline mr-1" />
                {property.bedrooms} Beds
              </span>
            )}
            {property.bathrooms && (
              <span data-testid={`property-bathrooms-${property._id}`}>
                <Bath className="h-4 w-4 inline mr-1" />
                {property.bathrooms} Baths
              </span>
            )}
            <span data-testid={`property-size-${property._id}`}>
              <Square className="h-4 w-4 inline mr-1" />
              {property.sizeSqm} m²
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-primary" data-testid={`property-price-${property._id}`}>
            {formatCurrency(property.priceETB)}
          </span>
          <div className="flex space-x-2">
            <a 
              href="tel:+251911006033" 
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground p-2 rounded-lg transition-colors"
              data-testid={`button-call-${property._id}`}
            >
              <Phone className="h-4 w-4" />
            </a>
            <a 
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg transition-colors"
              data-testid={`button-whatsapp-${property._id}`}
            >
              <MessageCircle className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
