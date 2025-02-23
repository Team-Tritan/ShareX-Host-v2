package handlers

import (
	"github.com/gofiber/fiber/v2"
	"tritan.dev/image-uploader/database"
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
