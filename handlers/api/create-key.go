package handlers

import (
	"log"
	"time"

	"github.com/gofiber/fiber/v2"

	"tritan.dev/image-uploader/functions"
)

func CreateKey(c *fiber.Ctx) error {
	ip := c.Get("x-forwarded-for")
	if ip == "" {
		ip = c.IP()
	}

	allKeys := functions.LoadKeysFromFile("keys.json")

	newKey := struct {
		Key       string `json:"key"`
		CreatedAt string `json:"created_at"`
		IP        string `json:"ip"`
	}{
		Key:       functions.GenerateRandomKey(10),
		CreatedAt: time.Now().Format(time.RFC3339),
		IP:        ip,
	}

	allKeys.AddKey(newKey)

	if err := allKeys.SaveKeysToFile("keys.json"); err != nil {
		log.Printf("Failed to save keys: %v\n", err)
		return c.Status(500).JSON(fiber.Map{
			"status":  500,
			"message": "Failed to create key.",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"status":  200,
		"message": "Key created successfully.",
		"key":     newKey.Key,
	})
}
