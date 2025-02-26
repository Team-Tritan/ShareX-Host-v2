package handlers

import (
	"github.com/gofiber/fiber/v2"
	"tritan.dev/image-uploader/constants"
	"tritan.dev/image-uploader/database"
	"tritan.dev/image-uploader/functions"
)

func GetURLsByToken(c *fiber.Ctx) error {
	key := c.Get("key")
	if key == "" {
		return errorResponse(c, constants.StatusUnauthorized, constants.MessageAPIKeyRequired)
	}

	validUsers, err := database.LoadUsersFromDB()
	if err != nil {
		return errorResponse(c, constants.StatusInternalServerError, constants.MessageFailedLoadUsers)
	}

	if !functions.IsValidKey(key, validUsers) {
		return errorResponse(c, constants.StatusUnauthorized, constants.MessageInvalidKey)
	}

	var displayName string
	for _, user := range validUsers {
		if user.Key == key {
			displayName = user.DisplayName
			break
		}
	}

	if displayName == "" {
		return errorResponse(c, constants.StatusUnauthorized, constants.MessageInvalidKey)
	}

	urls, err := database.LoadURLsFromDBByKey(key)
	if err != nil {
		return errorResponse(c, constants.StatusInternalServerError, constants.MessageFailedLoadURLs)
	}

	for i := range urls {
		urls[i].IP = "[Redacted]"
		urls[i].Key = "[Redacted]"
	}

	return c.JSON(fiber.Map{
		"status": constants.StatusOK,
		"urls":   urls,
	})
}
