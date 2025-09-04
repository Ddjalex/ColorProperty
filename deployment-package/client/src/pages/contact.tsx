import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { apiRequest } from '@/lib/queryClient'
import { MapPin, Phone, Mail, Clock, Facebook, Youtube, Instagram, Twitter, Linkedin, MessageCircle } from 'lucide-react'
import type { InsertLead, Settings } from '@shared/schema'

export default function Contact() {
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    propertyType: '',
    message: ''
  })

  // Get settings data
  const { data: settings } = useQuery<Settings>({
    queryKey: ['/api/settings'],
  })

  const createLead = useMutation({
    mutationFn: (lead: InsertLead) => apiRequest('POST', '/api/leads', lead),
    onSuccess: () => {
      toast({
        title: "Message Sent!",
        description: "Thank you for your inquiry. We'll get back to you soon.",
      })
      setFormData({
        name: '',
        email: '',
        phone: '',
        propertyType: '',
        message: ''
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    createLead.mutate({
      type: 'contact',
      name: formData.name,
      email: formData.email,
      phone: formData.phone || undefined,
      message: `Property Interest: ${formData.propertyType || 'Not specified'}\n\nMessage: ${formData.message}`,
    })
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-foreground mb-4">Get In Touch</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Ready to find your dream property? Contact our expert team today for personalized assistance.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Form */}
          <Card>
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold text-foreground mb-6">Send us a Message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Full Name *
                    </label>
                    <Input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Your full name"
                      data-testid="input-contact-name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      Phone Number
                    </label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+251 911 123 456"
                      data-testid="input-contact-phone"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Email Address *
                  </label>
                  <Input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="your.email@example.com"
                    data-testid="input-contact-email"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Property Interest
                  </label>
                  <Select value={formData.propertyType} onValueChange={(value) => handleInputChange('propertyType', value)}>
                    <SelectTrigger data-testid="select-contact-property-type">
                      <SelectValue placeholder="Select property type..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apartment">Residential Apartment</SelectItem>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="commercial">Commercial Space</SelectItem>
                      <SelectItem value="shop">Shop</SelectItem>
                      <SelectItem value="land">Land</SelectItem>
                      <SelectItem value="investment">Investment Property</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Message *
                  </label>
                  <Textarea
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    placeholder="Tell us about your property requirements..."
                    data-testid="textarea-contact-message"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={createLead.isPending}
                  data-testid="button-send-message"
                >
                  {createLead.isPending ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-6">Contact Information</h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="text-white h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Office Address</h3>
                    <p className="text-muted-foreground">
                      {settings?.address?.street || 'Addis Ababa'}<br />
                      {settings?.address?.city || 'Addis Ababa'}, {settings?.address?.country || 'Ethiopia'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="text-white h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Phone Numbers</h3>
                    <p className="text-muted-foreground">
                      {settings?.phoneNumber && `+${settings.phoneNumber.replace(/^\+?/, '')} (24/7 Hotline)`}<br />
                      {settings?.whatsappNumber && settings.whatsappNumber !== settings.phoneNumber && 
                        `+${settings.whatsappNumber.replace(/^\+?/, '')} (WhatsApp)`}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="text-white h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Email</h3>
                    <p className="text-muted-foreground">
                      {settings?.email || 'info@temerproperties.com'}<br />
                      {settings?.supportEmail && settings.supportEmail !== settings.email && settings.supportEmail}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="text-white h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Business Hours</h3>
                    <p className="text-muted-foreground">
                      Monday - Friday: 8:00 AM - 6:00 PM<br />
                      Saturday: 9:00 AM - 4:00 PM<br />
                      Sunday: Appointments Only
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div>
              <h3 className="font-semibold text-foreground mb-4">Follow Us</h3>
              <div className="flex space-x-4">
                <a href="#" className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white hover:bg-blue-700 transition-colors" data-testid="social-facebook">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center text-white hover:bg-red-700 transition-colors" data-testid="social-youtube">
                  <Youtube className="h-5 w-5" />
                </a>
                <a href="#" className="w-12 h-12 bg-pink-600 rounded-lg flex items-center justify-center text-white hover:bg-pink-700 transition-colors" data-testid="social-instagram">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center text-white hover:bg-gray-900 transition-colors" data-testid="social-twitter">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="w-12 h-12 bg-blue-700 rounded-lg flex items-center justify-center text-white hover:bg-blue-800 transition-colors" data-testid="social-linkedin">
                  <Linkedin className="h-5 w-5" />
                </a>
                <a href="#" className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white hover:bg-blue-600 transition-colors" data-testid="social-telegram">
                  <MessageCircle className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
