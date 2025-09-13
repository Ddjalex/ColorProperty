import { useParams } from 'wouter'
import { useQuery } from '@tanstack/react-query'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Calendar, User, ArrowLeft, Share2 } from 'lucide-react'
import { formatDate, getImageUrl } from '@/lib/utils'
import { Link } from 'wouter'
import type { BlogPost } from '@shared/schema'

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>()
  
  const { data: post, isLoading, error } = useQuery<BlogPost>({
    queryKey: ['/api/blog/slug', slug],
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse max-w-4xl mx-auto">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-8"></div>
            <div className="h-96 bg-gray-300 rounded-lg mb-8"></div>
            <div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div>
            <div className="h-6 bg-gray-300 rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-foreground mb-4">Article Not Found</h1>
            <p className="text-muted-foreground mb-8">The article you're looking for doesn't exist or has been removed.</p>
            <Link href="/blog">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Blog
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link href="/blog">
            <Button variant="ghost" className="mb-8" data-testid="button-back-to-blog">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Button>
          </Link>

          {/* Featured Image */}
          {post.coverImage && (
            <div className="mb-8">
              <img 
                src={getImageUrl(post.coverImage)} 
                alt={post.title}
                className="w-full h-96 object-cover rounded-xl"
                data-testid="blog-post-cover-image"
              />
            </div>
          )}

          {/* Article Header */}
          <div className="mb-8">
            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" data-testid={`blog-tag-${tag}`}>
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Title */}
            <h1 className="text-4xl font-bold text-foreground mb-6" data-testid="blog-post-title">
              {post.title}
            </h1>

            {/* Meta Information */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-muted-foreground mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span data-testid="blog-post-date">
                  {post.publishedAt ? formatDate(post.publishedAt) : 'Draft'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span data-testid="blog-post-author">Temer Properties</span>
              </div>
              <div className="sm:ml-auto">
                <Button variant="outline" size="sm" data-testid="button-share-article">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            {/* Excerpt */}
            <p className="text-xl text-muted-foreground leading-relaxed" data-testid="blog-post-excerpt">
              {post.excerpt}
            </p>
          </div>

          <Separator className="mb-8" />

          {/* Article Content */}
          <div className="prose prose-lg max-w-none mb-12" data-testid="blog-post-content">
            <div dangerouslySetInnerHTML={{ __html: post.body }} />
          </div>

          <Separator className="mb-8" />

          {/* Article Footer */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">
                Published on {post.publishedAt ? formatDate(post.publishedAt) : 'Draft'}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" data-testid="button-share-social">
                <Share2 className="h-4 w-4 mr-2" />
                Share Article
              </Button>
              <Link href="/blog">
                <Button size="sm" data-testid="button-more-articles">
                  More Articles
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
