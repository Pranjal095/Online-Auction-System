package db

import (
	"context"

	"Online-Auction-System/backend/config"
	"Online-Auction-System/backend/internal/schema"
)

// GetUserProfile retrieves a user's profile
func GetUserProfile(c context.Context, userID int) (schema.ProfileResponse, error) {
	var profile schema.ProfileResponse
	err := config.DB.QueryRow(c, `
        SELECT user_id, username, email, address, mobile_number, created_at 
        FROM users WHERE user_id = $1`,
		userID).Scan(
		&profile.UserID, &profile.Username, &profile.Email,
		&profile.Address, &profile.MobileNumber, &profile.CreatedAt,
	)
	return profile, err
}

// UpdateUserProfile updates user profile information
func UpdateUserProfile(c context.Context, userID int, profile schema.ProfileUpdate) error {
	_, err := config.DB.Exec(c, `
        UPDATE users 
        SET username = COALESCE($1, username), 
            email = COALESCE($2, email), 
            address = COALESCE($3, address),
            mobile_number = COALESCE($4, mobile_number)
        WHERE user_id = $5`,
		profile.Username, profile.Email, profile.Address, profile.MobileNumber, userID)
	return err
}
