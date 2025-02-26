package handlers

import (
	"github.com/gofiber/fiber/v2"
	"tritan.dev/image-uploader/constants"
	"tritan.dev/image-uploader/database"
)

func RedirectBySlug(c *fiber.Ctx) error {
	slug := c.Params("slug")

	url, err := database.GetURLBySlug(slug)
	if err != nil || url == nil {
		return errorResponse(c, constants.StatusNotFound, constants.MessageURLNotFound)
	}

	database.IncrementClickCount(slug)
	return c.Redirect(url.URL, fiber.StatusFound)
}
