package functions

import (
	"encoding/json"

	"github.com/gofiber/fiber/v2"
)

type ShareXConfig struct {
	Version         string            `json:"Version"`
	Name            string            `json:"Name"`
	DestinationType string            `json:"DestinationType"`
	RequestMethod   string            `json:"RequestMethod"`
	RequestURL      string            `json:"RequestURL"`
	Headers         map[string]string `json:"Headers"`
	Body            string            `json:"Body"`
	Arguments       map[string]string `json:"Arguments,omitempty"`
	URL             string            `json:"URL"`
	FileFormName    string            `json:"FileFormName,omitempty"`
}

func GenerateUploaderConfig(key string) ShareXConfig {
	return ShareXConfig{
		Version:         "15.0.0",
		Name:            "Lazy Uploader - Uploader",
		DestinationType: "ImageUploader, TextUploader, FileUploader",
		RequestMethod:   "POST",
		RequestURL:      "https://i.tritan.gg/api/upload",
		Headers: map[string]string{
			"key": key,
		},
		Body:         "MultipartFormData",
		FileFormName: "sharex",
		Arguments: map[string]string{
			"url": "{input}",
		},
		URL: "https://i.tritan.gg{json:url}",
	}
}

func GenerateURLShortenerConfig(key string) ShareXConfig {
	return ShareXConfig{
		Version:         "15.0.0",
		Name:            "Lazy Uploader - URL Shortener",
		DestinationType: "URLShortener",
		RequestMethod:   "POST",
		RequestURL:      "https://i.tritan.gg/api/url",
		Headers: map[string]string{
			"key": key,
		},
		Body:         "MultipartFormData",
		FileFormName: "sharex",
		Arguments: map[string]string{
			"url": "{input}",
		},
		URL: "https://i.tritan.gg/{json:slug}",
	}
}

func SendConfig(c *fiber.Ctx, config ShareXConfig) error {
	file, err := json.MarshalIndent(config, "", "  ")
	if err != nil {
		return err
	}

	fileName := "sharex-config.sxcu"

	c.Set("Content-disposition", "attachment; filename="+fileName)
	c.Set("Content-type", "application/json")

	return c.Send(file)
}
