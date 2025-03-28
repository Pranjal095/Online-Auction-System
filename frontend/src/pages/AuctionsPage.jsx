import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuctionStore } from "../store/useAuctionStore";
import { useAuthStore } from "../store/useAuthStore";

const AuctionsPage = () => {
  const { auctions, loading, fetchAuctions } = useAuctionStore();
  const { user } = useAuthStore();

  useEffect(() => { 
    fetchAuctions(); 
    
    const wsUrl = import.meta.env.VITE_BACKEND_URL 
      ? import.meta.env.VITE_BACKEND_URL.replace('http', 'ws') + '/ws'
      : 'ws://localhost:8000/ws';
    const ws = new WebSocket(wsUrl);
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === 'new_auction') {
        fetchAuctions();
      } else if (message.type === 'new_bid') {
        fetchAuctions();
      }
    };
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    return () => {
      ws.close();
    };
  }, [fetchAuctions]);

  return (
    <div className="min-h-screen container mx-auto px-4 pt-20">
      <h1 className="text-3xl font-bold mb-6">Auctions</h1>
      {!auctions || auctions.filter(auction => (user.is_admin ? true : auction.status === "open")).length === 0 ? (
        <p>No auctions available at the moment.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {auctions && auctions.filter(auction => (user.is_admin ? true : auction.status === "open")).map((auction) => (
            <Link
              key={auction.auction_id}
              to={`/auction/${auction.auction_id}`}
              className="card bg-base-200 shadow-lg hover:shadow-2xl transition-shadow"
            >
              <div className="card-body">
                <h2 className="card-title">{auction.title}</h2>
                <p>{auction.description}</p>
                <p>
                  <strong>Starting Bid:</strong> ${auction.starting_bid}
                </p>
                <p>
                  <strong>Current Highest Bid:</strong> ${auction.current_highest_bid}
                </p>
                <p>
                  <strong>Status:</strong> {auction.status}
                </p>
                <p>
                  <strong>Auction Ends:</strong>{" "}
                  {new Date(auction.end_time).toUTCString().slice(0,-4)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default AuctionsPage;