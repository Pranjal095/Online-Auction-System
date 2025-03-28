package controller

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"

	"Online-Auction-System/backend/internal/db"
	"Online-Auction-System/backend/internal/helpers"
	"Online-Auction-System/backend/internal/schema"
	"Online-Auction-System/backend/internal/websockets"
)

var wsManager *websockets.Manager

func SetWebSocketManager(manager *websockets.Manager) {
	wsManager = manager
}

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

	if wsManager != nil {
		auction, _ := db.GetAuctionByID(c, auctionID, userID)
		wsManager.BroadcastNewAuction(auction)
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

	auction, err := db.GetAuctionByID(c, auctionID, userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
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

	auction, err := db.GetAuctionByID(c, auctionID, userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Auction not found"})
		return
	}

	if bidRequest.Amount <= auction.CurrentHighestBid {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bid amount must be higher than current highest bid"})
		return
	}

	currentHighestBidder, err := db.GetCurrentHighestBidder(c, auctionID)

	highestAutomatedBid, err := db.GetHighestAutomatedBid(c, auctionID)
	if err == nil && highestAutomatedBid > 0 && currentHighestBidder != userID {
		if highestAutomatedBid > bidRequest.Amount {
			newBidAmount := bidRequest.Amount + 1

			_, err := db.CreateBid(c, auctionID, currentHighestBidder, newBidAmount)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process automated bid"})
				return
			}

			if wsManager != nil {
				updatedAuction, _ := db.GetAuctionByID(c, auctionID, userID)
				bidDetails := map[string]interface{}{
					"auction_id":  auctionID,
					"amount":      newBidAmount,
					"user_id":     currentHighestBidder,
					"highest_bid": updatedAuction.CurrentHighestBid,
				}

				wsManager.BroadcastNewBid(auctionID, bidDetails)
			}

			c.JSON(http.StatusOK, gin.H{
				"message": "Your bid was immediately outbid by an automated bidder",
			})
			return
		}
	}

	previousBidder, prevBidAmount, err := db.GetHighestBidder(c, auctionID)
	if err == nil && previousBidder > 0 && previousBidder != userID {
		prevBidderEmail, _ := db.GetUserEmail(c, previousBidder)

		if prevBidderEmail != "" {
			username, err := db.GetUserName(c, previousBidder)

			go func() {
				additionalData := map[string]interface{}{
					"your_bid": prevBidAmount,
					"new_bid":  bidRequest.Amount,
					"username": username,
					"error":    err,
				}

				if err := helpers.SendAuctionEmail(c, prevBidderEmail, helpers.NotificationOutbid, auctionID, additionalData); err != nil {
					// create_bid not affected by email sending
				}
			}()
		}
	}

	bidID, err := db.CreateBid(c, auctionID, userID, bidRequest.Amount)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if wsManager != nil {
		updatedAuction, _ := db.GetAuctionByID(c, auctionID, userID)
		bidDetails := map[string]interface{}{
			"auction_id":  auctionID,
			"bid_id":      bidID,
			"amount":      bidRequest.Amount,
			"user_id":     userID,
			"highest_bid": updatedAuction.CurrentHighestBid,
		}

		wsManager.BroadcastNewBid(auctionID, bidDetails)
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
	userID, err := helpers.GetUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}

	_, err = helpers.GetUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}

	auctionID, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid auction ID"})
		return
	}

	_, err = db.GetAuctionByID(c, auctionID, userID)
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
	userID, err := helpers.GetUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}

	_, err = helpers.GetUserID(c)
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

	_, err = db.GetAuctionByID(c, auctionID, userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Auction not found"})
		return
	}

	if request.NewEndTime.Before(time.Now()) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "End time cannot be in the past"})
		return
	}

	updatedAuction, err := db.UpdateAuctionEndTime(c, auctionID, request.NewEndTime, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update auction end time"})
		return
	}

	if wsManager != nil {
		wsManager.BroadcastNewAuction(updatedAuction)
	}

	c.JSON(http.StatusOK, updatedAuction)
}

