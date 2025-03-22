import React, { useEffect, useState } from "react";
import { useProfileStore } from "../store/useProfileStore";

const ProfileDetails = () => {
  const { profile, updateProfile, loading } = useProfileStore();
  const [formData, setFormData] = useState({});


  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || "",
        email: profile.email || "",
        address: profile.address || "",
        mobile_number: profile.mobile_number || "",
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateProfile(formData);
    window.location.href = "/profile"
  };

  if (loading && !profile) return <p>Loading profile...</p>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Profile Details</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Username</label>
          <input
            type="text"
            name="username"
            value={formData && formData.username}
            onChange={handleChange}
            className="input input-bordered w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={formData && formData.email}
            onChange={handleChange}
            className="input input-bordered w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Address</label>
          <input
            type="text"
            name="address"
            value={formData && formData.address}
            onChange={handleChange}
            className="input input-bordered w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Mobile Number</label>
          <input
            type="text"
            name="mobile_number"
            value={formData && formData.mobile_number}
            onChange={handleChange}
            className="input input-bordered w-full"
          />
        </div>
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? "Updating..." : "Update Profile"}
        </button>
      </form>
    </div>
  );
};

export default ProfileDetails;