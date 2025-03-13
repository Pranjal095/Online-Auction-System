import React from 'react'
import { Link } from 'react-router-dom'
// import AuctionList from '../components/AuctionList'

const HomePage = () => {
  const featuredCategories = [
    { id: 1, name: "Electronics", imageUrl: "https://placeholder.com", count: 95 },
  ]

  return (
    <div className="flex flex-col gap-8">
      <section className="bg-cover bg-center text-white py-16 px-8" style={{ backgroundImage: "url('https://via.placeholder.com/1400x400?text=Auction+Banner')" }}>
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl mb-4">Discover Incredible Auctions</h1>
          <p className="text-lg mb-8">
            Join the buzz and explore our vast collection of unique items available for bidding.
            Get the best deals and start your winning journey today!
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/auctions" className="btn btn-primary">Browse Auctions</Link>
            <Link to="/create-auction" className="btn btn-secondary">Start Selling</Link>
          </div>
        </div>
      </section>

      <section className="text-center py-8">
        <h2 className="text-2xl mb-6">Featured Categories</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 px-4">
          {featuredCategories.map(category => (
            <Link key={category.id} to={`/categories/${category.id}`} className="card shadow-xl">
              <img src={category.imageUrl} alt={category.name} className="w-full rounded-t-lg" />
              <div className="card-body p-4">
                <h3 className="text-xl">{category.name}</h3>
                <p>{category.count} items</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="text-center py-8">
        <h2 className="text-2xl mb-6">Trending Auctions</h2>
      </section>

      <section className="bg-base-200 py-12 text-center rounded-lg">
        <h2 className="text-2xl mb-4">Have Something to Sell?</h2>
        <p className="mb-6">Reach thousands of eager bidders by listing your own auction.</p>
        <Link to="/create-auction" className="btn btn-primary">List Your Item</Link>
      </section>
    </div>
  )
}

export default HomePage
