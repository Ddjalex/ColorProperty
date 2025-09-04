import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'

export function useWebSocket() {
  const queryClient = useQueryClient()
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    // Get the current host and port from the browser location
    const host = window.location.host || 'localhost:5000'
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
    const wsUrl = `${protocol}//${host}/ws`
    
    console.log('Attempting WebSocket connection to:', wsUrl)
    
    const connectWebSocket = () => {
      try {
        wsRef.current = new WebSocket(wsUrl)
        
        wsRef.current.onopen = () => {
          console.log('Connected to WebSocket')
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
                
                console.log(`Real-time update: ${message.type}`)
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
          console.log('WebSocket connection closed, attempting to reconnect...')
          // Attempt to reconnect after a delay
          setTimeout(connectWebSocket, 3000)
        }
        
        wsRef.current.onerror = (error) => {
          console.error('WebSocket error:', error)
        }
      } catch (error) {
        console.error('Failed to connect to WebSocket:', error)
        // Retry connection
        setTimeout(connectWebSocket, 3000)
      }
    }

    connectWebSocket()

    // Cleanup function
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [queryClient])

  return wsRef.current
}