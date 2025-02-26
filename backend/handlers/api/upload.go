package handlers

import (
	"fmt"
	"log"
	"path"
	"time"

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
	MessageInvalidKey            = "Invalid key"
	MessageNoFileUploaded        = "No file uploaded"
	MessageFailedToLoadUser      = "Failed to load user"
	MessageUploadFailed          = "Failed to upload the file."
	MessageVerifyFailed          = "Failed to verify the file upload to S3."
	MessageFileUploaded          = "File uploaded successfully"
	MessageFailedToCreateSession = "Failed to create S3 session"
	MessageFailedToUploadToS3    = "Failed to upload to S3"
)

func Upload(c *fiber.Ctx) error {
	apiKey := c.Get("key")
	if apiKey == "" {
		return errorResponse(c, StatusUnauthorized, MessageAPIKeyRequired)
	}

	user, err := database.GetUserByKey(apiKey)
	if err != nil {
		return errorResponse(c, StatusUnauthorized, MessageInvalidKey)
	}

	sharex, err := c.FormFile("sharex")
	if err != nil {
		return errorResponse(c, StatusBadRequest, MessageNoFileUploaded)
	}

	ext := path.Ext(sharex.Filename)
	name := functions.GenerateRandomKey(10)

	ip := c.Get("x-forwarded-for")
	if ip == "" {
		ip = c.IP()
	}

	s3Config := &aws.Config{
		Credentials:      credentials.NewStaticCredentials(config.AppConfigInstance.S3_KeyID, config.AppConfigInstance.S3_AppKey, ""),
		Endpoint:         aws.String("http://" + config.AppConfigInstance.S3_RegionURL),
		Region:           aws.String(config.AppConfigInstance.S3_RegionName),
		S3ForcePathStyle: aws.Bool(true),
	}
	newSession, err := session.NewSession(s3Config)
	if err != nil {
		log.Printf("Error creating new session: %v\n", err)
		return errorResponse(c, StatusInternalServerError, MessageFailedToCreateSession)
	}
	s3Client := s3.New(newSession)

	file, err := sharex.Open()
	if err != nil {
		log.Printf("Error opening file: %v\n", err)
		return errorResponse(c, StatusInternalServerError, MessageUploadFailed)
	}
	defer file.Close()

	fileSize := sharex.Size
	_, err = s3Client.PutObject(&s3.PutObjectInput{
		Body:   file,
		Bucket: aws.String(config.AppConfigInstance.S3_BucketName),
		Key:    aws.String(name + ext),
		ACL:    aws.String("public-read"),
	})
	if err != nil {
		log.Printf("Error uploading to S3: %v\n", err)
		return errorResponse(c, StatusInternalServerError, MessageFailedToUploadToS3)
	}

	// Verify upload
	verified := false
	for i := 0; i < 5; i++ {
		_, err = s3Client.HeadObject(&s3.HeadObjectInput{
			Bucket: aws.String(config.AppConfigInstance.S3_BucketName),
			Key:    aws.String(name + ext),
		})
		if err == nil {
			verified = true
			break
		}
		log.Printf("Retrying to verify upload to S3: attempt %d\n", i+1)
		time.Sleep(2 * time.Second)
	}

	if !verified {
		log.Printf("Error verifying upload to S3: %v\n", err)
		return errorResponse(c, StatusInternalServerError, MessageVerifyFailed)
	}

	log.Printf("%s just uploaded %s from %s.\n", apiKey, name+ext, ip)
	logEntry := database.UploadEntry{
		IP:          ip,
		Key:         apiKey,
		DisplayName: user.DisplayName,
		FileName:    name + ext,
		Metadata: database.Metadata{
			FileType:   ext,
			FileSize:   fileSize,
			UploadDate: time.Now(),
		},
	}

	if err := database.SaveUploadToDB(logEntry); err != nil {
		log.Printf("Error saving log entry: %v\n", err)
	}

	fullURL := fmt.Sprintf("i/%s", name)
	log.Printf("File uploaded successfully: %s\n", fullURL)

	return c.JSON(fiber.Map{
		"status":  fiber.StatusOK,
		"message": MessageFileUploaded,
		"url":     fullURL,
	})
}
