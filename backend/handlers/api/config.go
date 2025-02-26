package handlers

import (
	"github.com/gofiber/fiber/v2"
	"tritan.dev/image-uploader/database"
	"tritan.dev/image-uploader/functions"
)

func GetShareXConfig(c *fiber.Ctx) error {
	key := c.Get("key")
	if key == "" {
		return errorResponse(c, StatusUnauthorized, MessageAPIKeyRequired)
	}

	validUsers, err := database.LoadUsersFromDB()
	if err != nil {
		return errorResponse(c, StatusInternalServerError, "Failed to load users")
	}
	queryType := c.Query("type")

	if !functions.IsValidKey(key, validUsers) {
		return errorResponse(c, StatusUnauthorized, MessageInvalidKey)
	}

	user, err := database.GetUserByKey(key)
	if err != nil {
		return errorResponse(c, StatusInternalServerError, "Failed to get user")
	}
	domain := user.Domain

	if queryType == "" || !(queryType == "upload" || queryType == "url" || queryType == "text") {
		return errorResponse(c, StatusBadRequest, "The query type was invalid.")
	}

	switch queryType {
	case "upload":
		uploadConfig := functions.GenerateUploaderConfig(key, domain)
		functions.SendConfig(c, uploadConfig)
	case "url":
		urlConfig := functions.GenerateURLShortenerConfig(key, domain)
		functions.SendConfig(c, urlConfig)
	case "text":
		config := functions.GenerateTextUploaderConfig()
		functions.SendConfig(c, config)
	}

	return nil
}
