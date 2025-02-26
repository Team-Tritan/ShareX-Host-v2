package database

import (
	"context"
	"fmt"
	"log"
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
	client, err = mongo.Connect(context.Background(), options.Client().ApplyURI(config.AppConfigInstance.MongoDB_URI))
	if err != nil {
		log.Fatalf("Failed to connect to MongoDB: %v", err)
	}

	// Test the connection
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	if err = client.Ping(ctx, nil); err != nil {
		log.Fatalf("Failed to ping MongoDB: %v", err)
	}

	db = client.Database("ShareX-Uploader")
	log.Println("Successfully connected to MongoDB!")
}

// Helper function to get a collection
func getCollection(collectionName string) *mongo.Collection {
	return db.Collection(collectionName)
}

// Helper function to execute a FindOne operation and decode the result
func findOne(ctx context.Context, collectionName string, filter bson.M, result interface{}) error {
	collection := getCollection(collectionName)
	err := collection.FindOne(ctx, filter).Decode(result)
	if err != nil && err != mongo.ErrNoDocuments {
		log.Printf("Error finding document in %s: %v", collectionName, err)
		return err
	}
	return err
}

// Helper function to execute a Find operation and decode the results
func findMany(ctx context.Context, collectionName string, filter bson.M, opts *options.FindOptions, results interface{}) error {
	collection := getCollection(collectionName)
	cursor, err := collection.Find(ctx, filter, opts)
	if err != nil {
		log.Printf("Error finding documents in %s: %v", collectionName, err)
		return err
	}
	defer cursor.Close(ctx)

	if err := cursor.All(ctx, results); err != nil {
		log.Printf("Error decoding documents from %s: %v", collectionName, err)
		return err
	}

	return nil
}

// Helper function to execute an UpdateOne operation
func updateOne(ctx context.Context, collectionName string, filter bson.M, update bson.M) error {
	collection := getCollection(collectionName)
	_, err := collection.UpdateOne(ctx, filter, update)
	if err != nil {
		log.Printf("Error updating document in %s: %v", collectionName, err)
		return err
	}
	return nil
}

// Helper function to execute an UpdateMany operation
func updateMany(ctx context.Context, collectionName string, filter bson.M, update bson.M) error {
	collection := getCollection(collectionName)
	_, err := collection.UpdateMany(ctx, filter, update)
	if err != nil {
		log.Printf("Error updating documents in %s: %v", collectionName, err)
		return err
	}
	return nil
}

// Helper function to execute a DeleteOne operation
func deleteOne(ctx context.Context, collectionName string, filter bson.M) error {
	collection := getCollection(collectionName)
	_, err := collection.DeleteOne(ctx, filter)
	if err != nil {
		log.Printf("Error deleting document in %s: %v", collectionName, err)
		return err
	}
	return nil
}

type User struct {
	Key         string `bson:"api_key"`
	DisplayName string `bson:"display_name"`
	CreatedAt   string `bson:"created_at"`
	IP          string `bson:"ip"`
	Domain      string `bson:"domain"`
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

type Domain struct {
	Name      string   `bson:"name"`
	Allowed   []string `bson:"allowed"`
	UsedCount int      `bson:"count"`
}

func LoadUsersFromDB() ([]User, error) {
	var users []User
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err := findMany(ctx, "users", bson.M{}, nil, &users)
	if err != nil {
		return nil, err
	}
	return users, nil
}

func SaveUserToDB(user User) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	collection := getCollection("users")
	_, err := collection.InsertOne(ctx, user)
	if err != nil {
		log.Printf("Error inserting user: %v", err)
		return err
	}

	domainsCollection := getCollection("domains")
	_, err = domainsCollection.InsertOne(ctx, Domain{Name: user.Domain, Allowed: []string{user.Key}})
	if err != nil {
		log.Printf("Error inserting domain: %v", err)
		return err
	}

	return nil
}

func GetUserByKey(key string) (User, error) {
	var user User
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err := findOne(ctx, "users", bson.M{"api_key": key}, &user)
	return user, err
}

func UpdateUserDisplayName(key, displayName string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	filter := bson.M{"api_key": key}
	update := bson.M{"$set": bson.M{"display_name": displayName}}

	err := updateOne(ctx, "users", filter, update)
	if err != nil {
		return err
	}

	uploadFilter := bson.M{"api_key": key}
	uploadUpdate := bson.M{"$set": bson.M{"display_name": displayName}}

	err = updateMany(ctx, "uploads", uploadFilter, uploadUpdate)
	return err
}

func DeleteUserByKey(key string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	filter := bson.M{"api_key": key}
	return deleteOne(ctx, "users", filter)
}

func SaveURLToDB(url URL) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	collection := getCollection("urls")
	_, err := collection.InsertOne(ctx, url)
	if err != nil {
		log.Printf("Error inserting URL: %v", err)
		return err
	}
	return nil
}

func LoadUploadsFromDB(key string) ([]UploadEntry, error) {
	var logs []UploadEntry
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	filter := bson.M{"api_key": key}
	opts := options.Find().SetSort(bson.D{{Key: "_id", Value: -1}})

	err := findMany(ctx, "uploads", filter, opts, &logs)
	if err != nil {
		return nil, err
	}
	return logs, nil
}

func SaveUploadToDB(log UploadEntry) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	collection := getCollection("uploads")
	_, err := collection.InsertOne(ctx, log)
	if err != nil {
		fmt.Printf("Error inserting upload: %v", err)
		return err
	}
	return nil
}

