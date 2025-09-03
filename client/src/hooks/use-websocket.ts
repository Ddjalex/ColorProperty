import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'

export function useWebSocket() {
  const queryClient = useQueryClient()
  const wsRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
    const wsUrl = `${protocol}//${window.location.host}/ws`
    
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
                // Invalidate and refetch properties data
                queryClient.invalidateQueries({ queryKey: ['/api/properties'] })
                queryClient.invalidateQueries({ queryKey: ['/api/properties/featured'] })
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