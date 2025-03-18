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
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


--Each item is created by a seller (a user) and may later be auctioned, so current_highest_bid and bidder may be NULL
CREATE TABLE items (
    item_id SERIAL PRIMARY KEY,
    seller_id INTEGER NOT NULL REFERENCES users(user_id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_path VARCHAR(255) NOT NULL,
    starting_bid DECIMAL(10,2) NOT NULL,
    current_highest_bid DECIMAL(10,2),
    current_highest_bidder INTEGER REFERENCES users(user_id),
    status VARCHAR(20) CHECK (status IN ('active', 'closed', 'deleted')) NOT NULL DEFAULT 'active',
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


--Keeps an audit log of auction end_time changes made on key tables.
CREATE TABLE admin_update_log (
    log_id SERIAL PRIMARY KEY,
    old_time TIMESTAMP,
    new_time TIMESTAMP,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    changed_by SERIAL             -- e.g. admin username
);

--Keeps an audit log of auctions deleted.
CREATE TABLE admin_delete_log (
    log_id SERIAL PRIMARY KEY,
    auction_id INTEGER REFERENCES auctions(auction_id),
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    changed_by SERIAL             -- e.g. admin username
);

--Allows buyers (or sellers) to review their counterpart after a transaction, but honestly just to complete 10 tables. Again, it is not directly linked to any item, but linked to transactions table, which is linked to auctions, which is linked to item
CREATE TABLE reviews (
    review_id SERIAL PRIMARY KEY,
    transaction_id INTEGER NOT NULL REFERENCES transactions(transaction_id),
    reviewer_id INTEGER NOT NULL REFERENCES users(user_id),
    rating INTEGER CHECK (rating BETWEEN 1 AND 5) NOT NULL,
    comment TEXT,
    review_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP FUNCTION IF EXISTS update_highest_bid() CASCADE;
DROP TRIGGER IF EXISTS trg_update_highest_bid ON bids;
DROP PROCEDURE IF EXISTS finalize_transaction(p_transaction_id integer);
DROP PROCEDURE IF EXISTS send_notification(p_auction_id integer, p_item_id integer);
DROP FUNCTION IF EXISTS log_admin_changes() CASCADE;
DROP TRIGGER IF EXISTS log_items_changes ON items;
DROP PROCEDURE IF EXISTS close_auction(p_auction_id integer);
DROP FUNCTION IF EXISTS check_auction_end() CASCADE;
DROP TRIGGER IF EXISTS trg_auction_end_check ON auctions;


CREATE OR REPLACE FUNCTION update_highest_bid() 
RETURNS TRIGGER AS $$
DECLARE
    v_item_id INTEGER;
    v_current_bid DECIMAL(10,2);
    v_item_status VARCHAR(20);
    v_auction_status VARCHAR(20);
BEGIN
    -- Retrieve the associated item_id from the auctions table while locking the row.
    SELECT item_id, status 
      INTO v_item_id, v_auction_status
      FROM auctions 
     WHERE auction_id = NEW.auction_id
       FOR UPDATE;
    
    -- Check if the auction is still open.
    IF v_auction_status <> 'open' THEN
        RAISE NOTICE 'Auction % is not open. Skipping bid update.', NEW.auction_id;
        RETURN NEW;
    END IF;
    
    -- Retrieve the current highest bid (or starting bid if no bid exists) and the item status from the items table.
    SELECT COALESCE(current_highest_bid, starting_bid), status
      INTO v_current_bid, v_item_status
      FROM items 
     WHERE item_id = v_item_id
       FOR UPDATE;
    
    -- Ensure that the item is active (open for bidding) before updating.
    IF v_item_status <> 'active' THEN
        RAISE NOTICE 'Item % is not active. Skipping bid update.', v_item_id;
        RETURN NEW;
    END IF;
    
    -- If the new bid exceeds the current bid, update the highest bid and highest bidder.
    IF NEW.bid_amount > v_current_bid THEN
        UPDATE items
           SET current_highest_bid = NEW.bid_amount,
               current_highest_bidder = NEW.buyer_id
         WHERE item_id = v_item_id;
    ELSE
        RAISE NOTICE 'Bid % is not higher than current bid % for item %.', NEW.bid_amount, v_current_bid, v_item_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_highest_bid
AFTER INSERT ON bids
FOR EACH ROW
EXECUTE FUNCTION update_highest_bid();

CREATE PROCEDURE finalize_transaction(p_transaction_id integer)
LANGUAGE plpgsql
AS $$
DECLARE
    v_payment_record JSONB;
BEGIN
    -- Update the payment record to mark the payment as completed, only if it is still pending.
    UPDATE payment 
       SET payment_status = 'completed'
     WHERE transaction_id = p_transaction_id
       AND payment_status = 'pending';

    -- Retrieve the updated payment row for logging purposes
    SELECT row_to_json(p)::jsonb
      INTO v_payment_record
      FROM payment p
     WHERE transaction_id = p_transaction_id;
     
    -- Insert an audit log entry into admin_log for the payment update
    INSERT INTO admin_log(table_name, operation, old_data, new_data, changed_by)
    VALUES (
        'payment',
        'UPDATE',
        NULL,         -- Ideally, capture the old data before the update; here we use NULL for simplicity. HAVE TO DO THIS
        v_payment_record,
        current_user
    );
       
    RAISE NOTICE 'Transaction % finalized; payment status updated to completed', p_transaction_id;
END;
$$;

-- Procedure for notifying to the customer
CREATE PROCEDURE send_notification(p_auction_id integer, p_item_id integer)
LANGUAGE plpgsql
AS $$
DECLARE
    v_auction_status VARCHAR(20);
    v_auction_end TIMESTAMP;
    v_item_title VARCHAR(255);
    v_item_status VARCHAR(20);
    v_current_highest_bid NUMERIC(10,2);
    v_seller_id INTEGER;
    v_current_highest_bidder INTEGER;
    v_seller_email VARCHAR(100);
    v_seller_mobile VARCHAR(20);
    v_buyer_email VARCHAR(100);
BEGIN
    -- Retrieve auction details
    SELECT status, end_time 
      INTO v_auction_status, v_auction_end
      FROM auctions
     WHERE auction_id = p_auction_id;
     
    -- Retrieve item details, including seller and highest bid info
    SELECT title, status, current_highest_bid, seller_id, current_highest_bidder
      INTO v_item_title, v_item_status, v_current_highest_bid, v_seller_id, v_current_highest_bidder
      FROM items
     WHERE item_id = p_item_id;
     
    -- Retrieve seller contact information
    SELECT email, mobile_number
      INTO v_seller_email, v_seller_mobile
      FROM users
     WHERE user_id = v_seller_id;
     
    -- If a winning bid exists, look up the buyer's details and simulate notifications to both parties.
    IF v_current_highest_bid IS NOT NULL AND v_current_highest_bidder IS NOT NULL THEN
        SELECT email
          INTO v_buyer_email
          FROM users
         WHERE user_id = v_current_highest_bidder;
         
        RAISE NOTICE 'Auction % for item "%" closed at % with a winning bid of %.',
                     p_auction_id, v_item_title, v_auction_end, v_current_highest_bid;
                     
        RAISE NOTICE 'Notification sent to Seller: [ID: %, Email: %, Mobile: %].',
                     v_seller_id, v_seller_email, v_seller_mobile;
                     
        RAISE NOTICE 'Notification sent to Buyer: [ID: %, Email: %].',
                     v_current_highest_bidder, v_buyer_email;
    ELSE
        -- No bid was placed; notify the seller to relist or take further action.
        RAISE NOTICE 'Auction % for item "%" closed with no bids. Notification sent to Seller: [ID: %, Email: %, Mobile: %].',
                     p_auction_id, v_item_title, v_seller_id, v_seller_email, v_seller_mobile;
    END IF;
END;
$$;

CREATE TRIGGER log_items_changes
AFTER UPDATE OR DELETE ON items
FOR EACH ROW
EXECUTE FUNCTION log_admin_changes();

-- Items: Focus on seller activity and status filtering
CREATE INDEX IF NOT EXISTS idx_items_seller_status ON items(seller_id, status); -- Replaces individual seller_id/status indexes
CREATE INDEX IF NOT EXISTS idx_items_highest_bidder ON items(current_highest_bidder);

-- Auctions: Optimize time-based queries and status checks
CREATE INDEX IF NOT EXISTS idx_auctions_time_status ON auctions(status, end_time);
CREATE INDEX IF NOT EXISTS idx_auctions_item ON auctions(item_id); -- Already exists via UNIQUE

-- Bids: Speed up bid analysis and user activity lookups
CREATE INDEX IF NOT EXISTS idx_bids_auction_amount ON bids(auction_id, bid_amount DESC); -- For finding highest bids
CREATE INDEX IF NOT EXISTS idx_bids_buyer_time ON bids(buyer_id, bid_time);

-- Auction Participants: Support user-centric queries
CREATE INDEX IF NOT EXISTS idx_participants_user ON auction_participants(user_id);

-- Transactions: Accelerate history lookups and joins
CREATE INDEX IF NOT EXISTS idx_transactions_buyer_date ON transactions(buyer_id, transaction_date);
--CREATE INDEX IF NOT EXISTS idx_transactions_seller ON transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_transactions_item ON transactions(item_id);

-- Delivery: Track shipment states efficiently
CREATE INDEX IF NOT EXISTS idx_delivery_status ON deliveries(delivery_status);
CREATE INDEX IF NOT EXISTS idx_delivery_transaction ON deliveries(transaction_id);

-- Payment: Monitor payment outcomes
CREATE INDEX IF NOT EXISTS idx_payment_status ON payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_payment_transaction ON payments(transaction_id);

-- Admin Log: Audit trail optimization
CREATE INDEX IF NOT EXISTS idx_admin_log_table_changed ON admin_log(table_name, changed_at);

-- Reviews: Enable user reputation checks
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee ON reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer ON reviews(reviewer_id);

-- Procedure to close an auction
CREATE PROCEDURE close_auction(p_auction_id integer)
LANGUAGE plpgsql
AS $$
DECLARE
    v_item_id integer;
    v_highest_bid numeric(10,2);
    v_highest_bidder integer;
    v_seller_id integer;
BEGIN
    -- Get the item associated with the auction
    SELECT item_id INTO v_item_id 
      FROM auctions 
     WHERE auction_id = p_auction_id;
     
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Auction not found';
    END IF;
    
    -- Mark auction as closed
    UPDATE auctions 
       SET status = 'closed' 
     WHERE auction_id = p_auction_id;
    
    -- Update the item status to closed
    UPDATE items 
       SET status = 'closed' 
     WHERE item_id = v_item_id;
    
    -- Retrieve highest bid details and seller_id for the item
    SELECT current_highest_bid, current_highest_bidder, seller_id 
      INTO v_highest_bid, v_highest_bidder, v_seller_id 
      FROM items 
     WHERE item_id = v_item_id;
    
    IF v_highest_bid IS NOT NULL THEN
        -- Record the transaction for the auction using the new schema columns
        INSERT INTO transactions(auction_id, item_id, buyer_id, sale_price, transaction_date);
        VALUES (p_auction_id, v_item_id, v_highest_bidder, v_highest_bid, CURRENT_TIMESTAMP);
    END IF;
    
    -- Call the notification procedure (assumes it’s defined to accept auction and item IDs)
    CALL send_notification(p_auction_id, v_item_id);
END;
$$;



-- Trigger to check the end of auction
CREATE OR REPLACE FUNCTION check_auction_end() 
RETURNS trigger AS $$
BEGIN
    IF NEW.status = 'open' AND NEW.end_time <= CURRENT_TIMESTAMP THEN
        -- Use dynamic SQL to call the auction closing procedure
        EXECUTE 'CALL close_auction(' || NEW.auction_id || ')';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- Use this trigger for the required calls on any table
CREATE TRIGGER trg_auction_end_check
AFTER UPDATE OF end_time, status ON auctions
FOR EACH ROW
WHEN (NEW.status = 'open' AND NEW.end_time <= CURRENT_TIMESTAMP)
EXECUTE FUNCTION check_auction_end();