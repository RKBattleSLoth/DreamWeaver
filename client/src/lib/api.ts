import axios from 'axios'
import type { ApiResponse } from 'shared/types'

// Create axios instance
export const api = axios.create({
  baseURL: import.meta.env.DEV ? 'http://localhost:3000' : '',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Transform response to match our ApiResponse type
    if (response.data && typeof response.data === 'object' && 'success' in response.data) {
      return response
    }
    
    // Wrap non-standard responses
    return {
      ...response,
      data: {
        success: true,
        data: response.data
      }
    }
  },
  (error) => {
    // Handle 401 errors by clearing auth
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token')
      delete api.defaults.headers.common['Authorization']
      
      // Redirect to login if not already there
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }
    
    // Ensure error response follows our ApiResponse format
    if (error.response?.data && typeof error.response.data === 'object') {
      const errorData = error.response.data
      if (!('success' in errorData)) {
        errorData.success = false
      }
    } else {
      error.response = {
        ...error.response,
        data: {
          success: false,
          error: {
            message: error.message || 'Network error'
          }
        }
      }
    }
    
    return Promise.reject(error)
  }
)

// Helper function for type-safe API calls
export async function apiCall<T>(
  method: 'get' | 'post' | 'put' | 'delete',
  url: string,
  data?: any
): Promise<ApiResponse<T>> {
  try {
    const response = await api[method](url, data)
    return response.data
  } catch (error: any) {
    return error.response?.data || {
      success: false,
      error: { message: 'Network error' }
    }
  }
}