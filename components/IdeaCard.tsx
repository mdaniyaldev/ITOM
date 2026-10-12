import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScoreBadge } from "@/components/ScoreBadge"
import { StatusBadge } from "@/components/StatusBadge"
import { cn } from "@/lib/utils"

interface IdeaCardProps {
  title: string
  description?: string
  score?: number
  status?: "approved" | "under-review" | "changes-needed" | "rejected"
  inventorName?: string
  date?: string
  className?: string
}

export function IdeaCard({
  title,
  description,
  score,
  status,
  inventorName,
  date,
  className = ""
}: IdeaCardProps) {
  return (
    <Card className={cn("idea-card", className)}>
      <CardHeader>
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
        {inventorName && (
          <Badge variant="secondary" className="ml-2 text-xs">
            By {inventorName}
          </Badge>
        )}
      </CardHeader>

      {description && (
        <CardDescription className="mt-2 line-clamp-2">
          {description}
        </CardDescription>
      )}

      <CardFooter className="mt-4 flex flex-wrap gap-2">
        {score !== undefined && (
          <ScoreBadge score={score} className="flex-1" />
        )}
        {status && (
          <StatusBadge status={status} className="flex-1" />
        )}
        {date && (
          <span className="text-xs text-muted-foreground flex-1">{date}</span>
        )}
      </CardFooter>
    </Card>
  )
}