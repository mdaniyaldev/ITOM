import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface NavbarProps {
  className?: string
}

export function Navbar({ className = "" }: NavbarProps) {
  return (
    <nav className={cn("navbar bg-background/80 backdrop-blur-md border-border", className)}>
      <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              <span className="text-xl font-bold text-foreground">ITOM</span>
            </Link>
          </div>

          <div className="hidden md:flex md:items-center md:space-x-6">
            <Link href="/" className="text-muted-foreground hover:text-foreground">
              Home
            </Link>
            <Link href="/discover-ideas" className="text-muted-foreground hover:text-foreground">
              Discover Ideas
            </Link>
            <Link href="/case-studies" className="text-muted-foreground hover:text-foreground">
              Case Studies
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {/* User menu placeholder */}
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Avatar className="h-8 w-8">
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <span className="ml-2 text-sm font-medium hidden md:block">User</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[200px]">
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem variant="destructive">Sign Out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  )
}