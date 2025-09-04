import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiRequest } from '@/lib/queryClient'
import type { BlogPost, InsertBlogPost } from '@shared/schema'

export function useBlogPosts(status?: string) {
  return useQuery<BlogPost[]>({
    queryKey: ['/api/blog', status],
  })
}

export function useBlogPost(id: string) {
  return useQuery<BlogPost>({
    queryKey: ['/api/blog', id],
  })
}

export function useBlogPostBySlug(slug: string) {
  return useQuery<BlogPost>({
    queryKey: ['/api/blog/slug', slug],
  })
}

export function useCreateBlogPost() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (post: InsertBlogPost) =>
      apiRequest('POST', '/api/blog', post),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blog'] })
    },
  })
}

export function useUpdateBlogPost() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, ...post }: { id: string } & Partial<BlogPost>) =>
      apiRequest('PUT', `/api/blog/${id}`, post),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blog'] })
    },
  })
}

export function useDeleteBlogPost() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) =>
      apiRequest('DELETE', `/api/blog/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/blog'] })
    },
  })
}
