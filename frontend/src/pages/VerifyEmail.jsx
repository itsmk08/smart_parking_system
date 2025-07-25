"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation, Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const VerifyEmail = () => {
  const [otp, setOtp] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)

  const { verifyEmail, resendVerification } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email

  useEffect(() => {
    if (!email) {
      navigate("/register")
    }
  }, [email, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    if (otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP")
      setLoading(false)
      return
    }

    const result = await verifyEmail(email, otp)

    if (result.success) {
      setSuccess("Email verified successfully! Redirecting to login...")
      setTimeout(() => {
        navigate("/")
      }, 2000)
    } else {
      setError(result.message)
    }

    setLoading(false)
  }

  const handleResend = async () => {
    setResendLoading(true)
    setError("")
    setSuccess("")

    const result = await resendVerification(email)

    if (result.success) {
      setSuccess("Verification OTP resent successfully!")
    } else {
      setError(result.message)
    }

    setResendLoading(false)
  }

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6)
    setOtp(value)
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Verify Your Email</h1>
          <p className="text-gray-600 mt-2">We've sent a 6-digit code to {email}</p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}
            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">{success}</div>
            )}

            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 text-center">
                Enter 6-digit verification code
              </label>
              <input
                id="otp"
                name="otp"
                type="text"
                value={otp}
                onChange={handleOtpChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-center text-2xl font-mono tracking-widest"
                placeholder="000000"
                maxLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify Email"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Didn't receive the code?{" "}
              <button
                onClick={handleResend}
                disabled={resendLoading}
                className="font-medium text-blue-600 hover:text-blue-500 disabled:opacity-50"
              >
                {resendLoading ? "Sending..." : "Resend"}
              </button>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link to="/register" className="text-sm text-gray-600 hover:text-gray-500">
              ← Back to registration
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VerifyEmail
