import React from "react";
import { useProfileStore } from "../store/useProfileStore";

const SoldItems = () => {
  const { soldItems, loading } = useProfileStore();

  // Actual code when backend is ready:
  // if (loading && soldItems.length === 0) {
  //   return <p>Loading sold items...</p>;
  // }
  // if (!soldItems || soldItems.length === 0) {
  //   return <p>No sold items available.</p>;
  // }

  // Dummy sold items data:
  const dummySoldItems = [
    {
      transaction_id: 1,
      auction_id: 2,
      item_title: "Antique Vase",
      sale_price: 250.0,
      sold_date: "2025-04-02T14:05:00Z",
    },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Sold Items</h2>
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Auction ID</th>
              <th>Item Title</th>
              <th>Sale Price</th>
              <th>Sold Date</th>
            </tr>
          </thead>
          <tbody>
            {dummySoldItems.map((item, index) => (
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
    </div>
  );
};

export default SoldItems;
