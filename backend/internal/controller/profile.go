package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"Online-Auction-System/backend/internal/db"
	"Online-Auction-System/backend/internal/helpers"
	"Online-Auction-System/backend/internal/schema"
)

// GetProfileHandler retrieves the current user's profile
func GetProfileHandler(c *gin.Context) {
	userID, err := helpers.GetUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}

	profile, err := db.GetUserProfile(c, userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User profile not found"})
		return
	}

	c.JSON(http.StatusOK, profile)
}

// UpdateProfileHandler updates the current user's profile
func UpdateProfileHandler(c *gin.Context) {
	userID, err := helpers.GetUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}

	var profileUpdate schema.ProfileUpdate
	if err := c.BindJSON(&profileUpdate); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	user, err := db.GetUserByID(c, userID)

	if profileUpdate.Username != "" {
		available, err := db.IsUsernameAvailable(c, profileUpdate.Username)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check username availability"})
			return
		}
		if !available && profileUpdate.Username != user.Username {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Username already taken"})
			return
		}
	}

	if profileUpdate.Email != "" {
		available, err := db.IsEmailAvailable(c, profileUpdate.Email)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check email availability"})
			return
		}
		if !available && profileUpdate.Email != user.Email {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Email already registered"})
			return
		}
	}

	err = db.UpdateUserProfile(c, userID, profileUpdate)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update profile"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Profile updated successfully"})
}

// GetUserAuctionsHandler retrieves auctions created by the current user
func GetUserAuctionsHandler(c *gin.Context) {
	userID, err := helpers.GetUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}

	auctions, err := db.GetUserAuctions(c, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve user auctions"})
		return
	}

	c.JSON(http.StatusOK, auctions)
}

// GetUserBidsHandler retrieves bids placed by the current user
func GetUserBidsHandler(c *gin.Context) {
	userID, err := helpers.GetUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}

	bids, err := db.GetUserBids(c, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve user bids"})
		return
	}

	c.JSON(http.StatusOK, bids)
}

// GetUserSoldHandler retrieves items sold by the authenticated user
func GetUserSoldHandler(c *gin.Context) {
	userID, err := helpers.GetUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}

	soldItems, err := db.GetSoldItems(c, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve sold items"})
		return
	}

	c.JSON(http.StatusOK, soldItems)
}

// GetUserBoughtHandler retrieves items bought by the authenticated user
func GetUserBoughtHandler(c *gin.Context) {
	userID, err := helpers.GetUserID(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Authentication required"})
		return
	}

	boughtItems, err := db.GetBoughtItems(c, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve bought items"})
		return
	}

	c.JSON(http.StatusOK, boughtItems)
}
