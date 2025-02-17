package handlers

import (
	"log"
	"time"

	"github.com/gofiber/fiber/v2"
	"tritan.dev/image-uploader/database"
	"tritan.dev/image-uploader/functions"
)

func CreateKey(c *fiber.Ctx) error {
	ip := c.Get("x-forwarded-for")
	if ip == "" {
		ip = c.IP()
	}

	var userRequest struct {
		DisplayName string `json:"display_name"`
	}

	if err := c.BodyParser(&userRequest); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"status":  400,
			"message": "Invalid request body",
		})
	}

	newUser := database.User{
		Key:         functions.GenerateRandomKey(10),
		DisplayName: userRequest.DisplayName,
		CreatedAt:   time.Now().Format(time.RFC3339),
		IP:          ip,
	}

	if err := database.SaveUserToDB(newUser); err != nil {
		log.Printf("Failed to save user: %v\n", err)
		return c.Status(500).JSON(fiber.Map{
			"status":  500,
			"message": "Failed to create user.",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"status":  200,
		"message": "User created successfully.",
		"key":     newUser.Key,
	})
}
