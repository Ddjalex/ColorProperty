import { useState, useEffect } from 'react'
import { MessageCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useQuery } from '@tanstack/react-query'

export function WhatsAppFloat() {
  const [isVisible, setIsVisible] = useState(false)
  const [showChat, setShowChat] = useState(false)

  const { data: settings } = useQuery({
    queryKey: ['/api/settings'],
  })

  // Show button after user scrolls down a bit or after a delay
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 200) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
        setShowChat(false)
      }
    }

    // Show button immediately after 2 seconds or when user scrolls
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 2000)

    window.addEventListener('scroll', toggleVisibility)
    return () => {
      window.removeEventListener('scroll', toggleVisibility)
      clearTimeout(timer)
    }
  }, [])

  const whatsappNumber = settings?.whatsappNumber || '0974408281'
  
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

  const handleWhatsAppClick = () => {
    const formattedNumber = formatWhatsAppNumber(whatsappNumber)
    const message = encodeURIComponent("Hello! I'm interested in your properties. Could you please provide more information?")
    const whatsappUrl = `https://wa.me/${formattedNumber}?text=${message}`
    window.open(whatsappUrl, '_blank')
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button
        onClick={handleWhatsAppClick}
        className="h-14 w-14 rounded-full bg-[#25D366] hover:bg-[#1fb855] text-white shadow-lg transform hover:scale-110 transition-all duration-200"
        data-testid="button-whatsapp"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    </div>
  )
}