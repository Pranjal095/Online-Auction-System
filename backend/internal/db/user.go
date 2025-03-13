package db

import (
	"context"
	"time"

	"Online-Auction-System/backend/config"
)

type User struct {
	ID        int64
	Username  string
	Email     string
	Name      string
	Password  string
	CreatedAt time.Time
}

// CreateUser inserts a new user with password hash
func CreateUser(c context.Context, username, email, name, passwordHash string) (int64, error) {
	var id int64
	err := config.DB.QueryRow(c,
		"INSERT INTO users (username, email, name, password_hash, created_at) VALUES ($1, $2, $3, $4, $5) RETURNING id",
		username, email, name, passwordHash, time.Now()).Scan(&id)
	return id, err
}

// GetUserByUsername retrieves a user by username
func GetUserByUsername(c context.Context, username string) (User, error) {
	var user User
	err := config.DB.QueryRow(c,
		"SELECT id, username, email, name, password_hash, created_at FROM users WHERE username = $1",
		username).Scan(&user.ID, &user.Username, &user.Email, &user.Name, &user.Password, &user.CreatedAt)
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
