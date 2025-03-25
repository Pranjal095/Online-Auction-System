package websockets

import (
    "encoding/json"
    "log"
    "sync"

    "github.com/gorilla/websocket"
)

const (
    EventNewBid     = "new_bid"
    EventNewAuction = "new_auction"
)

type Manager struct {
    clients    map[*websocket.Conn]bool
    register   chan *websocket.Conn
    unregister chan *websocket.Conn
    broadcast  chan []byte
    mu         sync.Mutex
}

// NewManager creates a new WebSocket manager
func NewManager() *Manager {
    return &Manager{
        clients:    make(map[*websocket.Conn]bool),
        register:   make(chan *websocket.Conn),
        unregister: make(chan *websocket.Conn),
        broadcast:  make(chan []byte),
    }
}

// Run starts the manager's main loop
func (m *Manager) Run() {
    for {
        select {
        case conn := <-m.register:
            m.mu.Lock()
            m.clients[conn] = true
            m.mu.Unlock()
            log.Println("New websocket connection registered")

        case conn := <-m.unregister:
            m.mu.Lock()
            if _, ok := m.clients[conn]; ok {
                delete(m.clients, conn)
                conn.Close()
            }
            m.mu.Unlock()
            log.Println("Websocket connection unregistered")

        case message := <-m.broadcast:
            m.mu.Lock()
            for conn := range m.clients {
                if err := conn.WriteMessage(websocket.TextMessage, message); err != nil {
                    conn.Close()
                    delete(m.clients, conn)
                }
            }
            m.mu.Unlock()
        }
    }
}

// BroadcastNewBid broadcasts a new bid to all connected clients
func (m *Manager) BroadcastNewBid(auctionID int, bidDetails interface{}) {
    data := map[string]interface{}{
        "type": EventNewBid,
        "data": bidDetails,
    }
    
    jsonData, err := json.Marshal(data)
    if err != nil {
        log.Printf("Error marshalling bid event: %v", err)
        return
    }
    
    m.broadcast <- jsonData
    log.Printf("Broadcasting new bid for auction #%d", auctionID)
}

// BroadcastNewAuction broadcasts a new auction to all connected clients
func (m *Manager) BroadcastNewAuction(auctionDetails interface{}) {
    data := map[string]interface{}{
        "type": EventNewAuction,
        "data": auctionDetails,
    }
    
    jsonData, err := json.Marshal(data)
    if err != nil {
        log.Printf("Error marshalling auction event: %v", err)
        return
    }
    
    m.broadcast <- jsonData
    log.Println("Broadcasting new auction")
}