package db

import (
	"context"
	"database/sql"
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
	auctionStatus := "open"

	if startTime.After(time.Now()) {
		auctionStatus = "closed"
	}

	err := config.DB.QueryRow(c,
		"INSERT INTO auctions (item_id, start_time, end_time, auction_status) VALUES ($1, $2, $3, $4) RETURNING auction_id",
		itemID, startTime, endTime, auctionStatus).Scan(&auctionID)

	if err == nil {
		_, err = config.DB.Exec(c,
			`INSERT INTO auction_participants (auction_id, user_id, user_role) 
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
               a.start_time, a.end_time, a.auction_status, i.image_path
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
			&auction.StartingBid, &auction.CurrentHighestBid, &auction.SellerID, &auction.SellerName,
			&auction.StartTime, &auction.EndTime, &auction.Status, &auction.ImagePath,
		)
		if err != nil {
			return nil, err
		}
		auctions = append(auctions, auction)
	}

	return auctions, rows.Err()
}

// GetAuctionByID retrieves details of a specific auction
func GetAuctionByID(c context.Context, auctionID int, userID int) (schema.AuctionResponse, error) {
	var auction schema.AuctionResponse
	var currentUserBid sql.NullFloat64
	var currentAutomatedBid sql.NullFloat64

	err := config.DB.QueryRow(c, `
        SELECT a.auction_id, a.item_id, i.title, i.description, i.starting_bid,
            COALESCE(i.current_highest_bid, 0) as highest_bid, 
            i.seller_id, u.username as seller_name,
            a.start_time, a.end_time, a.auction_status, i.image_path,
            CASE WHEN i.current_highest_bidder = $2 THEN true ELSE false END as is_highest_bidder,
            (SELECT NULLIF(MAX(bid_amount), 0) FROM bids WHERE auction_id = a.auction_id AND buyer_id = $2) as current_user_bid,
            (SELECT NULLIF(bid_amount, 0) FROM automated_bids WHERE auction_id = a.auction_id AND buyer_id = $2) as current_automated_bid
        FROM auctions a
        JOIN items i ON a.item_id = i.item_id
        JOIN users u ON i.seller_id = u.user_id
        LEFT JOIN bids b ON a.auction_id = b.auction_id
        WHERE a.auction_id = $1
        GROUP BY a.auction_id, i.item_id, u.username, i.current_highest_bidder, i.highest_automated_bid
    `, auctionID, userID).Scan(
		&auction.AuctionID,
		&auction.ItemID,
		&auction.Title,
		&auction.Description,
		&auction.StartingBid,
		&auction.CurrentHighestBid,
		&auction.SellerID,
		&auction.SellerName,
		&auction.StartTime,
		&auction.EndTime,
		&auction.Status,
		&auction.ImagePath,
		&auction.IsHighestBidder,
		&currentUserBid,
		&currentAutomatedBid,
	)

	if currentUserBid.Valid {
		auction.CurrentUserBid = currentUserBid.Float64
	}

	if currentAutomatedBid.Valid {
		auction.CurrentAutomatedBid = currentAutomatedBid.Float64
	}

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
               a.start_time, a.end_time, a.auction_status
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
			&auction.StartingBid, &auction.CurrentHighestBid, &auction.SellerID, &auction.SellerName,
			&auction.StartTime, &auction.EndTime, &auction.Status,
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
func UpdateAuctionEndTime(c context.Context, auctionID int, newEndTime time.Time, userID int) (schema.AuctionResponse, error) {
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

	return GetAuctionByID(c, auctionID, userID)
}

// GetUserEmail gets the email address of a user by their ID
func GetUserEmail(c context.Context, userID int) (string, error) {
	var email string
	err := config.DB.QueryRow(c, `
        SELECT email
        FROM users
        WHERE user_id = $1
    `, userID).Scan(&email)

	if err != nil {
		return "", err
	}

	return email, nil
}

// GetUserName gets the full name of a user by their ID
func GetUserName(c context.Context, userID int) (string, error) {
	var username string
	err := config.DB.QueryRow(c, `
        SELECT username
        FROM users
        WHERE user_id = $1
    `, userID).Scan(&username)

	if err != nil {
		return "", err
	}

	return username, nil
}

// GetHighestBidder returns the user ID and amount of the highest bidder for an auction
func GetHighestBidder(c context.Context, auctionID int) (int, float64, error) {
    var userID sql.NullInt64
    var amount sql.NullFloat64

    err := config.DB.QueryRow(c, `
        SELECT i.current_highest_bidder, i.current_highest_bid
        FROM auctions AS a 
        JOIN items AS i ON a.item_id = i.item_id
        WHERE a.auction_id = $1
    `, auctionID).Scan(&userID, &amount)

    if err != nil {
        return 0, 0, err
    }

    winnerID := 0
    if userID.Valid {
        winnerID = int(userID.Int64)
    }
    
    highestBid := 0.0
    if amount.Valid {
        highestBid = amount.Float64
    }

    return winnerID, highestBid, nil
}

// UpdateAuctionStatus updates the status of an auction
func UpdateAuctionStatus(c context.Context, auctionID int, status string) error {
	_, err := config.DB.Exec(c, `
        UPDATE auctions
        SET auction_status = $1
        WHERE auction_id = $2
    `, status, auctionID)

	return err
}

// UpdateAutomatedBid sets or updates the maximum automated bid amount for a user on an auction
func UpdateAutomatedBid(c context.Context, userID int, auctionID int, amount float64) error {
	tx, err := config.DB.Begin(c)
	if err != nil {
		return err
	}
	defer tx.Rollback(c)

	var itemID int
	err = tx.QueryRow(c, `
        SELECT item_id FROM auctions WHERE auction_id = $1
    `, auctionID).Scan(&itemID)

	if err != nil {
		return err
	}

	var existingBidID int
	var existingAmount float64
	err = tx.QueryRow(c, `
        SELECT bid_id, bid_amount FROM automated_bids 
        WHERE auction_id = $1 AND buyer_id = $2
    `, auctionID, userID).Scan(&existingBidID, &existingAmount)

	if err != nil {
		if err.Error() == "no rows in result set" {
			_, err = tx.Exec(c, `
                INSERT INTO automated_bids (auction_id, buyer_id, bid_amount)
                VALUES ($1, $2, $3)
            `, auctionID, userID, amount)
		} else {
			return err
		}
	} else {
		_, err = tx.Exec(c, `
            UPDATE automated_bids 
            SET bid_amount = $3, bid_time = CURRENT_TIMESTAMP
            WHERE auction_id = $1 AND buyer_id = $2
        `, auctionID, userID, amount)
	}

	if err != nil {
		return err
	}

	var currentHighestBidderID sql.NullInt32
	err = tx.QueryRow(c, `
        SELECT current_highest_bidder FROM items WHERE item_id = $1
    `, itemID).Scan(&currentHighestBidderID)

	if err != nil && err.Error() != "no rows in result set" {
		return err
	}

	if !currentHighestBidderID.Valid || int(currentHighestBidderID.Int32) == userID {
		_, err = tx.Exec(c, `
            UPDATE items 
            SET highest_automated_bid = $1
            WHERE item_id = $2
        `, amount, itemID)

		if err != nil {
			return err
		}
	}

	return tx.Commit(c)
}

// GetHighestAutomatedBid returns the highest automated bid amount for an auction
func GetHighestAutomatedBid(c context.Context, auctionID int) (float64, error) {
	var highestAutomatedBid float64

	err := config.DB.QueryRow(c, `
        SELECT COALESCE(i.highest_automated_bid, 0)
        FROM items i
        JOIN auctions a ON i.item_id = a.item_id
        WHERE a.auction_id = $1
    `, auctionID).Scan(&highestAutomatedBid)

	if err != nil {
		return 0, err
	}

	return highestAutomatedBid, nil
}

// GetCurrentHighestBidder returns the user ID of the current highest bidder for an auction
func GetCurrentHighestBidder(c context.Context, auctionID int) (int, error) {
	var bidderID int

	err := config.DB.QueryRow(c, `
        SELECT i.current_highest_bidder
        FROM items i
        JOIN auctions a ON i.item_id = a.item_id
        WHERE a.auction_id = $1
    `, auctionID).Scan(&bidderID)

	if err != nil {
		return 0, err
	}

	return bidderID, nil
}

// GetAuctionsToOpen returns auctions where start_time is in the past but status is not "open"
func GetAuctionsToOpen(c context.Context) ([]schema.AuctionResponse, error) {
	rows, err := config.DB.Query(c, `
        SELECT a.auction_id, a.item_id, i.title, i.description, i.starting_bid,
        COALESCE(i.current_highest_bid, i.starting_bid) as highest_bid,
        i.seller_id, u.username as seller_name,
        a.start_time, a.end_time, a.auction_status, i.image_path
        FROM auctions a
        JOIN items i ON a.item_id = i.item_id
        JOIN users u ON i.seller_id = u.user_id
        WHERE a.start_time <= NOW() 
        AND a.end_time > NOW()
        AND a.auction_status != 'open'
        AND a.auction_status != 'deleted'
    `)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var auctions []schema.AuctionResponse
	for rows.Next() {
		var auction schema.AuctionResponse
		err := rows.Scan(
			&auction.AuctionID, &auction.ItemID, &auction.Title, &auction.Description,
			&auction.StartingBid, &auction.CurrentHighestBid, &auction.SellerID, &auction.SellerName,
			&auction.StartTime, &auction.EndTime, &auction.Status, &auction.ImagePath,
		)
		if err != nil {
			return nil, err
		}
		auctions = append(auctions, auction)
	}

	return auctions, rows.Err()
}

// GetAuctionsToClose returns auctions that have ended but haven't been processed yet
func GetAuctionsToClose(c context.Context) ([]schema.AuctionResponse, error) {
	rows, err := config.DB.Query(c, `
        SELECT a.auction_id, a.item_id, i.title, i.description, i.starting_bid,
        COALESCE(i.current_highest_bid, i.starting_bid) as highest_bid,
        i.seller_id, u.username as seller_name,
        a.start_time, a.end_time, a.auction_status, i.image_path
        FROM auctions a
        JOIN items i ON a.item_id = i.item_id
        JOIN users u ON i.seller_id = u.user_id
        WHERE a.end_time <= NOW()
        AND a.auction_status != 'closed'
        AND a.auction_status != 'deleted'
    `)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var auctions []schema.AuctionResponse
	for rows.Next() {
		var auction schema.AuctionResponse
		err := rows.Scan(
			&auction.AuctionID, &auction.ItemID, &auction.Title, &auction.Description,
			&auction.StartingBid, &auction.CurrentHighestBid, &auction.SellerID, &auction.SellerName,
			&auction.StartTime, &auction.EndTime, &auction.Status, &auction.ImagePath,
		)
		if err != nil {
			return nil, err
		}
		auctions = append(auctions, auction)
	}

	return auctions, rows.Err()
}
