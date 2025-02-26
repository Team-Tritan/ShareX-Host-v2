package handlers

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"tritan.dev/image-uploader/database"
	"tritan.dev/image-uploader/functions"
)

const (
	MessageInvalidRequestBody = "Invalid request body"
	MessageFailedLoadUsers    = "Failed to load users"
	MessageFailedSaveURL      = "Failed to save the URL data"
	MessageFailedToLoadURL    = "Failed to load URL data"
	MessageFailedLoadURLs     = "Failed to load URLs"
	MessageFailedUpdateSlug   = "Failed to update the slug"
	MessageURLRequired        = "URL is required"
	MessageNewSlugRequired    = "New slug is required"
	MessageSlugNotFound       = "Slug not found"
	MessageSlugExists         = "Slug already exists, choose another one"
	MessageSlugFailed         = "Failed to update the slug"
	MessageSlugUnauthorized   = "Unauthorized to change this slug"
)

func CreateURL(c *fiber.Ctx) error {
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

	var urlRequest database.URL
	if err := c.BodyParser(&urlRequest); err != nil {
		return errorResponse(c, StatusBadRequest, MessageInvalidRequestBody)
	}

	if urlRequest.URL == "" {
		return errorResponse(c, StatusBadRequest, MessageURLRequired)
	}

	urlRequest.Key = key
	urlRequest.CreatedAt = time.Now().Format(time.RFC3339)
	urlRequest.IP = c.IP()
	urlRequest.Slug = functions.GenerateRandomKey(10)

	if err := database.SaveURLToDB(urlRequest); err != nil {
		return errorResponse(c, StatusInternalServerError, MessageFailedSaveURL)
	}

	return c.JSON(fiber.Map{
		"status":  fiber.StatusOK,
		"message": "URL created successfully",
		"url":     urlRequest.URL,
		"slug":    urlRequest.Slug,
	})
}

func UpdateSlug(c *fiber.Ctx) error {
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

	oldSlug := c.Params("slug")
	var req struct {
		NewSlug string `json:"new_slug"`
	}

	if err := c.BodyParser(&req); err != nil {
		return errorResponse(c, StatusBadRequest, MessageInvalidRequestBody)
	}

	if req.NewSlug == "" {
		return errorResponse(c, StatusBadRequest, MessageNewSlugRequired)
	}

	urlData, err := functions.GetURLBySlug(oldSlug)
	if err != nil || urlData == nil {
		return errorResponse(c, StatusNotFound, MessageSlugNotFound)
	}

	if urlData.Key != key {
		return errorResponse(c, fiber.StatusForbidden, MessageSlugUnauthorized)
	}

	existing, _ := functions.GetURLBySlug(req.NewSlug)
	if existing != nil {
		return errorResponse(c, fiber.StatusConflict, MessageSlugExists)
	}

	if err := functions.UpdateURLSlug(oldSlug, req.NewSlug); err != nil {
		return errorResponse(c, StatusInternalServerError, MessageSlugFailed)
	}

	return c.JSON(fiber.Map{
		"status":  fiber.StatusOK,
		"message": "Slug updated successfully",
	})
}
