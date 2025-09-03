import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Plus, X, Upload, MapPin } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useCreateProperty, useUpdateProperty } from '@/hooks/use-properties'
import { generateSlug } from '@/lib/utils'
import type { Property } from '@shared/schema'

const propertyFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().min(1, 'Description is required'),
  location: z.string().min(1, 'Location is required'),
  propertyType: z.enum(['apartment', 'house', 'commercial', 'shop', 'land']),
  bedrooms: z.number().min(0).optional(),
  bathrooms: z.number().min(0).optional(),
  sizeSqm: z.number().min(1, 'Size is required'),
  priceETB: z.number().min(1, 'Price is required'),
  status: z.enum(['active', 'draft', 'sold', 'rented']),
  featured: z.boolean().default(false),
  amenities: z.array(z.string()).default([]),
  images: z.array(z.string()).default([]),
  imageFiles: z.array(z.instanceof(File)).default([]),
  project: z.string().optional(),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number(),
  }).optional(),
})

type PropertyFormData = z.infer<typeof propertyFormSchema>

interface PropertyFormProps {
  property?: Property | null
  onSuccess?: () => void
}

const commonAmenities = [
  'Parking', 'Swimming Pool', 'Gym', 'Security', 'Garden', 'Elevator',
  'Balcony', 'Air Conditioning', 'Heating', 'Internet', 'Kitchen', 'Laundry'
]

