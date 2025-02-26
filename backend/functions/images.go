package functions

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

func GetPath(dir string) string {
	return filepath.Join(dir)
}

func RenderError(w http.ResponseWriter, status int, message string) {
	w.WriteHeader(status)
	w.Header().Set("Content-Type", "application/json")
	fmt.Fprintf(w, `{"error":true,"status":%d,"message":"%s"}`, status, message)
}

func FindFileWithoutExtension(fileName string, dirPath string) (string, error) {
	files, err := os.ReadDir(dirPath)
	if err != nil {
		return "", err
	}

	fileWithoutExtension := strings.TrimSuffix(fileName, filepath.Ext(fileName))
	for _, file := range files {
		if strings.TrimSuffix(file.Name(), filepath.Ext(file.Name())) == fileWithoutExtension {
			return file.Name(), nil
		}
	}

	return "", nil
}
