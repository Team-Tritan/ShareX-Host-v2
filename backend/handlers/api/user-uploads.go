package handlers

import (
	"github.com/gofiber/fiber/v2"
	"tritan.dev/image-uploader/constants"
	"tritan.dev/image-uploader/database"
)

func GetUploadsByToken(c *fiber.Ctx) error {
	key := c.Get("key")
	if key == "" {
		return errorResponse(c, constants.StatusUnauthorized, constants.MessageAPIKeyRequired)
	}

	validUsers, err := database.LoadUsersFromDB()
	if err != nil {
		return errorResponse(c, constants.StatusInternalServerError, constants.MessageFailedLoadUsers)
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

	matchingLogs, err := database.LoadUploadsFromDB(key)
	if err != nil {
		return errorResponse(c, constants.StatusInternalServerError, constants.MessageFailedFetchUploads)
	}

	for i := range matchingLogs {
		matchingLogs[i].IP = "[Redacted]"
		matchingLogs[i].Key = "[Redacted]"
	}

	return c.JSON(fiber.Map{
		"status":  constants.StatusOK,
		"uploads": matchingLogs,
	})
}
