package handlers

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"tritan.dev/image-uploader/constants"
	"tritan.dev/image-uploader/database"
	"tritan.dev/image-uploader/functions"
)

func DeleteUpload(c *fiber.Ctx) error {
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

	id := c.Params("id")
	if id == "" {
		return errorResponse(c, constants.StatusBadRequest, constants.MessageMissingUploadID)
	}

	logEntry, err := database.GetUploadBySlug(id)
	if err != nil || logEntry == (database.UploadEntry{}) {
		return errorResponse(c, constants.StatusNotFound, constants.MessageUploadNotFound)
	}

	if logEntry.Key != key {
		log.Printf("Key: %s, logEntry.Key: %s\n", key, logEntry.Key)
		return errorResponse(c, fiber.StatusForbidden, constants.MessageUploadUnauthorized)
	}

	logEntry, err = database.DeleteUploadFromDB(key, id)
	if err != nil {
		log.Printf("Error deleting upload from DB: %v\n", err)
		return errorResponse(c, constants.StatusInternalServerError, constants.MessageUploadError)
	}

	fullKey := logEntry.FileName

	err = functions.DeleteFileFromS3(fullKey)
	if err != nil {
		log.Println("Failed to delete object from S3:", err)
		return errorResponse(c, constants.StatusInternalServerError, constants.MessageUploadError)
	}

	return c.JSON(fiber.Map{
		"status":  constants.StatusOK,
		"message": "Upload deleted successfully",
	})
}

func DeleteURL(c *fiber.Ctx) error {
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

	slug := c.Params("slug")
	if slug == "" {
		return errorResponse(c, constants.StatusBadRequest, constants.MessageMissingURLSlug)
	}

	urlData, err := functions.GetURLBySlug(slug)
	if err != nil || urlData == nil {
		return errorResponse(c, constants.StatusNotFound, constants.MessageMissingURL)
	}

	if urlData.Key != key {
		return errorResponse(c, constants.StatusForbidden, constants.MessageSlugUnauthorized)
	}

	url, err := database.DeleteURLFromDB(key, slug)
	if err != nil {
		log.Printf("Error deleting URL from DB: %v\n", err)
		return errorResponse(c, constants.StatusInternalServerError, constants.MessageSlugFailed)
	}

	return c.JSON(fiber.Map{
		"status":  constants.StatusOK,
		"message": "URL deleted successfully",
		"url":     url.URL,
	})
}
