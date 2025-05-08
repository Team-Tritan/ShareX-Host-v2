package functions

import (
	"tritan.dev/image-uploader/database"
)

type URL struct {
	Key       string `bson:"key"`
	URL       string `bson:"url"`
	CreatedAt string `bson:"created_at"`
	IP        string `bson:"ip"`
	Slug      string `bson:"slug"`
	Clicks    int    `bson:"clicks"`
}

func LoadURLsFromDB() ([]URL, error) {
	urls, err := database.LoadURLsFromDB()
	if err != nil {
		return nil, err
	}
	var result []URL
	for _, url := range urls {
		result = append(result, URL(url))
	}
	return result, nil
}

func SaveURLToDB(url URL) error {
	return database.SaveURLToDB(database.URL(url))
}

func GetURLBySlug(slug string) (*URL, error) {
	url, err := database.GetURLBySlug(slug)
	if err != nil {
		return nil, err
	}
	return (*URL)(url), nil
}

func UpdateURLSlug(oldSlug, newSlug string) error {
	return database.UpdateURLSlugInDB(oldSlug, newSlug)
}
