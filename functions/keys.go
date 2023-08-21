package functions

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"math/rand"
	"os"
	"sync"
	"time"
)

type Key struct {
	Key       string `json:"key"`
	CreatedAt string `json:"created_at"`
	IP        string `json:"ip"`
}

type Keys struct {
	Keys []Key `json:"keys"`
	mu   sync.Mutex
}

func LoadKeysFromFile(filename string) *Keys {
	file, err := os.Open(filename)
	if err != nil {
		log.Printf("Failed to open keys file: %v\n", err)
		return &Keys{}
	}
	defer file.Close()

	var keys Keys
	err = json.NewDecoder(file).Decode(&keys)
	if err != nil {
		log.Printf("Failed to decode keys file: %v\n", err)
		return &Keys{}
	}

	return &keys
}

func (k *Keys) AddKey(newKey Key) {
	k.mu.Lock()
	defer k.mu.Unlock()
	k.Keys = append(k.Keys, newKey)
}

func (k *Keys) SaveKeysToFile(filename string) error {
	k.mu.Lock()
	defer k.mu.Unlock()

	data, err := json.MarshalIndent(k, "", "  ")
	if err != nil {
		log.Printf("Failed to marshal keys data: %v\n", err)
		return err
	}

	if err := ioutil.WriteFile(filename, data, 0644); err != nil {
		log.Printf("Failed to write keys file: %v\n", err)
		return err
	}

	return nil
}

func GenerateRandomKey(length int) string {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	rand.Seed(time.Now().UnixNano())
	b := make([]byte, length)
	for i := range b {
		b[i] = charset[rand.Intn(len(charset))]
	}
	return string(b)
}
