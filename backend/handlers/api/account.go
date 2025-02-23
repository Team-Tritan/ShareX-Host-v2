package handlers

import (
	"log"
	"time"

	"github.com/gofiber/fiber/v2"
	"tritan.dev/image-uploader/database"
	"tritan.dev/image-uploader/functions"
)

func GetAccountDataByKey(c *fiber.Ctx) error {
	apiKey := c.Get("key")
	if apiKey == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"status":  fiber.StatusUnauthorized,
			"message": "API key is required",
		})
	}

	user, err := database.GetUserByKey(apiKey)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"status":  fiber.StatusNotFound,
			"message": "User not found",
		})
	}

	return c.JSON(user)
}

func PutAccountDisplayNameByKey(c *fiber.Ctx) error {
	apiKey := c.Get("key")
	if apiKey == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"status":  fiber.StatusUnauthorized,
			"message": "API key is required",
		})
	}

	var updateData struct {
		DisplayName string `json:"display_name"`
	}

	if err := c.BodyParser(&updateData); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"status":  fiber.StatusBadRequest,
			"message": "Invalid request payload",
		})
	}

	err := database.UpdateUserDisplayName(apiKey, updateData.DisplayName)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  fiber.StatusInternalServerError,
			"message": "Failed to update display name",
		})
	}

	return c.SendStatus(fiber.StatusNoContent)
}

func DeleteAccountByKey(c *fiber.Ctx) error {
	apiKey := c.Get("key")
	if apiKey == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"status":  fiber.StatusUnauthorized,
			"message": "API key is required",
		})
	}

	err := database.DeleteUserByKey(apiKey)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  fiber.StatusInternalServerError,
			"message": "Failed to delete account",
		})
	}

	return c.SendStatus(fiber.StatusNoContent)
}

func CreateAccount(c *fiber.Ctx) error {
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

func RegenerateToken(c *fiber.Ctx) error {
	apiKey := c.Get("key")
	if apiKey == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"status":  fiber.StatusUnauthorized,
			"message": "API key is required",
		})
	}

	newKey := functions.GenerateRandomKey(10)
	err := database.UpdateUserKey(apiKey, newKey)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"status":  fiber.StatusInternalServerError,
			"message": "Failed to regenerate token",
		})
	}

	return c.JSON(fiber.Map{
		"status": 200,
		"key":    newKey,
	})
}
