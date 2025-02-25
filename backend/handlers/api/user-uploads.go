package handlers

import (
	"github.com/gofiber/fiber/v2"
	"tritan.dev/image-uploader/database"
)

func GetUploadsByToken(c *fiber.Ctx) error {
	key := c.Get("key")
	if key == "" {
		return errorResponse(c, StatusUnauthorized, MessageAPIKeyRequired)
	}

	validUsers, err := database.LoadUsersFromDB()
	if err != nil {
		return errorResponse(c, StatusInternalServerError, "Failed to load users")
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

	matchingLogs, err := database.LoadUploadsFromDB(key)
	if err != nil {
		return errorResponse(c, StatusInternalServerError, "Error fetching uploads.")
	}

	return c.JSON(fiber.Map{
		"uploads": matchingLogs,
	})
}
