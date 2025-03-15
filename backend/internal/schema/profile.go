package schema

import "time"

type ProfileUpdate struct {
	Username     string `json:"username"`
	Email        string `json:"email"`
	Address      string `json:"address"`
	MobileNumber string `json:"mobile_number"`
}

type ProfileResponse struct {
	UserID       int       `json:"user_id"`
	Username     string    `json:"username"`
	Email        string    `json:"email"`
	Address      string    `json:"address"`
	MobileNumber string    `json:"mobile_number"`
	CreatedAt    time.Time `json:"created_at"`
}
