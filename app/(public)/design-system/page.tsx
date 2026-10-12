'use client';

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Toaster, Toast, ToastAction, ToastDescription, ToastTitle } from "@/components/ui/toast"
import { ScoreBadge } from "@/components/ScoreBadge"
import { StatusBadge } from "@/components/StatusBadge"
import { IdeaCard } from "@/components/IdeaCard"
import { InventorCard } from "@/components/InventorCard"
import { InvestorCard } from "@/components/InvestorCard"
import { CaseStudyCard } from "@/components/CaseStudyCard"
import { Navbar } from "@/components/Navbar"
import { Sidebar } from "@/components/Sidebar"
import { useState } from "react"
import { cn } from "@/lib/utils"
// Update: Fixed button labels to match ITOM Figma reference

export default function DesignSystemPreview() {
  const [selectedTab, setSelectedTab] = useState("shadcn")
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background p-8">
      {/* Navbar and Sidebar Preview */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-foreground mb-4">Layout Components</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Navbar (Public)</h3>
            <Navbar className="mb-4" />
          </div>
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold mb-2">Sidebar (Admin)</h3>
            <Sidebar className="h-96" />
          </div>
        </div>
      </div>

      {/* Tabs for different component categories */}
      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-foreground mb-6">Component Showcase</h2>

        <Tabs className="w-full" value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-3 gap-2">
            <TabsTrigger
              value="shadcn"
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-md",
                selectedTab === "shadcn" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
              )}
            >
              Shadcn/UI
            </TabsTrigger>
            <TabsTrigger
              value="custom"
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-md",
                selectedTab === "custom" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
              )}
            >
              Custom ITOM
            </TabsTrigger>
            <TabsTrigger
              value="states"
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-md",
                selectedTab === "states" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
              )}
            >
              States & Variants
            </TabsTrigger>
          </TabsList>

          <TabsContent value="shadcn" className="mt-4 space-y-6">
            {/* Shadcn/UI Components Showcase */}
            <section className="space-y-4">
              <h3 className="text-xl font-bold text-foreground">Buttons</h3>
              <div className="flex flex-wrap gap-2">
                <Button variant="default">Create idea</Button>
                <Button variant="outline">Explore ideas</Button>
                <Button variant="secondary">Learn more</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Delete idea</Button>
                <Button variant="link">Link</Button>
              </div>

              <div className="mt-4">
                <h3 className="text-xl font-bold text-foreground">Inputs</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input placeholder="Default input" />
                  <Input placeholder="Error input" className="border-destructive" />
                </div>
              </div>

              <div className="mt-4">
                <h3 className="text-xl font-bold text-foreground">Textarea</h3>
                <Textarea placeholder="Enter text..." className="h-20" />
              </div>

              <div className="mt-4">
                <h3 className="text-xl font-bold text-foreground">Select</h3>
                <Select value="option2" onValueChange={() => {}}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select an option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="option1">Option 1</SelectItem>
                    <SelectItem value="option2">Option 2</SelectItem>
                    <SelectItem value="option3">Option 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="mt-4">
                <h3 className="text-xl font-bold text-foreground">Checkbox</h3>
                <Checkbox defaultChecked>
                  Option A
                </Checkbox>
                <Checkbox className="mt-2">
                  Option B
                </Checkbox>
              </div>

              <div className="mt-4">
                <h3 className="text-xl font-bold text-foreground">Badges</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="default">Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="ghost">Ghost</Badge>
                  <Badge variant="link">Link</Badge>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="text-xl font-bold text-foreground">Cards</h3>
                <Card className="w-64">
                  <CardHeader>
                    <CardTitle>Card Title</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      This is a sample card content to demonstrate the card component.
                    </CardDescription>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" size="sm">Action</Button>
                  </CardFooter>
                </Card>
              </div>

              <div className="mt-4">
                <h3 className="text-xl font-bold text-foreground">Avatar</h3>
                <div className="flex flex-wrap gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" />
                  </Avatar>
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="text-xl font-bold text-foreground">Tabs</h3>
                <Tabs defaultValue="tab1" className="w-[300px]">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
                    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
                  </TabsList>
                  <TabsContent value="tab1">
                    <p className="p-4">Content for tab 1</p>
                  </TabsContent>
                  <TabsContent value="tab2">
                    <p className="p-4">Content for tab 2</p>
                  </TabsContent>
                </Tabs>
              </div>

              <div className="mt-4">
                <h3 className="text-xl font-bold text-foreground">Dialog</h3>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger render={<Button variant="outline" />}>Open Dialog</DialogTrigger>
                  <DialogContent className="w-[400px] max-w-xs">
                    <DialogHeader>
                      <DialogTitle>Dialog Title</DialogTitle>
                      <DialogDescription>
                        This is a sample dialog to demonstrate the dialog component.
                      </DialogDescription>
                    </DialogHeader>
                    <Button variant="destructive" onClick={() => setDialogOpen(false)}>
                      Close
                    </Button>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="mt-4">
                <h3 className="text-xl font-bold text-foreground">Dropdown Menu</h3>
                <DropdownMenu>
                  <DropdownMenuTrigger className="btn btn-outline">
                    Actions
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[200px]">
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuItem>Delete</DropdownMenuItem>
                    <DropdownMenuItem>Duplicate</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </section>
          </TabsContent>

          <TabsContent value="custom" className="mt-4 space-y-6">
            {/* Custom ITOM Components Showcase */}
            <section className="space-y-4">
              <div className="mt-4">
                <h3 className="text-xl font-bold text-foreground">ScoreBadge</h3>
                <div className="flex flex-wrap gap-4">
                  <ScoreBadge score={25} className="p-2" />
                  <ScoreBadge score={45} className="p-2" />
                  <ScoreBadge score={65} className="p-2" />
                  <ScoreBadge score={85} className="p-2" />
                </div>
              </div>

              <div className="mt-4">
                <h3 className="text-xl font-bold text-foreground">StatusBadge</h3>
                <div className="flex flex-wrap gap-4">
                  <StatusBadge status="approved" className="p-2" />
                  <StatusBadge status="under-review" className="p-2" />
                  <StatusBadge status="changes-needed" className="p-2" />
                  <StatusBadge status="rejected" className="p-2" />
                </div>
              </div>

              <div className="mt-4">
                <h3 className="text-xl font-bold text-foreground">IdeaCard</h3>
                <IdeaCard
                  title="Revolutionary Solar Panel Technology"
                  description="A new type of solar panel that increases efficiency by 40% while reducing manufacturing costs."
                  score={78}
                  status="approved"
                  inventorName="Dr. Elena Rodriguez"
                  date="2026-03-15"
                />
              </div>

              <div className="mt-4">
                <h3 className="text-xl font-bold text-foreground">InventorCard</h3>
                <InventorCard
                  name="Dr. Elena Rodriguez"
                  title="Senior Research Scientist"
                  organization="SolarTech Innovations"
                  bio="Leading researcher in photovoltaic technology with over 15 years of experience in solar energy solutions."
                  avatarUrl="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                  badges={[
                    { label: "Expert", variant: "secondary" },
                    { label: "15+ Years Experience", variant: "default" }
                  ]}
                />
              </div>

              <div className="mt-4">
                <h3 className="text-xl font-bold text-foreground">InvestorCard</h3>
                <InvestorCard
                  name="Michael Chen"
                  title="Partner"
                  organization="GreenFuture Ventures"
                  bio="Specializing in early-stage investments in renewable energy and sustainable technology companies."
                  investorType="Angel Investor"
                  avatarUrl="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                />
              </div>

              <div className="mt-4">
                <h3 className="text-xl font-bold text-foreground">CaseStudyCard</h3>
                <CaseStudyCard
                  title="Solar Farm Implementation in Arizona"
                  description="A 50MW solar farm implementation that provided renewable energy to 15,000 homes."
                  imageUrl="https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=60"
                  outcomes={[
                    { label: "Capacity", value: "50 MW" },
                    { label: "Homes Powered", value: "15,000" },
                    { label: "CO2 Reduction", value: "45,000 tons/year" }
                  ]}
                  hasRights={true}
                  isTrue={true}
                />
              </div>
            </section>
          </TabsContent>

          <TabsContent value="states" className="mt-4 space-y-6">
            {/* Component States and Variants Showcase */}
            <section className="space-y-4">
              <div className="mt-4">
                <h3 className="text-xl font-bold text-foreground">Button States</h3>
                <div className="flex flex-wrap gap-2">
                  <Button variant="default">Default</Button>
                  <Button variant="default" disabled>
                    Disabled
                  </Button>
                  <Button variant="outline">
                    Outline
                  </Button>
                  <Button variant="outline" disabled>
                    Disabled Outline
                  </Button>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="text-xl font-bold text-foreground">Input States</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input placeholder="Default input" />
                  <Input placeholder="Error input" className="border-destructive" />
                  <Input placeholder="Disabled input" disabled />
                </div>
              </div>

              <div className="mt-4">
                <h3 className="text-xl font-bold text-foreground">Badge Variants</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="default">Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="ghost">Ghost</Badge>
                  <Badge variant="link">Link</Badge>
                  <Badge variant="bronze">Bronze</Badge>
                  <Badge variant="silver">Silver</Badge>
                  <Badge variant="gold">Gold</Badge>
                  <Badge variant="success">Success</Badge>
                  <Badge variant="warning">Warning</Badge>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="text-xl font-bold text-foreground">ScoreBadge Variants</h3>
                <div className="flex flex-wrap gap-4">
                  <ScoreBadge score={20} className="p-2" /> {/* Bronze */ }
                  <ScoreBadge score={40} className="p-2" /> {/* Bronze/Silver border */ }
                  <ScoreBadge score={50} className="p-2" /> {/* Silver */ }
                  <ScoreBadge score={70} className="p-2" /> {/* Silver/Gold border */ }
                  <ScoreBadge score={80} className="p-2" /> {/* Gold */ }
                </div>
              </div>
            </section>
          </TabsContent>
        </Tabs>

        {/* Toaster preview (positioned separately) */}
        <div className="mt-8">
          <h3 className="text-xl font-bold text-foreground">Toast Notifications</h3>
          <div className="flex gap-4">
            <Button
              onClick={() => {
                // In a real app, you would use the toast helper from "@/components/ui/toast"
                // For preview purposes, we'll just show the static toaster
                alert("Toast would appear here in a real implementation")
              }}
              variant="outline"
            >
              Show Toast Example
            </Button>
            <Toaster />
          </div>
        </div>
      </div>
    </div>
  )
}