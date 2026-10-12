import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const getScoreBadgeVariant = (score: number) => {
  if (score < 40) return "bronze"
  if (score < 70) return "silver"
  return "gold"
}

interface ScoreBadgeProps {
  score: number
  className?: string
}

export function ScoreBadge({
  score,
  className = ""
}: ScoreBadgeProps) {
  const variant = getScoreBadgeVariant(score)

  return (
    <Badge
      variant={variant}
      className={cn("score-badge", className)}
    >
      {score}
    </Badge>
  )
}