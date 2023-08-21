package handlers

import (
	"github.com/gofiber/fiber/v2"

	keys "tritan.dev/image-uploader/functions"
	logs "tritan.dev/image-uploader/functions"
)

func GetUploadsByToken(c *fiber.Ctx) error {
	key := c.Get("key")
	validKeys := keys.LoadKeysFromFile("./data/keys.json")

	if key == "" {
		return c.Status(401).JSON(fiber.Map{
			"status":  401,
			"message": "Invalid key",
		})
	}

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
			"message": "Invalid key retard",
		})
	}

	imported_logs := logs.LoadLogsFromFile("./data/logs.json")

	matchingLogs := make([]logs.LogEntry, 0)
	for _, log := range imported_logs {
		if log.Key == key {
			matchingLogs = append(matchingLogs, log)
		}
	}

	if len(matchingLogs) == 0 {
		return c.Status(200).JSON(fiber.Map{
			"status":  200,
			"message": "No uploads found.",
		})
	}

	return c.JSON(matchingLogs)
}
