import { useState } from 'react'
import { Link, useLocation } from 'wouter'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu, Building, Heart } from 'lucide-react'
import { useAuth } from '@/lib/auth'

export default function Header() {
  const [location] = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  const { isAuthenticated, logout } = useAuth()

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Properties', href: '/properties' },
    { name: 'Team', href: '/team' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact', href: '/contact' },
  ]

  const isActiveLink = (href: string) => {
    if (href === '/') return location === '/'
    return location.startsWith(href)
  }

  return (
    <header className="bg-card shadow-sm sticky top-0 z-50 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <Link href="/" data-testid="link-logo">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                  <Building className="text-white text-xl" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">Temer</h1>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Properties</p>
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  data-testid={`link-${item.name.toLowerCase()}`}
                >
                  <a className={`font-medium transition-colors ${
                    isActiveLink(item.href)
                      ? 'text-primary'
                      : 'text-foreground hover:text-primary'
                  }`}>
                    {item.name}
                  </a>
                </Link>
              ))}
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
              <Button variant="ghost" size="icon" data-testid="button-favorites">
                <Heart className="h-5 w-5" />
              </Button>
              {isAuthenticated ? (
                <div className="flex items-center space-x-2">
                  <Link href="/admin" data-testid="link-admin">
                    <Button variant="outline">Admin</Button>
                  </Link>
                  <Button onClick={logout} data-testid="button-logout">
                    Logout
                  </Button>
                </div>
              ) : (
                <Link href="/login" data-testid="link-login">
                  <Button>Login</Button>
                </Link>
              )}
            </div>

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" data-testid="button-mobile-menu">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col space-y-4 mt-6">
                  {navigation.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      data-testid={`mobile-link-${item.name.toLowerCase()}`}
                    >
                      <a className={`block py-2 text-lg font-medium transition-colors ${
                        isActiveLink(item.href)
                          ? 'text-primary'
                          : 'text-foreground hover:text-primary'
                      }`}>
                        {item.name}
                      </a>
                    </Link>
                  ))}
                  {isAuthenticated && (
                    <Link href="/admin" onClick={() => setIsOpen(false)} data-testid="mobile-link-admin">
                      <a className="block py-2 text-lg font-medium text-foreground hover:text-primary">
                        Admin
                      </a>
                    </Link>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
  )
}
