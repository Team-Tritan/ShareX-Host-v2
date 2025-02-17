package handlers

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"tritan.dev/image-uploader/database"
	"tritan.dev/image-uploader/functions"
)

func CreateURL(c *fiber.Ctx) error {
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

	var urlRequest database.URL
	if err := c.BodyParser(&urlRequest); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"status":  400,
			"message": "Invalid request body",
		})
	}

	if urlRequest.URL == "" {
		return c.Status(400).JSON(fiber.Map{
			"status":  400,
			"message": "URL is required",
		})
	}

	urlRequest.Key = key
	urlRequest.CreatedAt = time.Now().Format(time.RFC3339)
	urlRequest.IP = c.IP()
	urlRequest.Slug = functions.GenerateRandomKey(10)

	if err := database.SaveURLToDB(urlRequest); err != nil {
		return c.Status(500).JSON(fiber.Map{
			"status":  500,
			"message": "Failed to save the URL data",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"status":  200,
		"message": "URL created successfully",
		"url":     urlRequest.URL,
		"slug":    urlRequest.Slug,
	})
}

func UpdateSlug(c *fiber.Ctx) error {
	oldSlug := c.Params("slug")

	var req struct {
		NewSlug string `json:"new_slug"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{
			"status":  400,
			"message": "Invalid request body",
		})
	}

	if req.NewSlug == "" {
		return c.Status(400).JSON(fiber.Map{
			"status":  400,
			"message": "New slug is required",
		})
	}

	existing, _ := functions.GetURLBySlug(req.NewSlug)
	if existing != nil {
		return c.Status(409).JSON(fiber.Map{
			"status":  409,
			"message": "Slug already exists, choose another one",
		})
	}

	if err := functions.UpdateURLSlug(oldSlug, req.NewSlug); err != nil {
		return c.Status(500).JSON(fiber.Map{
			"status":  500,
			"message": "Failed to update slug",
			"error":   err.Error(),
		})
	}

	return c.JSON(fiber.Map{
		"status":  200,
		"message": "Slug updated successfully",
	})
}
