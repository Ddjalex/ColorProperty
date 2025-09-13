import { useQuery } from '@tanstack/react-query'
import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import TeamMemberCard from '@/components/team/team-member-card'
import { Skeleton } from '@/components/ui/skeleton'
import type { TeamMember } from '@shared/schema'

export default function Team() {
  const { data: teamMembers = [], isLoading } = useQuery<TeamMember[]>({
    queryKey: ['/api/team'],
  })

  const officers = teamMembers.filter(member => member.roleType === 'officer')
  const agents = teamMembers.filter(member => member.roleType === 'agent')

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-foreground mb-4">Meet Our Team</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Our experienced real estate professionals are here to guide you through every step of your property journey.
          </p>
        </div>

        {/* Sales Officers */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold text-foreground mb-8 text-center">Sales Officers</h2>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-card rounded-xl shadow-lg overflow-hidden border border-border">
                  <Skeleton className="w-full h-64" />
                  <div className="p-6">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-4" />
                    <Skeleton className="h-4 w-full mb-6" />
                    <div className="flex justify-center space-x-4">
                      <Skeleton className="h-10 w-20" />
                      <Skeleton className="h-10 w-24" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : officers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {officers.map((member) => (
                <TeamMemberCard key={member._id} member={member} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No sales officers available at the moment.</p>
            </div>
          )}
        </div>

        {/* Sales Agents */}
        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-8 text-center">Sales Agents</h2>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-card rounded-xl shadow-lg overflow-hidden border border-border">
                  <Skeleton className="w-full h-48" />
                  <div className="p-4">
                    <Skeleton className="h-5 w-3/4 mb-1" />
                    <Skeleton className="h-4 w-1/2 mb-4" />
                    <div className="flex justify-center space-x-2">
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : agents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {agents.map((member) => (
                <TeamMemberCard key={member._id} member={member} variant="compact" />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No sales agents available at the moment.</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}
