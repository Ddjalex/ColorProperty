import { useState, useEffect, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Phone, MessageCircle, Settings, Save, Check } from 'lucide-react'

export default function AdminSettings() {
  const [formData, setFormData] = useState({
    phoneNumber: '',
    whatsappNumber: '',
    whatsappTemplate: '',
    companyName: '',
    companyEmail: ''
  })
  
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [autoSaving, setAutoSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState(null)
  
  const queryClient = useQueryClient()

  // Fetch current settings
  const { data: settings = {}, isLoading } = useQuery({
    queryKey: ['/api/settings'],
    queryFn: async () => {
      const response = await fetch('/api/settings')
      if (!response.ok) throw new Error('Failed to fetch settings')
      return response.json()
    }
  })

  // Initialize form with settings data
  useEffect(() => {
    if (settings) {
      setFormData({
        phoneNumber: settings.phoneNumber || '',
        whatsappNumber: settings.whatsappNumber || '',
        whatsappTemplate: settings.whatsappTemplate || "I'm interested in {propertyTitle} - {propertyPrice}. Property link: {propertyLink}",
        companyName: settings.companyName || 'Temer Properties',
        companyEmail: settings.companyEmail || ''
      })
    }
  }, [settings])

  // Update settings mutation
  const updateMutation = useMutation({
    mutationFn: async (data) => {
      const token = localStorage.getItem('authToken')
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update settings')
      }
      
      return response.json()
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries(['/api/settings'])
      // Only show alert for manual saves, not auto-saves
      if (!context?.isAutoSave) {
        alert('Settings updated successfully!')
      }
      setLastSaved(new Date())
    },
    onError: (error) => {
      setErrors({ submit: error.message })
    },
    onSettled: (data, error, variables, context) => {
      if (context?.isAutoSave) {
        setAutoSaving(false)
      } else {
        setIsSubmitting(false)
      }
    }
  })

  // Auto-save functionality with debouncing
  const debouncedAutoSave = useCallback(
    debounce((data) => {
      setAutoSaving(true)
      updateMutation.mutate(data, { context: { isAutoSave: true } })
    }, 2000), // 2 second delay
    [updateMutation]
  )

  // Auto-save when form data changes
  useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      // Only auto-save if form has been modified from initial settings
      const hasChanged = Object.keys(formData).some(key => 
        formData[key] !== (settings[key] || '')
      )
      
      if (hasChanged) {
        debouncedAutoSave(formData)
      }
    }
  }, [formData, settings, debouncedAutoSave])

  // Debounce utility function
  function debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required'
    if (!formData.whatsappNumber.trim()) newErrors.whatsappNumber = 'WhatsApp number is required'
    if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    
    setIsSubmitting(true)
    setErrors({})
    
    updateMutation.mutate(formData)
  }

  if (isLoading) {
    return (
      <div className="py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Loading settings...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="py-6">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Configure application settings</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-700">{errors.submit}</p>
            </div>
          )}

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.phoneNumber ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., +251974408281"
                  />
                  {errors.phoneNumber && <p className="text-red-600 text-sm mt-1">{errors.phoneNumber}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    name="whatsappNumber"
                    value={formData.whatsappNumber}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.whatsappNumber ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., +251974408281"
                  />
                  {errors.whatsappNumber && <p className="text-red-600 text-sm mt-1">{errors.whatsappNumber}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* WhatsApp Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                WhatsApp Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  WhatsApp Message Template
                </label>
                <textarea
                  name="whatsappTemplate"
                  value={formData.whatsappTemplate}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="I'm interested in {propertyTitle} - {propertyPrice}. Property link: {propertyLink}"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Available variables: {"{propertyTitle}"}, {"{propertyPrice}"}, {"{propertyLink}"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.companyName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Temer Properties"
                  />
                  {errors.companyName && <p className="text-red-600 text-sm mt-1">{errors.companyName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Email
                  </label>
                  <input
                    type="email"
                    name="companyEmail"
                    value={formData.companyEmail}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., info@temerproperties.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              {autoSaving && (
                <span className="flex items-center">
                  <div className="animate-spin h-3 w-3 border border-blue-500 border-t-transparent rounded-full mr-2"></div>
                  Auto-saving...
                </span>
              )}
              {lastSaved && !autoSaving && (
                <span className="flex items-center text-green-600">
                  <Check className="mr-1 h-3 w-3" />
                  Auto-saved {lastSaved.toLocaleTimeString()}
                </span>
              )}
            </div>
            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}