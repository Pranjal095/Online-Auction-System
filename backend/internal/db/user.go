package db

import (
	"context"
	"time"

	"Online-Auction-System/backend/config"
)

type User struct {
	ID           int64
	Username     string
	Password     string
	Email        string
	Address      string
	MobileNumber string
	CreatedAt    time.Time
}

// CreateUser inserts a new user with password hash
func CreateUser(c context.Context, username, email, password, address, mobileNumber string) (int, error) {
	var id int
	err := config.DB.QueryRow(c,
		"INSERT INTO users (username, email, password, address, mobile_number) VALUES ($1, $2, $3, $4, $5) RETURNING user_id",
		username, email, password, address, mobileNumber).Scan(&id)
	return id, err
}

// GetUserByUsername retrieves a user by username
func GetUserByUsername(c context.Context, username string) (User, error) {
	var user User
	err := config.DB.QueryRow(c,
		"SELECT user_id, username, email, password, address, mobile_number, created_at FROM users WHERE username = $1",
		username).Scan(&user.ID, &user.Username, &user.Email, &user.Password, &user.Address, &user.MobileNumber, &user.CreatedAt)
	return user, err
}

// IsUsernameAvailable checks if username is not already taken
func IsUsernameAvailable(c context.Context, username string) (bool, error) {
	var exists bool
	err := config.DB.QueryRow(c, "SELECT EXISTS(SELECT 1 FROM users WHERE username = $1)", username).Scan(&exists)
	return !exists, err
}

// IsEmailAvailable checks if email is not already registered
func IsEmailAvailable(c context.Context, email string) (bool, error) {
	var exists bool
	err := config.DB.QueryRow(c, "SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)", email).Scan(&exists)
	return !exists, err
}

// GetUserByID retrieves a user by ID
func GetUserByID(c context.Context, userID int) (User, error) {
	var user User
	err := config.DB.QueryRow(c,
		"SELECT user_id, username, email, password, address, mobile_number, created_at FROM users WHERE user_id = $1",
		userID).Scan(&user.ID, &user.Username, &user.Email, &user.Password, &user.Address, &user.MobileNumber, &user.CreatedAt)
	return user, err
}
