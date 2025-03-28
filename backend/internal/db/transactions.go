package db

import (
	"context"

	"Online-Auction-System/backend/config"
)

// CreateTransaction creates a transaction record for a completed auction
func CreateTransaction(c context.Context, auctionID int) (int, error) {
	var transactionID int
	err := config.DB.QueryRow(c, `
        INSERT INTO transactions (auction_id)
        VALUES ($1)
        RETURNING transaction_id
    `, auctionID).Scan(&transactionID)

	return transactionID, err
}

// GetTransactionByAuctionID gets transaction ID for an auction
func GetTransactionByAuctionID(c context.Context, auctionID int) (int, error) {
	var transactionID int
	err := config.DB.QueryRow(c, `
        SELECT transaction_id FROM transactions
        WHERE auction_id = $1
    `, auctionID).Scan(&transactionID)

	return transactionID, err
}

// SubmitReview adds a review for a transaction
func SubmitReview(c context.Context, transactionID int, rating int) error {
	_, err := config.DB.Exec(c, `
        INSERT INTO reviews (transaction_id, rating)
        VALUES ($1, $2)
        ON CONFLICT (transaction_id) 
        DO UPDATE SET rating = EXCLUDED.rating, review_date = CURRENT_TIMESTAMP
    `, transactionID, rating)

	return err
}
