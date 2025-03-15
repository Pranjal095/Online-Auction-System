package helpers

import (
	"context"
	"fmt"
	"os"

	"google.golang.org/api/idtoken"
)

var clientID string = os.Getenv("GOOGLE_CLIENT_ID") //get from env to validate tokenid

// Verify ID Token
func VerifyIDToken(ctx context.Context, token string) (bool, map[string]interface{}) {
	payload, err := idtoken.Validate(ctx, token, clientID)
	if err != nil {
		return false, map[string]interface{}{"error": fmt.Sprintf("Token validation failed: %v", err)}
	}

	payloadMap := make(map[string]interface{})
	payloadMap["email"] = payload.Claims["email"]
	payloadMap["name"] = payload.Claims["name"]
	// Add other fields you may need from payload.Claims as necessary

	// Return true and the ID information as a map
	return true, payloadMap
}
