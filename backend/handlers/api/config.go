package handlers

import (
	"github.com/gofiber/fiber/v2"
	"tritan.dev/image-uploader/database"
	"tritan.dev/image-uploader/functions"
)

func GetShareXConfig(c *fiber.Ctx) error {
	key := c.Get("key")

	validUsers, err := database.LoadUsersFromDB()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"status":  500,
			"message": "Failed to load users",
			"error":   err.Error(),
		})
	}
	queryType := c.Query("type")
	domain := c.Query("domain")

	if !functions.IsValidKey(key, validUsers) {
		return c.Status(401).JSON(fiber.Map{
			"status":  401,
			"message": "Invalid key",
		})
	}

	if queryType == "" || !(queryType == "upload" || queryType == "url") {
		return c.Status(400).JSON(fiber.Map{
			"status":  400,
			"message": "The query type was invalid.",
		})
	}

	if queryType == "upload" {
		uploadConfig := functions.GenerateUploaderConfig(key, domain)
		functions.SendConfig(c, uploadConfig)
	}

	if queryType == "url" {
		urlConfig := functions.GenerateURLShortenerConfig(key, domain)
		functions.SendConfig(c, urlConfig)
	}

	return nil
}