func DeleteUploadFromDB(key, fileName string) (UploadEntry, error) {
	var logEntry UploadEntry
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	filter := bson.M{
		"api_key":   key,
		"file_name": bson.M{"$regex": "^" + fileName + "\\..*$"},
	}

	err := findOne(ctx, "uploads", filter, &logEntry)
	if err != nil {
		return logEntry, err
	}

	if logEntry.Key != key {
		return logEntry, fmt.Errorf("unauthorized: key mismatch")
	}

	collection := getCollection("uploads")
	err = collection.FindOneAndDelete(ctx, filter).Decode(&logEntry)

	return logEntry, err
}

func LoadURLsFromDB() ([]URL, error) {
	var urls []URL
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err := findMany(ctx, "urls", bson.M{}, nil, &urls)
	if err != nil {
		return nil, err
	}
	return urls, nil
}

func LoadURLsFromDBByKey(key string) ([]URL, error) {
	var urls []URL
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	filter := bson.M{"api_key": key}
	opts := options.Find().SetSort(bson.D{{Key: "_id", Value: -1}})

	err := findMany(ctx, "urls", filter, opts, &urls)
	if err != nil {
		return nil, err
	}
	return urls, nil
}

func GetURLBySlug(slug string) (*URL, error) {
	var url URL
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err := findOne(ctx, "urls", bson.M{"slug": slug}, &url)
	if err != nil {
		return nil, err
	}
	return &url, nil
}

func GetDisplayNameByFileName(fileName string) (string, error) {
	var uploadEntry UploadEntry
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err := findOne(ctx, "uploads", bson.M{"file_name": fileName}, &uploadEntry)
	if err != nil {
		return "", err
	}
	return uploadEntry.DisplayName, nil
}

func GetUploadEntryByFileName(fileName string) (UploadEntry, error) {
	var uploadEntry UploadEntry
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err := findOne(ctx, "uploads", bson.M{"file_name": fileName}, &uploadEntry)
	return uploadEntry, err
}

func DeleteURLFromDB(key, slug string) (URL, error) {
	var url URL
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	filter := bson.M{"api_key": key, "slug": slug}
	err := findOne(ctx, "urls", filter, &url)
	if err != nil {
		return url, err
	}

	if url.Key != key {
		return url, fmt.Errorf("unauthorized: key mismatch")
	}

	collection := getCollection("urls")
	err = collection.FindOneAndDelete(ctx, filter).Decode(&url)
	return url, err
}

func UpdateURLSlugInDB(oldSlug, newSlug string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	filter := bson.M{"slug": oldSlug}
	update := bson.M{"$set": bson.M{"slug": newSlug}}

	return updateOne(ctx, "urls", filter, update)
}

func IncrementViewCount(fileName string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	filter := bson.M{"file_name": fileName}
	update := bson.M{"$inc": bson.M{"metadata.views": 1}}

	return updateOne(ctx, "uploads", filter, update)
}

func IncrementClickCount(slug string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	filter := bson.M{"slug": slug}
	update := bson.M{"$inc": bson.M{"clicks": 1}}

	return updateOne(ctx, "urls", filter, update)
}

func GetUploadBySlug(slug string) (UploadEntry, error) {
	var uploadEntry UploadEntry
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	filter := bson.M{"file_name": bson.M{"$regex": "^" + slug + "\\..*$"}}
	opts := options.FindOne()
	err := getCollection("uploads").FindOne(ctx, filter, opts).Decode(&uploadEntry)
	return uploadEntry, err
}

func UpdateUserKey(oldKey, newKey string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	filter := bson.M{"api_key": oldKey}
	update := bson.M{"$set": bson.M{"api_key": newKey}}

	err := updateOne(ctx, "users", filter, update)
	if err != nil {
		return err
	}

	uploadFilter := bson.M{"api_key": oldKey}
	uploadUpdate := bson.M{"$set": bson.M{"api_key": newKey}}

	err = updateMany(ctx, "uploads", uploadFilter, uploadUpdate)
	if err != nil {
		return err
	}

	urlFilter := bson.M{"api_key": oldKey}
	urlUpdate := bson.M{"$set": bson.M{"api_key": newKey}}

	err = updateMany(ctx, "urls", urlFilter, urlUpdate)
	if err != nil {
		return err
	}

	domainFilter := bson.M{"allowed": oldKey}
	domainUpdate := bson.M{"$set": bson.M{"allowed.$": newKey}}

	_, err = getCollection("domains").UpdateMany(ctx, domainFilter, domainUpdate)
	return err
}

func UpdateUserDomain(apiKey, domain string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	filter := bson.M{"name": domain}
	update := bson.M{"$addToSet": bson.M{"allowed": apiKey}}
	if err := updateOne(ctx, "domains", filter, update); err != nil {
		return err
	}

	userFilter := bson.M{"api_key": apiKey}
	userUpdate := bson.M{"$set": bson.M{"domain": domain}}
	return updateOne(ctx, "users", userFilter, userUpdate)
}

func contains(slice []string, key string) bool {
	for _, v := range slice {
		if v == key {
			return true
		}
	}
	return false
}

func GetEligibleDomainsFromDB(apiKey string) ([]string, error) {
	var domains []Domain
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err := findMany(ctx, "domains", bson.M{}, nil, &domains)
	if err != nil {
		return nil, err
	}

	eligible := []string{}
	for _, d := range domains {
		if contains(d.Allowed, "*") || contains(d.Allowed, apiKey) {
			eligible = append(eligible, d.Name)
		}
	}
	return eligible, nil
}
