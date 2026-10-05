import React from 'react'

const page = () => {
  return (
    <main className="bg-background min-h-screen p-page">
      <h1 className="text-3xl font-bold text-foreground">
        ITOM — Coming Soon
      </h1>
      <button className="mt-4 bg-primary text-primary-foreground px-4 py-2 rounded-md">
        Create Idea
      </button>
      <p className="mt-2 text-muted-foreground text-sm">
        Design tokens working ✓
      </p>
    </main>
  )
}

export default page