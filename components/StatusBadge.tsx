import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case "approved":
      return "success"
    case "under-review":
      return "warning"
    case "changes-needed":
      return "warning" // Could be a different shade if needed
    case "rejected":
      return "destructive"
    default:
      return "secondary"
  }
}

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({
  status,
  className = ""
}: StatusBadgeProps) {
  const variant = getStatusBadgeVariant(status)

  return (
    <Badge
      variant={variant}
      className={cn("status-badge", className)}
    >
      {status.replace(/-/g, " ").toUpperCase()}
    </Badge>
  )
}