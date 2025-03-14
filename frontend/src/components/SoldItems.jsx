import React from "react";
import { useProfileStore } from "../store/useProfileStore";

const SoldItems = () => {
  const { soldItems, loading } = useProfileStore();

  if (loading && soldItems.length === 0) {
    return <p>Loading sold items...</p>;
  }

  if (!soldItems || soldItems.length === 0) {
    return <p>No sold items found.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="table w-full">
        <thead>
          <tr>
            <th>Auction ID</th>
            <th>Item</th>
            <th>Sale Price</th>
            <th>Sold Date</th>
          </tr>
        </thead>
        <tbody>
          {soldItems.map((item, index) => (
            <tr key={index}>
              <td>{item.auction_id}</td>
              <td>{item.item_title}</td>
              <td>${item.sale_price}</td>
              <td>{new Date(item.sold_date).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SoldItems;
