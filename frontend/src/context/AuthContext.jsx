import { useEffect, useState } from 'react'
import { AuthContext } from './authContextValue'
import {
  clearCurrentUser,
  fetchCurrentUser,
  getCurrentUser,
  hasAuthToken,
  loginUser,
  registerUser,
  updateCurrentUser,
} from '../services/authService'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getCurrentUser)
  const [loading, setLoading] = useState(hasAuthToken)

  useEffect(() => {
    let active = true
    if (!hasAuthToken()) {
      clearCurrentUser()
      return () => {
        active = false
      }
    }

    fetchCurrentUser()
      .then((currentUser) => {
        if (active) setUser(currentUser)
      })
      .catch((requestError) => {
        if (requestError.status === 401) {
          clearCurrentUser()
          if (active) setUser(null)
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const register = async (userData) => {
    const registeredUser = await registerUser(userData)
    setUser(registeredUser)
    return registeredUser
  }

  const login = async (email, password, role) => {
    const authenticatedUser = await loginUser({ email, password, role })
    setUser(authenticatedUser)
    return authenticatedUser
  }

  const updateProfile = async (updates) => {
    const updatedUser = await updateCurrentUser(updates)
    setUser(updatedUser)
    return updatedUser
  }

  const handleLogout = () => {
    clearCurrentUser()
    setUser(null)
  }
  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    role: user?.role || null,
    login,
    register,
    updateProfile,
    logout: handleLogout,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
