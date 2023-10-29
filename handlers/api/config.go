package handlers

import (
	"github.com/gofiber/fiber/v2"

	functions "tritan.dev/image-uploader/functions"
	sharex "tritan.dev/image-uploader/functions"
)

func GetShareXConfig(c *fiber.Ctx) error {
	key := c.Get("key")
	
	validKeys := functions.LoadKeysFromFile("./data/keys.json")
	queryType := c.Query("type")

    if !isValidKey(key, validKeys) {
        return c.Status(401).JSON(fiber.Map{
            "status":  401,
            "message": "Invalid key",
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

func isValidKey(key string, validKeys *functions.Keys) bool {
    for _, k := range validKeys.Keys {
        if k.Key == key {
            return true
        }
    }
    return false
}