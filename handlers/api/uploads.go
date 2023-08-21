package handlers

import (
	"fmt"
	"math/rand"

	"github.com/gofiber/fiber/v2"
	"tritan.dev/image-uploader/config"
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

	importedLogs := logs.LoadLogsFromFile("./data/logs.json")

	matchingLogs := make([]logs.LogEntry, 0)
	for _, log := range importedLogs {
		if log.Key == key {
			dir := config.AppConfigInstance.Dirs[rand.Intn(len(config.AppConfigInstance.Dirs))]
			log.FileName = fmt.Sprintf("/%s/%s", dir, log.FileName)
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
