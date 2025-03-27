import React from "react";
import { useProfileStore } from "../store/useProfileStore";
import { useNavigate } from "react-router-dom";
import { Star } from "lucide-react";

const SoldItems = () => {
  const { soldItems, loading } = useProfileStore();
  const navigate = useNavigate();

  const handleClick = (id) => {
    navigate(`/auction/${id}`);
  };

  if (loading && soldItems.length === 0) {
    return <p>Loading sold items...</p>;
  }
  if (!soldItems || soldItems.length === 0) {
    return <p>No sold items available.</p>;
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Sold Items</h2>
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Auction ID</th>
              <th>Item Title</th>
              <th>Price</th>
              <th>Sale Date</th>
              <th>Review</th>
            </tr>
          </thead>
          <tbody>
            {soldItems.map((item, index) => (
              <tr key={index} className="cursor-pointer">
                <td onClick={() => handleClick(item.auction_id)}>
                  {item.auction_id}
                </td>
                <td onClick={() => handleClick(item.auction_id)}>
                  {item.title}
                </td>
                <td onClick={() => handleClick(item.auction_id)}>
                  ${item.price}
                </td>
                <td onClick={() => handleClick(item.auction_id)}>
                  {new Date(item.sale_date).toLocaleString()}
                </td>
                <td>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={20}
                        className={`transition-colors ${
                          star <= (item.review || 0)
                            ? "text-primary"
                            : "text-base-content/30"
                        }`}
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

export default SoldItems;
