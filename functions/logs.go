package functions

import (
	"encoding/json"
	"io/ioutil"
	"log"
	"time"
)

type LogEntry struct {
	IP        string    `json:"ip"`
	Key       string    `json:"key"`
	FileName  string    `json:"file_name"`
	Timestamp time.Time `json:"timestamp"`
}

func LoadLogsFromFile(filename string) []LogEntry {
	var logs []LogEntry

	data, err := ioutil.ReadFile(filename)
	if err != nil {
		log.Printf("Error reading log file: %v\n", err)
		return logs
	}

	if err := json.Unmarshal(data, &logs); err != nil {
		log.Printf("Error unmarshaling log data: %v\n", err)
		return logs
	}

	return logs
}

func SaveLogsToFile(filename string, logs []LogEntry) error {
	data, err := json.MarshalIndent(logs, "", "  ")
	if err != nil {
		log.Printf("Error marshaling log data: %v\n", err)
		return err
	}

	if err := ioutil.WriteFile(filename, data, 0644); err != nil {
		log.Printf("Error writing log file: %v\n", err)
		return err
	}

	return nil
}
