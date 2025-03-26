package db

import (
	"context"
	"fmt"
	"time"

	"Online-Auction-System/backend/config"
	"Online-Auction-System/backend/internal/schema"
)

// CreateItem inserts a new item
func CreateItem(c context.Context, sellerID int, title, description string, startingBid float64, imagePath string) (int, error) {
	var itemID int
	err := config.DB.QueryRow(c,
		"INSERT INTO items (seller_id, title, description, starting_bid, image_path) VALUES ($1, $2, $3, $4, $5) RETURNING item_id",
		sellerID, title, description, startingBid, imagePath).Scan(&itemID)
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
			`INSERT INTO auction_participants (auction_id, user_id, user_role) 
             SELECT $1, seller_id, 'seller' FROM items WHERE item_id = $2`,
			auctionID, itemID)
	}

	return auctionID, err
}

// GetAuctions retrieves a list of active auctions
func GetAuctions(c context.Context) ([]schema.AuctionResponse, error) {
	err := UpdateAuctionStatuses(c)
	if err != nil {
		fmt.Printf("Error updating auction statuses: %v\n", err)
	}
	rows, err := config.DB.Query(c, `
        SELECT a.auction_id, a.item_id, i.title, i.description, 
               i.starting_bid, COALESCE(i.current_highest_bid, 0), 
               i.seller_id, u.username, 
               a.start_time, a.end_time, a.auction_status, i.image_path, 
               (SELECT COUNT(*) FROM bids b WHERE b.auction_id = a.auction_id)
        FROM auctions a
        JOIN items i ON a.item_id = i.item_id
        JOIN users u ON i.seller_id = u.user_id
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
			&auction.StartTime, &auction.EndTime, &auction.Status, &auction.ImagePath, &auction.BidCount,
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
	err := UpdateAuctionStatuses(c)
	if err != nil {
		fmt.Printf("Error updating auction statuses: %v\n", err)
	}
	var auction schema.AuctionResponse
	err = config.DB.QueryRow(c, `
		SELECT a.auction_id, a.item_id, i.title, i.description, i.starting_bid, COALESCE(i.current_highest_bid, 0), i.seller_id, u.username, a.start_time, a.end_time, a.auction_status, i.image_path, (SELECT COUNT(*) FROM bids b WHERE b.auction_id = a.auction_id)
        FROM auctions a
        JOIN items i ON a.item_id = i.item_id
        JOIN users u ON i.seller_id = u.user_id
        WHERE a.auction_id = $1`, auctionID).Scan(
		&auction.AuctionID, &auction.ItemID, &auction.Title, &auction.Description,
		&auction.StartingBid, &auction.HighestBid, &auction.SellerID, &auction.SellerName,
		&auction.StartTime, &auction.EndTime, &auction.Status, &auction.ImagePath, &auction.BidCount,
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

	if err = tx.Commit(c); err != nil {
		return 0, err
	}

	return bidID, nil
}

// GetBidsForAuction retrieves all bids for a specific auction
func GetBidsForAuction(c context.Context, auctionID int) ([]schema.BidResponse, error) {
	rows, err := config.DB.Query(c, `
        SELECT b.bid_id, b.buyer_id, u.username, b.bid_amount, b.bid_time, b.auction_id, i.title
        FROM bids b
        JOIN users u ON b.buyer_id = u.user_id
		JOIN items i ON i.auction_id = b.auction_id
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
			&bid.BidID, &bid.BuyerID, &bid.BuyerName, &bid.Amount, &bid.BidTime, &bid.AuctionID, &bid.ItemTitle,
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
               a.start_time, a.end_time, a.auction_status,
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
        SELECT b.bid_id, b.buyer_id, u.username, b.bid_amount, b.bid_time, a.auction_id, i.title
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
		err := rows.Scan(
			&bid.BidID, &bid.BuyerID, &bid.BuyerName, &bid.Amount, &bid.BidTime,
			&bid.AuctionID, &bid.ItemTitle,
		)
		if err != nil {
			return nil, err
		}
		bids = append(bids, bid)
	}

	return bids, rows.Err()
}