// EndAuctionsHandler processes auctions that have ended or should be opened
func EndAuctionsHandler(c *gin.Context) {
    auctionsToOpen, err := db.GetAuctionsToOpen(c)
    if err != nil {
        fmt.Printf("Failed to get auctions to open: %v\n", err)
    } else {
        for _, auction := range auctionsToOpen {
            err = db.UpdateAuctionStatus(c, auction.AuctionID, "open")
            if err != nil {
                continue
            }
            
            if wsManager != nil {
                updatedAuction, _ := db.GetAuctionByID(c, auction.AuctionID, auction.SellerID)
                wsManager.BroadcastNewAuction(updatedAuction)
				wsManager.BroadcastAuctionStatus(auction.AuctionID, "open", updatedAuction)
            }
        }
    }

    endedAuctions, err := db.GetAuctionsToClose(c)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get ended auctions"})
        return
    }

    for _, auction := range endedAuctions {
        winnerID, highestBid, err := db.GetHighestBidder(c, auction.AuctionID)
        if err != nil {
            continue
        }

        err = db.UpdateAuctionStatus(c, auction.AuctionID, "closed")
        if err != nil {
            continue
        }

		if wsManager != nil {
            updatedAuction, _ := db.GetAuctionByID(c, auction.AuctionID, auction.SellerID)
            wsManager.BroadcastAuctionStatus(auction.AuctionID, "closed", updatedAuction)
        }

        if winnerID > 0 && highestBid > 0 {
            _, err := db.CreateTransaction(c, auction.AuctionID)
            if err != nil {
                continue
            }
		}

		sellerEmail, _ := db.GetUserEmail(c, auction.SellerID)
		sellerUsername, _ := db.GetUserName(c, auction.SellerID)
		if sellerEmail != "" {
			go func() {
				additionalData := map[string]interface{}{
					"is_seller":      true,
					"username":       sellerUsername,
				}

				if winnerID > 0 {
					winnerName, _ := db.GetUserName(c, winnerID)
					additionalData["winner_name"] = winnerName
					additionalData["highest_bid"] =     highestBid
				}

				helpers.SendAuctionEmail(c, sellerEmail, helpers.NotificationAuctionEnd, auction.AuctionID, additionalData)
			}()
		}

		winnerEmail, _ := db.GetUserEmail(c, winnerID)
		winnerUsername, _ := db.GetUserName(c, winnerID)
		if winnerEmail != "" {
			winnerEmailCopy := winnerEmail
			
			go func() {
				additionalData := map[string]interface{}{
					"is_winner":      true,
					"username":       winnerUsername,
					"highest_bid":    highestBid,
				}

				helpers.SendAuctionEmail(c, winnerEmailCopy, helpers.NotificationAuctionEnd, auction.AuctionID, additionalData)
			}()
		}
    }

    c.JSON(http.StatusOK, gin.H{
        "message": "Processed auctions",
    })
}

// PlaceAutomatedBidHandler handles placing an automated bid on an auction
func PlaceAutomatedBidHandler(c *gin.Context) {
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

	var bidRequest schema.AutomatedBidCreate
	if err := c.BindJSON(&bidRequest); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	auction, err := db.GetAuctionByID(c, auctionID, userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Auction not found"})
		return
	}

	if auction.Status != "open" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cannot bid on a closed or deleted auction"})
		return
	}

	if bidRequest.Amount <= auction.CurrentHighestBid {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Automated bid amount must be higher than current highest bid"})
		return
	}

	currentHighestBidder, err := db.GetCurrentHighestBidder(c, auctionID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve current highest bidder"})
		return
	}

	if currentHighestBidder == userID {
		err = db.UpdateAutomatedBid(c, userID, auctionID, bidRequest.Amount)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update automated bid"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"message": "Automated bid updated successfully",
		})
		return
	}

	highestAutomatedBid, err := db.GetHighestAutomatedBid(c, auctionID)
	if err != nil {
		fmt.Printf("Error getting highest automated bid: %v\n", err)
	} else if highestAutomatedBid > 0 && highestAutomatedBid >= bidRequest.Amount {
		c.JSON(http.StatusOK, gin.H{
			"message": "An automated bid higher than or equal to your automated bid already exists in the system",
		})
		return
	}

	bidAmount := highestAutomatedBid + 1
	bidID, err := db.CreateBid(c, auctionID, userID, bidAmount)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to set automated bid"})
		return
	}

	err = db.UpdateAutomatedBid(c, userID, auctionID, bidRequest.Amount)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to set automated bid"})
		return
	}

	if currentHighestBidder > 0 {
		prevBidderEmail, err := db.GetUserEmail(c, currentHighestBidder)
		if err == nil && prevBidderEmail != "" {
			username, _ := db.GetUserName(c, currentHighestBidder)

			go func() {
				additionalData := map[string]interface{}{
					"your_bid": auction.CurrentHighestBid,
					"new_bid":  bidAmount,
					"username": username,
				}

				if err := helpers.SendAuctionEmail(c, prevBidderEmail, helpers.NotificationOutbid, auctionID, additionalData); err != nil {
					fmt.Printf("Failed to send outbid notification: %v\n", err)
				}
			}()
		}
	}

	if wsManager != nil {
		updatedAuction, _ := db.GetAuctionByID(c, auctionID, userID)
		bidDetails := map[string]interface{}{
			"auction_id":  auctionID,
			"bid_id":      bidID,
			"amount":      bidAmount,
			"user_id":     userID,
			"highest_bid": updatedAuction.CurrentHighestBid,
		}

		wsManager.BroadcastNewBid(auctionID, bidDetails)
	}

	c.JSON(http.StatusCreated, gin.H{
		"bid_id":  bidID,
		"message": "Automated bid placed successfully",
	})
}
