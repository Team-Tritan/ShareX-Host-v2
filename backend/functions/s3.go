package functions

import (
	"io"
	"log"
	"time"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	"tritan.dev/image-uploader/config"
)

func createS3Session() (*session.Session, error) {
	sess, err := session.NewSession(&aws.Config{
		Credentials:      credentials.NewStaticCredentials(config.AppConfigInstance.S3_KeyID, config.AppConfigInstance.S3_AppKey, ""),
		Endpoint:         aws.String("http://" + config.AppConfigInstance.S3_RegionURL),
		Region:           aws.String(config.AppConfigInstance.S3_RegionName),
		S3ForcePathStyle: aws.Bool(true),
	})
	if err != nil {
		log.Println("Failed to create AWS session:", err)
		return nil, err
	}
	return sess, nil
}

func DeleteFileFromS3(fileName string) error {
	sess, err := createS3Session()
	if err != nil {
		return err
	}

	svc := s3.New(sess)
	_, err = svc.DeleteObject(&s3.DeleteObjectInput{
		Bucket: aws.String(config.AppConfigInstance.S3_BucketName),
		Key:    aws.String(fileName),
	})

	if err != nil {
		log.Println("Failed to delete object from S3:", err)
		return err
	}

	err = svc.WaitUntilObjectNotExists(&s3.HeadObjectInput{
		Bucket: aws.String(config.AppConfigInstance.S3_BucketName),
		Key:    aws.String(fileName),
	})

	if err != nil {
		log.Println("Failed to wait for object deletion:", err)
		return err
	}

	return nil
}

func UploadFileToS3(fileBody io.ReadSeeker, fileName string) error {
	sess, err := createS3Session()
	if err != nil {
		return err
	}

	svc := s3.New(sess)
	_, err = svc.PutObject(&s3.PutObjectInput{
		Body:   fileBody,
		Bucket: aws.String(config.AppConfigInstance.S3_BucketName),
		Key:    aws.String(fileName),
		ACL:    aws.String("public-read"),
	})
	if err != nil {
		log.Println("Error uploading to S3:", err)
		return err
	}

	return nil
}

func VerifyUploadToS3(fileName string) bool {
	sess, err := createS3Session()
	if err != nil {
		return false
	}

	svc := s3.New(sess)
	verified := false
	for i := 0; i < 5; i++ {
		_, err = svc.HeadObject(&s3.HeadObjectInput{
			Bucket: aws.String(config.AppConfigInstance.S3_BucketName),
			Key:    aws.String(fileName),
		})
		if err == nil {
			verified = true
			break
		}
		log.Printf("Retrying to verify upload to S3: attempt %d\n", i+1)
		time.Sleep(2 * time.Second)
	}

	return verified
}
