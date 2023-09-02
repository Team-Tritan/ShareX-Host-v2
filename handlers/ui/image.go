package handlers

import (
	"fmt"
	"path"
	"strings"

	"github.com/gofiber/fiber/v2"
	"tritan.dev/image-uploader/config"
	"tritan.dev/image-uploader/functions"
)

func DisplayImage(c *fiber.Ctx) error {
    dir := c.Params("dir")
    file := c.Params("file")

    uploadsDir := functions.GetPath("./uploads")

    resultCh := make(chan fiber.Map, 1)
    errorCh := make(chan error, 1)

    go func() {
        fileWithoutExtension, err := functions.FindFileWithoutExtension(file, uploadsDir)
        if err != nil {
            errorCh <- err
            return
        }

        if !isValidDir(dir) || fileWithoutExtension == "" {
            errorCh <- fmt.Errorf("Content not found") 
            return
        }

        if fileWithoutExtension != "" {
            data := map[string]interface{}{
                "Data": map[string]string{
                    "Name": fileWithoutExtension,
                    "Ext":  path.Ext(fileWithoutExtension),
                },
            }
            resultCh <- data 
        }
    }()

    select {
    case data := <-resultCh:
        if data == nil {
            return c.Status(404).JSON(fiber.Map{
                "status":  404,
                "message": "Content not found.",
            })
        }
        return c.Render("./pages/image.html", data)
    case err := <-errorCh:
        fmt.Println(err) 
        return c.Status(500).JSON(fiber.Map{
            "status":  500,
            "message": "Internal server error",
        })
    }
}
