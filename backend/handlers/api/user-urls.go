package handlers

import (
	"github.com/gofiber/fiber/v2"
	"tritan.dev/image-uploader/database"
	"tritan.dev/image-uploader/functions"
)

func GetURLsByToken(c *fiber.Ctx) error {
	key := c.Get("key")
	if key == "" {
		return errorResponse(c, StatusUnauthorized, MessageAPIKeyRequired)
	}

	validUsers, err := database.LoadUsersFromDB()
	if err != nil {
		return errorResponse(c, StatusInternalServerError, "Failed to load users")
	}

	if !functions.IsValidKey(key, validUsers) {
		return errorResponse(c, StatusUnauthorized, "Invalid key")
	}

	var displayName string
	for _, user := range validUsers {
		if user.Key == key {
			displayName = user.DisplayName
			break
		}
	}

	if displayName == "" {
		return errorResponse(c, StatusUnauthorized, "Invalid key")
	}

	urls, err := database.LoadURLsFromDBByKey(key)
	if err != nil {
		return errorResponse(c, StatusInternalServerError, "Failed to load URLs")
	}

	for i := range urls {
		urls[i].IP = "[Redacted]"
		urls[i].Key = "[Redacted]"
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status": fiber.StatusOK,
		"urls":   urls,
	})
}
