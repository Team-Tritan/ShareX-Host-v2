package handlers

import (
	"github.com/gofiber/fiber/v2"
	"tritan.dev/image-uploader/database"
)

func RedirectBySlug(c *fiber.Ctx) error {
	slug := c.Params("slug")

	url, err := database.GetURLBySlug(slug)
	if err != nil || url == nil {
		return c.Status(404).JSON(fiber.Map{
			"status":  404,
			"message": "URL not found",
		})
	}

	database.IncrementClickCount(slug)
	return c.Redirect(url.URL, fiber.StatusFound)
}
