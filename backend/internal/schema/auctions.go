package schema

import "time"

type ItemAuctionRequest struct {
	Title       string    `json:"title" binding:"required"`
	Description string    `json:"description"`
	StartingBid float64   `json:"starting_bid" binding:"required"`
	StartTime   time.Time `json:"start_time" binding:"required"`
	EndTime     time.Time `json:"end_time" binding:"required"`
}

type AuctionResponse struct {
	AuctionID   int       `json:"auction_id"`
	ItemID      int       `json:"item_id"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	StartingBid float64   `json:"starting_bid"`
	HighestBid  float64   `json:"highest_bid"`
	SellerID    int       `json:"seller_id"`
	SellerName  string    `json:"seller_name"`
	StartTime   time.Time `json:"start_time"`
	EndTime     time.Time `json:"end_time"`
	Status      string    `json:"status"`
	BidCount    int       `json:"bid_count"`
}

type BidCreate struct {
	Amount float64 `json:"amount" binding:"required"`
}

type BidResponse struct {
	BidID     int       `json:"bid_id"`
	BuyerID   int       `json:"buyer_id"`
	BuyerName string    `json:"buyer_name"`
	Amount    float64   `json:"amount"`
	BidTime   time.Time `json:"bid_time"`
}
