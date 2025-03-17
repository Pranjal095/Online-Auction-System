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
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    const processedValue = name === "starting_bid" && value !== "" 
      ? parseFloat(value) 
      : value;
      
    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
    formData.start_time += ":00Z";
    formData.end_time += ":00Z";
    await createAuction(formData);
    const error = useAuctionStore.getState().error;
    if (!error) {
      navigate("/auctions");
    }
  };

  return (
    <div className="min-h-screen container mx-auto px-4 pt-20">
      <div className="card bg-base-200 shadow-xl p-6 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Create Auction</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
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
