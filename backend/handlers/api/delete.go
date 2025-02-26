package handlers

import (
	"log"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/gofiber/fiber/v2"
	"tritan.dev/image-uploader/config"
	"tritan.dev/image-uploader/database"
	"tritan.dev/image-uploader/functions"
)

const (
	MessageUploadNotFound     = "Upload not found"
	MessageMissingUploadID    = "Missing upload ID"
	MessageUploadError        = "Error deleting upload"
	MessageUploadDeleted      = "Upload deleted successfully"
	MessageUploadUnauthorized = "Unauthorized to delete this upload"
	MessageMissingURLSlug     = "Missing URL slug"
	MessageMissingURL         = "URL not found"
)

func DeleteUpload(c *fiber.Ctx) error {
	key := c.Get("key")
	if key == "" {
		return errorResponse(c, StatusUnauthorized, MessageAPIKeyRequired)
	}

	validUsers, err := database.LoadUsersFromDB()
	if err != nil {
		return errorResponse(c, StatusInternalServerError, MessageFailedLoadUsers)
	}

	if !functions.IsValidKey(key, validUsers) {
		return errorResponse(c, StatusUnauthorized, MessageInvalidKey)
	}

	id := c.Params("id")
	if id == "" {
		return errorResponse(c, StatusBadRequest, MessageMissingUploadID)
	}

	logEntry, err := database.GetUploadBySlug(id)
	if err != nil || logEntry == (database.UploadEntry{}) {
		return errorResponse(c, StatusNotFound, MessageUploadNotFound)
	}

	if logEntry.Key != key {
		log.Printf("Key: %s, logEntry.Key: %s\n", key, logEntry.Key)
		return errorResponse(c, fiber.StatusForbidden, MessageUploadUnauthorized)
	}

	logEntry, err = database.DeleteUploadFromDB(key, id)
	if err != nil {
		log.Printf("Error deleting upload from DB: %v\n", err)
		return errorResponse(c, StatusInternalServerError, MessageUploadError)
	}

	fullKey := logEntry.FileName

	sess, err := session.NewSession(&aws.Config{
		Credentials:      credentials.NewStaticCredentials(config.AppConfigInstance.S3_KeyID, config.AppConfigInstance.S3_AppKey, ""),
		Endpoint:         aws.String("http://" + config.AppConfigInstance.S3_RegionURL),
		Region:           aws.String(config.AppConfigInstance.S3_RegionName),
		S3ForcePathStyle: aws.Bool(true),
	})

	if err != nil {
		log.Println("Failed to create AWS session:", err)
		return errorResponse(c, StatusInternalServerError, MessageUploadError)
	}

	svc := s3.New(sess)
	_, err = svc.DeleteObject(&s3.DeleteObjectInput{
		Bucket: aws.String(config.AppConfigInstance.S3_BucketName),
		Key:    aws.String(fullKey),
	})

	if err != nil {
		log.Println("Failed to delete object from S3:", err)
		return errorResponse(c, StatusInternalServerError, MessageUploadError)
	}

	err = svc.WaitUntilObjectNotExists(&s3.HeadObjectInput{
		Bucket: aws.String(config.AppConfigInstance.S3_BucketName),
		Key:    aws.String(fullKey),
	})

	if err != nil {
		log.Println("Failed to wait for object deletion:", err)
		return errorResponse(c, StatusInternalServerError, MessageUploadError)
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status":  fiber.StatusOK,
		"message": "Upload deleted successfully",
	})
}

func DeleteURL(c *fiber.Ctx) error {
	key := c.Get("key")
	if key == "" {
		return errorResponse(c, StatusUnauthorized, MessageAPIKeyRequired)
	}

	validUsers, err := database.LoadUsersFromDB()
	if err != nil {
		return errorResponse(c, StatusInternalServerError, MessageFailedLoadUsers)
	}

	if !functions.IsValidKey(key, validUsers) {
		return errorResponse(c, StatusUnauthorized, MessageInvalidKey)
	}

	slug := c.Params("slug")
	if slug == "" {
		return errorResponse(c, StatusBadRequest, MessageMissingURLSlug)
	}

	urlData, err := functions.GetURLBySlug(slug)
	if err != nil || urlData == nil {
		return errorResponse(c, StatusNotFound, MessageMissingURL)
	}

	if urlData.Key != key {
		return errorResponse(c, fiber.StatusForbidden, MessageSlugUnauthorized)
	}

	url, err := database.DeleteURLFromDB(key, slug)
	if err != nil {
		log.Printf("Error deleting URL from DB: %v\n", err)
		return errorResponse(c, StatusInternalServerError, MessageSlugFailed)
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status":  fiber.StatusOK,
		"message": "URL deleted successfully",
		"url":     url.URL,
	})
}
