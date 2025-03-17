import React from "react";
import { useProfileStore } from "../store/useProfileStore";

const BoughtItems = () => {
  const { boughtItems, loading } = useProfileStore();

  // Actual code when backend is ready:
  // if (loading && soldItems.length === 0) {
  //   return <p>Loading sold items...</p>;
  // }
  // if (!soldItems || soldItems.length === 0) {
  //   return <p>No sold items available.</p>;
  // }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Bought Items</h2>
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Auction ID</th>
              <th>Item Title</th>
              <th>Sale Price</th>
              <th>Bought Date</th>
            </tr>
          </thead>
          <tbody>
            {dummySoldItems.map((item, index) => (
              <tr key={index}>
                <td>{item.auction_id}</td>
                <td>{item.item_title}</td>
                <td>${item.sale_price}</td>
                <td>{new Date(item.bought_date).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BoughtItems;
