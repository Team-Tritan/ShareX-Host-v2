package handlers

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"math/rand"
	"path"
	"time"

	"github.com/gofiber/fiber/v2"
	
	"tritan.dev/image-uploader/config"
	"tritan.dev/image-uploader/functions"
)

type Key struct {
	Key string `json:"key"`
}

type LogEntry struct {
	IP        string    `json:"ip"`
	Key       string    `json:"key"`
	FileName  string    `json:"file_name"`
	Timestamp time.Time `json:"timestamp"`
}

func Upload(c *fiber.Ctx) error {
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

	sharex, err := c.FormFile("sharex")
	if err != nil {
		return c.Status(400).JSON(fiber.Map{
			"status":  400,
			"message": "No file uploaded, are you fucking stupid?",
		})
	}

	ext := path.Ext(sharex.Filename)
	name := functions.GenerateRandomKey(10)

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

	logEntry := LogEntry{
		IP:        ip,
		Key:       key,
		FileName:  name + ext,
		Timestamp: time.Now(),
	}

	existingLogs := loadLogsFromFile("logs.json")
	existingLogs = append(existingLogs, logEntry)

	if err := saveLogsToFile("logs.json", existingLogs); err != nil {
		log.Printf("Error saving log entry: %v\n", err)
	}

	return c.JSON(fiber.Map{
		"status":  200,
		"message": "File just got uploaded!",
		"url":     fmt.Sprintf("%s/%s", dir, name),
	})
}

func loadLogsFromFile(filename string) []LogEntry {
	var logs []LogEntry

	data, err := ioutil.ReadFile(filename)
	if err != nil {
		log.Printf("Error reading log file: %v\n", err)
		return logs
	}

	if err := json.Unmarshal(data, &logs); err != nil {
		log.Printf("Error unmarshaling log data: %v\n", err)
		return logs
	}

	return logs
}

func saveLogsToFile(filename string, logs []LogEntry) error {
	data, err := json.MarshalIndent(logs, "", "  ")
	if err != nil {
		log.Printf("Error marshaling log data: %v\n", err)
		return err
	}

	if err := ioutil.WriteFile(filename, data, 0644); err != nil {
		log.Printf("Error writing log file: %v\n", err)
		return err
	}

	return nil
}