export default function PropertyForm({ property, onSuccess }: PropertyFormProps) {
  const { toast } = useToast()
  const [newAmenity, setNewAmenity] = useState('')
  const [newImage, setNewImage] = useState('')
  const [uploadError, setUploadError] = useState('')
  
  const createProperty = useCreateProperty()
  const updateProperty = useUpdateProperty()

  const form = useForm<PropertyFormData>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      title: '',
      slug: '',
      description: '',
      location: '',
      propertyType: 'apartment',
      bedrooms: 0,
      bathrooms: 0,
      sizeSqm: 0,
      priceETB: 0,
      status: 'draft',
      featured: false,
      amenities: [],
      images: [],
      imageFiles: [],
      project: '',
      coordinates: undefined,
    },
  })

  useEffect(() => {
    if (property) {
      form.reset({
        title: property.title,
        slug: property.slug,
        description: property.description,
        location: property.location,
        propertyType: property.propertyType,
        bedrooms: property.bedrooms || 0,
        bathrooms: property.bathrooms || 0,
        sizeSqm: property.sizeSqm,
        priceETB: property.priceETB,
        status: property.status,
        featured: property.featured,
        amenities: property.amenities,
        images: property.images,
        project: property.project || '',
        coordinates: property.coordinates,
      })
    }
  }, [property, form])

  const watchTitle = form.watch('title')
  
  useEffect(() => {
    if (watchTitle && !property) {
      form.setValue('slug', generateSlug(watchTitle))
    }
  }, [watchTitle, property, form])

  const onSubmit = async (data: PropertyFormData) => {
    try {
      if (property) {
        await updateProperty.mutateAsync({ id: property._id!, ...data })
        toast({
          title: "Property Updated",
          description: "The property has been successfully updated.",
        })
      } else {
        await createProperty.mutateAsync(data)
        toast({
          title: "Property Created",
          description: "The property has been successfully created.",
        })
      }
      onSuccess?.()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save property. Please try again.",
        variant: "destructive",
      })
    }
  }

  const addAmenity = (amenity: string) => {
    const currentAmenities = form.getValues('amenities')
    if (!currentAmenities.includes(amenity)) {
      form.setValue('amenities', [...currentAmenities, amenity])
    }
    setNewAmenity('')
  }

  const removeAmenity = (amenity: string) => {
    const currentAmenities = form.getValues('amenities')
    form.setValue('amenities', currentAmenities.filter(a => a !== amenity))
  }

  const addImage = () => {
    if (newImage.trim()) {
      const currentImages = form.getValues('images')
      form.setValue('images', [...currentImages, newImage.trim()])
      setNewImage('')
    }
  }

  const removeImage = (index: number) => {
    const currentImages = form.getValues('images')
    const currentFiles = form.getValues('imageFiles')
    form.setValue('images', currentImages.filter((_, i) => i !== index))
    form.setValue('imageFiles', currentFiles.filter((_, i) => i !== index))
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    setUploadError('')
    const currentImages = form.getValues('images')
    const currentFiles = form.getValues('imageFiles')

    Array.from(files).forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        setUploadError('Image size must be less than 5MB')
        return
      }

      if (!file.type.startsWith('image/')) {
        setUploadError('Please select valid image files')
        return
      }

      // Create preview using FileReader
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        form.setValue('images', [...currentImages, result])
      }
      reader.readAsDataURL(file)
      
      form.setValue('imageFiles', [...currentFiles, file])
    })

    // Reset the input
    event.target.value = ''
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter property title" {...field} data-testid="input-property-title" />
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
                      <Input placeholder="property-slug" {...field} data-testid="input-property-slug" />
                    </FormControl>
                    <FormDescription>
                      URL-friendly version of the title
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter property description" 
                      rows={4} 
                      {...field} 
                      data-testid="textarea-property-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Bole, Addis Ababa" {...field} data-testid="input-property-location" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="project"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter project name (optional)" {...field} data-testid="input-property-project" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Property Details */}
        <Card>
          <CardHeader>
            <CardTitle>Property Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="propertyType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Property Type *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-property-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="apartment">Apartment</SelectItem>
                        <SelectItem value="house">House</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                        <SelectItem value="shop">Shop</SelectItem>
                        <SelectItem value="land">Land</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bedrooms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bedrooms</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0"
                        placeholder="0"
                        {...field} 
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        data-testid="input-property-bedrooms"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bathrooms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bathrooms</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="0"
                        placeholder="0"
                        {...field} 
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        data-testid="input-property-bathrooms"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sizeSqm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Size (m²) *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1"
                        placeholder="120"
                        {...field} 
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        data-testid="input-property-size"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="priceETB"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (ETB) *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1"
                        placeholder="3500000"
                        {...field} 
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        data-testid="input-property-price"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-property-status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="sold">Sold</SelectItem>
                        <SelectItem value="rented">Rented</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="checkbox-property-featured"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Featured Property</FormLabel>
                      <FormDescription>
                        Show this property in featured sections
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Amenities */}
        <Card>
          <CardHeader>
            <CardTitle>Amenities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {form.watch('amenities').map((amenity) => (
                <Badge key={amenity} variant="secondary" className="flex items-center gap-1">
                  {amenity}
                  <X 
                    className="h-3 w-3 cursor-pointer hover:text-destructive" 
                    onClick={() => removeAmenity(amenity)}
                    data-testid={`remove-amenity-${amenity}`}
                  />
                </Badge>
              ))}
            </div>

            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Add custom amenity"
                  value={newAmenity}
                  onChange={(e) => setNewAmenity(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity(newAmenity))}
                  data-testid="input-new-amenity"
                />
                <Button 
                  type="button" 
                  onClick={() => addAmenity(newAmenity)}
                  disabled={!newAmenity.trim()}
                  data-testid="button-add-amenity"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {commonAmenities.map((amenity) => (
                  <Button
                    key={amenity}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addAmenity(amenity)}
                    disabled={form.watch('amenities').includes(amenity)}
                    data-testid={`add-common-amenity-${amenity.toLowerCase().replace(' ', '-')}`}
                  >
                    {amenity}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card>
          <CardHeader>
            <CardTitle>Images</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {uploadError && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-3 py-2 rounded-md text-sm">
                {uploadError}
              </div>
            )}

            <div className="space-y-2">
              {form.watch('images').map((image, index) => (
                <div key={index} className="flex items-center gap-2 p-2 border rounded">
                  <img 
                    src={image} 
                    alt={`Property ${index + 1}`}
                    className="w-16 h-16 object-cover rounded"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-property.jpg'
                    }}
                  />
                  <span className="flex-1 text-sm text-muted-foreground truncate">
                    {image.startsWith('data:') ? `Image file ${index + 1}` : image}
                  </span>
                  <Button 
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeImage(index)}
                    data-testid={`remove-image-${index}`}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Upload Images</label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="image-upload"
                  data-testid="input-image-files"
                />
                <label
                  htmlFor="image-upload"
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 cursor-pointer"
                  data-testid="button-upload-images"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Images
                </label>
                <span className="text-sm text-muted-foreground">
                  Select multiple image files (max 5MB each)
                </span>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            {/* URL Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Add Image URL</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter image URL"
                  value={newImage}
                  onChange={(e) => setNewImage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())}
                  data-testid="input-new-image"
                />
                <Button 
                  type="button" 
                  onClick={addImage}
                  disabled={!newImage.trim()}
                  data-testid="button-add-image"
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add URL
                </Button>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              Upload image files directly or enter URLs from Cloudinary or other image hosting services.
            </p>
          </CardContent>
        </Card>

        {/* Location Coordinates */}
        <Card>
          <CardHeader>
            <CardTitle>Location Coordinates (Optional)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="coordinates.lat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Latitude (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="any"
                        placeholder="9.0320"
                        {...field} 
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value === '' ? undefined : parseFloat(value) || undefined);
                        }}
                        data-testid="input-property-latitude"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="coordinates.lng"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Longitude (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="any"
                        placeholder="38.7620"
                        {...field} 
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value === '' ? undefined : parseFloat(value) || undefined);
                        }}
                        data-testid="input-property-longitude"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>Coordinates will be used for map integration and location services</span>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onSuccess}
            data-testid="button-cancel-property"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={createProperty.isPending || updateProperty.isPending}
            data-testid="button-save-property"
          >
            {(createProperty.isPending || updateProperty.isPending) ? 'Saving...' : (property ? 'Update Property' : 'Create Property')}
          </Button>
        </div>
      </form>
    </Form>
  )
}
