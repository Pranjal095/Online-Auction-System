package controller

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"

	"Online-Auction-System/backend/internal/db"
	"Online-Auction-System/backend/internal/helpers"
	"Online-Auction-System/backend/internal/schema"
)

type UserResponse struct {
	ID           int64  `json:"id"`
	Username     string `json:"username"`
	Email        string `json:"email"`
	Address      string `json:"address"`
	MobileNumber string `json:"mobile_number"`
}

// LoginHandler handles user login with username and password
func LoginHandler(c *gin.Context) {
	var loginRequest schema.LoginRequest
	if err := c.BindJSON(&loginRequest); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	user, err := db.GetUserByUsername(c, loginRequest.Username)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid username or password"})
		return
	}

	if !helpers.CheckPasswordHash(loginRequest.Password, user.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid username or password"})
		return
	}

	token, err := helpers.GenerateToken(int(user.ID), user.Username)
	if err != nil {
		log.Printf("Token generation failed: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Authentication error"})
		return
	}

	helpers.SetCookie(c.Writer, "session", token, 15) //15 days expiry

	c.JSON(http.StatusOK, gin.H{
		"id":            user.ID,
		"username":      user.Username,
		"email":         user.Email,
		"address":       user.Address,
		"mobile_number": user.MobileNumber,
	})
}

// RegisterHandler handles new user registration
func RegisterHandler(c *gin.Context) {
	var registerRequest schema.RegisterRequest
	if err := c.BindJSON(&registerRequest); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
		return
	}

	usernameAvailable, err := db.IsUsernameAvailable(c, registerRequest.Username)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Registration failed"})
		return
	}
	if !usernameAvailable {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Username already taken"})
		return
	}

	emailAvailable, err := db.IsEmailAvailable(c, registerRequest.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Registration failed"})
		return
	}
	if !emailAvailable {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email already registered"})
		return
	}

	hashedPassword, err := helpers.HashPassword(registerRequest.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Registration failed"})
		return
	}

	userID, err := db.CreateUser(c,
		registerRequest.Username,
		registerRequest.Email,
		hashedPassword,
		registerRequest.Address,
		registerRequest.MobileNumber)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Registration failed"})
		return
	}

	token, err := helpers.GenerateToken(userID, registerRequest.Username)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Registration successful but login failed"})
		return
	}

	helpers.SetCookie(c.Writer, "session", token, 15) //15 days expiry

	c.JSON(http.StatusCreated, gin.H{
		"id":            userID,
		"username":      registerRequest.Username,
		"email":         registerRequest.Email,
		"address":       registerRequest.Address,
		"mobile_number": registerRequest.MobileNumber,
	})
}

// LogoutHandler handles user logout
func LogoutHandler(c *gin.Context) {
	//Set the cookie with immediate expiration
	helpers.SetCookie(c.Writer, "session", "", -1)
	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}
