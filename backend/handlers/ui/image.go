package handlers

import (
	"fmt"
	"log"
	"path"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/gofiber/fiber/v2"
	"tritan.dev/image-uploader/config"
	"tritan.dev/image-uploader/constants"
	"tritan.dev/image-uploader/database"
)

func errorResponse(c *fiber.Ctx, status int, message string) error {
	return c.Status(status).JSON(fiber.Map{
		"status":  status,
		"message": message,
	})
}

func DisplayImage(c *fiber.Ctx) error {
	fileWithExtension := c.Params("file")
	fileWithoutExtension := strings.TrimSuffix(fileWithExtension, path.Ext(fileWithExtension))
	log.Printf("Requested file: %s\n", fileWithExtension)

	s3Config := &aws.Config{
		Credentials:      credentials.NewStaticCredentials(config.AppConfigInstance.S3_KeyID, config.AppConfigInstance.S3_AppKey, ""),
		Endpoint:         aws.String("http://" + config.AppConfigInstance.S3_RegionURL),
		Region:           aws.String(config.AppConfigInstance.S3_RegionName),
		S3ForcePathStyle: aws.Bool(true),
	}

	newSession, err := session.NewSession(s3Config)
	if err != nil {
		log.Printf("Error creating new session: %v\n", err)
		return errorResponse(c, constants.StatusInternalServerError, constants.MessageInternalError)
	}

	s3Client := s3.New(newSession)
	bucket := config.AppConfigInstance.S3_BucketName

	headObjectOutput, err := s3Client.HeadObject(&s3.HeadObjectInput{
		Bucket: aws.String(bucket),
		Key:    aws.String(fileWithExtension),
	})

	if err == nil {
		fullURL := fmt.Sprintf("https://%s/%s/%s", config.AppConfigInstance.S3_PubURL, bucket, fileWithExtension)
		uploadTime := headObjectOutput.LastModified.Format(time.RFC1123)

		uploadEntry, err := database.GetUploadEntryByFileName(fileWithExtension)
		if err != nil {
			log.Printf("Error fetching upload entry from DB: %v\n", err)
			return errorResponse(c, constants.StatusInternalServerError, constants.MessageInternalError)
		}

		database.IncrementViewCount(uploadEntry.FileName)

		fileSizeMB := float64(uploadEntry.Metadata.FileSize) / (1024 * 1024)

		log.Printf("Image found: %s\n", fullURL)
		data := map[string]interface{}{
			"Data": map[string]string{
				"fullURL":     fullURL,
				"Name":        fileWithExtension,
				"UploadTime":  uploadTime,
				"DisplayName": uploadEntry.DisplayName,
				"Views":       fmt.Sprintf("%d", uploadEntry.Metadata.Views),
				"FileSizeMB":  fmt.Sprintf("%.2f MB", fileSizeMB),
			},
		}
		return c.Render("./pages/image.html", data)
	}

	resp, err := s3Client.ListObjectsV2(&s3.ListObjectsV2Input{
		Bucket: aws.String(bucket),
		Prefix: aws.String(fileWithoutExtension),
	})
	if err != nil {
		log.Printf("Error listing objects in S3: %v\n", err)
		return errorResponse(c, constants.StatusInternalServerError, constants.MessageInternalError)
	}

	for _, obj := range resp.Contents {
		objKeyWithoutExt := strings.TrimSuffix(path.Base(*obj.Key), path.Ext(path.Base(*obj.Key)))
		if objKeyWithoutExt == fileWithoutExtension {
			fullURL := fmt.Sprintf("https://%s/%s/%s", config.AppConfigInstance.S3_PubURL, bucket, *obj.Key)
			uploadTime := obj.LastModified.Format(time.RFC1123)

			uploadEntry, err := database.GetUploadEntryByFileName(*obj.Key)
			if err != nil {
				log.Printf("Error fetching upload entry from DB: %v\n", err)
				return errorResponse(c, constants.StatusInternalServerError, constants.MessageInternalError)
			}

			database.IncrementViewCount(uploadEntry.FileName)
			fileSizeMB := float64(uploadEntry.Metadata.FileSize) / (1024 * 1024)

			log.Printf("Image found: %s\n", fullURL)
			data := map[string]interface{}{
				"Data": map[string]string{
					"fullURL":     fullURL,
					"Name":        *obj.Key,
					"UploadTime":  uploadTime,
					"DisplayName": uploadEntry.DisplayName,
					"FileSizeMB":  fmt.Sprintf("%.2f MB", fileSizeMB),
					"Views":       fmt.Sprintf("%d", uploadEntry.Metadata.Views),
				},
			}
			return c.Render("./pages/image.html", data)
		}
	}

	log.Printf("Image not found: %s\n", fileWithExtension)
	return errorResponse(c, constants.StatusNotFound, "Content not found")
}
