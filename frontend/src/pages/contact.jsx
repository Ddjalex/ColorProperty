import { Phone, Mail, MapPin } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function Contact() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-lg text-muted-foreground">
            Get in touch with our real estate experts
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card>
            <CardHeader className="text-center">
              <Phone className="w-12 h-12 text-primary mx-auto mb-4" />
              <CardTitle>Phone</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">Call us anytime</p>
              <p className="font-semibold">+251 974 408 281</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Mail className="w-12 h-12 text-primary mx-auto mb-4" />
              <CardTitle>Email</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">Send us a message</p>
              <p className="font-semibold">info@temerproperties.com</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <MapPin className="w-12 h-12 text-primary mx-auto mb-4" />
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground">Visit our office</p>
              <p className="font-semibold">Addis Ababa, Ethiopia</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}