import { useState, useEffect } from 'react'
import { MessageCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useQuery } from '@tanstack/react-query'
import type { Settings } from '@shared/schema'

export function WhatsAppFloat() {
  const [isVisible, setIsVisible] = useState(false)
  const [showChat, setShowChat] = useState(false)

  const { data: settings } = useQuery<Settings>({
    queryKey: ['/api/settings'],
  })

  // Show button after user scrolls down a bit
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
        setShowChat(false)
      }
    }

    window.addEventListener('scroll', toggleVisibility)
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [])

  const whatsappNumber = settings?.whatsappNumber || '0974408281'
  
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

  const handleWhatsAppClick = () => {
    const formattedNumber = formatWhatsAppNumber(whatsappNumber)
    const message = encodeURIComponent("Hello! I'm interested in your properties. Could you please provide more information?")
    const whatsappUrl = `https://wa.me/${formattedNumber}?text=${message}`
    window.open(whatsappUrl, '_blank')
  }

  const toggleChat = () => {
    setShowChat(!showChat)
  }

  if (!isVisible) return null

  return (
    <>
      {/* WhatsApp Float Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {showChat && (
          <div className="mb-4 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-in slide-in-from-bottom-2 duration-300">
            {/* Chat Header */}
            <div className="bg-[#25D366] text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-[#25D366]" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm" data-testid="text-whatsapp-title">Temer Properties</h3>
                  <p className="text-xs opacity-90" data-testid="text-whatsapp-subtitle">Typically replies instantly</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleChat}
                className="text-white hover:bg-white/20"
                data-testid="button-close-chat"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Chat Body */}
            <div className="p-4 bg-gray-50 dark:bg-gray-900">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border">
                <p className="text-sm text-gray-700 dark:text-gray-300" data-testid="text-welcome-message">
                  Hello and welcome to Temer Properties! 👋
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-2" data-testid="text-help-message">
                  Are you interested in buying a property, or would you like more information about our available options?
                </p>
              </div>
            </div>
            
            {/* Chat Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                onClick={handleWhatsAppClick}
                className="w-full bg-[#25D366] hover:bg-[#20b358] text-white"
                data-testid="button-start-chat"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Start Chat on WhatsApp
              </Button>
            </div>
          </div>
        )}
        
        {/* Floating Action Button */}
        <Button
          onClick={showChat ? handleWhatsAppClick : toggleChat}
          size="lg"
          className="rounded-full w-14 h-14 bg-[#25D366] hover:bg-[#20b358] text-white shadow-2xl hover:scale-110 transition-all duration-300"
          data-testid="button-whatsapp-float"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
        
        {/* Online Indicator */}
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full animate-pulse" />
      </div>
    </>
  )
}