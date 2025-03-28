import React, { useEffect, useState } from "react";
import { useProfileStore } from "../store/useProfileStore";
import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react";

const BoughtItems = () => {
  const { boughtItems, loading, submitReview } = useProfileStore();
  const navigate = useNavigate();
  const [rating, setRating] = useState({});

  useEffect(() => {
    if (boughtItems && boughtItems.length > 0) {
      const initialRatings = {};
      boughtItems.forEach(item => {
        initialRatings[item.auction_id] = item.review || 0;
      });
      setRating(initialRatings);
    }
  }, [boughtItems]);

  const handleClick = (id) => {
    navigate(`/auction/${id}`);
  };

  const handleStarClick = (auctionId, starValue) => {
    setRating(prev => ({
      ...prev,
      [auctionId]: starValue
    }));
    submitReview(auctionId, starValue);
  };

  if (loading && boughtItems.length === 0) {
    return <p>Loading bought items...</p>;
  }
  if (!boughtItems || boughtItems.length === 0) {
    return <p>No bought items available.</p>;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Bought Items</h2>
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Auction ID</th>
              <th>Item Title</th>
              <th>Price</th>
              <th>Purchase Date</th>
              <th>Review</th>
            </tr>
          </thead>
          <tbody>
            {boughtItems.map((item, index) => (
              <tr key={index} className="cursor-pointer">
                <td onClick={() => handleClick(item.auction_id)}>{item.auction_id}</td>
                <td onClick={() => handleClick(item.auction_id)}>{item.title}</td>
                <td onClick={() => handleClick(item.auction_id)}>${item.price}</td>
                <td onClick={() => handleClick(item.auction_id)}>
                  {new Date(item.purchase_date).toLocaleString()}
                </td>
                <td>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={20}
                        className={`cursor-pointer transition-colors ${
                          star <= (rating[item.auction_id] || 0)
                            ? "text-primary"
                            : "text-base-content/30"
                        }`}
                        onClick={() => handleStarClick(item.auction_id, star)}
                      />
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BoughtItems;