// UpdateAuctionStatuses updates the statuses of auctions based on their start and end times
func UpdateAuctionStatuses(c context.Context) error {
	tx, err := config.DB.Begin(c)
	if err != nil {
		return err
	}
	defer tx.Rollback(c)

	rows, err := tx.Query(c, `
        SELECT auction_id, item_id 
        FROM auctions 
        WHERE auction_status = 'open' AND end_time < NOW()
    `)

	if err != nil {
		return err
	}

	type auctionItem struct {
		AuctionID int
		ItemID    int
	}

	var expiredAuctions []auctionItem
	for rows.Next() {
		var a auctionItem
		if err := rows.Scan(&a.AuctionID, &a.ItemID); err != nil {
			rows.Close()
			return err
		}
		expiredAuctions = append(expiredAuctions, a)
	}
	rows.Close()

	for _, a := range expiredAuctions {
		_, err = tx.Exec(c, "UPDATE auctions SET auction_status = 'closed' WHERE auction_id = $1", a.AuctionID)
		if err != nil {
			return err
		}
	}

	return tx.Commit(c)
}

// DeleteAuction updates an auction's status to 'deleted' and logs it
func DeleteAuction(c context.Context, auctionID int) error {
	result, err := config.DB.Exec(c,
		"UPDATE auctions SET auction_status = 'deleted' WHERE auction_id = $1",
		auctionID)

	if err != nil {
		return err
	}

	rowsAffected := result.RowsAffected()
	if rowsAffected == 0 {
		return fmt.Errorf("auction not found")
	}

	_, err = config.DB.Exec(c,
		"INSERT INTO admin_delete_log (auction_id, changed_by) VALUES ($1, 1)",
		auctionID)

	return err
}

// UpdateAuctionEndTime updates the end time for an auction
func UpdateAuctionEndTime(c context.Context, auctionID int, newEndTime time.Time) (schema.AuctionResponse, error) {
	tx, err := config.DB.Begin(c)
	if err != nil {
		return schema.AuctionResponse{}, err
	}
	defer tx.Rollback(c)

	var oldEndTime time.Time
	err = tx.QueryRow(c, "SELECT end_time FROM auctions WHERE auction_id = $1", auctionID).Scan(&oldEndTime)
	if err != nil {
		return schema.AuctionResponse{}, err
	}

	result, err := tx.Exec(c, "UPDATE auctions SET end_time = $1 WHERE auction_id = $2", newEndTime, auctionID)
	if err != nil {
		return schema.AuctionResponse{}, err
	}

	rowsAffected := result.RowsAffected()
	if rowsAffected == 0 {
		return schema.AuctionResponse{}, fmt.Errorf("auction not found")
	}

	_, err = tx.Exec(c,
		"INSERT INTO admin_update_log (old_time, new_time, changed_by) VALUES ($1, $2, 1)",
		oldEndTime, newEndTime)
	if err != nil {
		return schema.AuctionResponse{}, err
	}

	if err = tx.Commit(c); err != nil {
		return schema.AuctionResponse{}, err
	}

	return GetAuctionByID(c, auctionID)
}

// GetUserEmail gets the email address of a user by their ID
func GetUserEmail(c context.Context, userID int) (string, error) {
	var email string
	err := config.DB.QueryRow(c, `
        SELECT email
        FROM users
        WHERE id = $1
    `, userID).Scan(&email)

	if err != nil {
		return "", err
	}

	return email, nil
}

// GetUserName gets the full name of a user by their ID
func GetUserName(c context.Context, userID int) (string, error) {
	var name string
	err := config.DB.QueryRow(c, `
        SELECT name
        FROM users
        WHERE id = $1
    `, userID).Scan(&name)

	if err != nil {
		return "", err
	}

	return name, nil
}

// GetHighestBidder returns the user ID and amount of the highest bidder for an auction
func GetHighestBidder(c context.Context, auctionID int) (int, float64, error) {
	var userID int
	var amount float64

	err := config.DB.QueryRow(c, `
        SELECT user_id, amount
        FROM bids
        WHERE auction_id = $1
        ORDER BY amount DESC
        LIMIT 1
    `, auctionID).Scan(&userID, &amount)

	if err != nil {
		return 0, 0, err
	}

	return userID, amount, nil
}
