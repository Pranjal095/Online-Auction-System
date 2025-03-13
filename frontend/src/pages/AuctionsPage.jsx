import React from "react";
// For now we're using dummy data; later you can import and use useAuctionStore to fetch real auctions.
// import { useAuctionStore } from "../store/useAuctionStore";

const dummyAuctions = [
  {
    auction_id: 1,
    item: {
      title: "Vintage Watch",
      description: "A classic vintage watch from the 1960s.",
      starting_bid: 100.0,
      current_highest_bid: 150.0,
    },
    start_time: "2025-04-01T12:00:00Z",
    end_time: "2025-04-01T14:00:00Z",
    status: "open",
  },
  {
    auction_id: 2,
    item: {
      title: "Antique Vase",
      description: "An exquisite antique vase with intricate design.",
      starting_bid: 200.0,
      current_highest_bid: 250.0,
    },
    start_time: "2025-04-02T12:00:00Z",
    end_time: "2025-04-02T14:00:00Z",
    status: "open",
  },
];

const AuctionsPage = () => {
  // If you decide to use the store, you could do something like:
  // const { auctions, loading, fetchAuctions } = useAuctionStore();
  // React.useEffect(() => { fetchAuctions(); }, [fetchAuctions]);
  // For now, we'll use our dummy data.
  const auctions = dummyAuctions;

  return (
    <div className="min-h-screen container mx-auto px-4 pt-20">
      <h1 className="text-3xl font-bold mb-6">Auctions</h1>
      {auctions.length === 0 ? (
        <p>No auctions available at the moment.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {auctions.map((auction) => (
            <div key={auction.auction_id} className="card bg-base-200 shadow-lg">
              <div className="card-body">
                <h2 className="card-title">{auction.item.title}</h2>
                <p>{auction.item.description}</p>
                <p>
                  <strong>Starting Bid:</strong> ${auction.item.starting_bid}
                </p>
                <p>
                  <strong>Current Highest Bid:</strong> ${auction.item.current_highest_bid}
                </p>
                <p>
                  <strong>Status:</strong> {auction.status}
                </p>
                <p>
                  <strong>Auction Ends:</strong>{" "}
                  {new Date(auction.end_time).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AuctionsPage;
