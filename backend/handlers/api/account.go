package handlers

import (
	"log"
	"time"

	"github.com/gofiber/fiber/v2"
	"tritan.dev/image-uploader/database"
	"tritan.dev/image-uploader/functions"
)

const (
	StatusUnauthorized        = fiber.StatusUnauthorized
	StatusBadRequest          = fiber.StatusBadRequest
	StatusInternalServerError = fiber.StatusInternalServerError
	StatusNotFound            = fiber.StatusNotFound
	StatusNoContent           = fiber.StatusNoContent

	MessageAPIKeyRequired     = "API key is required"
	MessageInvalidPayload     = "Invalid request payload"
	MessageFailedUpdateName   = "Failed to update display name"
	MessageFailedDelete       = "Failed to delete account"
	MessageFailedCreateUser   = "Failed to create user"
	MessageFailedRegenToken   = "Failed to regenerate token"
	MessageFailedUpdateDomain = "Failed to update domain"
	MessageInvalidRequestType = "Invalid request type"
	MessageUserNotFound       = "User not found"
	MessageUserCreated        = "User created successfully"
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
		return errorResponse(c, StatusUnauthorized, MessageAPIKeyRequired)
	}

	user, err := database.GetUserByKey(apiKey)
	if err != nil {
		return errorResponse(c, StatusNotFound, MessageUserNotFound)
	}

	return c.JSON(user)
}

func changeDisplayName(c *fiber.Ctx, apiKey string) error {
	if apiKey == "" {
		return errorResponse(c, StatusUnauthorized, MessageAPIKeyRequired)
	}

	var updateData struct {
		DisplayName string `json:"display_name"`
	}

	if err := c.BodyParser(&updateData); err != nil {
		return errorResponse(c, StatusBadRequest, MessageInvalidPayload)
	}

	err := database.UpdateUserDisplayName(apiKey, updateData.DisplayName)
	if err != nil {
		return errorResponse(c, StatusInternalServerError, MessageFailedUpdateName)
	}

	return c.SendStatus(StatusNoContent)
}

func deleteAccountByKey(c *fiber.Ctx, apiKey string) error {
	if apiKey == "" {
		return errorResponse(c, StatusUnauthorized, MessageAPIKeyRequired)
	}

	err := database.DeleteUserByKey(apiKey)
	if err != nil {
		return errorResponse(c, StatusInternalServerError, MessageFailedDelete)
	}

	return c.SendStatus(StatusNoContent)
}

func CreateAccount(c *fiber.Ctx) error {
	ip := c.Get("x-forwarded-for")
	if ip == "" {
		ip = c.IP()
	}

	var userRequest struct {
		DisplayName string `json:"display_name"`
	}

	if err := c.BodyParser(&userRequest); err != nil {
		return c.Status(StatusBadRequest).JSON(fiber.Map{
			"status":  StatusBadRequest,
			"message": "Invalid request body",
		})
	}

	newUser := database.User{
		Key:         functions.GenerateRandomKey(20),
		DisplayName: userRequest.DisplayName,
		CreatedAt:   time.Now().Format(time.RFC3339),
		IP:          ip,
		Domain:      "https://footjobs.today",
	}

	if err := database.SaveUserToDB(newUser); err != nil {
		log.Printf("Failed to save user: %v\n", err)
		return c.Status(StatusInternalServerError).JSON(fiber.Map{
			"status":  StatusInternalServerError,
			"message": MessageFailedCreateUser,
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"status":  200,
		"message": MessageUserCreated,
		"key":     newUser.Key,
	})
}

func regenerateToken(c *fiber.Ctx, apiKey string) error {
	newKey := functions.GenerateRandomKey(20)
	err := database.UpdateUserKey(apiKey, newKey)
	if err != nil {
		return errorResponse(c, StatusInternalServerError, MessageFailedRegenToken)
	}

	return c.JSON(fiber.Map{
		"status": 200,
		"key":    newKey,
	})
}

func updateDomain(c *fiber.Ctx, apiKey string, domain string) error {
	err := database.UpdateUserDomain(apiKey, domain)
	if err != nil {
		return errorResponse(c, StatusInternalServerError, MessageFailedUpdateDomain)
	}

	return c.SendStatus(StatusNoContent)
}

func UpdateAccountDetails(c *fiber.Ctx) error {
	apiKey := c.Get("key")
	queryType := c.Params("type")
	value := c.Query("value")

	if apiKey == "" {
		return errorResponse(c, StatusUnauthorized, MessageAPIKeyRequired)
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
		return errorResponse(c, StatusBadRequest, MessageInvalidRequestType)
	}
}
