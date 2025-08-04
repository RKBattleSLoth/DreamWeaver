import React from 'react'
import { useLocation, Link } from 'wouter'
import { useSupabaseAuth } from '../../lib/supabase-auth'
import Button from './Button'
import ThemeToggle from './ThemeToggle'

const Navigation: React.FC = () => {
  const [location] = useLocation()
  const { user, logout } = useSupabaseAuth()

  const handleLogout = () => {
    logout()
  }

  const isActive = (path: string) => location === path

  if (!user) return null

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/">
              <a className="text-xl font-bold text-gray-900 dark:text-white">
                StoryTime AI
              </a>
            </Link>
            
            <div className="flex space-x-4">
              <Link href="/">
                <a className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/') 
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' 
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                }`}>
                  Dashboard
                </a>
              </Link>
              
              <Link href="/stories">
                <a className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/stories') 
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' 
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                }`}>
                  Stories
                </a>
              </Link>
              
              <Link href="/profiles">
                <a className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive('/profiles') 
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' 
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                }`}>
                  Profiles
                </a>
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {user.email}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navigation