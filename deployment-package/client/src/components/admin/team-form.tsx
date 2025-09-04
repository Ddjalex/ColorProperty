import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Upload, User } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useCreateTeamMember, useUpdateTeamMember } from '@/hooks/use-team'
import type { TeamMember } from '@shared/schema'

const teamMemberFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  roleType: z.enum(['officer', 'agent']),
  phone: z.string().min(1, 'Phone number is required'),
  whatsapp: z.string().min(1, 'WhatsApp number is required'),
  email: z.string().email('Please enter a valid email').optional().or(z.literal('')),
  photoUrl: z.string().optional(),
  order: z.number().min(0).default(0),
  specialization: z.string().optional(),
})

type TeamMemberFormData = z.infer<typeof teamMemberFormSchema>

interface TeamFormProps {
  member?: TeamMember | null
  onSuccess?: () => void
}

export default function TeamForm({ member, onSuccess }: TeamFormProps) {
  const { toast } = useToast()
  
  const createTeamMember = useCreateTeamMember()
  const updateTeamMember = useUpdateTeamMember()

  const form = useForm<TeamMemberFormData>({
    resolver: zodResolver(teamMemberFormSchema),
    defaultValues: {
      name: '',
      roleType: 'agent',
      phone: '',
      whatsapp: '',
      email: '',
      photoUrl: '',
      order: 0,
      specialization: '',
    },
  })

  useEffect(() => {
    if (member) {
      form.reset({
        name: member.name,
        roleType: member.roleType,
        phone: member.phone,
        whatsapp: member.whatsapp,
        email: member.email || '',
        photoUrl: member.photoUrl || '',
        order: member.order,
        specialization: member.specialization || '',
      })
    }
  }, [member, form])

  const onSubmit = async (data: TeamMemberFormData) => {
    try {
      // Clean up empty email field
      const submitData = {
        ...data,
        email: data.email?.trim() || undefined,
        photoUrl: data.photoUrl?.trim() || undefined,
        specialization: data.specialization?.trim() || undefined,
      }

      if (member) {
        await updateTeamMember.mutateAsync({ id: member._id!, ...submitData })
        toast({
          title: "Team Member Updated",
          description: "The team member has been successfully updated.",
        })
      } else {
        await createTeamMember.mutateAsync(submitData)
        toast({
          title: "Team Member Added",
          description: "The team member has been successfully added.",
        })
      }
      onSuccess?.()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save team member. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter full name" {...field} data-testid="input-member-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="roleType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-member-role">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="officer">Sales Officer</SelectItem>
                        <SelectItem value="agent">Sales Agent</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="specialization"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Specialization</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="e.g., Specializing in luxury residential properties in Bole and CMC areas" 
                      rows={2} 
                      {...field} 
                      data-testid="textarea-member-specialization"
                    />
                  </FormControl>
                  <FormDescription>
                    Brief description of the member's expertise or focus area
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number *</FormLabel>
                    <FormControl>
                      <Input 
                        type="tel" 
                        placeholder="+251-911-123-456" 
                        {...field} 
                        data-testid="input-member-phone"
                      />
                    </FormControl>
                    <FormDescription>
                      Phone number for direct calls
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="whatsapp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp Number *</FormLabel>
                    <FormControl>
                      <Input 
                        type="tel" 
                        placeholder="251911123456" 
                        {...field} 
                        data-testid="input-member-whatsapp"
                      />
                    </FormControl>
                    <FormDescription>
                      WhatsApp number (without + or spaces)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="member@temerproperties.com" 
                      {...field} 
                      data-testid="input-member-email"
                    />
                  </FormControl>
                  <FormDescription>
                    Optional email address for contact
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Photo and Display */}
        <Card>
          <CardHeader>
            <CardTitle>Photo and Display Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="photoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Photo URL</FormLabel>
                  <FormControl>
                    <Input 
                      type="url" 
                      placeholder="https://example.com/photo.jpg" 
                      {...field} 
                      data-testid="input-member-photo"
                    />
                  </FormControl>
                  <FormDescription>
                    Enter the full URL of the member's professional photo
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch('photoUrl') && (
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-4">
                  <img 
                    src={form.watch('photoUrl')} 
                    alt="Preview"
                    className="w-16 h-16 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-user.jpg'
                    }}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Photo Preview</p>
                    <p className="text-xs text-muted-foreground">
                      Make sure the image is clear and professional
                    </p>
                  </div>
                </div>
              </div>
            )}

            <FormField
              control={form.control}
              name="order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Order</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="0"
                      placeholder="0"
                      {...field} 
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      data-testid="input-member-order"
                    />
                  </FormControl>
                  <FormDescription>
                    Lower numbers appear first. Use 0 for default ordering.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Separator />

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onSuccess}
            data-testid="button-cancel-member"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={createTeamMember.isPending || updateTeamMember.isPending}
            data-testid="button-save-member"
          >
            {(createTeamMember.isPending || updateTeamMember.isPending) ? 'Saving...' : (member ? 'Update Member' : 'Add Member')}
          </Button>
        </div>
      </form>
    </Form>
  )
}
