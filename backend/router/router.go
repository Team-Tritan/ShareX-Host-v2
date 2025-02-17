package router

import (
	"github.com/gofiber/fiber/v2"

	api "tritan.dev/image-uploader/handlers/api"
	ui "tritan.dev/image-uploader/handlers/ui"
	"tritan.dev/image-uploader/middleware"
)

func SetupRoutes(app *fiber.App) error {
	rateLimiter := middleware.NewRateLimiter()

	app.Get("/", ui.LoadDashboardPage)
	app.Get("/u/:slug", ui.RedirectBySlug)
	app.Get("/:dir/:file", ui.DisplayImage)

	app.Get("/api/image/:slug", api.GetImageBySlug)
	app.Post("/api/upload", rateLimiter.Limit(api.Upload))
	app.Post("/api/create-key", api.CreateKey)
	app.Post("/api/config", api.GetShareXConfig)
	app.Post("/api/uploads", api.GetUploadsByToken)
	app.Post("/api/url", api.CreateURL)
	app.Post("/api/urls", api.GetURLsByToken)

	app.Put("/api/url/:slug", api.UpdateSlug)

	app.Delete("/api/delete-upload/:id", api.DeleteUpload)
	app.Delete("/api/delete-url/:slug", api.DeleteURL)

	app.Use(func(c *fiber.Ctx) error {
		return c.Status(404).JSON(fiber.Map{
			"status":  404,
			"message": "Content not found.",
		})
	})

	return nil
}
