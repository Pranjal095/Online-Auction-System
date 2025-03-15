-- Drop tables and types in the correct order with CASCADE to handle dependencies
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS items CASCADE;
DROP TABLE IF EXISTS auctions CASCADE;
DROP TABLE IF EXISTS bids CASCADE;
DROP TABLE IF EXISTS auction_participants CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS deliveries CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS admin_log CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;

-- Stores user login and contact information (each user has one address and one mobile number). The backend ensures that if another person tries to login with a number or address or email or username already in use, that is prevented
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    address VARCHAR(255) NOT NULL,       -- single address per user
    mobile_number VARCHAR(20) NOT NULL,    -- single mobile number per user
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


--Each item is created by a seller (a user) and may later be auctioned, so current_highest_bid and bidder may be NULL
CREATE TABLE items (
    item_id SERIAL PRIMARY KEY,
    seller_id INTEGER NOT NULL REFERENCES users(user_id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    starting_bid DECIMAL(10,2) NOT NULL,
    current_highest_bid DECIMAL(10,2),
    current_highest_bidder INTEGER REFERENCES users(user_id),
    status VARCHAR(20) CHECK (status IN ('active', 'closed')) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


--An auction is created for an item. (One auction per item.)
CREATE TABLE auctions (
    auction_id SERIAL PRIMARY KEY,
    item_id INTEGER NOT NULL UNIQUE REFERENCES items(item_id),
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    status VARCHAR(20) CHECK (status IN ('open', 'closed')) NOT NULL DEFAULT 'open'
);


--Records bids made by buyers on auctions.
CREATE TABLE bids (
    bid_id SERIAL PRIMARY KEY,
    auction_id INTEGER NOT NULL REFERENCES auctions(auction_id),
    buyer_id INTEGER NOT NULL REFERENCES users(user_id),
    bid_amount DECIMAL(10,2) NOT NULL CHECK (bid_amount > 0),
    bid_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


--Keeps track of which users participated in a given auction and in what role (buyer or seller). A user might appear as a seller in one auction and as a buyer in another.
CREATE TABLE auction_participants (
    auction_id INTEGER NOT NULL REFERENCES auctions(auction_id),
    user_id INTEGER NOT NULL REFERENCES users(user_id),
    role VARCHAR(10) CHECK (role IN ('buyer', 'seller')) NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (auction_id, user_id)
);


--Captures completed sales (to maintain buy-history and sell-history).
CREATE TABLE transactions (
    transaction_id SERIAL PRIMARY KEY,
    auction_id INTEGER NOT NULL REFERENCES auctions(auction_id),
    item_id INTEGER NOT NULL REFERENCES items(item_id),
    buyer_id INTEGER NOT NULL REFERENCES users(user_id),
    seller_id INTEGER NOT NULL REFERENCES users(user_id),
    sale_price DECIMAL(10,2) NOT NULL,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


--Tracks the shipment/delivery status for a transaction. Failed is used to indicate the case when payment is not made in stipulated time. The seller and buyer, both must be notified of this, and the auction, bid and items tables must be updated through transactions by deleting that auction and bid's record, and enabling the seller to host another auction for this item
CREATE TABLE deliveries (
    delivery_id SERIAL PRIMARY KEY,
    transaction_id INTEGER NOT NULL REFERENCES transactions(transaction_id),
    delivery_status VARCHAR(20) CHECK (delivery_status IN ('pending', 'shipped', 'delivered', 'failed')) NOT NULL DEFAULT 'pending',
    delivery_date TIMESTAMP,
    tracking_number VARCHAR(50)
);

--Records payment details for transactions, and failed indicates the same as what was mentioned before. Changes need to be made in this case. Delivery and payment are not directly linked, but both are linked to transactions, which acts as an intermediate to these two
CREATE TABLE payments (
    payment_id SERIAL PRIMARY KEY,
    transaction_id INTEGER NOT NULL REFERENCES transactions(transaction_id),
    payment_method VARCHAR(30) CHECK (payment_method IN ('credit_card', 'UPI', 'bank_transfer')) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_status VARCHAR(20) CHECK (payment_status IN ('pending', 'completed', 'failed')) NOT NULL
);


--Keeps an audit log of changes made on key tables.
CREATE TABLE admin_log (
    log_id SERIAL PRIMARY KEY,
    table_name VARCHAR(50) NOT NULL,
    operation VARCHAR(10) NOT NULL,   -- e.g. INSERT, UPDATE, DELETE
    old_data JSONB,
    new_data JSONB,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    changed_by VARCHAR(50)            -- e.g. admin username
);


--Allows buyers (or sellers) to review their counterpart after a transaction, but honestly just to complete 10 tables. Again, it is not directly linked to any item, but linked to transactions table, which is linked to auctions, which is linked to item
CREATE TABLE reviews (
    review_id SERIAL PRIMARY KEY,
    transaction_id INTEGER NOT NULL REFERENCES transactions(transaction_id),
    reviewer_id INTEGER NOT NULL REFERENCES users(user_id),
    reviewee_id INTEGER NOT NULL REFERENCES users(user_id),
    rating INTEGER CHECK (rating BETWEEN 1 AND 5) NOT NULL,
    comment TEXT,
    review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
