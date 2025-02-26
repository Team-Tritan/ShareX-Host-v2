package router

import (
	"github.com/gofiber/fiber/v2"

	"tritan.dev/image-uploader/constants"
	api "tritan.dev/image-uploader/handlers/api"
	ui "tritan.dev/image-uploader/handlers/ui"
)

func SetupRoutes(app *fiber.App) error {

	app.Get("/u/:slug", ui.RedirectBySlug)
	app.Get("/i/:file", ui.DisplayImage)
	app.Get("/api/account", api.GetAccountDataByKey)
	app.Get("/api/uploads", api.GetUploadsByToken)
	app.Get("/api/urls", api.GetURLsByToken)

	app.Post("/api/account", api.CreateAccount)
	app.Post("/api/upload", api.Upload)
	app.Post("/api/config", api.GetShareXConfig)
	app.Post("/api/url", api.CreateURL)

	app.Put("/api/url/:slug", api.UpdateSlug)
	app.Put("/api/account/:type", api.UpdateAccountDetails)

	app.Delete("/api/delete-upload/:id", api.DeleteUpload)
	app.Delete("/api/delete-url/:slug", api.DeleteURL)

	app.Use(func(c *fiber.Ctx) error {
		return c.Status(constants.StatusNotFound).JSON(fiber.Map{
			"status":  404,
			"message": "Content not found.",
		})
	})

	return nil
}
