package handlers

import (
	"github.com/gofiber/fiber/v2"

	functions "tritan.dev/image-uploader/functions"
	sharex "tritan.dev/image-uploader/functions"
)

func GetShareXConfig(c *fiber.Ctx) error {
	key := c.Get("key")
	queryType := c.Query("type")

	validKeys := functions.LoadKeysFromFile("./data/keys.json")

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

	if (queryType == ""){
		return c.Status(400).JSON(fiber.Map{
			"status": 400,
			"message": "The query type was invalid.",
		})
	}

	if (queryType == "uploader"){
		uploadConfig := sharex.GenerateUploaderConfig(key)
		sharex.SendConfig(c, uploadConfig)
	} 

	if (queryType == "url"){
		urlConfig := sharex.GenerateURLShortenerConfig(key)
		sharex.SendConfig(c, urlConfig)
	}

	return nil
}
