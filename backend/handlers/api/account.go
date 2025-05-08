package handlers

import (
	"log"
	"time"

	"github.com/gofiber/fiber/v2"
	"tritan.dev/image-uploader/constants"
	"tritan.dev/image-uploader/database"
	"tritan.dev/image-uploader/functions"
)

func errorResponse(c *fiber.Ctx, status int, message string) error {
	return c.Status(status).JSON(fiber.Map{
		"status":  status,
		"message": message,
	})
}

func GetAccountDataByKey(c *fiber.Ctx) error {
	apiKey := c.Get("key")
	if apiKey == "" {
		return errorResponse(c, constants.StatusUnauthorized, constants.MessageAPIKeyRequired)
	}

	user, err := database.GetUserByKey(apiKey)
	if err != nil {
		return errorResponse(c, constants.StatusNotFound, constants.MessageUserNotFound)
	}

	user.IP = "[Redacted]"

	return c.JSON(user)
}

func changeDisplayName(c *fiber.Ctx, apiKey string) error {
	if apiKey == "" {
		return errorResponse(c, constants.StatusUnauthorized, constants.MessageAPIKeyRequired)
	}

	var updateData struct {
		DisplayName string `json:"display_name"`
	}

	if err := c.BodyParser(&updateData); err != nil {
		return errorResponse(c, constants.StatusBadRequest, constants.MessageInvalidPayload)
	}

	err := database.UpdateUserDisplayName(apiKey, updateData.DisplayName)
	if err != nil {
		return errorResponse(c, constants.StatusInternalServerError, constants.MessageFailedUpdateName)
	}

	return c.SendStatus(constants.StatusNoContent)
}

func deleteAccountByKey(c *fiber.Ctx, apiKey string) error {
	if apiKey == "" {
		return errorResponse(c, constants.StatusUnauthorized, constants.MessageAPIKeyRequired)
	}

	uploads, err := database.LoadUploadsFromDB(apiKey)
	if err != nil {
		return errorResponse(c, constants.StatusInternalServerError, constants.MessageFailedFetchUploads)
	}

	for _, upload := range uploads {
		if err := functions.DeleteFileFromS3(upload.FileName); err != nil {
			log.Printf("Error deleting file from S3: %v", err)
			return errorResponse(c, constants.StatusInternalServerError, constants.MessageFailedDelete)
		}
	}

	err = database.DeleteUserByKey(apiKey)
	if err != nil {
		return errorResponse(c, constants.StatusInternalServerError, constants.MessageFailedDelete)
	}

	return c.SendStatus(constants.StatusNoContent)
}

func PostNewAccount(c *fiber.Ctx) error {
	ip := c.Get("x-forwarded-for")
	if ip == "" {
		ip = c.IP()
	}

	var userRequest struct {
		DisplayName string `json:"display_name"`
	}

	if err := c.BodyParser(&userRequest); err != nil {
		return c.Status(constants.StatusBadRequest).JSON(fiber.Map{
			"status":  constants.StatusBadRequest,
			"message": "Invalid request body",
		})
	}

	newUser := database.User{
		Key:         functions.GenerateRandomKey(20),
		DisplayName: userRequest.DisplayName,
		CreatedAt:   time.Now().Format(time.RFC3339),
		IP:          ip,
		Domain:      "i.tritan.gg",
	}

	if err := database.SaveUserToDB(newUser); err != nil {
		log.Printf("Failed to save user: %v\n", err)
		return c.Status(constants.StatusInternalServerError).JSON(fiber.Map{
			"status":  constants.StatusInternalServerError,
			"message": constants.MessageFailedCreateUser,
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"status":  constants.StatusOK,
		"message": constants.MessageUserCreated,
		"key":     newUser.Key,
	})
}

func regenerateToken(c *fiber.Ctx, apiKey string) error {
	newKey := functions.GenerateRandomKey(20)
	err := database.UpdateUserKey(apiKey, newKey)
	if err != nil {
		return errorResponse(c, constants.StatusInternalServerError, constants.MessageFailedRegenToken)
	}

	return c.JSON(fiber.Map{
		"status": constants.StatusOK,
		"key":    newKey,
	})
}

func updateDomain(c *fiber.Ctx, apiKey string, domain string) error {
	err := database.UpdateUserDomain(apiKey, domain)
	if err != nil {
		return errorResponse(c, constants.StatusInternalServerError, constants.MessageFailedUpdateDomain)
	}

	return c.SendStatus(constants.StatusNoContent)
}

func PutAccountDetailsByKey(c *fiber.Ctx) error {
	apiKey := c.Get("key")
	queryType := c.Params("type")
	value := c.Query("value")

	if apiKey == "" {
		return errorResponse(c, constants.StatusUnauthorized, constants.MessageAPIKeyRequired)
	}

	switch queryType {
	case "token":
		return regenerateToken(c, apiKey)
	case "domain":
		return updateDomain(c, apiKey, value)
	case "name":
		return changeDisplayName(c, apiKey)
	case "delete":
		return deleteAccountByKey(c, apiKey)
	default:
		return errorResponse(c, constants.StatusBadRequest, constants.MessageInvalidRequestType)
	}
}
