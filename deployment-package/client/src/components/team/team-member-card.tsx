import { Phone, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { generateWhatsAppUrl, getImageUrl } from '@/lib/utils'
import type { TeamMember } from '@shared/schema'

interface TeamMemberCardProps {
  member: TeamMember
  variant?: 'default' | 'compact'
}

export default function TeamMemberCard({ member, variant = 'default' }: TeamMemberCardProps) {
  const whatsappMessage = `Hello ${member.name}, I'd like to discuss a property inquiry.`
  const whatsappUrl = generateWhatsAppUrl(member.whatsapp, whatsappMessage)

  const roleDisplayName = member.roleType === 'officer' ? 'Sales Officer' : 'Sales Agent'

  if (variant === 'compact') {
    return (
      <Card className="overflow-hidden text-center" data-testid={`team-member-card-${member._id}`}>
        <div className="h-48 overflow-hidden">
          {member.photoUrl ? (
            <img 
              src={getImageUrl(member.photoUrl)} 
              alt={member.name}
              className="w-full h-full object-cover"
              data-testid={`team-member-photo-${member._id}`}
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground">No Photo</span>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h4 className="text-lg font-semibold text-foreground mb-1" data-testid={`team-member-name-${member._id}`}>
            {member.name}
          </h4>
          <p className="text-muted-foreground text-sm mb-4" data-testid={`team-member-role-${member._id}`}>
            {roleDisplayName}
          </p>
          <div className="flex justify-center space-x-2">
            <a 
              href={`tel:${member.phone}`}
              className="p-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
              data-testid={`team-member-call-${member._id}`}
            >
              <Phone className="h-4 w-4" />
            </a>
            <a 
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              data-testid={`team-member-whatsapp-${member._id}`}
            >
              <MessageCircle className="h-4 w-4" />
            </a>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden text-center" data-testid={`team-member-card-${member._id}`}>
      <div className="h-64 overflow-hidden">
        {member.photoUrl ? (
          <img 
            src={getImageUrl(member.photoUrl)} 
            alt={member.name}
            className="w-full h-full object-cover"
            data-testid={`team-member-photo-${member._id}`}
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <span className="text-muted-foreground">No Photo</span>
          </div>
        )}
      </div>
      <CardContent className="p-6">
        <h4 className="text-xl font-semibold text-foreground mb-2" data-testid={`team-member-name-${member._id}`}>
          {member.name}
        </h4>
        <p className="text-muted-foreground mb-4" data-testid={`team-member-role-${member._id}`}>
          {roleDisplayName}
        </p>
        {member.specialization && (
          <p className="text-sm text-muted-foreground mb-6" data-testid={`team-member-specialization-${member._id}`}>
            {member.specialization}
          </p>
        )}
        <div className="flex justify-center space-x-4">
          <a href={`tel:${member.phone}`}>
            <Button 
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground"
              data-testid={`team-member-call-${member._id}`}
            >
              <Phone className="h-4 w-4 mr-2" />
              Call
            </Button>
          </a>
          <a 
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button 
              className="bg-green-500 hover:bg-green-600 text-white"
              data-testid={`team-member-whatsapp-${member._id}`}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              WhatsApp
            </Button>
          </a>
        </div>
      </CardContent>
    </Card>
  )
}
