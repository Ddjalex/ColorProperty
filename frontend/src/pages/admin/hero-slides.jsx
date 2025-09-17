import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  Image,
  MoveUp,
  MoveDown,
  Upload,
  X
} from 'lucide-react'

export default function AdminHeroSlides() {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingSlide, setEditingSlide] = useState(null)
  
  const queryClient = useQueryClient()

  // Fetch hero slides
  const { data: slides = [], isLoading, error } = useQuery({
    queryKey: ['/api/hero-slides'],
    queryFn: async () => {
      const response = await fetch('/api/hero-slides')
      if (!response.ok) throw new Error('Failed to fetch hero slides')
      return response.json()
    }
  })

  // Delete slide mutation
  const deleteMutation = useMutation({
    mutationFn: async (slideId) => {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`/api/hero-slides/${slideId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (!response.ok) throw new Error('Failed to delete hero slide')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['/api/hero-slides'])
    }
  })

  const handleDelete = async (slideId) => {
    if (window.confirm('Are you sure you want to delete this hero slide?')) {
      deleteMutation.mutate(slideId)
    }
  }

  if (isLoading) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Loading hero slides...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-lg text-red-600">Error loading hero slides: {error.message}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Hero Slides</h1>
              <p className="text-gray-600">Manage your website hero slides</p>
            </div>
            <Button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Hero Slide
            </Button>
          </div>
        </div>

        {/* Hero Slides List */}
        {slides.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hero slides found</h3>
              <p className="text-gray-600 mb-4">
                Get started by adding your first hero slide.
              </p>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Hero Slide
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {slides.map((slide, index) => (
              <Card key={slide._id} className="overflow-hidden">
                <div className="flex">
                  <div className="w-48 h-32 bg-gray-200 relative flex-shrink-0">
                    {slide.imageUrl ? (
                      <img
                        src={slide.imageUrl}
                        alt={slide.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <Image className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col">
                    <CardHeader className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {slide.title || 'Untitled Slide'}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {slide.subtitle || 'No subtitle'}
                          </CardDescription>
                        </div>
                        <Badge variant="outline">
                          Order: {slide.order || index + 1}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingSlide(slide)}
                        >
                          <Edit2 className="mr-1 h-3 w-3" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(slide._id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="mr-1 h-3 w-3" />
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Statistics */}
        <div className="mt-8">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{slides.length}</div>
              <div className="text-sm text-gray-600">Total Hero Slides</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add/Edit Hero Slide Modal - Simple form for now */}
      {(showAddForm || editingSlide) && (
        <HeroSlideForm 
          isOpen={showAddForm || !!editingSlide}
          slide={editingSlide}
          onClose={() => {
            setShowAddForm(false)
            setEditingSlide(null)
          }} 
          onSuccess={() => {
            setShowAddForm(false)
            setEditingSlide(null)
            queryClient.invalidateQueries(['/api/hero-slides'])
          }}
        />
      )}
    </div>
  )
}

// Hero Slide Form Component with File Upload
function HeroSlideForm({ isOpen, slide, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: slide?.title || '',
    subtitle: slide?.subtitle || '',
    imageUrl: slide?.imageUrl || '',
    order: slide?.order || 1
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError] = useState('')

  const handleImageUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    setUploadingImage(true)
    setError('')

    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select a valid image file')
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image size must be less than 5MB')
      }

      // Convert to base64
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      setFormData({ ...formData, imageUrl: base64 })
    } catch (error) {
      setError(error.message)
    } finally {
      setUploadingImage(false)
    }
  }

  const removeImage = () => {
    setFormData({ ...formData, imageUrl: '' })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const token = localStorage.getItem('authToken')
      if (!token) {
        throw new Error('You must be logged in to save hero slides')
      }

      const url = slide ? `/api/hero-slides/${slide._id}` : '/api/hero-slides'
      const method = slide ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        let errorMessage = 'Failed to save hero slide'
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorMessage
        } catch (parseError) {
          // If response is not JSON, show response status
          errorMessage = `Server error: ${response.status} ${response.statusText}`
        }
        throw new Error(errorMessage)
      }

      onSuccess()
    } catch (error) {
      console.error('Save error:', error)
      setError('Failed to save hero slide: ' + error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {slide ? 'Edit Hero Slide' : 'Add Hero Slide'}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subtitle
            </label>
            <textarea
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={2}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hero Image
            </label>
            
            {formData.imageUrl ? (
              <div className="space-y-3">
                <div className="relative inline-block">
                  <img
                    src={formData.imageUrl}
                    alt="Hero slide preview"
                    className="w-full h-32 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-sm text-gray-600">Click the X to remove and upload a different image</p>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-600 mb-2">
                    {uploadingImage ? 'Uploading...' : 'Click to upload hero image'}
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 5MB
                  </p>
                </label>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Order
            </label>
            <input
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="1"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting || uploadingImage}
              className="flex-1"
            >
              {isSubmitting ? 'Saving...' : (slide ? 'Update' : 'Create')}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}