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

func DeleteUpload(c *fiber.Ctx) error {
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

	id := c.Params("id")
	if id == "" {
		return errorResponse(c, StatusBadRequest, "Missing upload ID")
	}

	logEntry, err := database.GetUploadBySlug(id)
	if err != nil || logEntry == (database.UploadEntry{}) {
		return errorResponse(c, StatusNotFound, "Upload not found")
	}

	if logEntry.Key != key {
		log.Printf("Key: %s, logEntry.Key: %s\n", key, logEntry.Key)
		return errorResponse(c, fiber.StatusForbidden, "Unauthorized to delete this upload")
	}

	logEntry, err = database.DeleteUploadFromDB(key, id)
	if err != nil {
		log.Printf("Error deleting upload from DB: %v\n", err)
		return errorResponse(c, StatusInternalServerError, "Error deleting upload.")
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
		return errorResponse(c, StatusInternalServerError, "Error deleting upload.")
	}

	svc := s3.New(sess)
	_, err = svc.DeleteObject(&s3.DeleteObjectInput{
		Bucket: aws.String(config.AppConfigInstance.S3_BucketName),
		Key:    aws.String(fullKey),
	})

	if err != nil {
		log.Println("Failed to delete object from S3:", err)
		return errorResponse(c, StatusInternalServerError, "Error deleting upload.")
	}

	err = svc.WaitUntilObjectNotExists(&s3.HeadObjectInput{
		Bucket: aws.String(config.AppConfigInstance.S3_BucketName),
		Key:    aws.String(fullKey),
	})

	if err != nil {
		log.Println("Failed to wait for object deletion:", err)
		return errorResponse(c, StatusInternalServerError, "Error deleting upload.")
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
		return errorResponse(c, StatusInternalServerError, "Failed to load users")
	}

	if !functions.IsValidKey(key, validUsers) {
		return errorResponse(c, StatusUnauthorized, "Invalid key")
	}

	slug := c.Params("slug")
	if slug == "" {
		return errorResponse(c, StatusBadRequest, "Missing URL slug")
	}

	urlData, err := functions.GetURLBySlug(slug)
	if err != nil || urlData == nil {
		return errorResponse(c, StatusNotFound, "URL not found")
	}

	if urlData.Key != key {
		return errorResponse(c, fiber.StatusForbidden, "Unauthorized to delete this URL")
	}

	url, err := database.DeleteURLFromDB(key, slug)
	if err != nil {
		log.Printf("Error deleting URL from DB: %v\n", err)
		return errorResponse(c, StatusInternalServerError, "Error deleting URL.")
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"status":  fiber.StatusOK,
		"message": "URL deleted successfully",
		"url":     url.URL,
	})
}
