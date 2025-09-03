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
          {/* Contact Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Settings</CardTitle>
              <p className="text-sm text-muted-foreground">
                Primary contact numbers used for call and WhatsApp buttons on property listings
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
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
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">
                  WhatsApp Message Template
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

          {/* WhatsApp Template */}
          <Card>
            <CardHeader>
              <CardTitle>WhatsApp Message Template</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={formData.whatsappTemplate}
                onChange={(e) => setFormData(prev => ({ ...prev, whatsappTemplate: e.target.value }))}
                placeholder="I'm interested in {propertyTitle}"
                rows={3}
                data-testid="textarea-whatsapp-template"
              />
              <p className="text-sm text-muted-foreground mt-2">
                Use {'{propertyTitle}'} to include the property title in the message.
              </p>
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
