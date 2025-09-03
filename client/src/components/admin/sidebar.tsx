import { Link, useLocation } from 'wouter'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  Building, 
  LayoutDashboard, 
  Users, 
  FileText, 
  MessageSquare, 
  Settings, 
  LogOut,
  Home,
  Image
} from 'lucide-react'

export default function AdminSidebar() {
  const [location] = useLocation()
  const { logout, user } = useAuth()

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Properties', href: '/admin/properties', icon: Building },
    { name: 'Hero Slides', href: '/admin/hero-slides', icon: Image },
    { name: 'Team', href: '/admin/team', icon: Users },
    { name: 'Blog', href: '/admin/blog', icon: FileText },
    { name: 'Leads', href: '/admin/leads', icon: MessageSquare },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ]

  const isActiveLink = (href: string) => {
    if (href === '/admin') return location === '/admin'
    return location.startsWith(href)
  }

  return (
    <div className="w-64 bg-card border-r border-border h-screen flex flex-col">
      {/* Logo/Brand */}
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
            <Building className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Temer</h1>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Admin Panel</p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  isActiveLink(item.href)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
                data-testid={`nav-${item.name.toLowerCase()}`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </div>
            </Link>
          )
        })}
      </nav>

      <Separator />

      {/* User Info & Actions */}
      <div className="p-4 space-y-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-primary-foreground text-sm font-medium">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">{user?.name}</p>
            <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
          </div>
        </div>

        <div className="space-y-2">
          <Link href="/">
            <Button variant="outline" className="w-full justify-start" data-testid="nav-view-site">
              <Home className="h-4 w-4 mr-2" />
              View Site
            </Button>
          </Link>
          <Button 
            variant="outline" 
            className="w-full justify-start" 
            onClick={logout}
            data-testid="nav-logout"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  )
}
