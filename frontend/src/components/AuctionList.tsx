import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import '../styles/AuctionList.css'

interface Auction {
  id: number
  title: string
  description: string
  currentBid: number
  imageUrl: string
  endTime: string
  bidCount: number
}

const AuctionList: React.FC = () => {
  const [auctions, setAuctions] = useState<Auction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const apiUri = import.meta.env.VITE_API_URI
    axios.get(`${apiUri}/auctions`)
      .then(response => {
        setAuctions(response.data)
        setLoading(false)
      })
      .catch(err => {
        setError('Failed to fetch auctions.')
        setLoading(false)
        console.error(err)
      })
  }, [])

  const formatTimeRemaining = (endTime: string) => {
    const diff = new Date(endTime).getTime() - Date.now()
    if (diff <= 0) return 'Ended'
    const hours = Math.floor(diff / 3600000)
    const minutes = Math.floor((diff % 3600000) / 60000)
    return `${hours}h ${minutes}m left`
  }

  if (loading) return <div className="auction-loading">Loading auctions...</div>
  if (error) return <div className="auction-loading">{error}</div>

  return (
    <div className="auction-list">
      
    </div>
  )
}

export default AuctionList;