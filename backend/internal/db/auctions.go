package db

import (
	"context"
	"time"

	"Online-Auction-System/backend/config"
	"Online-Auction-System/backend/internal/schema"
)

// CreateItem inserts a new item
func CreateItem(c context.Context, sellerID int, title, description string, startingBid float64) (int, error) {
	var itemID int
	err := config.DB.QueryRow(c,
		"INSERT INTO items (seller_id, title, description, starting_bid) VALUES ($1, $2, $3, $4) RETURNING item_id",
		sellerID, title, description, startingBid).Scan(&itemID)
	return itemID, err
}

// CreateAuction creates a new auction for an item
func CreateAuction(c context.Context, itemID int, startTime, endTime time.Time) (int, error) {
	var auctionID int
	err := config.DB.QueryRow(c,
		"INSERT INTO auctions (item_id, start_time, end_time) VALUES ($1, $2, $3) RETURNING auction_id",
		itemID, startTime, endTime).Scan(&auctionID)

	if err == nil {
		// Add the seller as a participant
		_, err = config.DB.Exec(c,
			`INSERT INTO auction_participants (auction_id, user_id, role) 
             SELECT $1, seller_id, 'seller' FROM items WHERE item_id = $2`,
			auctionID, itemID)
	}

	return auctionID, err
}

// GetAuctions retrieves a list of active auctions
func GetAuctions(c context.Context) ([]schema.AuctionResponse, error) {
	rows, err := config.DB.Query(c, `
        SELECT a.auction_id, a.item_id, i.title, i.description, 
               i.starting_bid, COALESCE(i.current_highest_bid, 0), 
               i.seller_id, u.username, 
               a.start_time, a.end_time, a.status,
               (SELECT COUNT(*) FROM bids b WHERE b.auction_id = a.auction_id)
        FROM auctions a
        JOIN items i ON a.item_id = i.item_id
        JOIN users u ON i.seller_id = u.user_id
        WHERE a.status = 'open'
        ORDER BY a.end_time ASC`)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var auctions []schema.AuctionResponse
	for rows.Next() {
		var auction schema.AuctionResponse
		err := rows.Scan(
			&auction.AuctionID, &auction.ItemID, &auction.Title, &auction.Description,
			&auction.StartingBid, &auction.HighestBid, &auction.SellerID, &auction.SellerName,
			&auction.StartTime, &auction.EndTime, &auction.Status, &auction.BidCount,
		)
		if err != nil {
			return nil, err
		}
		auctions = append(auctions, auction)
	}

	return auctions, rows.Err()
}

// GetAuctionByID retrieves details of a specific auction
func GetAuctionByID(c context.Context, auctionID int) (schema.AuctionResponse, error) {
	var auction schema.AuctionResponse
	err := config.DB.QueryRow(c, `
        SELECT a.auction_id, a.item_id, i.title, i.description, 
               i.starting_bid, COALESCE(i.current_highest_bid, 0), 
               i.seller_id, u.username, 
               a.start_time, a.end_time, a.status,
               (SELECT COUNT(*) FROM bids b WHERE b.auction_id = a.auction_id)
        FROM auctions a
        JOIN items i ON a.item_id = i.item_id
        JOIN users u ON i.seller_id = u.user_id
        WHERE a.auction_id = $1`, auctionID).Scan(
		&auction.AuctionID, &auction.ItemID, &auction.Title, &auction.Description,
		&auction.StartingBid, &auction.HighestBid, &auction.SellerID, &auction.SellerName,
		&auction.StartTime, &auction.EndTime, &auction.Status, &auction.BidCount,
	)

	return auction, err
}

