package handlers

import (
	"fmt"
	"log"
	"path"
	"time"

	"github.com/gofiber/fiber/v2"
	"tritan.dev/image-uploader/constants"
	"tritan.dev/image-uploader/database"
	"tritan.dev/image-uploader/functions"
)

func PostUpload(c *fiber.Ctx) error {
	apiKey := c.Get("key")
	if apiKey == "" {
		return errorResponse(c, constants.StatusUnauthorized, constants.MessageAPIKeyRequired)
	}

	user, err := database.GetUserByKey(apiKey)
	if err != nil {
		return errorResponse(c, constants.StatusUnauthorized, constants.MessageInvalidKey)
	}

	sharex, err := c.FormFile("sharex")
	if err != nil {
		return errorResponse(c, constants.StatusBadRequest, constants.MessageNoFileUploaded)
	}

	ext := path.Ext(sharex.Filename)
	name := functions.GenerateRandomKey(10)

	ip := c.Get("x-forwarded-for")
	if ip == "" {
		ip = c.IP()
	}

	s3FileName := name + ext

	file, err := sharex.Open()
	if err != nil {
		log.Printf("Error opening file: %v\n", err)
		return errorResponse(c, constants.StatusInternalServerError, constants.MessageUploadFailed)
	}
	defer file.Close()

	fileSize := sharex.Size
	err = functions.UploadFileToS3(file, s3FileName)
	if err != nil {
		return errorResponse(c, constants.StatusInternalServerError, constants.MessageFailedToUploadToS3)
	}

	if !functions.VerifyUploadToS3(s3FileName) {
		log.Printf("Error verifying upload to S3: %v\n", err)
		return errorResponse(c, constants.StatusInternalServerError, constants.MessageVerifyFailed)
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

	fullURL := fmt.Sprintf("https://%s/i/%s", user.Domain, name)
	log.Printf("File uploaded successfully: %s\n", fullURL)

	return c.JSON(fiber.Map{
		"status":  constants.StatusOK,
		"message": constants.MessageFileUploaded,
		"url":     fullURL,
	})
}
