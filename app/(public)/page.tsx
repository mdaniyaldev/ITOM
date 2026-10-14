import Link from "next/link"
import { Navbar } from "@/components/Navbar"
import { IdeaCard } from "@/components/IdeaCard"
import { InventorCard } from "@/components/InventorCard"
import { InvestorCard } from "@/components/InvestorCard"
import { CaseStudyCard } from "@/components/CaseStudyCard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import HeroButtons from "@/components/HeroButtons"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/server"
import type { SupabaseClient } from "@supabase/supabase-js"

// Types for our data
interface StepCount {
  step_no: number
  count: number
}

interface InventorProfile {
  id: string
  name: string
  score: number
  badge: string | null
  photo_url: string
}

interface Idea {
  id: string
  title: string
  description: string | null
  score: number
  badge: string | null
  views: number
  inventorName: string
}

interface InvestorProfile {
  id: string
  name: string
  score: number
  badge: string | null
  logo_url: string | null
  type: string | null
}

interface CaseStudy {
  id: string
  title: string
  description: string | null
  views: number
  image_url: string | null
}

export const dynamic = "force-dynamic" // Ensure fresh data on each request

export default async function HomePage() {
  const supabase = await createClient()

  // Fetch data
  const [stepCounts, topInventors, topIdeas, newIdeas, topInvestors, topCaseStudies] = await Promise.all([
    fetchStepCounts(supabase),
    fetchTopInventors(supabase),
    fetchTopIdeas(supabase),
    fetchNewIdeas(supabase),
    fetchTopInvestors(supabase),
    fetchTopCaseStudies(supabase),
  ])

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-content mx-auto px-4 py-8">
        {/* Hero section */}
        <section className="mb-16 text-center">
          <h1 className="mb-6 text-3xl font-bold text-foreground">
            Connecting Innovators with Investors
          </h1>
          <p className="mb-8 max-w-xl mx-auto text-muted-foreground">
            Discover groundbreaking ideas, connect with visionary investors,
            and explore inspiring case studies that shape our future.
          </p>
          <HeroButtons />
        </section>

        {/* Ten steps section */}
        <section className="mb-16">
          <h2 className="mb-6 text-2xl font-bold text-foreground">
            The 10-Step Journey
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {stepCounts.map((step) => (
              <Link
                key={step.step_no}
                href={`/discover-ideas?step=${step.step_no}`}
                className="bg-card border border-border rounded-lg p-4 flex flex-col items-center justify-between hover:bg-muted transition-colors"
              >
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-primary flex items-center justify-center text-white rounded-full mb-2">
                    {step.step_no}
                  </div>
                  <span className="ml-3 text-foreground">{getStepName(step.step_no)}</span>
                </div>
                <div className="text-2xl font-bold text-primary">
                  {step.count}
                </div>
                <div className="text-xs text-muted-foreground text-center">
                  ideas in this step
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Navigation links */}
        <div className="mb-16 text-center">
          <div className="flex flex-wrap justify-center gap-2">
            <Link href="/discover-ideas" className="text-muted-foreground hover:text-foreground">
              Ideas
            </Link>
            <span className="text-muted-foreground">·</span>
            <Link href="/findinvestors" className="text-muted-foreground hover:text-foreground">
              Inventors
            </Link>
            <span className="text-muted-foreground">·</span>
            <Link href="/investors" className="text-muted-foreground hover:text-foreground">
              Investors
            </Link>
            <span className="text-muted-foreground">·</span>
            <Link href="/case-studies" className="text-muted-foreground hover:text-foreground">
              Case studies
            </Link>
          </div>
        </div>

        {/* Top Inventors */}
        <section className="mb-16">
          <h2 className="mb-6 text-2xl font-bold text-foreground">
            Top Inventors
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {topInventors.map((inventor) => (
              <InventorCard
                key={inventor.id}
                name={inventor.name}
                title="Top Inventor"
                organization="Featured Innovator"
                avatarUrl={inventor.photo_url}
                score={inventor.score}
              />
            ))}
          </div>
        </section>

        {/* Ideas on Platform */}
        <section className="mb-16">
          <h2 className="mb-6 text-2xl font-bold text-foreground">
            Ideas on the Platform
          </h2>
          <Tabs className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="top-scored" className={cn(
                "px-4 py-2 text-sm font-medium rounded-md",
                "bg-primary text-primary-foreground"
              )}>
                Top Scored
              </TabsTrigger>
              <TabsTrigger value="newly-approved" className={cn(
                "px-4 py-2 text-sm font-medium rounded-md",
                "text-muted-foreground hover:bg-muted"
              )}>
                Newly Approved
              </TabsTrigger>
            </TabsList>

            <TabsContent value="top-scored" className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {topIdeas.map((idea) => (
                <IdeaCard
                  key={idea.id}
                  title={idea.title}
                  description={idea.description ?? undefined}
                  score={idea.score}
                  inventorName={idea.inventorName}
                  date={new Date().toISOString().split('T')[0]} // Placeholder date
                />
              ))}
            </TabsContent>

            <TabsContent value="newly-approved" className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {newIdeas.map((idea) => (
                <IdeaCard
                  key={idea.id}
                  title={idea.title}
                  description={idea.description ?? undefined}
                  score={idea.score}
                  inventorName={idea.inventorName}
                  date={new Date().toISOString().split('T')[0]} // Placeholder date
                />
              ))}
            </TabsContent>
          </Tabs>
        </section>

        {/* Top Investors */}
        <section className="mb-16">
          <h2 className="mb-6 text-2xl font-bold text-foreground">
            Top Investors
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {topInvestors.map((investor) => (
              <InvestorCard
                key={investor.id}
                name={investor.name}
                title="Top Investor"
                organization="Featured Investor"
                avatarUrl={investor.logo_url ?? undefined}
                investorType={investor.type ?? undefined}
                score={investor.score}
              />
            ))}
          </div>
        </section>

        {/* Most Viewed Case Studies */}
        <section className="mb-16">
          <h2 className="mb-6 text-2xl font-bold text-foreground">
            Most Viewed Case Studies
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {topCaseStudies.map((study) => (
              <CaseStudyCard
                key={study.id}
                title={study.title}
                description={study.description ?? undefined}
                imageUrl={study.image_url || "/placeholder-case-study.jpg"}
                outcomes={[
                  { label: "Views", value: `${study.views.toLocaleString()}` }
                ]}
                hasRights={true}
                isTrue={true}
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}

// Helper functions for data fetching
async function fetchStepCounts(supabase: SupabaseClient): Promise<StepCount[]> {
  const { data, error } = await supabase
    .from('ideas')
    .select('current_step')
    .eq('visibility', 'public')
    .is('deleted_at', null)

  if (error) {
    console.error('Error fetching step counts:', error)
    return []
  }

  // Group by current_step and count
  const countsMap = new Map<number, number>()
  data?.forEach((idea) => {
    const step = idea.current_step
    countsMap.set(step, (countsMap.get(step) || 0) + 1)
  })

  // Convert to array and sort by step_no
  return Array.from(countsMap.entries())
    .map(([step_no, count]) => ({ step_no, count }))
    .sort((a, b) => a.step_no - b.step_no)
}

async function fetchTopInventors(supabase: SupabaseClient): Promise<InventorProfile[]> {
  const { data, error } = await supabase
    .from('inventor_profiles')
    .select(`
      id,
      name,
      score,
      badge,
      photo_url,
      users!inner (
        id,
        user_roles!inner (
          id,
          is_approved,
          deleted_at
        )
      )
    `)
    .eq('visibility', 'public')
    .is('deleted_at', null)
    .order('score', { ascending: false })
    .limit(6)

  if (error) {
    console.error('Error fetching top inventors:', error)
    return []
  }

  // Filter for approved users and map to our interface
  return data
    .filter((profile: any) =>
      profile.users &&
      profile.users.user_roles &&
      profile.users.user_roles.is_approved === true &&
      profile.users.user_roles.deleted_at === null
    )
    .map((profile: any) => ({
      id: profile.id,
      name: profile.name,
      score: profile.score,
      badge: profile.badge,
      photo_url: profile.photo_url
    }))
}

async function fetchTopIdeas(supabase: SupabaseClient): Promise<Idea[]> {
  const { data, error } = await supabase
    .from('ideas')
    .select(`
      id,
      name,
      how_it_works,
      score,
      badge,
      views,
      users!inner (
        id,
        user_roles!inner (
          id,
          is_approved,
          deleted_at
        ),
        name
      )
    `)
    .eq('visibility', 'public')
    .is('deleted_at', null)
    .order('score', { ascending: false })
    .limit(6)

  if (error) {
    console.error('Error fetching top ideas:', error)
    return []
  }

  // Filter for approved users and map to our interface
  return data
    .filter((idea: any) =>
      idea.users &&
      idea.users.user_roles &&
      idea.users.user_roles.is_approved === true &&
      idea.users.user_roles.deleted_at === null
    )
    .map((idea: any) => ({
      id: idea.id,
      title: idea.name,
      description: idea.how_it_works,
      score: idea.score,
      badge: idea.badge,
      views: idea.views,
      inventorName: idea.users.name
    }))
}

async function fetchNewIdeas(supabase: SupabaseClient): Promise<Idea[]> {
  const { data, error } = await supabase
    .from('ideas')
    .select(`
      id,
      name,
      how_it_works,
      score,
      badge,
      views,
      users!inner (
        id,
        user_roles!inner (
          id,
          is_approved,
          deleted_at
        ),
        name
      ),
      created_at
    `)
    .eq('visibility', 'public')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(6)

  if (error) {
    console.error('Error fetching new ideas:', error)
    return []
  }

  // Filter for approved users and map to our interface
  return data
    .filter((idea: any) =>
      idea.users &&
      idea.users.user_roles &&
      idea.users.user_roles.is_approved === true &&
      idea.users.user_roles.deleted_at === null
    )
    .map((idea: any) => ({
      id: idea.id,
      title: idea.name,
      description: idea.how_it_works,
      score: idea.score,
      badge: idea.badge,
      views: idea.views,
      inventorName: idea.users.name
    }))
}

async function fetchTopInvestors(supabase: SupabaseClient): Promise<InvestorProfile[]> {
  const { data, error } = await supabase
    .from('investor_profiles')
    .select(`
      id,
      name,
      score,
      badge,
      logo_url,
      type,
      users!inner (
        id,
        user_roles!inner (
          id,
          is_approved,
          deleted_at
        )
      )
    `)
    .eq('visibility', 'public')
    .is('deleted_at', null)
    .order('score', { ascending: false })
    .limit(6)

  if (error) {
    console.error('Error fetching top investors:', error)
    return []
  }

  // Filter for approved users and map to our interface
  return data
    .filter((profile: any) =>
      profile.users &&
      profile.users.user_roles &&
      profile.users.user_roles.is_approved === true &&
      profile.users.user_roles.deleted_at === null
    )
    .map((profile: any) => ({
      id: profile.id,
      name: profile.name,
      score: profile.score,
      badge: profile.badge,
      logo_url: profile.logo_url,
      type: profile.type
    }))
}

async function fetchTopCaseStudies(supabase: SupabaseClient): Promise<CaseStudy[]> {
  const { data: studies, error } = await supabase
    .from('case_studies')
    .select('id, title, main_card_description, views')
    .eq('visibility', 'public')
    .is('deleted_at', null)
    .eq('has_rights_tick', true)
    .eq('has_true_tick', true)
    .order('views', { ascending: false })
    .limit(6)

  if (error) {
    console.error('Error fetching top case studies:', error)
    return []
  }

  if (!studies || studies.length === 0) {
    return []
  }

  // files is polymorphic (entity_type + entity_id), so PostgREST cannot join it
  // to case_studies. Fetch the public, approved images in a second query and
  // merge in JS.
  const studyIds = studies.map((study: any) => study.id)
  const { data: files, error: filesError } = await supabase
    .from('files')
    .select('entity_id, file_url')
    .eq('entity_type', 'case_study')
    .in('entity_id', studyIds)
    .eq('visibility', 'public')
    .eq('status', 'approved')
    .is('deleted_at', null)

  if (filesError) {
    console.error('Error fetching case study images:', filesError)
  }

  const imageByStudyId = new Map<string, string>()
  files?.forEach((file: any) => {
    if (!imageByStudyId.has(file.entity_id)) {
      imageByStudyId.set(file.entity_id, file.file_url)
    }
  })

  return studies.map((study: any) => ({
    id: study.id,
    title: study.title,
    description: study.main_card_description,
    views: study.views ?? 0,
    image_url: imageByStudyId.get(study.id) ?? null
  }))
}

// Helper function to get step name
function getStepName(stepNo: number): string {
  const stepNames: Record<number, string> = {
    1: "Idea",
    2: "Fund",
    3: "Build",
    4: "Prove",
    5: "Protect",
    6: "Regulate",
    7: "Manufacture",
    8: "Market",
    9: "Commercialise",
    10: "Scale"
  }
  return stepNames[stepNo] || `Step ${stepNo}`
}