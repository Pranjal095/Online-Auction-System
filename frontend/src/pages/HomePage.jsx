import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  const featuredCategories = [
    { id: 1, name: "Electronics", imageUrl: "https://via.placeholder.com/200", count: 95 },
    { id: 2, name: "Fashion", imageUrl: "https://via.placeholder.com/200", count: 120 },
    { id: 3, name: "Home & Living", imageUrl: "https://via.placeholder.com/200", count: 80 },
  ];

  return (
    <div className="flex flex-col gap-12">
      {/* Hero Section */}
      <section className="bg-base-300 text-base-content py-20 px-8 rounded-lg shadow-lg">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-extrabold">Discover Incredible Auctions</h1>
          <p className="text-lg opacity-80 mt-4">
            Join the buzz and explore our vast collection of unique items available for bidding.
            Get the best deals and start your winning journey today!
          </p>
          <div className="flex justify-center gap-4 mt-6">
            <Link to="/auctions" className="btn btn-primary btn-lg">Browse Auctions</Link>
            <Link to="/create-auction" className="btn btn-secondary btn-lg">Start Selling</Link>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="text-center py-10">
        <h2 className="text-3xl font-bold text-base-content">Featured Categories</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 px-6 mt-6">
          {featuredCategories.map(category => (
            <Link key={category.id} to={`/categories/${category.id}`} className="card bg-base-100 shadow-lg hover:scale-105 transition-transform">
              <img src={category.imageUrl} alt={category.name} className="w-full h-40 object-cover rounded-t-lg" />
              <div className="card-body p-6 text-center">
                <h3 className="text-xl font-semibold">{category.name}</h3>
                <p className="text-sm text-base-content/70">{category.count} items</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Trending Auctions */}
      <section className="text-center py-10">
        <h2 className="text-3xl font-bold text-base-content">Trending Auctions</h2>
        <p className="text-lg opacity-80 mt-2">Explore the hottest deals and bid on the most sought-after items.</p>
      </section>

      {/* Seller CTA */}
      <section className="bg-base-300 text-base-content py-16 text-center rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold">Have Something to Sell?</h2>
        <p className="text-lg opacity-90 mt-2">Reach thousands of eager bidders by listing your own auction.</p>
        <Link to="/create-auction" className="btn btn-primary btn-lg mt-6">List Your Item</Link>
      </section>
    </div>
  );
};

export default HomePage;