// CreateBid adds a new bid to an auction
func CreateBid(c context.Context, auctionID, buyerID int, amount float64) (int, error) {
	tx, err := config.DB.Begin(c)
	if err != nil {
		return 0, err
	}
	defer tx.Rollback(c)

	var bidID int
	err = tx.QueryRow(c, `
        INSERT INTO bids (auction_id, buyer_id, bid_amount) 
        VALUES ($1, $2, $3) 
        RETURNING bid_id`,
		auctionID, buyerID, amount).Scan(&bidID)

	if err != nil {
		return 0, err
	}

	_, err = tx.Exec(c, `
        UPDATE items i SET 
        current_highest_bid = $1, 
        current_highest_bidder = $2
        FROM auctions a 
        WHERE a.auction_id = $3 
        AND i.item_id = a.item_id`,
		amount, buyerID, auctionID)

	if err != nil {
		return 0, err
	}

	_, err = tx.Exec(c, `
        INSERT INTO auction_participants (auction_id, user_id, role)
        VALUES ($1, $2, 'buyer')
        ON CONFLICT DO NOTHING`,
		auctionID, buyerID)

	if err != nil {
		return 0, err
	}

	if err = tx.Commit(c); err != nil {
		return 0, err
	}

	return bidID, nil
}

// GetBidsForAuction retrieves all bids for a specific auction
func GetBidsForAuction(c context.Context, auctionID int) ([]schema.BidResponse, error) {
	rows, err := config.DB.Query(c, `
        SELECT b.bid_id, b.buyer_id, u.username, b.bid_amount, b.bid_time
        FROM bids b
        JOIN users u ON b.buyer_id = u.user_id
        WHERE b.auction_id = $1
        ORDER BY b.bid_amount DESC`,
		auctionID)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var bids []schema.BidResponse
	for rows.Next() {
		var bid schema.BidResponse
		err := rows.Scan(
			&bid.BidID, &bid.BuyerID, &bid.BuyerName, &bid.Amount, &bid.BidTime,
		)
		if err != nil {
			return nil, err
		}
		bids = append(bids, bid)
	}

	return bids, rows.Err()
}

// GetUserAuctions gets auctions created by a user
func GetUserAuctions(c context.Context, userID int) ([]schema.AuctionResponse, error) {
	rows, err := config.DB.Query(c, `
        SELECT a.auction_id, a.item_id, i.title, i.description, 
               i.starting_bid, COALESCE(i.current_highest_bid, 0), 
               i.seller_id, u.username, 
               a.start_time, a.end_time, a.status,
               (SELECT COUNT(*) FROM bids b WHERE b.auction_id = a.auction_id)
        FROM auctions a
        JOIN items i ON a.item_id = i.item_id
        JOIN users u ON i.seller_id = u.user_id
        WHERE i.seller_id = $1
        ORDER BY a.start_time DESC`, userID)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var auctions []schema.AuctionResponse
	for rows.Next() {
		var auction schema.AuctionResponse
		err := rows.Scan(
			&auction.AuctionID, &auction.ItemID, &auction.Title, &auction.Description,
			&auction.StartingBid, &auction.HighestBid, &auction.SellerID, &auction.SellerName,
			&auction.StartTime, &auction.EndTime, &auction.Status, &auction.BidCount,
		)
		if err != nil {
			return nil, err
		}
		auctions = append(auctions, auction)
	}

	return auctions, rows.Err()
}

// GetUserBids gets bids placed by a user
func GetUserBids(c context.Context, userID int) ([]schema.BidResponse, error) {
	rows, err := config.DB.Query(c, `
        SELECT b.bid_id, b.buyer_id, u.username, b.bid_amount, b.bid_time, 
               a.auction_id, i.title
        FROM bids b
        JOIN users u ON b.buyer_id = u.user_id
        JOIN auctions a ON b.auction_id = a.auction_id
        JOIN items i ON a.item_id = i.item_id
        WHERE b.buyer_id = $1
        ORDER BY b.bid_time DESC`,
		userID)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var bids []schema.BidResponse
	for rows.Next() {
		var bid schema.BidResponse
		var auctionID int
		var itemTitle string
		err := rows.Scan(
			&bid.BidID, &bid.BuyerID, &bid.BuyerName, &bid.Amount, &bid.BidTime,
			&auctionID, &itemTitle,
		)
		if err != nil {
			return nil, err
		}
		bids = append(bids, bid)
	}

	return bids, rows.Err()
}
