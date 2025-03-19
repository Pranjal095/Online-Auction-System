import React, { useState } from "react";
import { useAuctionStore } from "../store/useAuctionStore";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import getLocalTime from "../helpers/getLocalTime";

const CreateAuctionPage = () => {
  const { createAuction, isCreating } = useAuctionStore();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    starting_bid: "",
    start_time: "",
    end_time: "",
    image_path: "",
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // File size validation
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size must be less than 2MB");
      e.target.value = "";
      return;
    }

    // Check if it's an image
    if (!file.type.match('image.*')) {
      toast.error("Only image files are allowed");
      e.target.value = "";
      return;
    }

    setSelectedImage(file);

    // Create a preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const uploadImage = async () => {
    if (!selectedImage) return null;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append("image", selectedImage);

    try {
      const response = await axiosInstance.post("/api/auctions/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setUploadingImage(false);
      return response.data.path;
    } catch (error) {
      setUploadingImage(false);
      toast.error("Failed to upload image");
      console.error("Image upload error:", error);
      return null;
    }
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

    // First upload the image if selected
    let imagePath = null;
    if (selectedImage) {
      imagePath = await uploadImage();
      if (!imagePath) {
        return; // Stop if image upload failed
      }
    }

    // Create a copy of formData with the image path
    const auctionData = {
      ...formData,
      image_path: imagePath,
      start_time: getLocalTime(formData.start_time),
      end_time: getLocalTime(formData.end_time),
    };

    await createAuction(auctionData);
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
          {/* Existing form fields */}
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
          
          {/* New image upload field */}
          <div>
            <label htmlFor="image" className="block text-sm font-medium">
              Item Image (max 2MB)
            </label>
            <input
              type="file"
              name="image"
              id="image"
              accept="image/*"
              className="file-input file-input-bordered w-full"
              onChange={handleImageChange}
              required
            />
            {previewUrl && (
              <div className="mt-2">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="max-h-48 rounded-md shadow-sm" 
                />
              </div>
            )}
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
              disabled={isCreating || uploadingImage}
            >
              {isCreating || uploadingImage ? "Creating Auction..." : "Create Auction"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAuctionPage;