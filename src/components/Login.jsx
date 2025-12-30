import { useState } from 'react'
import {
  RecaptchaVerifier,
  signInWithPhoneNumber
} from 'firebase/auth'
import { auth } from '../firebase'

const Login = () => {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [step, setStep] = useState('phone') // 'phone', 'verify', 'success'
  const [confirmationResult, setConfirmationResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Format phone number as user types
  const formatPhoneNumber = (value) => {
    const phoneNumberDigits = value.replace(/\D/g, '')
    if (phoneNumberDigits.length <= 3) return phoneNumberDigits
    if (phoneNumberDigits.length <= 6) {
      return `(${phoneNumberDigits.slice(0, 3)}) ${phoneNumberDigits.slice(3)}`
    }
    return `(${phoneNumberDigits.slice(0, 3)}) ${phoneNumberDigits.slice(3, 6)}-${phoneNumberDigits.slice(6, 10)}`
  }

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value)
    setPhoneNumber(formatted)
  }

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved
        }
      })
    }
  }

  const handleSendCode = async (e) => {
    e.preventDefault()
    setError('')

    // Validate phone number (must be 10 digits)
    const digits = phoneNumber.replace(/\D/g, '')
    if (digits.length !== 10) {
      setError('Please enter a valid 10-digit phone number')
      return
    }

    setLoading(true)

    try {
      setupRecaptcha()
      const appVerifier = window.recaptchaVerifier
      const fullPhoneNumber = `+1${digits}` // Assuming US numbers

      const confirmation = await signInWithPhoneNumber(auth, fullPhoneNumber, appVerifier)
      setConfirmationResult(confirmation)
      setStep('verify')
    } catch (err) {
      console.error('Error sending code:', err)
      setError(err.message || 'Failed to send verification code. Please try again.')
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear()
        window.recaptchaVerifier = null
      }
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async (e) => {
    e.preventDefault()
    setError('')

    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter the 6-digit verification code')
      return
    }

    setLoading(true)

    try {
      await confirmationResult.confirm(verificationCode)
      setStep('success')
    } catch (err) {
      console.error('Error verifying code:', err)
      setError('Invalid verification code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    setStep('phone')
    setVerificationCode('')
    setError('')
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear()
      window.recaptchaVerifier = null
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🀄</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Mahjong Coordinator
            </h1>
            <p className="text-gray-600">
              {step === 'phone' && 'Sign in with your phone number'}
              {step === 'verify' && 'Enter verification code'}
              {step === 'success' && 'Welcome!'}
            </p>
          </div>

          {/* Phone Number Step */}
          {step === 'phone' && (
            <form onSubmit={handleSendCode} className="space-y-6">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  placeholder="(555) 123-4567"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition"
                  maxLength="14"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-pink-600 hover:to-rose-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send Verification Code'}
              </button>
            </form>
          )}

          {/* Verification Code Step */}
          {step === 'verify' && (
            <form onSubmit={handleVerifyCode} className="space-y-6">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Code
                </label>
                <input
                  type="text"
                  id="code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition text-center text-2xl tracking-widest"
                  maxLength="6"
                  required
                />
                <p className="mt-2 text-sm text-gray-600 text-center">
                  Sent to {phoneNumber}
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-pink-600 hover:to-rose-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Verifying...' : 'Verify Code'}
                </button>
                <button
                  type="button"
                  onClick={handleBack}
                  className="w-full bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-lg hover:bg-gray-200 transition duration-200"
                >
                  Back
                </button>
              </div>
            </form>
          )}

          {/* Success Step */}
          {step === 'success' && (
            <div className="text-center space-y-6">
              <div className="text-6xl">✅</div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Logged in!
                </h2>
                <p className="text-gray-600">
                  You've successfully authenticated with your phone number.
                </p>
              </div>
              <div className="bg-gradient-to-r from-pink-100 to-rose-100 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  Your session is now active. You can start coordinating your mahjong games!
                </p>
              </div>
            </div>
          )}

          {/* ReCAPTCHA Container */}
          <div id="recaptcha-container"></div>
        </div>

        {/* Footer */}
        <p className="text-center mt-6 text-sm text-gray-600">
          Secure authentication powered by Firebase
        </p>
      </div>
    </div>
  )
}

export default Login
