package router

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"Online-Auction-System/backend/internal/controller"
)

func home(c *gin.Context) {
	HTMLString := "<h1>Hello from <a href='https://iith.dev' target='_blank'>Group 24</a></h1>"
	c.Writer.WriteHeader(http.StatusOK)

	c.Writer.Write([]byte(HTMLString))
}

func SetupRoutes(router *gin.Engine) {

	// Home route
	router.GET("/", home)

	// Group routes for authentication
	authGroup := router.Group("/auth")
	{
		authGroup.POST("/register", controller.RegisterHandler)
		authGroup.POST("/login", controller.LoginHandler)
		authGroup.GET("/logout", controller.LogoutHandler)
	}
}
