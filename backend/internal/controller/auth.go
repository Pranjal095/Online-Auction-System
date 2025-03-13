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

// User response structure
type UserResponse struct {
    ID       int64  `json:"id"`
    Username string `json:"username"`
    Email    string `json:"email"`
    Name     string `json:"name"`
}

// LoginHandler handles user login with username and password
func LoginHandler(c *gin.Context) {
    var loginRequest schema.LoginRequest
    if err := c.BindJSON(&loginRequest); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
        return
    }

    // Get user from database
    user, err := db.GetUserByUsername(c, loginRequest.Username)
    if err != nil {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid username or password"})
        return
    }

    // Check password
    if !helpers.CheckPasswordHash(loginRequest.Password, user.Password) {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid username or password"})
        return
    }

    // Generate JWT token
    token, err := helpers.GenerateToken(int(user.ID), user.Name)
    if err != nil {
        log.Printf("Token generation failed: %v", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Authentication error"})
        return
    }

    // Set cookie with JWT token
    helpers.SetCookie(c.Writer, "session", token, 15) // 15 days expiry

    // Return user data
    c.JSON(http.StatusOK, gin.H{
        "id":       user.ID,
        "username": user.Username,
        "email":    user.Email,
        "name":     user.Name,
    })
}

// RegisterHandler handles new user registration
func RegisterHandler(c *gin.Context) {
    var registerRequest schema.RegisterRequest
    if err := c.BindJSON(&registerRequest); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload"})
        return
    }

    // Check if username is available
    usernameAvailable, err := db.IsUsernameAvailable(c, registerRequest.Username)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Registration failed"})
        return
    }
    if !usernameAvailable {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Username already taken"})
        return
    }

    // Check if email is available
    emailAvailable, err := db.IsEmailAvailable(c, registerRequest.Email)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Registration failed"})
        return
    }
    if !emailAvailable {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Email already registered"})
        return
    }

    // Hash the password
    hashedPassword, err := helpers.HashPassword(registerRequest.Password)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Registration failed"})
        return
    }

    // Create the user in the database
    userID, err := db.CreateUser(c, registerRequest.Username, registerRequest.Email, registerRequest.Name, hashedPassword)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Registration failed"})
        return
    }

    // Generate JWT token
    token, err := helpers.GenerateToken(int(userID), registerRequest.Name)
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Registration successful but login failed"})
        return
    }

    // Set cookie with JWT token
    helpers.SetCookie(c.Writer, "session", token, 15) // 15 days expiry

    // Return user data
    c.JSON(http.StatusCreated, gin.H{
        "id":       userID,
        "username": registerRequest.Username,
        "email":    registerRequest.Email,
        "name":     registerRequest.Name,
    })
}

// LogoutHandler handles user logout
func LogoutHandler(c *gin.Context) {
    // Set the cookie with immediate expiration
    helpers.SetCookie(c.Writer, "session", "", -1)
    c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}