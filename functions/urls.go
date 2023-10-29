package functions

import (
    "encoding/json"
    "io/ioutil"
    "log"
    "sync"
    "os"
)

type URL struct {
    URL       string `json:"url"`
    Slug      string `json:"slug"`
    CreatedAt string `json:"created_at"`
    IP        string `json:"ip"`
    Key       string `json:"key"`
}

type URLs struct {
    URLs []URL `json:"urls"`
    mu   sync.Mutex
}

func LoadURLsFromFile(filename string) *URLs {
    file, err := os.Open(filename)
    if err != nil {
        log.Printf("Failed to open URLs file: %v\n", err)
        return &URLs{}
    }
    defer file.Close()

    var urls URLs
    err = json.NewDecoder(file).Decode(&urls)
    if err != nil {
        log.Printf("Failed to decode URLs file: %v\n", err)
        return &URLs{}
    }

    return &urls
}

func (u *URLs) AddURL(newURL URL) {
    u.mu.Lock()
    defer u.mu.Unlock()
    u.URLs = append(u.URLs, newURL)
}

func (u *URLs) SaveURLsToFile(filename string) error {
    u.mu.Lock()
    defer u.mu.Unlock()

    data, err := json.MarshalIndent(u, "", "  ")
    if err != nil {
        log.Printf("Failed to marshal URLs data: %v\n", err)
        return err
    }

    if err := ioutil.WriteFile(filename, data, 0644); err != nil {
        log.Printf("Failed to write URLs file: %v\n", err)
        return err
    }

    return nil
}

func (u *URLs) GetURLs() []URL {
	return u.URLs
}

func (u *URLs) GetURLBySlug(slug string) *URL {
	for i := range u.URLs {
		if u.URLs[i].Slug == slug {
			return &u.URLs[i]
		}
	}
	return nil
}