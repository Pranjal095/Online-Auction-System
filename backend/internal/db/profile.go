package db

import (
	"context"

	"Online-Auction-System/backend/config"
	"Online-Auction-System/backend/internal/schema"
)

// GetUserProfile retrieves a user's profile
func GetUserProfile(c context.Context, userID int) (schema.ProfileResponse, error) {
	var profile schema.ProfileResponse
	err := config.DB.QueryRow(c, `
        SELECT user_id, username, email, address, mobile_number, created_at 
        FROM users WHERE user_id = $1`,
		userID).Scan(
		&profile.UserID, &profile.Username, &profile.Email,
		&profile.Address, &profile.MobileNumber, &profile.CreatedAt,
	)
	return profile, err
}

// UpdateUserProfile updates user profile information
func UpdateUserProfile(c context.Context, userID int, profile schema.ProfileUpdate) error {
	_, err := config.DB.Exec(c, `
        UPDATE users 
        SET username = COALESCE($1, username), 
		email = COALESCE($2, email), 
		address = COALESCE($3, address),
		mobile_number = COALESCE($4, mobile_number)
        WHERE user_id = $5`,
		profile.Username, profile.Email, profile.Address, profile.MobileNumber, userID)
	return err
}

// GetSoldItems retrieves items sold by a specific user
func GetSoldItems(c context.Context, sellerID int) ([]schema.TransactionResponse, error) {
	rows, err := config.DB.Query(c, `
        SELECT t.transaction_id, a.auction_id, i.title, i.current_highest_bid as price, 
		t.transaction_date, COALESCE(r.rating, 0) as review
        FROM transactions t
        JOIN auctions a ON t.auction_id = a.auction_id
        JOIN items i ON a.item_id = i.item_id
        LEFT JOIN reviews r ON t.transaction_id = r.transaction_id
        WHERE i.seller_id = $1
        ORDER BY t.transaction_date DESC
    `, sellerID)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var transactions []schema.TransactionResponse
	for rows.Next() {
		var transaction schema.TransactionResponse
		err := rows.Scan(
			&transaction.TransactionID,
			&transaction.AuctionID,
			&transaction.Title,
			&transaction.Price,
			&transaction.Date,
			&transaction.Review,
		)
		if err != nil {
			return nil, err
		}
		transactions = append(transactions, transaction)
	}

	return transactions, rows.Err()
}

// GetBoughtItems retrieves items bought by a specific user
func GetBoughtItems(c context.Context, buyerID int) ([]schema.TransactionResponse, error) {
	rows, err := config.DB.Query(c, `
        SELECT t.transaction_id, a.auction_id, i.title, i.current_highest_bid as price,
        t.transaction_date, COALESCE(r.rating, 0) as review
        FROM transactions t
        JOIN auctions a ON t.auction_id = a.auction_id
        JOIN items i ON a.item_id = i.item_id
        LEFT JOIN reviews r ON t.transaction_id = r.transaction_id
        WHERE i.current_highest_bidder = $1
        ORDER BY t.transaction_date DESC
    `, buyerID)

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var transactions []schema.TransactionResponse
	for rows.Next() {
		var transaction schema.TransactionResponse
		err := rows.Scan(
			&transaction.TransactionID,
			&transaction.AuctionID,
			&transaction.Title,
			&transaction.Price,
			&transaction.Date,
			&transaction.Review,
		)
		if err != nil {
			return nil, err
		}
		transactions = append(transactions, transaction)
	}

	return transactions, rows.Err()
}
