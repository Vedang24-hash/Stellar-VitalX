import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { connectWallet, disconnectWallet, getWalletAddress, checkAllowed, isFreighterInstalled } from "./services/stellarWallet";
import "./styles/App.css";

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [walletAddress, setWalletAddress] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const checkPreviousConnection = async () => {
      const savedAddress = getWalletAddress();
      if (savedAddress && savedAddress.includes('[object')) {
        disconnectWallet();
        return;
      }
      if (savedAddress) {
        try {
          const allowed = await checkAllowed();
          if (allowed) {
            setWalletAddress(savedAddress);
            setAuthenticated(true);
          } else {
            disconnectWallet();
          }
        } catch (error) {
          disconnectWallet();
        }
      }
    };
    checkPreviousConnection();
  }, []);

  const handleInstallClick = () => {
    window.open("https://www.freighter.app/", "_blank");
  };

  const handleConnectWallet = async () => {
    setIsConnecting(true);
    setErrorMessage("");

    try {
      const installed = await isFreighterInstalled();
      if (!installed) {
        setErrorMessage("not_installed");
        return;
      }

      const address = await connectWallet();

      if (!address) {
        throw new Error("No address returned from Freighter");
      }

      setWalletAddress(address);
      setAuthenticated(true);
      setErrorMessage("");

    } catch (error) {
      console.error("❌ Connection error:", error);

      if (error.message.includes("not installed")) {
        setErrorMessage("not_installed");
      } else if (error.message.includes("rejected") || error.message.includes("declined") || error.message.includes("denied")) {
        setErrorMessage("rejected");
      } else {
        setErrorMessage("failed");
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnectWallet = () => {
    disconnectWallet();
    setWalletAddress(null);
    setAuthenticated(false);
    setErrorMessage("");
    console.log("🔌 Wallet disconnected");
  };

  return (
    <div className="app-root">
      <header className="header">
        <h1 className="brand">VitalX</h1>
        <div className="status-actions">
          {authenticated ? (
            <button className="connect-wallet-btn connected">
              Connected ✅
            </button>
          ) : (
            <button
              className="connect-wallet-btn"
              onClick={handleConnectWallet}
              disabled={isConnecting}
            >
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </button>
          )}
        </div>
      </header>

      <main className="main-content">
        <div className="card">
          <h4>Stellar Healthcare Records</h4>

          {errorMessage === "not_installed" && (
            <div className="error-message">
              <strong>⚠️ Freighter Not Installed</strong>
              <p>Install the Freighter browser extension, then refresh this page to connect your wallet.</p>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "10px" }}>
                <button onClick={handleInstallClick} className="install-button">
                  Install Freighter
                </button>
                <button onClick={() => window.location.reload()} className="install-button" style={{ background: "#2563eb" }}>
                  Refresh Page
                </button>
              </div>
            </div>
          )}

          {errorMessage === "rejected" && (
            <div className="error-message">
              <strong>⚠️ Connection Rejected</strong>
              <p>You declined the connection request. Click "Connect Wallet" and approve in the Freighter popup.</p>
            </div>
          )}

          {errorMessage === "failed" && (
            <div className="error-message">
              <strong>⚠️ Connection Failed</strong>
              <p>Make sure Freighter is installed, unlocked, and you approve the connection request.</p>
              <button onClick={handleInstallClick} className="install-button">
                Install Freighter
              </button>
            </div>
          )}

          {authenticated ? (
            <>
              <p className="welcomemsg">
                Welcome
                <br />
                <br />
                Wallet Address:{" "}
                <span className="address">
                  {walletAddress && typeof walletAddress === 'string' 
                    ? `${walletAddress.slice(0, 8)}...${walletAddress.slice(-8)}`
                    : walletAddress || 'No address'}
                </span>
              </p>
              <div className="action-row">
                <button
                  className="dashboardButton"
                  onClick={() => navigate("/patient")}
                >
                  Go to Dashboard
                </button>
                <button className="logoutButton" onClick={handleDisconnectWallet}>
                  Disconnect Wallet
                </button>
              </div>
            </>
          ) : (
            <div className="wallet-option">
              <button
                className="walletbutton"
                onClick={handleConnectWallet}
                disabled={isConnecting}
              >
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="wallet-logo"
                >
                  <path
                    d="M21 18V19C21 20.1 20.1 21 19 21H5C3.89 21 3 20.1 3 19V5C3 3.9 3.89 3 5 3H19C20.1 3 21 3.9 21 5V6H12C10.89 6 10 6.9 10 8V16C10 17.1 10.89 18 12 18H21ZM12 16H22V8H12V16ZM16 13.5C15.17 13.5 14.5 12.83 14.5 12C14.5 11.17 15.17 10.5 16 10.5C16.83 10.5 17.5 11.17 17.5 12C17.5 12.83 16.83 13.5 16 13.5Z"
                    fill="currentColor"
                  />
                </svg>
                <span>
                  {isConnecting ? "Connecting..." : "Connect Freighter Wallet"}
                </span>
              </button>
              <p className="hint">
                Click to connect your Stellar wallet via Freighter
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
