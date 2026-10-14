import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScoreBadge } from "@/components/ScoreBadge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface InvestorCardProps {
  name: string
  title?: string
  organization?: string
  bio?: string
  avatarUrl?: string
  score?: number
  investorType?: string
  className?: string
}

export function InvestorCard({
  name,
  title,
  organization,
  bio,
  avatarUrl,
  score,
  investorType,
  className = ""
}: InvestorCardProps) {
  return (
    <Card className={cn("investor-card", className)}>
      <CardHeader className="flex flex-col sm:flex-row sm:items-start sm:gap-4">
        {avatarUrl ? (
          <div className="flex-shrink-0 h-12 w-12">
            <Avatar className="h-12 w-12">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback>{name.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
        ) : (
          <div className="flex-shrink-0 h-12 w-12">
            <Avatar className="h-12 w-12">
              <AvatarFallback>{name.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
        )}
        <div>
          <CardTitle className="text-lg font-medium">{name}</CardTitle>
          {title && (
            <CardDescription className="mt-1 text-muted-foreground">
              {title}
            </CardDescription>
          )}
          {organization && (
            <CardDescription className="mt-1 text-muted-foreground text-sm">
              {organization}
            </CardDescription>
          )}
        </div>
      </CardHeader>

      {bio && (
        <CardContent className="mt-4">
          <p className="text-sm">{bio}</p>
        </CardContent>
      )}

      {(score !== undefined || investorType) && (
        <CardFooter className="mt-4 flex flex-wrap gap-2">
          {score !== undefined && (
            <ScoreBadge score={score} className="w-fit" />
          )}
          {investorType && (
            <Badge variant="secondary" className="w-fit">
              {investorType}
            </Badge>
          )}
        </CardFooter>
      )}
    </Card>
  )
}