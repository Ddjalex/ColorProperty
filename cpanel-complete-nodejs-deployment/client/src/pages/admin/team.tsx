import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/lib/auth'
import AdminSidebar from '@/components/admin/sidebar'
import TeamForm from '@/components/admin/team-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Search, Edit, Trash2, Phone, MessageCircle } from 'lucide-react'
import { useDeleteTeamMember } from '@/hooks/use-team'
import { useToast } from '@/hooks/use-toast'
import { generateWhatsAppUrl } from '@/lib/utils'
import type { TeamMember } from '@shared/schema'

export default function AdminTeam() {
  const { isAuthenticated } = useAuth()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)

  const { data: teamMembers = [], isLoading } = useQuery<TeamMember[]>({
    queryKey: ['/api/team'],
    enabled: isAuthenticated,
  })

  const deleteTeamMember = useDeleteTeamMember()

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = !searchTerm || 
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.specialization && member.specialization.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesRole = !roleFilter || roleFilter === 'all' || member.roleType === roleFilter
    
    return matchesSearch && matchesRole
  })

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member)
    setIsFormOpen(true)
  }

  const handleDelete = async (member: TeamMember) => {
    if (window.confirm(`Are you sure you want to remove ${member.name} from the team?`)) {
      try {
        await deleteTeamMember.mutateAsync(member._id!)
        toast({
          title: "Team Member Removed",
          description: "The team member has been successfully removed.",
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to remove team member. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const handleFormClose = () => {
    setIsFormOpen(false)
    setEditingMember(null)
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Please log in to access this page.</p>
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
            <h1 className="text-3xl font-bold text-foreground">Team Management</h1>
            <p className="text-muted-foreground">Manage your team members</p>
          </div>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-team-member">
                <Plus className="h-4 w-4 mr-2" />
                Add Team Member
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingMember ? 'Edit Team Member' : 'Add New Team Member'}
                </DialogTitle>
              </DialogHeader>
              <TeamForm 
                member={editingMember}
                onSuccess={handleFormClose}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search team members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-team"
                />
              </div>
              
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger data-testid="select-filter-role">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="officer">Sales Officers</SelectItem>
                  <SelectItem value="agent">Sales Agents</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline"
                onClick={() => {
                  setSearchTerm('')
                  setRoleFilter('all')
                }}
                data-testid="button-clear-filters"
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Team Members Grid */}
        <Card>
          <CardHeader>
            <CardTitle>Team Members ({filteredMembers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading team members...</p>
              </div>
            ) : filteredMembers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMembers.map((member) => (
                  <Card key={member._id} className="overflow-hidden">
                    <div className="aspect-square overflow-hidden">
                      {member.photoUrl ? (
                        <img 
                          src={member.photoUrl} 
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <span className="text-muted-foreground">No Photo</span>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-foreground mb-1">{member.name}</h3>
                      <p className="text-muted-foreground text-sm mb-2 capitalize">
                        {member.roleType === 'officer' ? 'Sales Officer' : 'Sales Agent'}
                      </p>
                      {member.specialization && (
                        <p className="text-muted-foreground text-xs mb-4">{member.specialization}</p>
                      )}
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex space-x-2">
                          <a 
                            href={`tel:${member.phone}`}
                            className="p-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
                            data-testid={`button-call-${member._id}`}
                          >
                            <Phone className="h-4 w-4" />
                          </a>
                          <a 
                            href={generateWhatsAppUrl(member.whatsapp, `Hello ${member.name}, I'd like to discuss a property.`)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                            data-testid={`button-whatsapp-${member._id}`}
                          >
                            <MessageCircle className="h-4 w-4" />
                          </a>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEdit(member)}
                            data-testid={`button-edit-${member._id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleDelete(member)}
                            data-testid={`button-delete-${member._id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p>Phone: {member.phone}</p>
                        {member.email && <p>Email: {member.email}</p>}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No team members found</p>
                <p className="text-muted-foreground text-sm">
                  {searchTerm || roleFilter 
                    ? 'Try adjusting your filters'
                    : 'Add your first team member to get started'
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
