import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiRequest } from '@/lib/queryClient'
import type { Property, InsertProperty } from '@shared/schema'

export function useProperties(filters?: any) {
  return useQuery<Property[]>({
    queryKey: ['/api/properties', filters],
  })
}

export function useProperty(id: string) {
  return useQuery<Property>({
    queryKey: ['/api/properties', id],
  })
}

export function usePropertyBySlug(slug: string) {
  return useQuery<Property>({
    queryKey: ['/api/properties/slug', slug],
  })
}

export function useFeaturedProperties() {
  return useQuery<Property[]>({
    queryKey: ['/api/properties/featured'],
  })
}

export function useCreateProperty() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (property: InsertProperty) =>
      apiRequest('POST', '/api/properties', property),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/properties'] })
    },
  })
}

export function useUpdateProperty() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, ...property }: { id: string } & Partial<Property>) =>
      apiRequest('PUT', `/api/properties/${id}`, property),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/properties'] })
    },
  })
}

export function useDeleteProperty() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) =>
      apiRequest('DELETE', `/api/properties/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/properties'] })
    },
  })
}
