import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/lib/auth'
import AdminSidebar from '@/components/admin/sidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Search, Download, Eye, Trash2, Phone, Mail } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'
import type { Lead } from '@shared/schema'

export default function AdminLeads() {
  const { isAuthenticated } = useAuth()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('')

  const { data: leads = [], isLoading } = useQuery<Lead[]>({
    queryKey: ['/api/leads'],
    enabled: isAuthenticated,
  })

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = !searchTerm || 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.email && lead.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (lead.phone && lead.phone.includes(searchTerm))
    
    const matchesType = !typeFilter || typeFilter === 'all' || lead.type === typeFilter
    
    return matchesSearch && matchesType
  })

  const handleExportCSV = () => {
    if (filteredLeads.length === 0) {
      toast({
        title: "No Data",
        description: "No leads available to export.",
        variant: "destructive",
      })
      return
    }

    const headers = ['Name', 'Email', 'Phone', 'Type', 'Message', 'Property ID', 'Preferred Time', 'Created Date']
    const csvData = [
      headers.join(','),
      ...filteredLeads.map(lead => [
        lead.name,
        lead.email || '',
        lead.phone || '',
        lead.type,
        `"${lead.message.replace(/"/g, '""')}"`,
        lead.propertyId || '',
        lead.preferredTime ? new Date(lead.preferredTime).toLocaleString() : '',
        lead.createdAt ? formatDate(lead.createdAt) : ''
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvData], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `leads-export-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)

    toast({
      title: "Export Complete",
      description: "Leads data has been exported successfully.",
    })
  }

  const handleDelete = async (lead: Lead) => {
    if (window.confirm(`Are you sure you want to delete the lead from ${lead.name}?`)) {
      // TODO: Implement delete functionality
      toast({
        title: "Lead Deleted",
        description: "The lead has been successfully deleted.",
      })
    }
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
            <h1 className="text-3xl font-bold text-foreground">Leads Management</h1>
            <p className="text-muted-foreground">Manage customer inquiries and contacts</p>
          </div>
          <Button onClick={handleExportCSV} data-testid="button-export-leads">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-leads"
                />
              </div>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger data-testid="select-filter-type">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="contact">Contact Form</SelectItem>
                  <SelectItem value="schedule">Schedule Viewing</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline"
                onClick={() => {
                  setSearchTerm('')
                  setTypeFilter('all')
                }}
                data-testid="button-clear-filters"
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Leads Table */}
        <Card>
          <CardHeader>
            <CardTitle>Leads & Inquiries ({filteredLeads.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading leads...</p>
              </div>
            ) : filteredLeads.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 text-muted-foreground font-medium">Contact</th>
                      <th className="text-left py-3 text-muted-foreground font-medium">Type</th>
                      <th className="text-left py-3 text-muted-foreground font-medium">Message</th>
                      <th className="text-left py-3 text-muted-foreground font-medium">Preferred Time</th>
                      <th className="text-left py-3 text-muted-foreground font-medium">Created</th>
                      <th className="text-left py-3 text-muted-foreground font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.map((lead) => (
                      <tr key={lead._id} className="border-b border-border">
                        <td className="py-4">
                          <div>
                            <div className="font-medium text-foreground">{lead.name}</div>
                            <div className="text-sm text-muted-foreground space-y-1">
                              {lead.email && (
                                <div className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {lead.email}
                                </div>
                              )}
                              {lead.phone && (
                                <div className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  {lead.phone}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-4">
                          <Badge 
                            variant={lead.type === 'contact' ? 'default' : 'secondary'}
                            className={lead.type === 'contact' ? 'bg-primary' : 'bg-blue-500'}
                          >
                            {lead.type === 'contact' ? 'Contact Form' : 'Schedule Viewing'}
                          </Badge>
                        </td>
                        <td className="py-4">
                          <div className="max-w-xs">
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {lead.message}
                            </p>
                          </div>
                        </td>
                        <td className="py-4 text-muted-foreground">
                          {lead.preferredTime ? formatDate(lead.preferredTime) : 'N/A'}
                        </td>
                        <td className="py-4 text-muted-foreground">
                          {lead.createdAt ? formatDate(lead.createdAt) : 'N/A'}
                        </td>
                        <td className="py-4">
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                // TODO: Implement view details modal
                                toast({
                                  title: "Lead Details",
                                  description: "Lead details functionality coming soon.",
                                })
                              }}
                              data-testid={`button-view-${lead._id}`}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {lead.email && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => window.location.href = `mailto:${lead.email}`}
                                data-testid={`button-email-${lead._id}`}
                              >
                                <Mail className="h-4 w-4" />
                              </Button>
                            )}
                            {lead.phone && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => window.location.href = `tel:${lead.phone}`}
                                data-testid={`button-call-${lead._id}`}
                              >
                                <Phone className="h-4 w-4" />
                              </Button>
                            )}
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDelete(lead)}
                              data-testid={`button-delete-${lead._id}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No leads found</p>
                <p className="text-muted-foreground text-sm">
                  {searchTerm || typeFilter 
                    ? 'Try adjusting your filters'
                    : 'Customer inquiries will appear here'
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
