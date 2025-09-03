import { useQuery } from '@tanstack/react-query'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import BlogCard from '@/components/blog/blog-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Search } from 'lucide-react'
import { useState } from 'react'
import type { BlogPost } from '@shared/schema'

export default function Blog() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTag, setSelectedTag] = useState('')

  const { data: blogPosts = [], isLoading } = useQuery<BlogPost[]>({
    queryKey: ['/api/blog'],
  })

  // Extract unique tags from all posts
  const allTags = Array.from(
    new Set(blogPosts.flatMap(post => post.tags))
  ).filter(Boolean)

  // Filter posts based on search term and selected tag
  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = !searchTerm || 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesTag = !selectedTag || post.tags.includes(selectedTag)
    
    return matchesSearch && matchesTag
  })

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-foreground mb-4">Latest News & Insights</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Stay updated with the latest trends, market insights, and property news in Ethiopia.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-12 max-w-2xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="blog-search"
            />
          </div>
          <Select value={selectedTag} onValueChange={setSelectedTag}>
            <SelectTrigger className="w-full md:w-48" data-testid="blog-filter-tags">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {allTags.map(tag => (
                <SelectItem key={tag} value={tag}>{tag}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Blog Posts Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-card rounded-xl shadow-lg overflow-hidden border border-border">
                <Skeleton className="w-full h-48" />
                <div className="p-6">
                  <div className="flex items-center text-sm text-muted-foreground mb-3">
                    <Skeleton className="h-4 w-16 mr-2" />
                    <Skeleton className="h-4 w-20 ml-auto" />
                  </div>
                  <Skeleton className="h-6 w-full mb-3" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-4" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <BlogCard key={post._id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              {searchTerm || selectedTag 
                ? 'No articles found matching your criteria.' 
                : 'No blog posts available at the moment.'
              }
            </p>
            {(searchTerm || selectedTag) && (
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setSearchTerm('')
                  setSelectedTag('')
                }}
                data-testid="button-clear-filters"
              >
                Clear Filters
              </Button>
            )}
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
