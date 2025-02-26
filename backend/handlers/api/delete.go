package handlers

import (
	"log"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/gofiber/fiber/v2"
	"tritan.dev/image-uploader/config"
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

	sess, err := session.NewSession(&aws.Config{
		Credentials:      credentials.NewStaticCredentials(config.AppConfigInstance.S3_KeyID, config.AppConfigInstance.S3_AppKey, ""),
		Endpoint:         aws.String("http://" + config.AppConfigInstance.S3_RegionURL),
		Region:           aws.String(config.AppConfigInstance.S3_RegionName),
		S3ForcePathStyle: aws.Bool(true),
	})

	if err != nil {
		log.Println("Failed to create AWS session:", err)
		return errorResponse(c, constants.StatusInternalServerError, constants.MessageUploadError)
	}

	svc := s3.New(sess)
	_, err = svc.DeleteObject(&s3.DeleteObjectInput{
		Bucket: aws.String(config.AppConfigInstance.S3_BucketName),
		Key:    aws.String(fullKey),
	})

	if err != nil {
		log.Println("Failed to delete object from S3:", err)
		return errorResponse(c, constants.StatusInternalServerError, constants.MessageUploadError)
	}

	err = svc.WaitUntilObjectNotExists(&s3.HeadObjectInput{
		Bucket: aws.String(config.AppConfigInstance.S3_BucketName),
		Key:    aws.String(fullKey),
	})

	if err != nil {
		log.Println("Failed to wait for object deletion:", err)
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
