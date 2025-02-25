package handlers

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"tritan.dev/image-uploader/database"
	"tritan.dev/image-uploader/functions"
)

func CreateURL(c *fiber.Ctx) error {
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

	var urlRequest database.URL
	if err := c.BodyParser(&urlRequest); err != nil {
		return errorResponse(c, StatusBadRequest, "Invalid request body")
	}

	if urlRequest.URL == "" {
		return errorResponse(c, StatusBadRequest, "URL is required")
	}

	urlRequest.Key = key
	urlRequest.CreatedAt = time.Now().Format(time.RFC3339)
	urlRequest.IP = c.IP()
	urlRequest.Slug = functions.GenerateRandomKey(10)

	if err := database.SaveURLToDB(urlRequest); err != nil {
		return errorResponse(c, StatusInternalServerError, "Failed to save the URL data")
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
		return errorResponse(c, StatusInternalServerError, "Failed to load users")
	}

	if !functions.IsValidKey(key, validUsers) {
		return errorResponse(c, StatusUnauthorized, "Invalid key")
	}

	oldSlug := c.Params("slug")

	var req struct {
		NewSlug string `json:"new_slug"`
	}

	if err := c.BodyParser(&req); err != nil {
		return errorResponse(c, StatusBadRequest, "Invalid request body")
	}

	if req.NewSlug == "" {
		return errorResponse(c, StatusBadRequest, "New slug is required")
	}

	urlData, err := functions.GetURLBySlug(oldSlug)
	if err != nil || urlData == nil {
		return errorResponse(c, StatusNotFound, "Slug not found")
	}

	if urlData.Key != key {
		return errorResponse(c, fiber.StatusForbidden, "Unauthorized to change this slug")
	}

	existing, _ := functions.GetURLBySlug(req.NewSlug)
	if existing != nil {
		return errorResponse(c, fiber.StatusConflict, "Slug already exists, choose another one")
	}

	if err := functions.UpdateURLSlug(oldSlug, req.NewSlug); err != nil {
		return errorResponse(c, StatusInternalServerError, "Failed to update slug")
	}

	return c.JSON(fiber.Map{
		"status":  fiber.StatusOK,
		"message": "Slug updated successfully",
	})
}
