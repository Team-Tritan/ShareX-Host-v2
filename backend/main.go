package main

import (
	"fmt"
	"html/template"
	"io/ioutil"
	"log"
	"path/filepath"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"

	"tritan.dev/image-uploader/config"
	"tritan.dev/image-uploader/router"

	"github.com/getsentry/sentry-go"
)

func main() {
	defer func() {
		if r := recover(); r != nil {
			sentry.CaptureException(fmt.Errorf("%v", r))
			log.Fatalf("Recovered from panic: %v", r)
		}
	}()

	initSentry()

	app := fiber.New()
	port := config.AppConfigInstance.Port
	address := fmt.Sprintf(":%d", port)

	templates := loadTemplates()

	app.Use(logger.New())
	app.Use(cors.New())
	app.Use(func(c *fiber.Ctx) error {
		c.Locals("templates", templates)
		return c.Next()
	})

	if err := router.SetupRoutes(app); err != nil {
		sentry.CaptureException(err)
		fmt.Printf("Error setting up routes: %v\n", err)
		return
	}

	log.Printf("Listening for requests on port %d", port)
	if err := app.Listen(address); err != nil {
		sentry.CaptureException(err)
		log.Fatalf("Error starting server: %v", err)
	}
}

func loadTemplates() *template.Template {
	templates := template.New("")
	templatePath := "./pages"

	templateDir, err := ioutil.ReadDir(templatePath)
	if err != nil {
		sentry.CaptureException(err)
		log.Fatalf("Error reading template directory: %v", err)
	}

	for _, fileInfo := range templateDir {
		templateName := fileInfo.Name()
		if !fileInfo.IsDir() && strings.HasSuffix(templateName, ".html") {
			templateBytes, err := ioutil.ReadFile(filepath.Join(templatePath, templateName))
			if err != nil {
				sentry.CaptureException(err)
				log.Fatalf("Error reading template file: %v", err)
			}
			templateContent := string(templateBytes)
			templates.New(templateName).Parse(templateContent)
		}
	}

	return templates
}

func initSentry() {
	err := sentry.Init(sentry.ClientOptions{
		Dsn:              config.AppConfigInstance.Sentry_DSN,
		TracesSampleRate: 1.0,
	})

	if err != nil {
		log.Fatalf("Sentry init: %s", err)
	}
}
