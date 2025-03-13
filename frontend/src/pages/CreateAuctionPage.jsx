import React, { useState } from "react";
import { useAuctionStore } from "../store/useAuctionStore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const CreateAuctionPage = () => {
  const { createAuction, isCreating } = useAuctionStore();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    starting_bid: "",
    start_time: "",
    end_time: "",
    image: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Basic validation: ensure required fields are filled.
    if (
      !formData.title ||
      !formData.description ||
      !formData.starting_bid ||
      !formData.start_time ||
      !formData.end_time
    ) {
      toast.error("Please fill all required fields.");
      return;
    }
    try {
      await createAuction(formData);
      toast.success("Auction created successfully!");
      navigate("/auctions");
    } catch (error) {
      console.error("CreateAuctionPage error:", error);
      // Error toast is handled within the store.
    }
  };

  return (
    <div className="min-h-screen container mx-auto px-4 pt-20">
      <div className="card bg-base-200 shadow-xl p-6 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Create Auction</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium">
              Title
            </label>
            <input
              type="text"
              name="title"
              id="title"
              className="input input-bordered w-full"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>
          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium">
              Description
            </label>
            <textarea
              name="description"
              id="description"
              rows="4"
              className="textarea textarea-bordered w-full"
              value={formData.description}
              onChange={handleChange}
              required
            ></textarea>
          </div>
          {/* Starting Bid */}
          <div>
            <label htmlFor="starting_bid" className="block text-sm font-medium">
              Starting Bid ($)
            </label>
            <input
              type="number"
              name="starting_bid"
              id="starting_bid"
              className="input input-bordered w-full"
              value={formData.starting_bid}
              onChange={handleChange}
              required
            />
          </div>
          {/* Auction Start Time */}
          <div>
            <label htmlFor="start_time" className="block text-sm font-medium">
              Auction Start Time
            </label>
            <input
              type="datetime-local"
              name="start_time"
              id="start_time"
              className="input input-bordered w-full"
              value={formData.start_time}
              onChange={handleChange}
              required
            />
          </div>
          {/* Auction End Time */}
          <div>
            <label htmlFor="end_time" className="block text-sm font-medium">
              Auction End Time
            </label>
            <input
              type="datetime-local"
              name="end_time"
              id="end_time"
              className="input input-bordered w-full"
              value={formData.end_time}
              onChange={handleChange}
              required
            />
          </div>
          {/* Image URL */}
          <div>
            <label htmlFor="image" className="block text-sm font-medium">
              Image URL
            </label>
            <input
              type="text"
              name="image"
              id="image"
              className="input input-bordered w-full"
              value={formData.image}
              onChange={handleChange}
            />
          </div>
          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={isCreating}
            >
              {isCreating ? "Creating Auction..." : "Create Auction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAuctionPage;
