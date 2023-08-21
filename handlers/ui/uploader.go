package handlers

import (
	"encoding/json"
	"html/template"
	"log"

	"github.com/gofiber/fiber/v2"
	"tritan.dev/image-uploader/config"
)

func LoadUploaderPage(c *fiber.Ctx) error {
	domainsJSON, err := json.Marshal(config.AppConfigInstance.Domains)
	if err != nil {
		log.Printf("Error marshaling data: %v\n", err)
		return c.SendStatus(fiber.StatusInternalServerError)
	}

	data := fiber.Map{
		"DomainsJSON": template.JS(domainsJSON),
	}

	return c.Render("./pages/uploader.html", data, "layouts/main")
}
