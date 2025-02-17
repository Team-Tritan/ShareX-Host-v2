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
	validUsers, err := database.LoadUsersFromDB()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"status":  500,
			"message": "Failed to load users",
			"error":   err.Error(),
		})
	}

	if !functions.IsValidKey(key, validUsers) {
		return c.Status(401).JSON(fiber.Map{
			"status":  401,
			"message": "Invalid key",
		})
	}

	id := c.Params("id")
	if id == "" {
		return c.Status(400).JSON(fiber.Map{
			"status":  400,
			"message": "Missing upload ID",
		})
	}

	logEntry, err := database.DeleteUploadFromDB(key, id)
	if err != nil {
		log.Printf("Error deleting upload from DB: %v\n", err)
		return c.Status(500).JSON(fiber.Map{
			"status":  500,
			"message": "Error deleting upload.",
			"error":   err.Error(),
		})
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
		return c.Status(500).JSON(fiber.Map{
			"status":  500,
			"message": "Error deleting upload.",
			"error":   err.Error(),
		})
	}

	svc := s3.New(sess)
	_, err = svc.DeleteObject(&s3.DeleteObjectInput{
		Bucket: aws.String(config.AppConfigInstance.S3_BucketName),
		Key:    aws.String(fullKey),
	})

	if err != nil {
		log.Println("Failed to delete object from S3:", err)
		return c.Status(500).JSON(fiber.Map{
			"status":  500,
			"message": "Error deleting upload.",
			"error":   err.Error(),
		})
	}

	err = svc.WaitUntilObjectNotExists(&s3.HeadObjectInput{
		Bucket: aws.String(config.AppConfigInstance.S3_BucketName),
		Key:    aws.String(fullKey),
	})

	if err != nil {
		log.Println("Failed to wait for object deletion:", err)
		return c.Status(500).JSON(fiber.Map{
			"status":  500,
			"message": "Error deleting upload.",
			"error":   err.Error(),
		})
	}

	return c.Status(200).JSON(fiber.Map{
		"status":  200,
		"message": "Upload deleted successfully",
	})
}

func DeleteURL(c *fiber.Ctx) error {
	key := c.Get("key")
	validUsers, err := database.LoadUsersFromDB()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{
			"status":  500,
			"message": "Failed to load users",
			"error":   err.Error(),
		})
	}

	if !functions.IsValidKey(key, validUsers) {
		return c.Status(401).JSON(fiber.Map{
			"status":  401,
			"message": "Invalid key",
		})
	}

	slug := c.Params("slug")
	if slug == "" {
		return c.Status(400).JSON(fiber.Map{
			"status":  400,
			"message": "Missing URL slug",
		})
	}

	url, err := database.DeleteURLFromDB(key, slug)
	if err != nil {
		log.Printf("Error deleting URL from DB: %v\n", err)
		return c.Status(500).JSON(fiber.Map{
			"status":  500,
			"message": "Error deleting URL.",
			"error":   err.Error(),
		})
	}

	return c.Status(200).JSON(fiber.Map{
		"status":  200,
		"message": "URL deleted successfully",
		"url":     url,
	})
}
