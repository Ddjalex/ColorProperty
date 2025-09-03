import { Link } from 'wouter'
import { Building, Facebook, Youtube, Instagram, Twitter, Linkedin, MessageCircle } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <Building className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Temer</h1>
                <p className="text-xs text-gray-400 uppercase tracking-wide">Properties</p>
              </div>
            </div>
            <p className="text-gray-400 mb-6">
              Your trusted partner in finding the perfect property in Ethiopia. We provide premium real estate services with integrity and professionalism.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary transition-colors" data-testid="footer-facebook">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors" data-testid="footer-youtube">
                <Youtube className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors" data-testid="footer-instagram">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors" data-testid="footer-twitter">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors" data-testid="footer-linkedin">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors" data-testid="footer-telegram">
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link href="/"><a className="text-gray-400 hover:text-primary transition-colors" data-testid="footer-link-home">Home</a></Link></li>
              <li><Link href="/properties"><a className="text-gray-400 hover:text-primary transition-colors" data-testid="footer-link-properties">Properties</a></Link></li>
              <li><Link href="/team"><a className="text-gray-400 hover:text-primary transition-colors" data-testid="footer-link-team">Our Team</a></Link></li>
              <li><Link href="/blog"><a className="text-gray-400 hover:text-primary transition-colors" data-testid="footer-link-blog">Blog</a></Link></li>
              <li><Link href="/contact"><a className="text-gray-400 hover:text-primary transition-colors" data-testid="footer-link-contact">Contact</a></Link></li>
            </ul>
          </div>

          {/* Property Types */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Property Types</h3>
            <ul className="space-y-3">
              <li><a href="/properties?type=apartment" className="text-gray-400 hover:text-primary transition-colors" data-testid="footer-link-apartments">Apartments</a></li>
              <li><a href="/properties?type=house" className="text-gray-400 hover:text-primary transition-colors" data-testid="footer-link-houses">Houses</a></li>
              <li><a href="/properties?type=commercial" className="text-gray-400 hover:text-primary transition-colors" data-testid="footer-link-commercial">Commercial Spaces</a></li>
              <li><a href="/properties?type=shop" className="text-gray-400 hover:text-primary transition-colors" data-testid="footer-link-shops">Shops</a></li>
              <li><a href="/properties?type=land" className="text-gray-400 hover:text-primary transition-colors" data-testid="footer-link-land">Land</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Contact Info</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="text-primary mt-1">📍</div>
                <div>
                  <p className="text-gray-400">Bole Road, Near Edna Mall</p>
                  <p className="text-gray-400">Addis Ababa, Ethiopia</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-primary">📞</div>
                <p className="text-gray-400">+251-911-6033</p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="text-primary">✉️</div>
                <p className="text-gray-400">info@temerproperties.com</p>
              </div>
            </div>

            {/* Hotline Banner */}
            <div className="bg-primary rounded-lg p-4 mt-6">
              <p className="text-center font-semibold">24/7 Hotline</p>
              <p className="text-center text-xl font-bold">+251-911-6033</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <p className="text-gray-400 text-sm">
              © 2024 Temer Properties. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-primary text-sm transition-colors" data-testid="footer-privacy">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-primary text-sm transition-colors" data-testid="footer-terms">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-primary text-sm transition-colors" data-testid="footer-cookies">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
