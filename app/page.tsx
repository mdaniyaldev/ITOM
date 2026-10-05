import React from 'react'

const page = () => {
  return (
     <main className="min-h-screen bg-background p-8">
      <div className="max-w-content mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-foreground">
          ITOM — Design System Test
        </h1>
        <p className="text-muted-foreground">
          If you see blue button and correct colors, tokens work.
        </p>
        <div className="flex gap-3">
          <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md">
            Create Idea
          </button>
          <button className="border border-border px-4 py-2 rounded-md text-foreground">
            Explore Ideas
          </button>
        </div>
        <div className="flex gap-2">
          <span className="bg-success/10 text-success px-3 py-1 rounded-full text-sm">Approved</span>
          <span className="bg-warning/10 text-warning px-3 py-1 rounded-full text-sm">Under Review</span>
          <span className="bg-destructive/10 text-destructive px-3 py-1 rounded-full text-sm">Rejected</span>
        </div>
      </div>
    </main>
  )
}

export default page