import axios from 'axios'

const PINATA_JWT = import.meta.env.VITE_PINATA_JWT

// Check if Pinata is configured
const isPinataConfigured = () => {
  const isValid = PINATA_JWT && 
                  PINATA_JWT !== 'YOUR_PINATA_JWT' && 
                  PINATA_JWT.trim().length > 0 &&
                  !PINATA_JWT.includes('undefined')
  
  console.log('Pinata check:', { 
    hasValue: !!PINATA_JWT, 
    length: PINATA_JWT?.length || 0,
    isValid 
  })
  
  return isValid
}

export const uploadToPinata = async (file) => {
  try {
    // Check if Pinata is configured
    if (!isPinataConfigured()) {
      throw new Error('Pinata is not configured. Please add VITE_PINATA_JWT to your .env file.')
    }

    const formData = new FormData()
    formData.append('file', file)

    const metadata = JSON.stringify({
      name: file.name,
      keyvalues: {
        type: 'health-record',
        uploadedAt: new Date().toISOString()
      }
    })
    formData.append('pinataMetadata', metadata)

    const options = JSON.stringify({
      cidVersion: 1
    })
    formData.append('pinataOptions', options)

    const response = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        maxBodyLength: 'Infinity',
        headers: {
          'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
          'Authorization': `Bearer ${PINATA_JWT}`
        }
      }
    )

    return {
      success: true,
      ipfsHash: response.data.IpfsHash,
      pinataUrl: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`
    }
  } catch (error) {
    console.error('Error uploading to Pinata:', error)
    
    // Better error messages
    let errorMessage = error.message
    if (error.response?.status === 401) {
      errorMessage = 'Invalid Pinata API key. Please check your VITE_PINATA_JWT in .env file.'
    } else if (error.response?.status === 403) {
      errorMessage = 'Pinata access forbidden. Check your API key permissions.'
    }
    
    return {
      success: false,
      error: errorMessage
    }
  }
}

// Helper to check if Pinata is available
export const isPinataAvailable = isPinataConfigured
