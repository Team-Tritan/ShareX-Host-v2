package handlers

import (
	"github.com/gofiber/fiber/v2"
	
	"tritan.dev/image-uploader/functions"
)

func GetShareXConfig(c *fiber.Ctx) error {
	key := c.Get("key")

	validKeys := functions.LoadKeysFromFile("keys.json")

	found := false
	for _, k := range validKeys.Keys {
		if k.Key == key {
			found = true
			break
		}
	}

	if !found {
		return c.Status(401).JSON(fiber.Map{
			"status":  401,
			"message": "Invalid key retard.",
		})
	}

	if key == "" {
		return c.Status(403).JSON(fiber.Map{
			"status":  403,
			"message": "You need to be authenticated to get your ShareX config.",
		})
	}

	config := functions.GenerateShareXConfig(key)

	functions.SendShareXConfig(c, config)

	return nil
}
