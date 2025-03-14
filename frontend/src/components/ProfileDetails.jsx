import React, { useEffect, useState } from "react";
import { useProfileStore } from "../store/useProfileStore";

const ProfileDetails = () => {
  const { profile, loading, updateProfile } = useProfileStore();
  const [editData, setEditData] = useState({});

  useEffect(() => {
    if (profile) {
      setEditData({
        username: profile.username,
        email: profile.email,
        address: profile.address,
        mobile_number: profile.mobile_number,
      });
    }
  }, [profile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    await updateProfile(editData);
  };

  if (loading && !profile) {
    return <p>Loading profile...</p>;
  }

  if (!profile) {
    return <p>No profile data available.</p>;
  }

  return (
    <form onSubmit={handleProfileUpdate} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Username</label>
        <input 
          type="text" 
          name="username" 
          className="input input-bordered w-full" 
          value={editData.username || ""} 
          onChange={handleInputChange}
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Email</label>
        <input 
          type="email" 
          name="email" 
          className="input input-bordered w-full" 
          value={editData.email || ""} 
          onChange={handleInputChange}
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Address</label>
        <input 
          type="text" 
          name="address" 
          className="input input-bordered w-full" 
          value={editData.address || ""} 
          onChange={handleInputChange}
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Mobile Number</label>
        <input 
          type="text" 
          name="mobile_number" 
          className="input input-bordered w-full" 
          value={editData.mobile_number || ""} 
          onChange={handleInputChange}
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Payment Info</label>
        <input 
          type="text" 
          className="input input-bordered w-full" 
          value={profile.payment_info ? `${profile.payment_info.payment_method} ending ${profile.payment_info.last_four}` : "Not Provided"} 
          disabled
        />
      </div>
      <div>
        <button type="submit" className="btn btn-primary">
          Update Profile
        </button>
      </div>
    </form>
  );
};

export default ProfileDetails;
