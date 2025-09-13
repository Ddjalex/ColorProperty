import { useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'

export function useWebSocket() {
  const queryClient = useQueryClient()
  const wsRef = useRef<WebSocket | null>(null)
  const [reconnectAttempts, setReconnectAttempts] = useState(0)
  const [isProduction, setIsProduction] = useState(false)
  const maxReconnectAttempts = 5 // Limit reconnection attempts

  useEffect(() => {
    // Check if we're in production (cPanel hosting)
    const currentHost = window.location.host
    const isProductionEnv = currentHost.includes('temerrealestatesales.com') || 
                           currentHost.includes('.com') ||
                           window.location.protocol === 'https:'
    
    setIsProduction(isProductionEnv)

    // Skip WebSocket entirely in production for now
    if (isProductionEnv) {
      console.log('WebSocket disabled in production environment to prevent connection errors')
      return
    }

    // Get the current host and port from the browser location
    const host = window.location.host || 'localhost:5000'
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
    const wsUrl = `${protocol}//${host}/ws`
    
    console.log('Attempting WebSocket connection to:', wsUrl)
    
    const connectWebSocket = () => {
      // Stop trying if too many attempts
      if (reconnectAttempts >= maxReconnectAttempts) {
        console.log('WebSocket: Maximum reconnection attempts reached. Stopping reconnection.')
        return
      }

      try {
        wsRef.current = new WebSocket(wsUrl)
        
        wsRef.current.onopen = () => {
          console.log('Connected to WebSocket')
          setReconnectAttempts(0) // Reset counter on successful connection
        }
        
        wsRef.current.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data)
            
            // Handle different types of real-time updates
            switch (message.type) {
              case 'property_created':
              case 'property_updated':
                // Invalidate all property-related queries for instant updates
                queryClient.invalidateQueries({ queryKey: ['/api/properties'] })
                queryClient.invalidateQueries({ queryKey: ['/api/properties/featured'] })
                queryClient.invalidateQueries({ queryKey: ['/api/properties/slug'] })
                
                // Also refetch immediately for faster updates
                queryClient.refetchQueries({ queryKey: ['/api/properties'] })
                queryClient.refetchQueries({ queryKey: ['/api/properties/featured'] })
                
                // Force image cache refresh by reloading all property images on the page
                setTimeout(() => {
                  const images = document.querySelectorAll('img[src*="/api/properties/"]')
                  images.forEach((img: any) => {
                    const src = img.src
                    img.src = ''
                    img.src = src.split('?')[0] + '?v=' + Date.now()
                  })
                }, 100)
                
                console.log(`Real-time update: ${message.type} - Images refreshed`)
                break
              case 'property_deleted':
                // Handle property deletions
                queryClient.invalidateQueries({ queryKey: ['/api/properties'] })
                queryClient.invalidateQueries({ queryKey: ['/api/properties/featured'] })
                queryClient.refetchQueries({ queryKey: ['/api/properties'] })
                console.log('Real-time update: property_deleted')
                break
              default:
                console.log('Unknown message type:', message.type)
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error)
          }
        }
        
        wsRef.current.onclose = () => {
          if (reconnectAttempts < maxReconnectAttempts) {
            console.log(`WebSocket connection closed, attempting to reconnect... (${reconnectAttempts + 1}/${maxReconnectAttempts})`)
            setReconnectAttempts(prev => prev + 1)
            setTimeout(connectWebSocket, 3000)
          } else {
            console.log('WebSocket: Maximum reconnection attempts reached.')
          }
        }
        
        wsRef.current.onerror = (error) => {
          console.error('WebSocket error:', error)
          // Don't increment attempts on error, let onclose handle it
        }
      } catch (error) {
        console.error('Failed to connect to WebSocket:', error)
        if (reconnectAttempts < maxReconnectAttempts) {
          setReconnectAttempts(prev => prev + 1)
          setTimeout(connectWebSocket, 3000)
        }
      }
    }

    // Only connect in development
    if (!isProductionEnv) {
      connectWebSocket()
    }

    // Cleanup function
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [queryClient, reconnectAttempts])

  return wsRef.current
}