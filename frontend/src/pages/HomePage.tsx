import React from 'react'
import { Link } from 'react-router-dom'
import AuctionList from '../components/AuctionList'
import '../styles/HomePage.css'

const HomePage: React.FC = () => {
  const featuredCategories = [
    { id: 1, name: "Electronics", imageUrl: "https://placeholder.com", count: 95 },
  ]

  return (
    <div className="home-page">
      <section className="hero">
        <div className="hero-content">
          <h1>Discover Incredible Auctions</h1>
          <p>
            Join the buzz and explore our vast collection of unique items available for bidding.
            Get the best deals and start your winning journey today!
          </p>
          <div className="hero-buttons">
            <Link to="/auctions" className="btn primary">Browse Auctions</Link>
            <Link to="/create-auction" className="btn secondary">Start Selling</Link>
          </div>
        </div>
      </section>
      
      <section className="featured-categories">
        <h2>Featured Categories</h2>
        <div className="categories-grid">
          {featuredCategories.map(category => (
            <Link key={category.id} to={`/categories/${category.id}`} className="category-card">
              <img src={category.imageUrl} alt={category.name} />
              <div className="category-info">
                <h3>{category.name}</h3>
                <p>{category.count} items</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
      
      <section className="trending-auctions">
        <h2>Trending Auctions</h2>
        <AuctionList />
      </section>
      
      <section className="cta">
        <h2>Have Something to Sell?</h2>
        <p>Reach thousands of eager bidders by listing your own auction.</p>
        <Link to="/create-auction" className="btn primary">List Your Item</Link>
      </section>
    </div>
  )
}

export default HomePage;