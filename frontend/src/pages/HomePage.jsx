import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="flex flex-col gap-12">
      <section className="bg-base-300 text-base-content py-20 px-8 rounded-lg shadow-lg bg-gradient-to-br from-base-300 to-base-200">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block mb-4 bg-primary/20 rounded-full p-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h1 className="text-5xl font-extrabold mb-2">Discover Incredible Auctions</h1>
          <div className="h-1 w-32 bg-primary mx-auto my-4 rounded-full"></div>
          <p className="text-lg opacity-80 mt-4">
            Join the buzz and explore our vast collection of unique items available for bidding.
            Get the best deals and start your winning journey today!
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Link to="/auctions" className="btn btn-primary btn-lg gap-2 hover:translate-y-1 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Browse Auctions
            </Link>
            <Link to="/create-auction" className="btn btn-secondary btn-lg gap-2 hover:translate-y-1 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Start Selling
            </Link>
          </div>
        </div>
      </section>

      <section className="py-10">
        <h2 className="text-3xl font-bold text-center mb-10">Why Choose Our Auction Platform?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-4">
          <div className="flex flex-col items-center p-6 bg-base-200 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="bg-primary/20 rounded-full p-4 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Real-Time Bidding</h3>
            <p className="text-center opacity-80">Experience the thrill of live auctions with our real-time bidding system. Never miss a beat!</p>
          </div>
          
          <div className="flex flex-col items-center p-6 bg-base-200 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="bg-primary/20 rounded-full p-4 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Email Notifications</h3>
            <p className="text-center opacity-80">Stay updated with email alerts for bid activity, outbids, and auction endings.</p>
          </div>
          
          <div className="flex flex-col items-center p-6 bg-base-200 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="bg-primary/20 rounded-full p-4 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Secure Transactions</h3>
            <p className="text-center opacity-80">Bid with confidence through our secure payment system and verified seller profiles.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;