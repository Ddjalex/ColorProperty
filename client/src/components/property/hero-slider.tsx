import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { HeroSlide } from '@shared/schema'

// Fallback slides if no slides are configured
const fallbackSlides = [
  {
    _id: 'fallback-1',
    title: 'Find Your Dream Home in Ethiopia',
    subtitle: 'Discover premium properties across Addis Ababa and beyond. From luxury apartments to commercial spaces, we have it all.',
    imageUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    ctaText: 'Browse Properties',
    ctaLink: '/properties',
    order: 0,
    isActive: true,
  },
  {
    _id: 'fallback-2',
    title: 'Luxury Living Redefined',
    subtitle: 'Experience modern amenities and prime locations in our carefully selected properties.',
    imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    ctaText: 'View Properties',
    ctaLink: '/properties',
    order: 1,
    isActive: true,
  },
  {
    _id: 'fallback-3',
    title: 'Investment Opportunities',
    subtitle: 'Discover profitable real estate investments in Ethiopia\'s growing market.',
    imageUrl: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    ctaText: 'Learn More',
    ctaLink: '/properties',
    order: 2,
    isActive: true,
  },
]

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)

  // Fetch hero slides from API
  const { data: apiSlides = [] } = useQuery<HeroSlide[]>({
    queryKey: ['/api/hero-slides'],
  })

  // Use API slides if available and active, otherwise use fallback slides
  const slides = apiSlides.filter(slide => slide.isActive).length > 0 
    ? apiSlides.filter(slide => slide.isActive).sort((a, b) => (a.order || 0) - (b.order || 0))
    : fallbackSlides

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [slides.length])

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  return (
    <div className="relative h-screen overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={slide._id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${slide.imageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="container mx-auto px-4 h-full flex items-center">
            <div className="max-w-2xl text-white">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                {slide.title}
              </h1>
              <p className="text-xl mb-8 text-gray-200">
                {slide.subtitle}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                {slide.ctaText && (
                  <Button 
                    size="lg" 
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg"
                    data-testid="button-primary-cta"
                    onClick={() => slide.ctaLink && (window.location.href = slide.ctaLink)}
                  >
                    {slide.ctaText}
                  </Button>
                )}
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-4 text-lg"
                  data-testid="button-schedule-tour"
                  onClick={() => window.location.href = '/contact'}
                >
                  Contact Us
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors"
        data-testid="button-prev-slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors"
        data-testid="button-next-slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-opacity ${
              index === currentSlide ? 'bg-white opacity-100' : 'bg-white opacity-50'
            }`}
            data-testid={`slide-indicator-${index}`}
          />
        ))}
      </div>
    </div>
  )
}
