import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiRequest } from '@/lib/queryClient'
import type { TeamMember, InsertTeamMember } from '@shared/schema'

export function useTeamMembers() {
  return useQuery<TeamMember[]>({
    queryKey: ['/api/team'],
  })
}

export function useTeamMember(id: string) {
  return useQuery<TeamMember>({
    queryKey: ['/api/team', id],
  })
}

export function useCreateTeamMember() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (member: InsertTeamMember) =>
      apiRequest('POST', '/api/team', member),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/team'] })
    },
  })
}

export function useUpdateTeamMember() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, ...member }: { id: string } & Partial<TeamMember>) =>
      apiRequest('PUT', `/api/team/${id}`, member),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/team'] })
    },
  })
}

export function useDeleteTeamMember() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) =>
      apiRequest('DELETE', `/api/team/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/team'] })
    },
  })
}
