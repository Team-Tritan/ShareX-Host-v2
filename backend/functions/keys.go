package functions

import (
	"math/rand"
	"time"

	"tritan.dev/image-uploader/database"
)

func GenerateRandomKey(length int) string {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	randomSource := rand.NewSource(time.Now().UnixNano())
	random := rand.New(randomSource)

	b := make([]byte, length)
	for i := range b {
		b[i] = charset[random.Intn(len(charset))]
	}
	return string(b)
}

func IsValidKey(key string, validUsers []database.User) bool {
	for _, user := range validUsers {
		if user.Key == key {
			return true
		}
	}
	return false
}
