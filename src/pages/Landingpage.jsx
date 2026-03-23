import { useNavigate } from 'react-router-dom'
import '../styles/Landingpage.css'

function Landingpage() {
  const navigate = useNavigate()

  return (
    <div className="landing-container">
      <nav className="navbar">
        <div className="nav-content">
          <h1 className="logo">VitalX</h1>
          <div className="nav-buttons">
            <button onClick={() => navigate('/login')} className="nav-button">
              Login
            </button>
            <button onClick={() => navigate('/signup')} className="nav-button primary">
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      <main className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Secure Healthcare Records on Stellar Blockchain
          </h1>
          <p className="hero-subtitle">
            Store and manage your medical records with blockchain security and IPFS storage
          </p>
          <button onClick={() => navigate('/app')} className="cta-button">
            Get Started
          </button>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>Secure & Private</h3>
            <p>Your health records are encrypted and stored securely on IPFS</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Fast & Efficient</h3>
            <p>Powered by Stellar blockchain for quick and low-cost transactions</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🌐</div>
            <h3>Decentralized</h3>
            <p>No single point of failure with distributed storage</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">👤</div>
            <h3>You Own Your Data</h3>
            <p>Complete control over your medical records</p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Landingpage
