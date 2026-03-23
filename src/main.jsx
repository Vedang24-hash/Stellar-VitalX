import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './styles/index.css'

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', color: 'white', background: '#dc3545' }}>
          <h1>Something went wrong!</h1>
          <p>Error: {this.state.error?.message}</p>
          <button onClick={() => window.location.reload()} style={{ padding: '10px 20px', marginTop: '20px' }}>
            Reload Page
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

// Lazy load components
const Landingpage = React.lazy(() => import('./pages/Landingpage.jsx').catch(err => {
  console.error('Failed to load Landingpage:', err)
  return { default: () => <div style={{color: 'white', padding: '20px'}}>Error loading Landingpage: {err.message}</div> }
}))

const App = React.lazy(() => import('./App.jsx').catch(err => {
  console.error('Failed to load App:', err)
  return { default: () => <div style={{color: 'white', padding: '20px'}}>Error loading App: {err.message}</div> }
}))

const LoginPage = React.lazy(() => import('./pages/login.jsx').catch(err => {
  console.error('Failed to load LoginPage:', err)
  return { default: () => <div style={{color: 'white', padding: '20px'}}>Error loading LoginPage: {err.message}</div> }
}))

const SignUpPage = React.lazy(() => import('./pages/SignUpPage.jsx').catch(err => {
  console.error('Failed to load SignUpPage:', err)
  return { default: () => <div style={{color: 'white', padding: '20px'}}>Error loading SignUpPage: {err.message}</div> }
}))

const PatientPage = React.lazy(() => import('./pages/patitent.jsx').catch(err => {
  console.error('Failed to load PatientPage:', err)
  return { default: () => <div style={{color: 'white', padding: '20px'}}>Error loading PatientPage: {err.message}</div> }
}))

const LoadingFallback = () => (
  <div style={{ 
    minHeight: '100vh', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    fontSize: '24px'
  }}>
    Loading VitalX...
  </div>
)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <React.Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Landingpage />} />
            <Route path="/app" element={<App />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/patient" element={<PatientPage />} />
          </Routes>
        </React.Suspense>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
)
