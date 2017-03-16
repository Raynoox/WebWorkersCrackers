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
  fmt.Println("opening file")
	if _, err2 := os.Stat("application.conf"); os.IsNotExist(err2) {
  // path/to/whatever does not exist
	fmt.Println("blabla")
	}
	file, _ := os.Open("application.conf")
	decoder := json.NewDecoder(file)
	fmt.Println(decoder)
	err := decoder.Decode(&configuration)
	if err != nil {
		fmt.Println("error:", err)
	}
}
func GetConfiguration() Configuration {
  return configuration
}
