package handlers

import (
	"fmt"
	"path"
	"strings"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"github.com/gofiber/fiber/v2"
	"tritan.dev/image-uploader/config"
)

func DisplayImage(c *fiber.Ctx) error {
	fileWithoutExtension := strings.TrimSuffix(c.Params("file"), path.Ext(c.Params("file")))

	s3Config := &aws.Config{
		Credentials:      credentials.NewStaticCredentials(config.AppConfigInstance.S3_KeyID, config.AppConfigInstance.S3_AppKey, ""),
		Endpoint:         aws.String(config.AppConfigInstance.S3_RegionURL),
		Region:           aws.String(config.AppConfigInstance.S3_RegionName),
		S3ForcePathStyle: aws.Bool(true),
	}

	newSession := session.New(s3Config)

	s3Client := s3.New(newSession)
	bucket := config.AppConfigInstance.S3_BucketName

	resp, err := s3Client.ListObjectsV2(&s3.ListObjectsV2Input{
		Bucket: aws.String(bucket),
	})
	if err != nil {
		fmt.Println(err)
		return c.Status(500).JSON(fiber.Map{
			"status":  500,
			"message": "Internal server error",
		})
	}

	for _, obj := range resp.Contents {
		objKeyWithoutExt := strings.TrimSuffix(path.Base(*obj.Key), path.Ext(path.Base(*obj.Key)))
		if objKeyWithoutExt == fileWithoutExtension {
			fullURL := fmt.Sprintf("https://%s/%s", config.AppConfigInstance.S3_BucketName, *obj.Key)
			data := map[string]interface{}{
				"Data": map[string]string{
					"fullURL": fullURL,
					"Name": *obj.Key,
				},
			}
			return c.Render("./pages/image.html", data)
		}
	}

	return c.Status(404).JSON(fiber.Map{
		"status":  404,
		"message": "Content not found",
	})
}
