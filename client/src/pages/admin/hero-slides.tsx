import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/lib/auth'
import AdminSidebar from '@/components/admin/sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Edit, Trash2, Search, Eye, ArrowUp, ArrowDown } from 'lucide-react'
import { Link } from 'wouter'
import { formatDate } from '@/lib/utils'
import { apiRequest } from '@/lib/queryClient'
import HeroSlideForm from '@/components/admin/hero-slide-form'
import type { HeroSlide } from '@shared/schema'

export default function AdminHeroSlides() {
  const { user, isAuthenticated } = useAuth()
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null)
  const queryClient = useQueryClient()

  const { data: heroSlides = [], isLoading } = useQuery<HeroSlide[]>({
    queryKey: ['/api/hero-slides'],
    enabled: isAuthenticated,
  })

  const deleteMutation = useMutation({
    mutationFn: (slideId: string) => apiRequest('DELETE', `/api/hero-slides/${slideId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hero-slides'] })
    },
  })

  const updateOrderMutation = useMutation({
    mutationFn: ({ slideId, order }: { slideId: string, order: number }) => 
      apiRequest('PUT', `/api/hero-slides/${slideId}`, { order }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hero-slides'] })
    },
  })

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground mb-4">Access Denied</h1>
              <p className="text-muted-foreground mb-6">
                Please log in to access the admin dashboard.
              </p>
              <Link href="/login">
                <Button>Login</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const filteredSlides = heroSlides.filter(slide =>
    !searchTerm || 
    slide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    slide.subtitle.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEdit = (slide: HeroSlide) => {
    setEditingSlide(slide)
    setIsDialogOpen(true)
  }

  const handleDelete = (slideId: string) => {
    if (confirm('Are you sure you want to delete this hero slide?')) {
      deleteMutation.mutate(slideId)
    }
  }

  const handleFormClose = () => {
    setIsDialogOpen(false)
    setEditingSlide(null)
  }

  const moveSlide = (slideId: string, direction: 'up' | 'down') => {
    const currentSlide = heroSlides.find(s => s._id === slideId)
    if (!currentSlide) return

    const currentOrder = currentSlide.order || 0
    const newOrder = direction === 'up' ? currentOrder - 1 : currentOrder + 1
    
    updateOrderMutation.mutate({ slideId, order: newOrder })
  }

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />
      
      <div className="flex-1 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Hero Slides</h1>
            <p className="text-muted-foreground">Manage homepage hero slider content</p>
          </div>
          <Button 
            onClick={() => setIsDialogOpen(true)}
            data-testid="button-add-hero-slide"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Hero Slide
          </Button>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingSlide ? 'Edit Hero Slide' : 'Add New Hero Slide'}
                </DialogTitle>
              </DialogHeader>
              <HeroSlideForm 
                slide={editingSlide}
                onSuccess={handleFormClose}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search hero slides..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-hero-slides"
              />
            </div>
          </CardContent>
        </Card>

        {/* Hero Slides Grid */}
        <Card>
          <CardHeader>
            <CardTitle>Hero Slides ({filteredSlides.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading hero slides...</p>
              </div>
            ) : filteredSlides.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSlides.map((slide) => (
                  <Card key={slide._id} className="overflow-hidden">
                    <div className="relative aspect-video">
                      <img 
                        src={slide.imageUrl} 
                        alt={slide.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="secondary"
                            onClick={() => handleEdit(slide)}
                            data-testid={`button-edit-${slide._id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleDelete(slide._id!)}
                            data-testid={`button-delete-${slide._id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-foreground truncate">{slide.title}</h3>
                        <div className="flex space-x-1 ml-2">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => moveSlide(slide._id!, 'up')}
                            data-testid={`button-move-up-${slide._id}`}
                          >
                            <ArrowUp className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => moveSlide(slide._id!, 'down')}
                            data-testid={`button-move-down-${slide._id}`}
                          >
                            <ArrowDown className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {slide.subtitle}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge 
                          variant={slide.isActive ? 'default' : 'secondary'}
                          className={slide.isActive ? 'bg-primary' : ''}
                        >
                          {slide.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Order: {slide.order || 0}
                        </span>
                      </div>
                      {slide.createdAt && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Created: {formatDate(slide.createdAt)}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No hero slides yet</p>
                <Button 
                  className="mt-4"
                  onClick={() => setIsDialogOpen(true)}
                  data-testid="button-add-first-hero-slide"
                >
                  Add First Hero Slide
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}