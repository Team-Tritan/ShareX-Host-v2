package handlers

import (
	"github.com/gofiber/fiber/v2"
	"tritan.dev/image-uploader/database"
)

func GetUploadsByToken(c *fiber.Ctx) error {
	key := c.Get("key")
	validUsers, err := database.LoadUsersFromDB()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"status":  500,
			"message": "Failed to load users",
			"error":   err.Error(),
		})
	}

	var displayName string
	for _, user := range validUsers {
		if user.Key == key {
			displayName = user.DisplayName
			break
		}
	}

	if displayName == "" {
		return c.Status(401).JSON(fiber.Map{
			"status":  401,
			"message": "Invalid key",
		})
	}

	matchingLogs, err := database.LoadUploadsFromDB(key)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"status":  500,
			"message": "Error fetching uploads.",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"uploads": matchingLogs,
	})
}

func GetImageBySlug(c *fiber.Ctx) error {
	slug := c.Params("slug")
	upload, err := database.GetUploadBySlug(slug)

	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"status":  500,
			"message": "Error fetching upload.",
			"error":   err.Error(),
		})
	}

	return c.JSON(upload)
}
