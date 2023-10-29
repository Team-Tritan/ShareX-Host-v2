package handlers

import (
	"github.com/gofiber/fiber/v2"
	"tritan.dev/image-uploader/functions"
)

func RedirectBySlug(c *fiber.Ctx) error {
	slug := c.Params("slug")

	urls := functions.LoadURLsFromFile("./data/urls.json")
	url := urls.GetURLBySlug(slug)

	if url == nil {
		return c.Status(404).JSON(fiber.Map{
			"status":  404,
			"message": "URL not found",
		})
	}

	return c.Redirect(url.URL, fiber.StatusFound)
}
