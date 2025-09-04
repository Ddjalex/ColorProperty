import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/lib/auth'
import AdminSidebar from '@/components/admin/sidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Plus, Trash2, Save } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { apiRequest } from '@/lib/queryClient'
import type { Settings } from '@shared/schema'

export default function AdminSettings() {
  const { isAuthenticated } = useAuth()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: settings, isLoading } = useQuery<Settings>({
    queryKey: ['/api/settings'],
    enabled: isAuthenticated,
  })

  const [formData, setFormData] = useState({
    phoneNumber: '',
    whatsappNumber: '',
    email: '',
    supportEmail: '',
    address: {
      street: '',
      city: '',
      region: '',
      country: 'Ethiopia',
      postalCode: '',
    },
    businessHours: {
      monday: '9:00 AM - 6:00 PM',
      tuesday: '9:00 AM - 6:00 PM',
      wednesday: '9:00 AM - 6:00 PM',
      thursday: '9:00 AM - 6:00 PM',
      friday: '9:00 AM - 6:00 PM',
      saturday: '9:00 AM - 4:00 PM',
      sunday: 'Closed',
    },
    hotlineNumbers: [] as string[],
    socialLinks: {
      facebook: '',
      youtube: '',
      instagram: '',
      twitter: '',
      linkedin: '',
      telegram: '',
    },
    whatsappTemplate: '',
    seoDefaults: {
      title: '',
      description: '',
      keywords: '',
    },
  })

  // Update form data when settings are loaded
  React.useEffect(() => {
    if (settings) {
      setFormData({
        phoneNumber: settings.phoneNumber || '0974408281',
        whatsappNumber: settings.whatsappNumber || '0974408281',
        email: settings.email || '',
        supportEmail: settings.supportEmail || '',
        address: {
          street: settings.address?.street || '',
          city: settings.address?.city || '',
          region: settings.address?.region || '',
          country: settings.address?.country || 'Ethiopia',
          postalCode: settings.address?.postalCode || '',
        },
        businessHours: {
          monday: settings.businessHours?.monday || '9:00 AM - 6:00 PM',
          tuesday: settings.businessHours?.tuesday || '9:00 AM - 6:00 PM',
          wednesday: settings.businessHours?.wednesday || '9:00 AM - 6:00 PM',
          thursday: settings.businessHours?.thursday || '9:00 AM - 6:00 PM',
          friday: settings.businessHours?.friday || '9:00 AM - 6:00 PM',
          saturday: settings.businessHours?.saturday || '9:00 AM - 4:00 PM',
          sunday: settings.businessHours?.sunday || 'Closed',
        },
        hotlineNumbers: settings.hotlineNumbers || [],
        socialLinks: {
          facebook: settings.socialLinks?.facebook || '',
          youtube: settings.socialLinks?.youtube || '',
          instagram: settings.socialLinks?.instagram || '',
          twitter: settings.socialLinks?.twitter || '',
          linkedin: settings.socialLinks?.linkedin || '',
          telegram: settings.socialLinks?.telegram || '',
        },
        whatsappTemplate: settings.whatsappTemplate || "I'm interested in {propertyTitle} - {propertyPrice}. Property link: {propertyLink}",
        seoDefaults: {
          title: settings.seoDefaults?.title || '',
          description: settings.seoDefaults?.description || '',
          keywords: settings.seoDefaults?.keywords || '',
        },
      })
    }
  }, [settings])

  const updateSettings = useMutation({
    mutationFn: (updatedSettings: Partial<Settings>) =>
      apiRequest('PUT', '/api/settings', updatedSettings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] })
      toast({
        title: "Settings Updated",
        description: "Your settings have been saved successfully.",
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateSettings.mutate(formData)
  }

  const addHotlineNumber = () => {
    setFormData(prev => ({
      ...prev,
      hotlineNumbers: [...prev.hotlineNumbers, '']
    }))
  }

  const updateHotlineNumber = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      hotlineNumbers: prev.hotlineNumbers.map((num, i) => i === index ? value : num)
    }))
  }

  const removeHotlineNumber = (index: number) => {
    setFormData(prev => ({
      ...prev,
      hotlineNumbers: prev.hotlineNumbers.filter((_, i) => i !== index)
    }))
  }

  const updateSocialLink = (platform: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value
      }
    }))
  }

  const updateSeoDefault = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      seoDefaults: {
        ...prev.seoDefaults,
        [field]: value
      }
    }))
  }

  const updateAddress = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value
      }
    }))
  }

  const updateBusinessHours = (day: string, hours: string) => {
    setFormData(prev => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: hours
      }
    }))
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Please log in to access this page.</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex">
        <AdminSidebar />
        <div className="flex-1 p-8">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading settings...</p>
          </div>
        </div>
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
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground">Manage your website settings and preferences</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="max-w-4xl space-y-8">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage all your business contact details and communication preferences
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Primary Contact */}
              <div>
                <h4 className="text-lg font-medium mb-4">Primary Contact</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Phone Number
                    </label>
                    <Input
                      type="tel"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      placeholder="0974408281"
                      data-testid="input-phone-number"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Used for call buttons on property cards
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      WhatsApp Number
                    </label>
                    <Input
                      type="tel"
                      value={formData.whatsappNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, whatsappNumber: e.target.value }))}
                      placeholder="0974408281"
                      data-testid="input-whatsapp-number"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Used for WhatsApp buttons on property cards
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="info@temerproperties.com"
                      data-testid="input-email"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Main email for contact forms and inquiries
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Support Email
                    </label>
                    <Input
                      type="email"
                      value={formData.supportEmail}
                      onChange={(e) => setFormData(prev => ({ ...prev, supportEmail: e.target.value }))}
                      placeholder="support@temerproperties.com"
                      data-testid="input-support-email"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Dedicated support email address
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Business Address */}
              <div>
                <h4 className="text-lg font-medium mb-4">Business Address</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Street Address
                    </label>
                    <Input
                      value={formData.address.street}
                      onChange={(e) => updateAddress('street', e.target.value)}
                      placeholder="123 Bole Road"
                      data-testid="input-address-street"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      City
                    </label>
                    <Input
                      value={formData.address.city}
                      onChange={(e) => updateAddress('city', e.target.value)}
                      placeholder="Addis Ababa"
                      data-testid="input-address-city"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Region/State
                    </label>
                    <Input
                      value={formData.address.region}
                      onChange={(e) => updateAddress('region', e.target.value)}
                      placeholder="Addis Ababa"
                      data-testid="input-address-region"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Country
                    </label>
                    <Input
                      value={formData.address.country}
                      onChange={(e) => updateAddress('country', e.target.value)}
                      placeholder="Ethiopia"
                      data-testid="input-address-country"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Postal Code
                    </label>
                    <Input
                      value={formData.address.postalCode}
                      onChange={(e) => updateAddress('postalCode', e.target.value)}
                      placeholder="1000"
                      data-testid="input-address-postal"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Business Hours */}
              <div>
                <h4 className="text-lg font-medium mb-4">Business Hours</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(formData.businessHours).map(([day, hours]) => (
                    <div key={day}>
                      <label className="block text-sm font-medium text-muted-foreground mb-2 capitalize">
                        {day}
                      </label>
                      <Input
                        value={hours}
                        onChange={(e) => updateBusinessHours(day, e.target.value)}
                        placeholder="9:00 AM - 6:00 PM"
                        data-testid={`input-hours-${day}`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* WhatsApp Template */}
              <div>
                <h4 className="text-lg font-medium mb-4">WhatsApp Communication</h4>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Message Template
                  </label>
                  <Textarea
                    value={formData.whatsappTemplate}
                    onChange={(e) => setFormData(prev => ({ ...prev, whatsappTemplate: e.target.value }))}
                    placeholder="I'm interested in {propertyTitle} - {propertyPrice}. Property link: {propertyLink}"
                    rows={3}
                    data-testid="input-whatsapp-template"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Available variables: {'{propertyTitle}'}, {'{propertyPrice}'}, {'{propertyLink}'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hotline Numbers */}
          <Card>
            <CardHeader>
              <CardTitle>Hotline Numbers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.hotlineNumbers.map((number, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    type="tel"
                    value={number}
                    onChange={(e) => updateHotlineNumber(index, e.target.value)}
                    placeholder="+251-911-6033"
                    className="flex-1"
                    data-testid={`input-hotline-${index}`}
                  />
                  <Button 
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeHotlineNumber(index)}
                    data-testid={`button-remove-hotline-${index}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button 
                type="button"
                variant="outline"
                onClick={addHotlineNumber}
                data-testid="button-add-hotline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Hotline Number
              </Button>
            </CardContent>
          </Card>

          {/* Social Media Links */}
          <Card>
            <CardHeader>
              <CardTitle>Social Media Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Facebook</label>
                  <Input
                    type="url"
                    value={formData.socialLinks.facebook}
                    onChange={(e) => updateSocialLink('facebook', e.target.value)}
                    placeholder="https://facebook.com/temerproperties"
                    data-testid="input-facebook"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">YouTube</label>
                  <Input
                    type="url"
                    value={formData.socialLinks.youtube}
                    onChange={(e) => updateSocialLink('youtube', e.target.value)}
                    placeholder="https://youtube.com/@temerproperties"
                    data-testid="input-youtube"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Instagram</label>
                  <Input
                    type="url"
                    value={formData.socialLinks.instagram}
                    onChange={(e) => updateSocialLink('instagram', e.target.value)}
                    placeholder="https://instagram.com/temerproperties"
                    data-testid="input-instagram"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Twitter</label>
                  <Input
                    type="url"
                    value={formData.socialLinks.twitter}
                    onChange={(e) => updateSocialLink('twitter', e.target.value)}
                    placeholder="https://twitter.com/temerproperties"
                    data-testid="input-twitter"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">LinkedIn</label>
                  <Input
                    type="url"
                    value={formData.socialLinks.linkedin}
                    onChange={(e) => updateSocialLink('linkedin', e.target.value)}
                    placeholder="https://linkedin.com/company/temerproperties"
                    data-testid="input-linkedin"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">Telegram</label>
                  <Input
                    type="url"
                    value={formData.socialLinks.telegram}
                    onChange={(e) => updateSocialLink('telegram', e.target.value)}
                    placeholder="https://t.me/temerproperties"
                    data-testid="input-telegram"
                  />
                </div>
              </div>
            </CardContent>
          </Card>


          {/* SEO Defaults */}
          <Card>
            <CardHeader>
              <CardTitle>SEO Defaults</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Default Title</label>
                <Input
                  value={formData.seoDefaults.title}
                  onChange={(e) => updateSeoDefault('title', e.target.value)}
                  placeholder="Temer Properties - Premium Real Estate in Ethiopia"
                  data-testid="input-seo-title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Default Description</label>
                <Textarea
                  value={formData.seoDefaults.description}
                  onChange={(e) => updateSeoDefault('description', e.target.value)}
                  placeholder="Find your dream property in Ethiopia with Temer Properties. Browse apartments, commercial spaces, and luxury homes in Addis Ababa and beyond."
                  rows={3}
                  data-testid="textarea-seo-description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Default Keywords</label>
                <Input
                  value={formData.seoDefaults.keywords}
                  onChange={(e) => updateSeoDefault('keywords', e.target.value)}
                  placeholder="real estate, property, Ethiopia, Addis Ababa, apartments, houses"
                  data-testid="input-seo-keywords"
                />
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Save Button */}
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={updateSettings.isPending}
              data-testid="button-save-settings"
            >
              <Save className="h-4 w-4 mr-2" />
              {updateSettings.isPending ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
