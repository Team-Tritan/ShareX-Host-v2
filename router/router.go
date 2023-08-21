package router

import (
	"github.com/gofiber/fiber/v2"

	api "tritan.dev/image-uploader/handlers/api"
	ui "tritan.dev/image-uploader/handlers/ui"
)

func SetupRoutes(app *fiber.App) error {
	app.Get("/", ui.LoadUploaderPage)
	app.Get("/:dir/:file", ui.DisplayImage)

	app.Post("/api/upload", api.Upload)
	app.Post("/api/create-key", api.CreateKey)
	app.Post("/api/sharex-config", api.GetShareXConfig)

	app.Static("/api/content/raw", "./uploads")

	app.Use(func(c *fiber.Ctx) error {
		return c.Status(404).JSON(fiber.Map{
			"status":  404,
			"message": "Content not found.",
		})
	})

	return nil
}
