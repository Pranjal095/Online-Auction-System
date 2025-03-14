import React, { useEffect, useState } from "react";
import { useProfileStore } from "../store/useProfileStore";

const ProfileDetails = () => {
  const { profile, updateProfile, loading } = useProfileStore();

  // Actual code to use when backend is ready:
  /*
  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username,
        email: profile.email,
        address: profile.address,
        mobile_number: profile.mobile_number,
      });
    }
  }, [profile]);
  */

  // Dummy data for now:
  const dummyProfile = {
    username: "johndoe",
    email: "john@example.com",
    address: "123 Main St, City",
    mobile_number: "1234567890",
    payment_info: {
      payment_method: "credit_card",
      last_four: "4242",
    },
  };

  const [formData, setFormData] = useState(dummyProfile);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Uncomment the line below when backend is ready:
    // await updateProfile(formData);
    console.log("Updated profile (dummy):", formData);
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
            value={formData.username}
            onChange={handleChange}
            className="input input-bordered w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="input input-bordered w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Address</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="input input-bordered w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Mobile Number</label>
          <input
            type="text"
            name="mobile_number"
            value={formData.mobile_number}
            onChange={handleChange}
            className="input input-bordered w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Payment Information</label>
          <input
            type="text"
            value={
              dummyProfile.payment_info
                ? `${dummyProfile.payment_info.payment_method} ending in ${dummyProfile.payment_info.last_four}`
                : "Not Provided"
            }
            className="input input-bordered w-full"
            disabled
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Update Profile
        </button>
      </form>
    </div>
  );
};

export default ProfileDetails;
