package handlers

import (
	"fmt"
	"log"
	"math/rand"
	"path"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/gofiber/fiber/v2"

	"tritan.dev/image-uploader/config"
	keys "tritan.dev/image-uploader/functions"
	logs "tritan.dev/image-uploader/functions"
)

type Key struct {
	Key string `json:"key"`
}

func Upload(c *fiber.Ctx) error {
	key := c.Get("key")
	validKeys := keys.LoadKeysFromFile("./data/keys.json")

	if !isValidKey(key, validKeys) {
		return c.Status(401).JSON(fiber.Map{
			"status":  401,
			"message": "Invalid key",
		})
	}

	sharex, err := c.FormFile("sharex")
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"status":  400,
			"message": "No file uploaded, are you fucking stupid?",
		})
	}

	ext := path.Ext(sharex.Filename)
	name := keys.GenerateRandomKey(10)

	dir := config.AppConfigInstance.Dirs[rand.Intn(len(config.AppConfigInstance.Dirs))]
	ip := c.Get("x-forwarded-for")
	if ip == "" {
		ip = c.IP()
	}

	s3Config := &aws.Config{
		Credentials:      credentials.NewStaticCredentials(config.AppConfigInstance.S3_KeyID, config.AppConfigInstance.S3_AppKey, ""),
		Endpoint:         aws.String(config.AppConfigInstance.S3_RegionURL),
		Region:           aws.String(config.AppConfigInstance.S3_RegionName),
		S3ForcePathStyle: aws.Bool(true),
	}
	newSession := session.New(s3Config)

	s3Client := s3.New(newSession)

	file, err := sharex.Open()
	if err != nil {
		log.Printf("Error opening file: %v\n", err)
		return c.Status(500).JSON(fiber.Map{
			"status":  500,
			"message": "Failed to upload the file.",
			"error":   err.Error(),
		})
	}
	defer file.Close()

	_, err = s3Client.PutObject(&s3.PutObjectInput{
		Body:   file,
		Bucket: aws.String(config.AppConfigInstance.S3_BucketName),
		Key:    aws.String(name + ext),
		ACL:    aws.String("public-read"),
	})
	if err != nil {
		log.Printf("Error uploading to Backblaze B2: %v\n", err)
		return c.Status(500).JSON(fiber.Map{
			"status":  500,
			"message": "Failed to upload the file to Backblaze B2.",
			"error":   err.Error(),
		})
	}

	log.Printf("%s just uploaded %s from %s.\n", key, name+ext, ip)

	logEntry := logs.LogEntry{
		IP:        ip,
		Key:       key,
		FileName:  name + ext,
		Timestamp: time.Now(),
	}

	existingLogs := logs.LoadLogsFromFile("./data/logs.json")
	existingLogs = append(existingLogs, logEntry)

	if err := logs.SaveLogsToFile("./data/logs.json", existingLogs); err != nil {
		log.Printf("Error saving log entry: %v\n", err)
	}

	return c.JSON(fiber.Map{
		"status":  200,
		"message": "File just got uploaded!",
		"url":     fmt.Sprintf("/%s/%s", dir, name),
	})
}
