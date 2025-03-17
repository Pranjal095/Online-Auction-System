import { Navigate, Route, Routes } from 'react-router-dom'

import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import SettingsPage from './pages/SettingsPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import AuctionsPage from './pages/AuctionsPage'
import AuctionPage from './pages/AuctionPage'
import CreateAuctionPage from './pages/CreateAuctionPage'
import ProfilePage from './pages/ProfilePage'

import { useThemeStore } from './store/useThemeStore';
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/useAuthStore'
import { useEffect } from 'react'

function App() {
  const { theme } = useThemeStore();
  const { user, isCheckingAuth, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  },[checkAuth]);

  if(isCheckingAuth && !user){
    return (
        <div className='flex items-center justify-center h-screen'>
            <span className="loading loading-infinity loading-xl"></span>
        </div>
    )
  }

  return (
    <div data-theme={theme}>
      <Toaster position="bottom-right" />
      <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
          <Route path="/signup" element={!user ? <SignupPage /> : <Navigate to="/" />} />
          <Route path="/auctions" element={user ? <AuctionsPage /> : <Navigate to="/login" />} />
          <Route path="/create-auction" element={user ? <CreateAuctionPage /> : <Navigate to="/login" />} />
          <Route path="/auction/:auction_id" element={user ? <AuctionPage /> : <Navigate to="/login" />} />
          <Route path="/profile" element={user ? <ProfilePage /> : <Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    </div>
  )
}

export default App
