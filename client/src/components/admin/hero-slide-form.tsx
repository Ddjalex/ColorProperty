import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Upload, X } from 'lucide-react'
import { apiRequest } from '@/lib/queryClient'
import { insertHeroSlideSchema } from '@shared/schema'
import type { HeroSlide } from '@shared/schema'
import { z } from 'zod'

const formSchema = insertHeroSlideSchema.extend({
  imageFile: z.instanceof(File).optional(),
})

type FormData = z.infer<typeof formSchema>

interface HeroSlideFormProps {
  slide?: HeroSlide | null
  onSuccess: () => void
}

export default function HeroSlideForm({ slide, onSuccess }: HeroSlideFormProps) {
  const [imagePreview, setImagePreview] = useState<string>(slide?.imageUrl || '')
  const [uploadError, setUploadError] = useState<string>('')
  const queryClient = useQueryClient()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: slide?.title || '',
      subtitle: slide?.subtitle || '',
      imageUrl: slide?.imageUrl || '',
      ctaText: slide?.ctaText || '',
      ctaLink: slide?.ctaLink || '',
      order: slide?.order || 0,
      isActive: slide?.isActive ?? true,
    },
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/hero-slides', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hero-slides'] })
      onSuccess()
    },
    onError: () => {
      setUploadError('Failed to create hero slide')
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: any) => apiRequest('PUT', `/api/hero-slides/${slide?._id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/hero-slides'] })
      onSuccess()
    },
    onError: () => {
      setUploadError('Failed to update hero slide')
    },
  })

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setUploadError('Image size must be less than 5MB')
        return
      }

      if (!file.type.startsWith('image/')) {
        setUploadError('Please select a valid image file')
        return
      }

      setUploadError('')
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setImagePreview(result)
        form.setValue('imageUrl', result)
      }
      reader.readAsDataURL(file)
      
      form.setValue('imageFile', file)
    }
  }

  const removeImage = () => {
    setImagePreview('')
    form.setValue('imageUrl', '')
    form.setValue('imageFile', undefined)
  }

  const onSubmit = async (data: FormData) => {
    try {
      setUploadError('')
      
      // For now, we'll use the image URL directly
      // In a real app, you'd upload to a cloud service like Cloudinary
      const slideData = {
        title: data.title,
        subtitle: data.subtitle,
        imageUrl: data.imageUrl,
        ctaText: data.ctaText || undefined,
        ctaLink: data.ctaLink || undefined,
        order: data.order,
        isActive: data.isActive,
      }

      if (slide) {
        updateMutation.mutate(slideData)
      } else {
        createMutation.mutate(slideData)
      }
    } catch (error) {
      setUploadError('An error occurred while saving the slide')
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {uploadError && (
          <Alert variant="destructive">
            <AlertDescription>{uploadError}</AlertDescription>
          </Alert>
        )}

        {/* Image Upload */}
        <div className="space-y-4">
          <Label>Hero Image</Label>
          
          {imagePreview ? (
            <Card>
              <CardContent className="p-4">
                <div className="relative">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={removeImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                Upload an image or paste an image URL
              </p>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="mb-4"
                data-testid="input-image-file"
              />
              <p className="text-sm text-muted-foreground">Or</p>
            </div>
          )}
          
          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Image URL</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://example.com/image.jpg"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e)
                      if (e.target.value && !form.getValues('imageFile')) {
                        setImagePreview(e.target.value)
                      }
                    }}
                    data-testid="input-image-url"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Find Your Dream Home" 
                    {...field}
                    data-testid="input-title"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="order"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Order</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                    data-testid="input-order"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="subtitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subtitle/Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Discover premium properties across Ethiopia..."
                  rows={3}
                  {...field}
                  data-testid="textarea-subtitle"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Call to Action */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="ctaText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Call to Action Text (Optional)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Browse Properties" 
                    {...field}
                    data-testid="input-cta-text"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ctaLink"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Call to Action Link (Optional)</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="/properties" 
                    {...field}
                    data-testid="input-cta-link"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Status */}
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Active</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Show this slide in the hero carousel
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  data-testid="switch-is-active"
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onSuccess}
            data-testid="button-cancel"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading}
            data-testid="button-save-hero-slide"
          >
            {isLoading ? 'Saving...' : slide ? 'Update Slide' : 'Create Slide'}
          </Button>
        </div>
      </form>
    </Form>
  )
}