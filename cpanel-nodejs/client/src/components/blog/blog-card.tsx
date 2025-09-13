import { Link } from 'wouter'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Calendar, ArrowRight } from 'lucide-react'
import { formatDate, getImageUrl } from '@/lib/utils'
import type { BlogPost } from '@shared/schema'

interface BlogCardProps {
  post: BlogPost
}

export default function BlogCard({ post }: BlogCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-xl transition-shadow" data-testid={`blog-card-${post._id}`}>
      {post.coverImage && (
        <div className="h-48 overflow-hidden">
          <img 
            src={getImageUrl(post.coverImage)} 
            alt={post.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            data-testid={`blog-card-image-${post._id}`}
          />
        </div>
      )}
      
      <CardContent className="p-6">
        {/* Tags and Date */}
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
          <div className="flex flex-wrap gap-2">
            {post.tags.slice(0, 2).map((tag) => (
              <Badge 
                key={tag} 
                variant="secondary" 
                className="text-xs"
                data-testid={`blog-tag-${tag}-${post._id}`}
              >
                {tag}
              </Badge>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span data-testid={`blog-date-${post._id}`}>
              {post.publishedAt ? formatDate(post.publishedAt) : 'Draft'}
            </span>
          </div>
        </div>

        {/* Title */}
        <Link href={`/blog/${post.slug}`}>
          <h3 className="text-xl font-semibold text-foreground mb-3 hover:text-primary transition-colors cursor-pointer line-clamp-2" data-testid={`blog-title-${post._id}`}>
            {post.title}
          </h3>
        </Link>

        {/* Excerpt */}
        <p className="text-muted-foreground mb-4 line-clamp-3" data-testid={`blog-excerpt-${post._id}`}>
          {post.excerpt}
        </p>

        {/* Read More Link */}
        <Link href={`/blog/${post.slug}`}>
          <div className="text-primary hover:text-primary/80 font-medium inline-flex items-center cursor-pointer transition-colors" data-testid={`blog-read-more-${post._id}`}>
            Read More 
            <ArrowRight className="ml-2 h-4 w-4" />
          </div>
        </Link>
      </CardContent>
    </Card>
  )
}
