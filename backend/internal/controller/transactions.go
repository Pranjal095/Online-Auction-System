package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"Online-Auction-System/backend/internal/db"
	"Online-Auction-System/backend/internal/helpers"
	"Online-Auction-System/backend/internal/schema"
)

// SubmitReviewHandler handles submitting a review for an auction
func SubmitReviewHandler(c *gin.Context) {
	_, err := helpers.GetUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}

	var request schema.ReviewRequest
	if err := c.BindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	transactionID, err := db.GetTransactionByAuctionID(c, request.AuctionID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "No transaction found for this auction"})
		return
	}

	err = db.SubmitReview(c, transactionID, request.Rating)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Review submitted successfully"})
}
