import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/login.css'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    // For demo purposes, redirect to app
    navigate('/app')
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Welcome Back</h1>
        <p className="auth-subtitle">Login to access your health records</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className="submit-button">
            Login
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account?{' '}
          <span onClick={() => navigate('/signup')} className="auth-link">
            Sign up
          </span>
        </p>
      </div>
    </div>
  )
}

export default LoginPage
