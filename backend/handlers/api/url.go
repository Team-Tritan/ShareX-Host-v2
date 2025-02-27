package handlers

import (
	"fmt"
	"time"

	"github.com/gofiber/fiber/v2"
	"tritan.dev/image-uploader/constants"
	"tritan.dev/image-uploader/database"
	"tritan.dev/image-uploader/functions"
)

func PostNewURL(c *fiber.Ctx) error {
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

	user, err := database.GetUserByKey(key)
	if err != nil {
		return errorResponse(c, constants.StatusUnauthorized, constants.MessageInvalidKey)
	}

	var urlRequest database.URL
	if err := c.BodyParser(&urlRequest); err != nil {
		return errorResponse(c, constants.StatusBadRequest, constants.MessageInvalidRequestBody)
	}

	if urlRequest.URL == "" {
		return errorResponse(c, constants.StatusBadRequest, constants.MessageURLRequired)
	}

	urlRequest.Key = key
	urlRequest.CreatedAt = time.Now().Format(time.RFC3339)
	urlRequest.IP = c.IP()
	urlRequest.Slug = functions.GenerateRandomKey(10)

	if err := database.SaveURLToDB(urlRequest); err != nil {
		return errorResponse(c, constants.StatusInternalServerError, constants.MessageFailedSaveURL)
	}

	return c.JSON(fiber.Map{
		"status":  constants.StatusOK,
		"message": "URL created successfully",
		"url":     urlRequest.URL,
		"slug":    urlRequest.Slug,
		"fullUrl": fmt.Sprintf("https://%s/u/%s", user.Domain, urlRequest.Slug),
	})
}

func PutUpdatedURLSlug(c *fiber.Ctx) error {
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

	oldSlug := c.Params("slug")
	var req struct {
		NewSlug string `json:"new_slug"`
	}

	if err := c.BodyParser(&req); err != nil {
		return errorResponse(c, constants.StatusBadRequest, constants.MessageInvalidRequestBody)
	}

	if req.NewSlug == "" {
		return errorResponse(c, constants.StatusBadRequest, constants.MessageNewSlugRequired)
	}

	urlData, err := functions.GetURLBySlug(oldSlug)
	if err != nil || urlData == nil {
		return errorResponse(c, constants.StatusNotFound, constants.MessageSlugNotFound)
	}

	if urlData.Key != key {
		return errorResponse(c, constants.StatusForbidden, constants.MessageSlugUnauthorized)
	}

	existing, _ := functions.GetURLBySlug(req.NewSlug)
	if existing != nil {
		return errorResponse(c, constants.StatusConflict, constants.MessageSlugExists)
	}

	if err := functions.UpdateURLSlug(oldSlug, req.NewSlug); err != nil {
		return errorResponse(c, constants.StatusInternalServerError, constants.MessageSlugFailed)
	}

	return c.JSON(fiber.Map{
		"status":  constants.StatusOK,
		"message": "Slug updated successfully",
	})
}
