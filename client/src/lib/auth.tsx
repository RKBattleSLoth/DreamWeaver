import React, { createContext, useContext, useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { User, LoginRequest, RegisterRequest, AuthResponse } from 'shared/types'
import { api } from './api'

interface AuthContextType {
  user: Omit<User, 'password_hash'> | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginRequest) => Promise<void>
  register: (credentials: RegisterRequest) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => 
    localStorage.getItem('auth_token')
  )
  const queryClient = useQueryClient()

  // Get current user
  const { data: user, isLoading } = useQuery({
    queryKey: ['auth', 'user'],
    queryFn: async () => {
      if (!token) return null
      const response = await api.get('/api/auth/me')
      return response.data.user
    },
    enabled: !!token,
    retry: false
  })

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const response = await api.post<AuthResponse>('/api/auth/login', credentials)
      return response.data
    },
    onSuccess: (data) => {
      setToken(data.token)
      localStorage.setItem('auth_token', data.token)
      queryClient.setQueryData(['auth', 'user'], data.user)
    }
  })

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (credentials: RegisterRequest) => {
      const response = await api.post<AuthResponse>('/api/auth/register', credentials)
      return response.data
    },
    onSuccess: (data) => {
      setToken(data.token)
      localStorage.setItem('auth_token', data.token)
      queryClient.setQueryData(['auth', 'user'], data.user)
    }
  })

  // Logout function
  const logout = () => {
    setToken(null)
    localStorage.removeItem('auth_token')
    queryClient.setQueryData(['auth', 'user'], null)
    queryClient.clear()
  }

  // Update API headers when token changes
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete api.defaults.headers.common['Authorization']
    }
  }, [token])

  const value: AuthContextType = {
    user: user || null,
    isLoading,
    isAuthenticated: !!user,
    login: async (credentials) => {
      try {
        await loginMutation.mutateAsync(credentials)
      } catch (error: any) {
        throw new Error(error.response?.data?.error?.message || 'Login failed')
      }
    },
    register: async (credentials) => {
      try {
        await registerMutation.mutateAsync(credentials)
      } catch (error: any) {
        throw new Error(error.response?.data?.error?.message || 'Registration failed')
      }
    },
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}