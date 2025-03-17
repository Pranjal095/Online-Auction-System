package helpers

import (
	"fmt"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

// setCookie sets a cookie with the given parameters
func SetCookie(w http.ResponseWriter, key string, value string, daysExpire int) {
	expiration := time.Now().Add(time.Duration(daysExpire) * 24 * time.Hour)
	http.SetCookie(w, &http.Cookie{
		Name:     key,
		Value:    value,
		Expires:  expiration,
		HttpOnly: true,
		Secure:   true,
		SameSite: http.SameSiteNoneMode,
		Path:     "/",
		MaxAge:   daysExpire * 24 * 60 * 60,
		Domain: os.Getenv("COOKIE_DOMAIN"),
	})
}

// GetUserID retrieves the user ID from the request context
func GetUserID(c *gin.Context) (int, error) {
	userIDVal, exists := c.Get("id")
	if !exists {
		return 0, fmt.Errorf("error: User ID not found in context")
	}

	switch v := userIDVal.(type) {
    case float64:
        return int(v), nil
    case int:
        return v, nil
    case string:
        userID, err := strconv.Atoi(v)
        if err != nil {
            return 0, fmt.Errorf("error: User ID is not a valid integer string")
        }
        return userID, nil
    default:
        return 0, fmt.Errorf("error: User ID has unexpected type %T", userIDVal)
    }
}
