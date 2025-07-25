"use client"

import { createContext, useContext, useState, useEffect } from "react"
import api from "../services/api"

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    const token = localStorage.getItem("authToken")
    if (token) {
      try {
        const response = await api.get("/auth/verify")
        if (response.data.success) {
          setIsAuthenticated(true)
          setUser(response.data.user)
        } else {
          localStorage.removeItem("authToken")
        }
      } catch (error) {
        localStorage.removeItem("authToken")
      }
    }
    setLoading(false)
  }

  const login = async (credentials) => {
    try {
      const response = await api.post("/auth/login", credentials)
      if (response.data.success) {
        localStorage.setItem("authToken", response.data.token)
        setIsAuthenticated(true)
        setUser(response.data.user)
        return { success: true }
      }
      return { success: false, message: response.data.message }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      }
    }
  }

  const register = async (userData) => {
    try {
      const response = await api.post("/auth/register", userData)
      return {
        success: response.data.success,
        message: response.data.message,
        userId: response.data.userId,
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed",
      }
    }
  }

  const verifyEmail = async (email, otp) => {
    try {
      const response = await api.post("/auth/verify-email", { email, otp })
      return {
        success: response.data.success,
        message: response.data.message,
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Verification failed",
      }
    }
  }

  const resendVerification = async (email) => {
    try {
      const response = await api.post("/auth/resend-verification", { email })
      return {
        success: response.data.success,
        message: response.data.message,
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Resend failed",
      }
    }
  }

  const forgotPassword = async (email) => {
    try {
      const response = await api.post("/auth/forgot-password", { email })
      return {
        success: response.data.success,
        message: response.data.message,
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Request failed",
      }
    }
  }

  const resetPassword = async (email, otp, newPassword) => {
    try {
      const response = await api.post("/auth/reset-password", { email, otp, newPassword })
      return {
        success: response.data.success,
        message: response.data.message,
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Reset failed",
      }
    }
  }

  const logout = () => {
    localStorage.removeItem("authToken")
    setIsAuthenticated(false)
    setUser(null)
  }

  const value = {
    isAuthenticated,
    user,
    loading,
    login,
    register,
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
