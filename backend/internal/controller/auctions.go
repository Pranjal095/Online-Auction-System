package controller

import (
	"net/http"
	"strconv"
	"time"

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

	itemID, err := db.CreateItem(
		c,
		userID,
		combinedRequest.Title,
		combinedRequest.Description,
		combinedRequest.StartingBid,
		combinedRequest.ImagePath,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create item"})
		return
	}

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

	auction, err := db.GetAuctionByID(c, auctionID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Auction not found"})
		return
	}

	if bidRequest.Amount <= auction.HighestBid {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bid amount must be higher than current highest bid"})
		return
	}

	bidID, err := db.CreateBid(c, auctionID, userID, bidRequest.Amount)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err})
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

// DeleteAuctionHandler handles deleting an auction (setting status to deleted)
func DeleteAuctionHandler(c *gin.Context) {
	_, err := helpers.GetUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}

	auctionID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid auction ID"})
		return
	}

	_, err = db.GetAuctionByID(c, auctionID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Auction not found"})
		return
	}

	err = db.DeleteAuction(c, auctionID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete auction"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Auction deleted successfully"})
}

// UpdateAuctionEndTimeHandler handles updating an auction's end time
func UpdateAuctionEndTimeHandler(c *gin.Context) {
	_, err := helpers.GetUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}

	auctionID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid auction ID"})
		return
	}

	var request struct {
		NewEndTime time.Time `json:"newEndTime" binding:"required"`
	}

	if err := c.BindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	_, err = db.GetAuctionByID(c, auctionID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Auction not found"})
		return
	}

	if request.NewEndTime.Before(time.Now()) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "End time cannot be in the past"})
		return
	}

	updatedAuction, err := db.UpdateAuctionEndTime(c, auctionID, request.NewEndTime)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update auction end time"})
		return
	}

	c.JSON(http.StatusOK, updatedAuction)
}
