package service

import (
	"encoding/json"
	"fmt"
	"os"
)

type Configuration struct {
	Iterations int
}
var configuration Configuration
func SetConfiguration() {
	file, _ := os.Open("/application.conf")
	decoder := json.NewDecoder(file)
	err := decoder.Decode(&configuration)
	if err != nil {
		fmt.Println("error:", err)
	}
}
func GetConfiguration() Configuration {
  return configuration
}
