import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/lib/auth'
import AdminSidebar from '@/components/admin/sidebar'
import BlogForm from '@/components/admin/blog-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Search, Eye, Edit, Trash2 } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useDeleteBlogPost } from '@/hooks/use-blog'
import { useToast } from '@/hooks/use-toast'
import type { BlogPost } from '@shared/schema'

export default function AdminBlog() {
  const { isAuthenticated } = useAuth()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)

  const { data: blogPosts = [], isLoading } = useQuery<BlogPost[]>({
    queryKey: ['/api/blog'],
    enabled: isAuthenticated,
  })

  const deleteBlogPost = useDeleteBlogPost()

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = !searchTerm || 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = !statusFilter || post.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post)
    setIsFormOpen(true)
  }

  const handleDelete = async (post: BlogPost) => {
    if (window.confirm(`Are you sure you want to delete "${post.title}"?`)) {
      try {
        await deleteBlogPost.mutateAsync(post._id!)
        toast({
          title: "Blog Post Deleted",
          description: "The blog post has been successfully deleted.",
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete blog post. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditingPost(null)
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Please log in to access this page.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />
      
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Blog Management</h1>
            <p className="text-muted-foreground">Manage your blog posts and content</p>
          </div>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-blog-post">
                <Plus className="h-4 w-4 mr-2" />
                Add Blog Post
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingPost ? 'Edit Blog Post' : 'Add New Blog Post'}
                </DialogTitle>
              </DialogHeader>
              <BlogForm 
                post={editingPost}
                onSuccess={handleFormClose}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search blog posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-blog"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger data-testid="select-filter-status">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline"
                onClick={() => {
                  setSearchTerm('')
                  setStatusFilter('')
                }}
                data-testid="button-clear-filters"
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Blog Posts Table */}
        <Card>
          <CardHeader>
            <CardTitle>Blog Posts ({filteredPosts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading blog posts...</p>
              </div>
            ) : filteredPosts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 text-muted-foreground font-medium">Post</th>
                      <th className="text-left py-3 text-muted-foreground font-medium">Tags</th>
                      <th className="text-left py-3 text-muted-foreground font-medium">Status</th>
                      <th className="text-left py-3 text-muted-foreground font-medium">Published</th>
                      <th className="text-left py-3 text-muted-foreground font-medium">Created</th>
                      <th className="text-left py-3 text-muted-foreground font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPosts.map((post) => (
                      <tr key={post._id} className="border-b border-border">
                        <td className="py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-muted rounded-lg overflow-hidden">
                              {post.coverImage && (
                                <img 
                                  src={post.coverImage} 
                                  alt={post.title}
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                            <div>
                              <div className="font-medium text-foreground">{post.title}</div>
                              <div className="text-sm text-muted-foreground line-clamp-1">
                                {post.excerpt}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4">
                          <div className="flex flex-wrap gap-1">
                            {post.tags.slice(0, 2).map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {post.tags.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{post.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-4">
                          <Badge 
                            variant={post.status === 'published' ? 'default' : 'secondary'}
                            className={post.status === 'published' ? 'bg-primary' : ''}
                          >
                            {post.status}
                          </Badge>
                        </td>
                        <td className="py-4 text-muted-foreground">
                          {post.publishedAt ? formatDate(post.publishedAt) : 'Not published'}
                        </td>
                        <td className="py-4 text-muted-foreground">
                          {post.createdAt ? formatDate(post.createdAt) : 'N/A'}
                        </td>
                        <td className="py-4">
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => window.open(`/blog/${post.slug}`, '_blank')}
                              data-testid={`button-view-${post._id}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEdit(post)}
                              data-testid={`button-edit-${post._id}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDelete(post)}
                              data-testid={`button-delete-${post._id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No blog posts found</p>
                <p className="text-muted-foreground text-sm">
                  {searchTerm || statusFilter 
                    ? 'Try adjusting your filters'
                    : 'Add your first blog post to get started'
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
