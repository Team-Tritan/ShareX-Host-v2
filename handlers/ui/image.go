package handlers

import (
	"fmt"
	"path"

	"github.com/gofiber/fiber/v2"
	"tritan.dev/image-uploader/functions"
)

func DisplayImage(c *fiber.Ctx) error {
	file := c.Params("file")
	uploadsDir := functions.GetPath("./uploads")
	fileWithoutExtension, err := functions.FindFileWithoutExtension(file, uploadsDir)

	if err != nil {
		fmt.Println(err)
		return c.Status(500).JSON(fiber.Map{
			"status":  500,
			"message": "Internal server error",
		})
	}

	if fileWithoutExtension == "" {
		return c.Status(404).JSON(fiber.Map{
			"status":  404,
			"message": "Content not found",
		})
	}

	data := map[string]interface{}{
		"Data": map[string]string{
			"Name": fileWithoutExtension,
			"Ext":  path.Ext(fileWithoutExtension),
		},
	}

	return c.Render("./pages/image.html", data)
}
