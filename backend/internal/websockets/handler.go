package websockets

import (
    "log"
    "net/http"

    "github.com/gin-gonic/gin"
    "github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
    ReadBufferSize:  1024,
    WriteBufferSize: 1024,
    CheckOrigin: func(r *http.Request) bool {
        return true
    },
}

// Handler handles WebSocket connections
func Handler(manager *Manager) gin.HandlerFunc {
    return func(c *gin.Context) {
        conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
        if err != nil {
            log.Println("Error upgrading connection:", err)
            return
        }

        manager.register <- conn

        go func() {
            for {
                if _, _, err := conn.ReadMessage(); err != nil {
                    manager.unregister <- conn
                    break
                }
            }
        }()
    }
}