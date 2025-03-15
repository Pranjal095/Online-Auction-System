package router

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"Online-Auction-System/backend/internal/controller"
	// "Online-Auction-System/backend/internal/middlewares"
)

func home(c *gin.Context) {
	HTMLString := "<h1>Hello from Group 24</h1>"
	c.Writer.WriteHeader(http.StatusOK)

	c.Writer.Write([]byte(HTMLString))
}

func SetupRoutes(router *gin.Engine) {

	router.GET("/", home)

	authGroup := router.Group("/auth")
	{
		authGroup.POST("/register", controller.RegisterHandler)
		authGroup.POST("/login", controller.LoginHandler)
		authGroup.GET("/logout", controller.LogoutHandler)
	}

	auctionGroup := router.Group("/api/auctions")
	{
		auctionGroup.GET("", controller.GetAuctionsHandler)
		auctionGroup.GET("/:id", controller.GetAuctionHandler)
		auctionGroup.GET("/:id/bids", controller.GetBidsHandler)

		auctionProtected := auctionGroup.Group("")
		// auctionProtected.Use(middlewares.AuthMiddleware())
		{
			auctionProtected.POST("", controller.CreateAuctionHandler)
			auctionProtected.POST("/:id/bid", controller.PlaceBidHandler)
		}
	}

	profileGroup := router.Group("/api/profile")
	// profileGroup.Use(middlewares.AuthMiddleware())
	{
		profileGroup.GET("", controller.GetProfileHandler)
		profileGroup.PUT("", controller.UpdateProfileHandler)
		profileGroup.GET("/auctions", controller.GetUserAuctionsHandler)
		profileGroup.GET("/bids", controller.GetUserBidsHandler)
	}
}
