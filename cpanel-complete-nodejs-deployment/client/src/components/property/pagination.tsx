import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export default function PropertyPagination({ currentPage, totalPages, onPageChange, className }: PaginationProps) {
  const generatePageNumbers = () => {
    const pages: (number | string)[] = []
    
    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)
      
      if (currentPage <= 3) {
        // Show first 3 pages, ellipsis, last page
        pages.push(2, 3, '...', totalPages)
      } else if (currentPage >= totalPages - 2) {
        // Show first page, ellipsis, last 3 pages
        pages.push('...', totalPages - 2, totalPages - 1, totalPages)
      } else {
        // Show first page, ellipsis, current-1, current, current+1, ellipsis, last page
        pages.push('...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages)
      }
    }
    
    return pages
  }

  const pages = generatePageNumbers()

  if (totalPages <= 1) {
    return null
  }

  return (
    <div className={cn('flex items-center justify-center space-x-2', className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        data-testid="button-prev-page"
        className="px-3 py-2"
      >
        Previous
      </Button>
      
      {pages.map((page, index) => (
        <div key={index}>
          {page === '...' ? (
            <span className="px-2 py-2 text-muted-foreground">...</span>
          ) : (
            <Button
              variant={currentPage === page ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPageChange(page as number)}
              data-testid={`button-page-${page}`}
              className={cn(
                'min-w-[40px] h-10',
                currentPage === page 
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90' 
                  : 'hover:bg-accent'
              )}
            >
              {page}
            </Button>
          )}
        </div>
      ))}
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        data-testid="button-next-page"
        className="px-3 py-2"
      >
        Next
      </Button>
    </div>
  )
}