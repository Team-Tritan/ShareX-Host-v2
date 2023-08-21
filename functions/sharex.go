package functions

import (
	"encoding/json"

	"github.com/gofiber/fiber/v2"
)

type ShareXConfig struct {
	Name            string            `json:"Name"`
	DestinationType string            `json:"DestinationType"`
	RequestType     string            `json:"RequestType"`
	RequestURL      string            `json:"RequestURL"`
	Headers         map[string]string `json:"Headers"`
	FileFormName    string            `json:"FileFormName"`
	ResponseType    string            `json:"ResponseType"`
	URL             string            `json:"URL"`
}

func GenerateShareXConfig(key string) ShareXConfig {
	return ShareXConfig{
		Name:            "Lazy Uploader",
		DestinationType: "ImageUploader, TextUploader, FileUploader",
		RequestType:     "POST",
		RequestURL:      "https://im.sleepdeprived.wtf/api/upload/",
		Headers: map[string]string{
			"key": key,
		},
		FileFormName: "sharex",
		ResponseType: "Text",
		URL:          "https://im.sleepdeprived.wtf/$json:url$",
	}
}

func SendShareXConfig(c *fiber.Ctx, config ShareXConfig) error {
	file, err := json.MarshalIndent(config, "", "  ")
	if err != nil {
		return err
	}

	fileName := "sharex-config.sxcu"

	c.Set("Content-disposition", "attachment; filename="+fileName)
	c.Set("Content-type", "application/json")

	return c.Send(file)
}
