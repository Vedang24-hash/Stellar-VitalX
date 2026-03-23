import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getWalletAddress } from '../services/stellarWallet'
import { uploadToPinata, isPinataAvailable } from '../services/pinataUpload'
import { uploadRecord, getRecordsByUploader, getRecord, isContractConfigured } from '../services/stellarContract'
import { FileText, Upload, LogOut } from 'lucide-react'
import '../styles/patitent.css'

function PatientPage() {
  const [walletAddress, setWalletAddress] = useState(null)
  const [records, setRecords] = useState([])
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    initializePage()
  }, [])

  const initializePage = async () => {
    try {
      const address = getWalletAddress()
      
      if (!address) {
        navigate('/app')
        return
      }
      
      setWalletAddress(address)
      await fetchRecords(address)
    } catch (error) {
      console.error('Error initializing page:', error)
      navigate('/app')
    } finally {
      setLoading(false)
    }
  }

  const fetchRecords = async (address) => {
    try {
      if (!isContractConfigured()) {
        setRecords([])
        return
      }

      console.log('📋 Fetching records from blockchain...')
      const result = await getRecordsByUploader(address)
      
      if (result.success && result.recordIds.length > 0) {
        const recordPromises = result.recordIds.map(id => getRecord(id))
        const recordResults = await Promise.all(recordPromises)
        
        const blockchainRecords = recordResults
          .filter(r => r.success && r.record)
          .map(r => ({
            id: r.record.id,
            wallet_address: r.record.uploader,
            filename: r.record.label,
            ipfs_hash: r.record.ipfsHash,
            ipfs_url: `https://gateway.pinata.cloud/ipfs/${r.record.ipfsHash}`,
            created_at: new Date(r.record.timestamp * 1000).toISOString(),
            source: 'blockchain'
          }))
        
        setRecords(blockchainRecords)
        console.log('✅ Loaded', blockchainRecords.length, 'records from blockchain')
      } else {
        setRecords([])
      }
    } catch (error) {
      console.error('Error fetching records:', error)
      setRecords([])
    }
  }

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Show confirmation dialog BEFORE starting
    const confirmed = window.confirm(
      '📋 Upload Process:\n\n' +
      '1. File will be uploaded to IPFS\n' +
      '2. Freighter wallet will popup\n' +
      '3. You must SIGN transaction and PAY GAS FEES\n' +
      '4. Ownership recorded on Stellar blockchain\n\n' +
      'File: ' + file.name + '\n\n' +
      'Continue?'
    )

    if (!confirmed) {
      event.target.value = ''
      return
    }

    setUploading(true)
    try {
      // Check if smart contract is configured
      if (!isContractConfigured()) {
        alert('⚠️ Smart Contract Not Configured\n\nBlockchain storage is required.\n\nPlease deploy the smart contract and add VITE_CONTRACT_ID to .env file.')
        setUploading(false)
        event.target.value = ''
        return
      }

      // Check if Pinata is configured
      if (!isPinataAvailable()) {
        alert('⚠️ IPFS Not Configured\n\nPinata (IPFS storage) is required.\n\nAdd VITE_PINATA_JWT to .env file.')
        setUploading(false)
        event.target.value = ''
        return
      }

      // STEP 1: Upload to IPFS
      console.log('📤 Step 1: Uploading file to IPFS...')
      const uploadResult = await uploadToPinata(file)
      
      if (!uploadResult.success) {
        throw new Error('IPFS upload failed: ' + uploadResult.error)
      }

      console.log('✅ File uploaded to IPFS:', uploadResult.ipfsHash)

      // STEP 2: Record on blockchain (user signs and pays gas)
      console.log('📝 Step 2: Recording ownership on blockchain...')
      console.log('💰 Please sign the transaction in your Freighter wallet...')
      
      const contractResult = await uploadRecord(uploadResult.ipfsHash, file.name)
      
      if (!contractResult.success) {
        throw new Error('Blockchain transaction failed: ' + contractResult.error)
      }

      console.log('✅ Ownership recorded on blockchain!')
      
      alert(
        '✅ File uploaded successfully!\n\n' +
        '📁 File: ' + file.name + '\n' +
        '🔗 IPFS Hash: ' + uploadResult.ipfsHash + '\n' +
        '⛓️ Transaction: ' + contractResult.transactionHash + '\n\n' +
        'Your ownership is now recorded on Stellar blockchain!'
      )
      
      await fetchRecords(walletAddress)
      
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('❌ Failed to upload file\n\n' + error.message)
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  const handleLogout = () => {
    navigate('/app')
  }

  if (loading) {
    return (
      <div className="patient-container">
        <div className="loading">Loading...</div>
      </div>
    )
  }

  return (
    <div className="patient-container">
      <header className="patient-header">
        <div className="header-content">
          <h1>VitalX Dashboard</h1>
          <div className="header-info">
            <span className="wallet-badge">
              {walletAddress 
                ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
                : 'No wallet'}
            </span>
            <button onClick={handleLogout} className="logout-button">
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="patient-main">
        {isContractConfigured() && (
          <div style={{
            background: '#d4edda',
            border: '1px solid #28a745',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '20px',
            fontSize: '14px'
          }}>
            <strong>✅ Blockchain Storage Active</strong>
            <p style={{margin: '10px 0 0 0'}}>
              Records are being stored on Stellar blockchain via smart contract.
            </p>
          </div>
        )}
        
        <div className="upload-section">
          <div className="upload-card">
            <FileText size={48} className="upload-icon" />
            <h2>Upload Health Record</h2>
            <p>Upload your medical records securely to IPFS and blockchain</p>
            <label className="upload-button">
              <Upload size={20} />
              {uploading ? 'Uploading...' : 'Choose File'}
              <input
                type="file"
                onChange={handleFileUpload}
                disabled={uploading}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                style={{ display: 'none' }}
              />
            </label>
          </div>
        </div>

        <div className="records-section">
          <h2>Your Health Records</h2>
          {records.length === 0 ? (
            <div className="empty-state">
              <FileText size={64} />
              <p>No records uploaded yet</p>
              <p className="empty-subtitle">Upload your first health record to get started</p>
            </div>
          ) : (
            <div className="records-table">
              <table>
                <thead>
                  <tr>
                    <th>Filename</th>
                    <th>Upload Date</th>
                    <th>IPFS Hash</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr key={record.id}>
                      <td>{record.filename}</td>
                      <td>{new Date(record.created_at).toLocaleDateString()}</td>
                      <td className="hash-cell">
                        {record.ipfs_hash.slice(0, 10)}...{record.ipfs_hash.slice(-8)}
                      </td>
                      <td>
                        <a
                          href={record.ipfs_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="view-button"
                        >
                          View
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default PatientPage
