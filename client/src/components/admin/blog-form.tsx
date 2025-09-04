import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Plus, X, Upload, Calendar, Eye } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useCreateBlogPost, useUpdateBlogPost } from '@/hooks/use-blog'
import { generateSlug } from '@/lib/utils'
import { useAuth } from '@/lib/auth'
import type { BlogPost } from '@shared/schema'

const blogPostFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  excerpt: z.string().min(1, 'Excerpt is required'),
  body: z.string().min(1, 'Content is required'),
  coverImage: z.string().optional(),
  tags: z.array(z.string()).default([]),
  status: z.enum(['draft', 'published']),
  publishedAt: z.date().optional(),
  authorId: z.string().min(1, 'Author is required'),
})

type BlogPostFormData = z.infer<typeof blogPostFormSchema>

interface BlogFormProps {
  post?: BlogPost | null
  onSuccess?: () => void
}

const commonTags = [
  'Real Estate', 'Market Analysis', 'Investment', 'Property Tips', 'Addis Ababa',
  'Commercial Property', 'Residential', 'Ethiopia', 'Property Guide', 'Market Trends'
]

export default function BlogForm({ post, onSuccess }: BlogFormProps) {
  const { toast } = useToast()
  const { user } = useAuth()
  const [newTag, setNewTag] = useState('')
  
  const createBlogPost = useCreateBlogPost()
  const updateBlogPost = useUpdateBlogPost()

  const form = useForm<BlogPostFormData>({
    resolver: zodResolver(blogPostFormSchema),
    defaultValues: {
      title: '',
      slug: '',
      excerpt: '',
      body: '',
      coverImage: '',
      tags: [],
      status: 'draft',
      publishedAt: undefined,
      authorId: user?._id || '',
    },
  })

  // Update authorId when user is loaded
  useEffect(() => {
    if (user?._id && !post) {
      form.setValue('authorId', user._id)
    }
  }, [user, form, post])

  useEffect(() => {
    if (post) {
      form.reset({
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        body: post.body,
        coverImage: post.coverImage || '',
        tags: post.tags,
        status: post.status,
        publishedAt: post.publishedAt ? new Date(post.publishedAt) : undefined,
        authorId: post.authorId,
      })
    }
  }, [post, form])

  const watchTitle = form.watch('title')
  const watchStatus = form.watch('status')
  
  useEffect(() => {
    if (watchTitle && !post) {
      form.setValue('slug', generateSlug(watchTitle))
    }
  }, [watchTitle, post, form])

  useEffect(() => {
    if (watchStatus === 'published' && !form.getValues('publishedAt')) {
      form.setValue('publishedAt', new Date())
    }
  }, [watchStatus, form])

  const onSubmit = async (data: BlogPostFormData) => {
    try {
      // Ensure authorId is set
      if (!data.authorId && user?._id) {
        data.authorId = user._id
      }

      // Validate authorId is present
      if (!data.authorId) {
        throw new Error('Author ID is required but missing')
      }

      // Clean up empty fields
      const submitData = {
        ...data,
        coverImage: data.coverImage?.trim() || undefined,
        publishedAt: data.status === 'published' ? (data.publishedAt || new Date()) : undefined,
      }

      console.log('Submitting blog post data:', { ...submitData, body: '[content]' })

      if (post) {
        await updateBlogPost.mutateAsync({ id: post._id!, ...submitData })
        toast({
          title: "Blog Post Updated",
          description: "The blog post has been successfully updated.",
        })
      } else {
        await createBlogPost.mutateAsync(submitData)
        toast({
          title: "Blog Post Created", 
          description: "The blog post has been successfully created.",
        })
      }
      onSuccess?.()
    } catch (error) {
      console.error('Failed to save blog post:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save blog post. Please try again.",
        variant: "destructive",
      })
    }
  }

  const addTag = (tag: string) => {
    const currentTags = form.getValues('tags')
    if (!currentTags.includes(tag)) {
      form.setValue('tags', [...currentTags, tag])
    }
    setNewTag('')
  }

  const removeTag = (tag: string) => {
    const currentTags = form.getValues('tags')
    form.setValue('tags', currentTags.filter(t => t !== tag))
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter blog post title" {...field} data-testid="input-blog-title" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug *</FormLabel>
                  <FormControl>
                    <Input placeholder="blog-post-slug" {...field} data-testid="input-blog-slug" />
                  </FormControl>
                  <FormDescription>
                    URL-friendly version of the title
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="excerpt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Excerpt *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Brief summary of the blog post for previews" 
                      rows={3} 
                      {...field} 
                      data-testid="textarea-blog-excerpt"
                    />
                  </FormControl>
                  <FormDescription>
                    Short description that appears in blog listings and social media previews
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Content */}
        <Card>
          <CardHeader>
            <CardTitle>Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Write your blog post content here. You can use HTML tags for formatting." 
                      rows={12} 
                      {...field} 
                      data-testid="textarea-blog-content"
                    />
                  </FormControl>
                  <FormDescription>
                    Main content of the blog post. HTML formatting is supported.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="coverImage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cover Image URL</FormLabel>
                  <FormControl>
                    <Input 
                      type="url" 
                      placeholder="https://example.com/cover-image.jpg" 
                      {...field} 
                      data-testid="input-blog-cover-image"
                    />
                  </FormControl>
                  <FormDescription>
                    Optional cover image for the blog post
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch('coverImage') && (
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-4">
                  <img 
                    src={form.watch('coverImage')} 
                    alt="Cover Preview"
                    className="w-24 h-16 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-blog.jpg'
                    }}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Cover Image Preview</p>
                    <p className="text-xs text-muted-foreground">
                      This image will appear in blog listings and social media shares
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tags */}
        <Card>
          <CardHeader>
            <CardTitle>Tags</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {form.watch('tags').map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-destructive" 
                    onClick={() => removeTag(tag)}
                    data-testid={`remove-tag-${tag}`}
                  />
                </Badge>
              ))}
            </div>

            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Add custom tag"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag(newTag))}
                  data-testid="input-new-tag"
                />
                <Button 
                  type="button" 
                  onClick={() => addTag(newTag)}
                  disabled={!newTag.trim()}
                  data-testid="button-add-tag"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {commonTags.map((tag) => (
                  <Button
                    key={tag}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addTag(tag)}
                    disabled={form.watch('tags').includes(tag)}
                    data-testid={`add-common-tag-${tag.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {tag}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Publishing Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Publishing Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-blog-status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch('status') === 'published' && (
                <FormField
                  control={form.control}
                  name="publishedAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Publish Date</FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          {...field}
                          value={field.value ? field.value.toISOString().slice(0, 16) : ''}
                          onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                          data-testid="input-blog-publish-date"
                        />
                      </FormControl>
                      <FormDescription>
                        When this post should be published
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {form.watch('status') === 'published' && (
              <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="text-sm">
                  This post will be visible to the public once published.
                </span>
              </div>
            )}

            {form.watch('status') === 'draft' && (
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  This post is saved as a draft and not visible to the public.
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Separator />

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onSuccess}
            data-testid="button-cancel-blog"
          >
            Cancel
          </Button>
          {form.watch('status') === 'draft' && (
            <Button 
              type="submit" 
              variant="outline"
              disabled={createBlogPost.isPending || updateBlogPost.isPending}
              onClick={() => form.setValue('status', 'draft')}
              data-testid="button-save-draft"
            >
              Save as Draft
            </Button>
          )}
          <Button 
            type="submit" 
            disabled={createBlogPost.isPending || updateBlogPost.isPending}
            onClick={() => form.setValue('status', 'published')}
            data-testid="button-publish-blog"
          >
            {(createBlogPost.isPending || updateBlogPost.isPending) ? 'Saving...' : (post ? 'Update Post' : 'Publish Post')}
          </Button>
        </div>
      </form>
    </Form>
  )
}
