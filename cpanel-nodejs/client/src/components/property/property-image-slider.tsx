import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getPropertyImageUrl } from '@/lib/utils'
import type { Property } from '@shared/schema'

interface PropertyImageSliderProps {
  property: Property
  className?: string
}

export default function PropertyImageSlider({ property, className = '' }: PropertyImageSliderProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const imageCount = property.images?.length || 0

  if (imageCount === 0) {
    return (
      <div className={`relative bg-muted rounded-lg overflow-hidden ${className}`}>
        <div className="w-full h-full flex items-center justify-center">
          <p className="text-muted-foreground">No images available</p>
        </div>
      </div>
    )
  }

  const goToPrevious = () => {
    setCurrentImageIndex((prev) => (prev - 1 + imageCount) % imageCount)
  }

  const goToNext = () => {
    setCurrentImageIndex((prev) => (prev + 1) % imageCount)
  }

  const goToSlide = (index: number) => {
    setCurrentImageIndex(index)
  }

  return (
    <div className={`relative group ${className}`}>
      {/* Main Image */}
      <div className="relative overflow-hidden rounded-lg">
        <img 
          src={getPropertyImageUrl(property._id!, currentImageIndex)} 
          alt={`${property.title} - Image ${currentImageIndex + 1}`}
          className="w-full h-full object-cover"
          data-testid={`property-image-${currentImageIndex}`}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&h=600&fit=crop';
          }}
        />
        
        {/* Navigation Arrows - only show if more than 1 image */}
        {imageCount > 1 && (
          <>
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={goToPrevious}
              data-testid="button-prev-image"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={goToNext}
              data-testid="button-next-image"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
        
        {/* Image Counter */}
        {imageCount > 1 && (
          <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-sm" data-testid="image-counter">
            {currentImageIndex + 1} / {imageCount}
          </div>
        )}
      </div>
      
      {/* Thumbnail Navigation - only show if more than 1 image */}
      {imageCount > 1 && (
        <div className="flex space-x-2 mt-4 overflow-x-auto">
          {Array.from({ length: imageCount }).map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`flex-shrink-0 w-20 h-16 rounded-md overflow-hidden border-2 transition-all ${
                currentImageIndex === index 
                  ? 'border-primary ring-2 ring-primary/20' 
                  : 'border-muted hover:border-primary/50'
              }`}
              data-testid={`thumbnail-${index}`}
            >
              <img 
                src={getPropertyImageUrl(property._id!, index)} 
                alt={`${property.title} thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=80&h=64&fit=crop';
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}