package helpers

import (
	"context"
	"fmt"
	"net/smtp"
	"os"
	"strings"
	"text/template"

	"Online-Auction-System/backend/internal/db"

	"github.com/gin-gonic/gin"
	"github.com/jordan-wright/email"
)

// notifType defines the type of notification
type notifType string

const (
	NotificationOutbid     notifType = "outbid"
	NotificationAuctionEnd notifType = "auction_end"
)

// SendAuctionEmail sends an email notification related to auctions
func SendAuctionEmail(c context.Context, receiver string, notifType notifType, auctionID int, additionalData map[string]interface{}) error {
	userID, err := GetUserID(c.(*gin.Context))

	auction, err := db.GetAuctionByID(c, auctionID, userID)
	if err != nil {
		return fmt.Errorf("failed to get auction details: %w", err)
	}

	emailData := map[string]interface{}{
		"auction_id":          auction.AuctionID,
		"item_id":             auction.ItemID,
		"title":               auction.Title,
		"description":         auction.Description,
		"starting_bid":        auction.StartingBid,
		"current_highest_bid": auction.CurrentHighestBid,
		"seller_id":           auction.SellerID,
		"seller_name":         auction.SellerName,
		"start_time":          auction.StartTime.Format("2006-01-02 15:04"),
		"end_time":            auction.EndTime.Format("2006-01-02 15:04"),
		"date":                auction.StartTime.Format("02 Jan 2006"),
		"status":              auction.Status,
	}

	for key, val := range additionalData {
		emailData[key] = val
	}

	subject, err := ParseTemplate(fmt.Sprintf("internal/templates/%s/subject.txt", notifType), emailData)
	if err != nil {
		return fmt.Errorf("failed to parse subject template: %w", err)
	}

	body, err := ParseTemplate(fmt.Sprintf("internal/templates/%s/body.html", notifType), emailData)
	if err != nil {
		return fmt.Errorf("failed to parse body template: %w", err)
	}

	emailAddress := os.Getenv("EMAIL")
	emailPassword := os.Getenv("EMAIL_PASSWORD")

	if emailAddress == "" || emailPassword == "" {
		return fmt.Errorf("Missing email credentials in environment variables")
	}

	e := email.NewEmail()
	e.From = fmt.Sprintf("Online Auction System <%s>", emailAddress)
	e.To = []string{receiver}
	e.Subject = subject
	e.HTML = []byte(body)

	err = e.Send("smtp.gmail.com:587", smtp.PlainAuth("", emailAddress, emailPassword, "smtp.gmail.com"))
	if err != nil {
		return fmt.Errorf("failed to send email: %w", err)
	}

	return nil
}

// ParseTemplate parses a template file with the provided data and returns the formatted string.
func ParseTemplate(filePath string, data map[string]interface{}) (string, error) {
	tmpl, err := template.ParseFiles(filePath)
	if err != nil {
		return "", fmt.Errorf("failed to parse template file: %w", err)
	}

	var builder strings.Builder
	err = tmpl.Execute(&builder, data)
	if err != nil {
		return "", fmt.Errorf("failed to execute template: %w", err)
	}

	return builder.String(), nil
}
