import { useState, useEffect } from 'react'
import { AppConfig, UserSession, showConnect } from '@stacks/connect'
import { NETWORK } from '../utils/constants'

const appConfig = new AppConfig(['store_write', 'publish_data'])
const userSession = new UserSession({ appConfig })

/**
 * Resolve the correct STX address based on network configuration
 */
const getAddress = (userData) => {
  if (!userData?.profile?.stxAddress) return null
  const addresses = userData.profile.stxAddress
  return NETWORK === 'mainnet'
    ? addresses.mainnet || addresses.testnet
    : addresses.testnet || addresses.mainnet
}

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

  const connect = () => {
    showConnect({
      appDetails: {
        name: 'Bitchat',
        icon: window.location.origin + '/logo.svg',
      },
      redirectTo: '/',
      onFinish: () => {
        const data = userSession.loadUserData()
        setUserData(data)
        setIsAuthenticated(true)
      },
      userSession,
    })
  }

  const disconnect = () => {
    userSession.signUserOut()
    setUserData(null)
    setIsAuthenticated(false)
  }

  return {
    userData,
    isAuthenticated,
    address: getAddress(userData),
    connect,
    disconnect,
    userSession
  }
}
