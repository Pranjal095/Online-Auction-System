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


function App() {
  const { theme } = useThemeStore();

  return (
    <div data-theme={theme}>
      <Toaster position="bottom-right" />
      <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/auctions" element={<AuctionsPage />} />
          <Route path="/create-auction" element={<CreateAuctionPage />} />
          <Route path="/auction/:auction_id" element={<AuctionPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    </div>
  )
}

export default App
