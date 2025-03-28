package schema

import "time"

type TransactionResponse struct {
	TransactionID int       `json:"transaction_id"`
	AuctionID     int       `json:"auction_id"`
	Title         string    `json:"title"`
	Price         float64   `json:"price"`
	Date          time.Time `json:"purchase_date"`
	Review        int       `json:"review"`
}

type ReviewRequest struct {
	AuctionID int `json:"auction_id" binding:"required"`
	Rating    int `json:"rating" binding:"required"`
}
