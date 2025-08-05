import React, { createContext, useContext, useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { User, Session } from '@supabase/supabase-js'
import { LoginRequest, RegisterRequest } from '../shared/types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qvvujxjxufjnrwzgpoib.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2dnVqeGp4dWZqbnJ3emdwb2liIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxOTAxMTgsImV4cCI6MjA2OTc2NjExOH0.PGUVk0KNh3Z5-vbNPgubzSwlipRK1HRDz5K8MFMNY4g'

console.log('Supabase client initialization:', {
  url: supabaseUrl,
  keyPresent: !!supabaseAnonKey
})

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface AuthContextType {
  user: User | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginRequest) => Promise<void>
  register: (credentials: RegisterRequest) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const login = async (credentials: LoginRequest) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    })

    if (error) {
      throw new Error(error.message)
    }

    if (!data.user) {
      throw new Error('Login failed')
    }
  }

  const register = async (credentials: RegisterRequest) => {
    const { data, error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
    })

    if (error) {
      throw new Error(error.message)
    }

    if (!data.user) {
      throw new Error('Registration failed')
    }
  }

  const logout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw new Error(error.message)
    }
  }

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useSupabaseAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider')
  }
  return context
}