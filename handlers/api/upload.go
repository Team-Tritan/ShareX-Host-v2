package handlers

import (
	"fmt"
	"log"
	"math/rand"
	"path"
	"time"

	"github.com/gofiber/fiber/v2"

	"tritan.dev/image-uploader/config"
	keys "tritan.dev/image-uploader/functions"
	logs "tritan.dev/image-uploader/functions"
)

type Key struct {
	Key string `json:"key"`
}

func Upload(c *fiber.Ctx) error {
	key := c.Get("key")

	validKeys := keys.LoadKeysFromFile("./data/keys.json")

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

	sharex, err := c.FormFile("sharex")
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"status":  400,
			"message": "No file uploaded, are you fucking stupid?",
		})
	}

	ext := path.Ext(sharex.Filename)
	name := keys.GenerateRandomKey(10)

	dir := config.AppConfigInstance.Dirs[rand.Intn(len(config.AppConfigInstance.Dirs))]
	ip := c.Get("x-forwarded-for")
	if ip == "" {
		ip = c.IP()
	}

	if err := c.SaveFile(sharex, fmt.Sprintf("./uploads/%s%s", name, ext)); err != nil {
		return c.Status(500).JSON(fiber.Map{
			"status":  500,
			"message": "Failed to upload the file.",
			"error":   err.Error(),
		})
	}

	log.Printf("%s just uploaded %s from %s.\n", key, name+ext, ip)

	logEntry := logs.LogEntry{
		IP:        ip,
		Key:       key,
		FileName:  name + ext,
		Timestamp: time.Now(),
	}

	existingLogs := logs.LoadLogsFromFile("./data/logs.json")
	existingLogs = append(existingLogs, logEntry)

	if err := logs.SaveLogsToFile("./data/logs.json", existingLogs); err != nil {
		log.Printf("Error saving log entry: %v\n", err)
	}

	return c.JSON(fiber.Map{
		"status":  200,
		"message": "File just got uploaded!",
		"url":     fmt.Sprintf("/%s/%s", dir, name),
	})
}
