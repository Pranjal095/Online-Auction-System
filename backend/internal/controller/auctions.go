package controller

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"

	"Online-Auction-System/backend/internal/db"
	"Online-Auction-System/backend/internal/helpers"
	"Online-Auction-System/backend/internal/schema"
)

// CreateAuctionHandler handles creation of a new auction with an item
func CreateAuctionHandler(c *gin.Context) {
	userID, err := helpers.GetUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}

	var combinedRequest schema.ItemAuctionRequest
	if err := c.BindJSON(&combinedRequest); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	// Create the item
	itemID, err := db.CreateItem(
		c,
		userID,
		combinedRequest.Title,
		combinedRequest.Description,
		combinedRequest.StartingBid,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create item"})
		return
	}

	// Create the auction using the new item ID
	auctionID, err := db.CreateAuction(
		c,
		itemID,
		combinedRequest.StartTime,
		combinedRequest.EndTime,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create auction"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"auction_id": auctionID,
		"item_id":    itemID,
		"message":    "Auction created successfully",
	})
}

// GetAuctionsHandler retrieves a list of all active auctions
func GetAuctionsHandler(c *gin.Context) {
	auctions, err := db.GetAuctions(c)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve auctions"})
		return
	}

	c.JSON(http.StatusOK, auctions)
}

// GetAuctionHandler retrieves details of a specific auction
func GetAuctionHandler(c *gin.Context) {
	auctionID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid auction ID"})
		return
	}

	auction, err := db.GetAuctionByID(c, auctionID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Auction not found"})
		return
	}

	c.JSON(http.StatusOK, auction)
}

// PlaceBidHandler handles placing a bid on an auction
func PlaceBidHandler(c *gin.Context) {
	userID, err := helpers.GetUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}

	auctionID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid auction ID"})
		return
	}

	var bidRequest schema.BidCreate
	if err := c.BindJSON(&bidRequest); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	// Check if auction exists and is open
	auction, err := db.GetAuctionByID(c, auctionID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Auction not found"})
		return
	}

	// Validate bid amount is higher than current highest bid
	if bidRequest.Amount <= auction.HighestBid {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bid amount must be higher than current highest bid"})
		return
	}

	// Create the bid
	bidID, err := db.CreateBid(c, auctionID, userID, bidRequest.Amount)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to place bid"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"bid_id":  bidID,
		"message": "Bid placed successfully",
	})
}

// GetBidsHandler retrieves all bids for a specific auction
func GetBidsHandler(c *gin.Context) {
	auctionID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid auction ID"})
		return
	}

	bids, err := db.GetBidsForAuction(c, auctionID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve bids"})
		return
	}

	c.JSON(http.StatusOK, bids)
}
