import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="flex flex-col gap-12">
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

      <section className="text-center py-10">
        <h2 className="text-3xl font-bold text-base-content">Trending Auctions</h2>
        <p className="text-lg opacity-80 mt-2">Explore the hottest deals and bid on the most sought-after items.</p>
      </section>

      <section className="bg-base-300 text-base-content py-16 text-center rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold">Have Something to Sell?</h2>
        <p className="text-lg opacity-90 mt-2">Reach thousands of eager bidders by listing your own auction.</p>
        <Link to="/create-auction" className="btn btn-primary btn-lg mt-6">List Your Item</Link>
      </section>
    </div>
  );
};

export default HomePage;