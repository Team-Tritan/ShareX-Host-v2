package database

import (
	"context"
	"fmt"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"tritan.dev/image-uploader/config"
)

var client *mongo.Client
var db *mongo.Database

func init() {
	var err error
	client, err = mongo.NewClient(options.Client().ApplyURI(config.AppConfigInstance.MongoDB_URI))
	if err != nil {
		panic(err)
	}
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	err = client.Connect(ctx)
	if err != nil {
		panic(err)
	}
	db = client.Database("ShareX-Uploader")
}

type User struct {
	Key         string `bson:"api_key"`
	DisplayName string `bson:"display_name"`
	CreatedAt   string `bson:"created_at"`
	IP          string `bson:"ip"`
}

type URL struct {
	Key       string `bson:"api_key"`
	URL       string `bson:"url"`
	CreatedAt string `bson:"created_at"`
	IP        string `bson:"ip"`
	Slug      string `bson:"slug"`
	Clicks    int    `bson:"clicks"`
}

type Metadata struct {
	FileType   string    `bson:"file_type"`
	FileSize   int64     `bson:"file_size"`
	UploadDate time.Time `bson:"upload_date"`
	Views      int       `bson:"views"`
}

type UploadEntry struct {
	IP          string   `bson:"ip"`
	Key         string   `bson:"api_key"`
	DisplayName string   `bson:"display_name"`
	FileName    string   `bson:"file_name"`
	Metadata    Metadata `bson:"metadata"`
}

func LoadUsersFromDB() ([]User, error) {
	var users []User
	collection := db.Collection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	cursor, err := collection.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)
	for cursor.Next(ctx) {
		var user User
		if err := cursor.Decode(&user); err != nil {
			return nil, err
		}
		users = append(users, user)
	}
	return users, nil
}

func SaveUserToDB(user User) error {
	collection := db.Collection("users")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	_, err := collection.InsertOne(ctx, user)
	return err
}

func SaveURLToDB(url URL) error {
	collection := db.Collection("urls")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	_, err := collection.InsertOne(ctx, url)
	return err
}

func LoadUploadsFromDB(key string) ([]UploadEntry, error) {
	var logs []UploadEntry
	collection := db.Collection("uploads")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	filter := bson.M{"api_key": key}
	opts := options.Find().SetSort(bson.D{{"_id", -1}})
	cursor, err := collection.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)
	for cursor.Next(ctx) {
		var log UploadEntry
		if err := cursor.Decode(&log); err != nil {
			return nil, err
		}
		logs = append(logs, log)
	}
	return logs, nil
}

func SaveUploadToDB(log UploadEntry) error {
	collection := db.Collection("uploads")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	_, err := collection.InsertOne(ctx, log)
	return err
}

func DeleteUploadFromDB(key, fileName string) (UploadEntry, error) {
	var logEntry UploadEntry
	collection := db.Collection("uploads")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	filter := bson.M{
		"api_key":   key,
		"file_name": bson.M{"$regex": "^" + fileName + "\\..*$"},
	}
	err := collection.FindOne(ctx, filter).Decode(&logEntry)
	if err != nil {
		return logEntry, err
	}
	if logEntry.Key != key {
		return logEntry, fmt.Errorf("unauthorized: key mismatch")
	}
	err = collection.FindOneAndDelete(ctx, filter).Decode(&logEntry)
	return logEntry, err
}

func LoadURLsFromDB() ([]URL, error) {
	var urls []URL
	collection := db.Collection("urls")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	cursor, err := collection.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)
	for cursor.Next(ctx) {
		var url URL
		if err := cursor.Decode(&url); err != nil {
			return nil, err
		}
		urls = append(urls, url)
	}
	return urls, nil
}

func LoadURLsFromDBByKey(key string) ([]URL, error) {
	var urls []URL
	collection := db.Collection("urls")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	filter := bson.M{"api_key": key}
	opts := options.Find().SetSort(bson.D{{"_id", -1}})
	cursor, err := collection.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)
	for cursor.Next(ctx) {
		var url URL
		if err := cursor.Decode(&url); err != nil {
			return nil, err
		}
		urls = append(urls, url)
	}
	return urls, nil
}

func GetURLBySlug(slug string) (*URL, error) {
	var url URL
	collection := db.Collection("urls")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	err := collection.FindOne(ctx, bson.M{"slug": slug}).Decode(&url)
	if err != nil {
		return nil, err
	}
	return &url, nil
}

func GetDisplayNameByFileName(fileName string) (string, error) {
	var uploadEntry UploadEntry
	collection := db.Collection("uploads")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	err := collection.FindOne(ctx, bson.M{"file_name": fileName}).Decode(&uploadEntry)
	if err != nil {
		return "", err
	}
	return uploadEntry.DisplayName, nil
}

func GetUploadEntryByFileName(fileName string) (UploadEntry, error) {
	var uploadEntry UploadEntry
	collection := db.Collection("uploads")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	err := collection.FindOne(ctx, bson.M{"file_name": fileName}).Decode(&uploadEntry)
	return uploadEntry, err
}

func DeleteURLFromDB(key, slug string) (URL, error) {
	var url URL
	collection := db.Collection("urls")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	filter := bson.M{"api_key": key, "slug": slug}
	err := collection.FindOne(ctx, filter).Decode(&url)
	if err != nil {
		return url, err
	}
	if url.Key != key {
		return url, fmt.Errorf("unauthorized: key mismatch")
	}
	err = collection.FindOneAndDelete(ctx, filter).Decode(&url)
	return url, err
}

func UpdateURLSlugInDB(oldSlug, newSlug string) error {
	collection := db.Collection("urls")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	filter := bson.M{"slug": oldSlug}
	update := bson.M{"$set": bson.M{"slug": newSlug}}

	_, err := collection.UpdateOne(ctx, filter, update)
	return err
}

func IncrementViewCount(fileName string) error {
	collection := db.Collection("uploads")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	filter := bson.M{"file_name": fileName}
	update := bson.M{"$inc": bson.M{"metadata.views": 1}}

	_, err := collection.UpdateOne(ctx, filter, update)
	return err
}

func IncrementClickCount(slug string) error {
	collection := db.Collection("urls")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	filter := bson.M{"slug": slug}
	update := bson.M{"$inc": bson.M{"clicks": 1}}

	_, err := collection.UpdateOne(ctx, filter, update)
	return err
}

func GetUploadBySlug(slug string) (UploadEntry, error) {
	var uploadEntry UploadEntry
	collection := db.Collection("uploads")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	filter := bson.M{"file_name": bson.M{"$regex": "^" + slug + "\\..*$"}}
	err := collection.FindOne(ctx, filter).Decode(&uploadEntry)
	return uploadEntry, err
}
