import React from 'react'
import { useLocation, Link } from 'wouter'
import { useSupabaseAuth } from '../lib/supabase-auth'
import { useActiveChildProfile } from '../hooks/useChildProfiles'
import Button from '../components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card'

export default function DashboardPage() {
  const [, setLocation] = useLocation()
  const { user, isLoading, isAuthenticated, logout } = useSupabaseAuth()
  const { data: activeProfile } = useActiveChildProfile()

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation('/login')
    }
  }, [isAuthenticated, isLoading, setLocation])

  const handleLogout = () => {
    logout()
    setLocation('/login')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner w-8 h-8"></div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">StoryTime AI</h1>
            <p className="text-sm text-muted-foreground">v2.0</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-muted-foreground">
                Welcome, {user?.email}
              </div>
              {activeProfile && (
                <div className="text-xs text-muted-foreground">
                  Active: {activeProfile.name}
                </div>
              )}
            </div>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Welcome Card */}
          <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
              <CardTitle>Welcome to StoryTime AI v2.0</CardTitle>
              <CardDescription>
                Create magical bedtime stories and beautiful illustrations for children
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This is the simplified version of StoryTime AI with separated story generation, 
                illustration creation, and a comprehensive gallery system. 
                Ready to bring your stories to life!
              </p>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Child Profiles</CardTitle>
              <CardDescription>
                Manage your children's profiles and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/profiles">
                <Button className="w-full">
                  Manage Profiles
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Story Creator</CardTitle>
              <CardDescription>
                Generate personalized stories with AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/stories">
                <Button className="w-full">
                  Manage Stories
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Illustration Gallery</CardTitle>
              <CardDescription>
                Create and manage beautiful illustrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}