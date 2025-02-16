package handlers

import (
	"github.com/gofiber/fiber/v2"
)

func LoadDashboardPage(c *fiber.Ctx) error {

	return c.Render("./pages/dashboard.html", "layouts/main")
}
