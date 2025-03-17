package controller

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

const (
	MaxUploadSize = 2 * 1024 * 1024
	UploadPath    = "./uploads/images"
)

// UploadImageHandler handles image uploads for auction items
func UploadImageHandler(c *gin.Context) {
	if err := os.MkdirAll(UploadPath, os.ModePerm); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create upload directory"})
		return
	}

	file, header, err := c.Request.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file uploaded"})
		return
	}
	defer file.Close()

	if header.Size > MaxUploadSize {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("File size exceeds maximum limit of %d MB", MaxUploadSize/(1024*1024))})
		return
	}

	contentType := header.Header.Get("Content-Type")
	if !strings.HasPrefix(contentType, "image/") {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Only image files are allowed"})
		return
	}

	filename := uuid.New().String() + filepath.Ext(header.Filename)
	filePath := filepath.Join(UploadPath, filename)

	dst, err := os.Create(filePath)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create file"})
		return
	}
	defer dst.Close()

	if _, err = io.Copy(dst, file); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"filename": filename,
		"path":     "/uploads/images/" + filename,
	})
}
