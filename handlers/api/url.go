package handlers

import (
    "github.com/gofiber/fiber/v2"
    "tritan.dev/image-uploader/functions"
    "time"
)

func CreateURL(c *fiber.Ctx) error {
    key := c.Get("key")
    validKeys := functions.LoadKeysFromFile("./data/keys.json")

    if !isValidKey(key, validKeys) {
        return c.Status(401).JSON(fiber.Map{
            "status":  401,
            "message": "Invalid key",
        })
    }

    var urlRequest functions.URL
    if err := c.BodyParser(&urlRequest); err != nil {
        return c.Status(400).JSON(fiber.Map{
            "status":  400,
            "message": "Invalid request body",
        })
    }

    if urlRequest.URL == "" {
        return c.Status(400).JSON(fiber.Map{
            "status":  400,
            "message": "URL is required",
        })
    }

    urlRequest.Key = key
    urlRequest.CreatedAt = time.Now().Format(time.RFC3339)
    urlRequest.IP = c.IP()
    urlRequest.Slug = functions.GenerateRandomKey(10)

    if err := saveURL(urlRequest); err != nil {
        return c.Status(500).JSON(fiber.Map{
            "status":  500,
            "message": "Failed to save the URL data",
            "error":   err.Error(),
        })
    }

    return c.JSON(fiber.Map{
        "status":  200,
        "message": "URL created successfully",
        "url":     urlRequest.URL,
        "slug":    urlRequest.Slug,
    })
}

func saveURL(urlRequest functions.URL) error {
    existingURLs := functions.LoadURLsFromFile("./data/urls.json")
    existingURLs.AddURL(urlRequest)
    return existingURLs.SaveURLsToFile("./data/urls.json")
}
