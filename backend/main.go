package main

import (
	"fmt"
	"os"

	"Online-Auction-System/backend/config"
	"Online-Auction-System/backend/internal/router"
	"Online-Auction-System/backend/internal/websockets"
)

var wsManager *websockets.Manager

func init() {
	config.Init()

	wsManager = websockets.NewManager()
	go wsManager.Run()
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8000"
	}

	fmt.Printf("\033[1;36m%s\033[0m \033[1;32m%s%s\033[0m\n", "Server running on:", "http://localhost:", port)

	r := router.SetupRouter(wsManager)
	defer config.DB.Close()

	r.Run(":" + port)
}
