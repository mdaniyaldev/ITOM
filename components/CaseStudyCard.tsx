import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { cn } from "@/lib/utils"

interface CaseStudyCardProps {
  title: string
  description?: string
  imageUrl?: string
  outcomes?: Array<{ label: string; value: string | number }>
  hasRights: boolean
  isTrue: boolean
  className?: string
}

export function CaseStudyCard({
  title,
  description,
  imageUrl,
  outcomes,
  hasRights,
  isTrue,
  className = ""
}: CaseStudyCardProps) {
  return (
    <Card className={cn("case-study-card", className)}>
      {imageUrl && (
        <Image src={imageUrl} alt={title} width={800} height={192} className="object-cover h-48 w-full rounded-t-md" />
      )}
      <CardHeader>
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
      </CardHeader>

      {description && (
        <CardContent className="mt-4">
          <p className="text-sm">{description}</p>
        </CardContent>
      )}

      {outcomes?.length && (
        <CardContent className="mt-4 space-y-2">
          {outcomes.map((outcome, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{outcome.label}</span>
              <span className="font-medium">{outcome.value}</span>
            </div>
          ))}
        </CardContent>
      )}

      <CardFooter className="mt-4 flex flex-wrap gap-2">
        <Badge
          variant={isTrue ? "success" : "destructive"}
          className="flex-1"
        >
          {isTrue ? "True" : "Not True"}
        </Badge>
        <Badge
          variant={hasRights ? "success" : "destructive"}
          className="flex-1"
        >
          {hasRights ? "Rights Cleared" : "Rights Pending"}
        </Badge>
      </CardFooter>
    </Card>
  )
}