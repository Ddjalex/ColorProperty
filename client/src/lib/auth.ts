import { useState, useEffect } from 'react'

interface User {
  _id: string
  name: string
  email: string
  role: string
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    
    if (token && user) {
      setAuthState({
        user: JSON.parse(user),
        token,
        isLoading: false
      })
    } else {
      setAuthState({
        user: null,
        token: null,
        isLoading: false
      })
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        throw new Error('Login failed')
      }

      const data = await response.json()
      
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      
      setAuthState({
        user: data.user,
        token: data.token,
        isLoading: false
      })

      return { success: true }
    } catch (error) {
      return { success: false, error: 'Login failed' }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setAuthState({
      user: null,
      token: null,
      isLoading: false
    })
  }

  const isAuthenticated = !!authState.token && !!authState.user
  const isAdmin = authState.user?.role === 'admin'

  return {
    ...authState,
    login,
    logout,
    isAuthenticated,
    isAdmin
  }
}
