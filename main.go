package main

import (
<<<<<<< HEAD
	"WebWorkersCrackers/dao"
	"WebWorkersCrackers/model"
	"WebWorkersCrackers/service"
	"bytes"
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"net/http"
=======
  "bytes"
  "encoding/json"
  "flag"
  "fmt"
  "github.com/gorilla/mux"
  "log"
  "net/http"
  "WebWorkersCrackers/dao"
  "WebWorkersCrackers/model"
  "WebWorkersCrackers/service"
)
>>>>>>> 16dc3f55aaba43e54973d7972486ef9c24412c41

	"github.com/gorilla/mux"
)
var conf service.Configuration
func main() {
<<<<<<< HEAD
	service.SetConfiguration()
	var dir string
	flag.StringVar(&dir, "dir", "/build/", "the directory to serve files from. Defaults to the current dir")
	flag.Parse()
	router := mux.NewRouter().StrictSlash(true)
	router.PathPrefix("/build").Handler(http.StripPrefix("/build", http.FileServer(http.Dir("build/"))))
	router.HandleFunc("/", Index)
	router.HandleFunc("/hash/", NewHash)
	router.HandleFunc("/hashlist", HashList)
	router.HandleFunc("/crack/", GetHashToCrack)
	router.HandleFunc("/finish/", RegisterFinishedSequence)
	router.PathPrefix("/build/").Handler(http.StripPrefix("/build/", ServeFile(dir)))
	log.Fatal(http.ListenAndServe(":8080", router))
=======
  var dir string
  flag.StringVar(&dir, "dir", "/build/", "the directory to serve files from. Defaults to the current dir")
  flag.Parse()
  router := mux.NewRouter().StrictSlash(true)
  router.PathPrefix("/build").Handler(http.StripPrefix("/build", http.FileServer(http.Dir("build/"))))
  router.HandleFunc("/", Index)
  router.HandleFunc("/hash/", NewHash)
  router.HandleFunc("/hashlist", HashList)
  router.HandleFunc("/crack/", GetHashToCrack)
  router.HandleFunc("/finish/", RegisterFinishedSequence)
  router.PathPrefix("/build/").Handler(http.StripPrefix("/build/", ServeFile(dir)))
  log.Fatal(http.ListenAndServe(":8080", router))
>>>>>>> 16dc3f55aaba43e54973d7972486ef9c24412c41
}


//RegisterFinishedSequence registers finish of sequence
//needs Hash, IterationStart, IsSuccess, Result in body params
func RegisterFinishedSequence(w http.ResponseWriter, req *http.Request) {
  fmt.Println("someone finished")
  decoder := json.NewDecoder(req.Body)
  var t model.FinishInfo
  err := decoder.Decode(&t)
  if err != nil {
    panic(err)
  }
  defer req.Body.Close()
  service.RegisterCrackCompletion(t)
}

//GetHashToCrack gets next iteration for hash
func GetHashToCrack(w http.ResponseWriter, req *http.Request) {
  fmt.Println(w, "getting hash to crack")
  decoder := json.NewDecoder(req.Body)
  var t model.HashInfo
  err := decoder.Decode(&t)
  if err != nil {
    panic(err)
  }
  defer req.Body.Close()
  var result model.StartInfo

<<<<<<< HEAD
	result.StartHash = service.GetHashToCrack(t.Hash)
	result.Iterations = service.GetConfiguration().Iterations
	result.Algorithm = "MD5"
	b := new(bytes.Buffer)
	json.NewEncoder(b).Encode(result)
	fmt.Fprintln(w, b)
=======
  result.StartHash = service.GetHashToCrack(t.Hash)
  result.Iterations = 10000
  result.Algorithm = "MD5"
  b := new(bytes.Buffer)
  json.NewEncoder(b).Encode(result)
  fmt.Fprintln(w, b)
>>>>>>> 16dc3f55aaba43e54973d7972486ef9c24412c41
}

//HashList action for displaying list of hash
func HashList(w http.ResponseWriter, req *http.Request) {
  u := dao.GetHashes()
  b := new(bytes.Buffer)
  json.NewEncoder(b).Encode(u)
  fmt.Println(b)
  fmt.Fprintln(w, b)
}

//NewHash action for adding new hash
func NewHash(w http.ResponseWriter, req *http.Request) {
  decoder := json.NewDecoder(req.Body)
  var t model.HashInfo
  err := decoder.Decode(&t)
  fmt.Println(t.Hash)
  fmt.Println(req.Body)
  if err != nil {
    panic(err)
  }
  defer req.Body.Close()
  dao.AddHash(t.Hash)
  fmt.Println("newHashUploaded")
  fmt.Println(t.Hash)

}

//ServeFile serves files
func ServeFile(dir string) http.Handler {
  fmt.Println(dir)
  return http.FileServer(http.Dir(dir))
}

//Index serves html
func Index(w http.ResponseWriter, r *http.Request) {
  http.ServeFile(w, r, "build/index.html")
}
