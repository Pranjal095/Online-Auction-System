package cronjob

import (
    "bytes"
    "encoding/json"
    "log"
    "net/http"
    "time"
)

// StartAuctionEndCron starts a background job that periodically checks for ended auctions
func StartAuctionEndCron() {
    ticker := time.NewTicker(1 * time.Minute)
    
    go func() {
        for {
            select {
            case <-ticker.C:
                resp, err := http.Post("http://localhost:8000/api/cronjob", 
                    "application/json", bytes.NewBuffer([]byte{}))
                
                if err != nil {
                    log.Printf("Error calling auction end handler: %v", err)
                    continue
                }
                
                var result map[string]interface{}
                json.NewDecoder(resp.Body).Decode(&result)
                resp.Body.Close()
            }
        }
    }()
}