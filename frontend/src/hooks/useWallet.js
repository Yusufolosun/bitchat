import { useState, useEffect } from 'react'
import { AppConfig, UserSession, showConnect } from '@stacks/connect'

const appConfig = new AppConfig(['store_write', 'publish_data'])
const userSession = new UserSession({ appConfig })

export const useWallet = () => {
  const [userData, setUserData] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      const data = userSession.loadUserData()
      setUserData(data)
      setIsAuthenticated(true)
    } else if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn().then((data) => {
        setUserData(data)
        setIsAuthenticated(true)
      })
    }
  }, [])

  // TO BE CONTINUED - will add connect and disconnect functions
  return {
    userData,
    isAuthenticated,
    address: userData?.profile?.stxAddress?.testnet || userData?.profile?.stxAddress?.mainnet
  }
}
