import NavLink from "next/link"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface SidebarProps {
  className?: string
}

export function Sidebar({ className = "" }: SidebarProps) {
  return (
    <aside className={cn("sidebar w-[240px] bg-sidebar border-border", className)}>
      <nav className="px-4 py-6 space-y-2">
        <NavLink href="/admin" className={cn("flex items-center px-3 py-2 text-sm font-medium rounded-md", "hover:bg-sidebar-accent/50", "sidebar-nav-item-active:bg-sidebar-primary/20 sidebar-nav-item-active:text-sidebar-primary-foreground")}>
          Dashboard
        </NavLink>
        <NavLink href="/admin/ideas" className={cn("flex items-center px-3 py-2 text-sm font-medium rounded-md", "hover:bg-sidebar-accent/50", "sidebar-nav-item-active:bg-sidebar-primary/20 sidebar-nav-item-active:text-sidebar-primary-foreground")}>
          Ideas
        </NavLink>
        <NavLink href="/admin/investors" className={cn("flex items-center px-3 py-2 text-sm font-medium rounded-md", "hover:bg-sidebar-accent/50", "sidebar-nav-item-active:bg-sidebar-primary/20 sidebar-nav-item-active:text-sidebar-primary-foreground")}>
          Investors
        </NavLink>
        <NavLink href="/admin/case-studies" className={cn("flex items-center px-3 py-2 text-sm font-medium rounded-md", "hover:bg-sidebar-accent/50", "sidebar-nav-item-active:bg-sidebar-primary/20 sidebar-nav-item-active:text-sidebar-primary-foreground")}>
          Case Studies
        </NavLink>
        <NavLink href="/admin/users" className={cn("flex items-center px-3 py-2 text-sm font-medium rounded-md", "hover:bg-sidebar-accent/50", "sidebar-nav-item-active:bg-sidebar-primary/20 sidebar-nav-item-active:text-sidebar-primary-foreground")}>
          Users
        </NavLink>
        <NavLink href="/admin/reports" className={cn("flex items-center px-3 py-2 text-sm font-medium rounded-md", "hover:bg-sidebar-accent/50", "sidebar-nav-item-active:bg-sidebar-primary/20 sidebar-nav-item-active:text-sidebar-primary-foreground")}>
          Reports
        </NavLink>
      </nav>

      <div className="mx-4 mb-4">
        <div className="flex items-center px-2 pt-2 pb-3 border-t border-border">
          <Avatar className="h-10 w-10">
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
          <div className="ml-3 text-sm font-medium text-sidebar-foreground whitespace-nowrap">
            Admin User
          </div>
        </div>
      </div>
    </aside>
  )
}