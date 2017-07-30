package main

import (
  "WebWorkersCrackers/dao"
  "WebWorkersCrackers/model"
  "WebWorkersCrackers/service"
  "bytes"
  "encoding/json"
  "flag"
  "fmt"
  "log"
  "net/http"
  "strconv"
  "github.com/gorilla/mux"
  "crypto/md5"
  "regexp"
  "strings"
)
func main() {
  fmt.Println("START getting configuration")
  service.SetConfiguration()
  fmt.Println(service.GetConfiguration().Iterations)
  fmt.Println(service.GetConfiguration().Types)
  for index, typez := range service.GetConfiguration().Types {
    fmt.Println(typez, index)
  }
  fmt.Println("END getting configuration")
  var dir string
  flag.StringVar(&dir, "dir", "/build/", "the directory to serve files from. Defaults to the current dir")
  flag.Parse()
  router := mux.NewRouter().StrictSlash(true)
  router.PathPrefix("/build").Handler(http.StripPrefix("/build", http.FileServer(http.Dir("build/"))))
  router.HandleFunc("/", Index)
  //router.HandleFunc("/hash/", NewHash)
  //router.HandleFunc("/hashes", HashList).Methods("GET")
  //router.HandleFunc("/crack/", GetHashToCrack)
  //router.HandleFunc("/finish/", RegisterFinishedSequence)
  //router.HandleFunc("/hashes", NewHash).Methods("POST")
  //router.HandleFunc("/hashes/{id}", UpdateHash).Methods("PUT")
  //router.HandleFunc("/hashes/{id}", DeleteHash).Methods("DELETE")
  //router.HandleFunc("/hashes/{id}", GetHashInfo).Methods("GET")
//
  router.HandleFunc("/hash", TypeList).Methods("GET")//ok
  router.HandleFunc("/hash/{type}", HashTypeList).Methods("GET")//ok
  router.HandleFunc("/hash/{type}", CreateHashOfType).Methods("POST")//ok
  router.HandleFunc("/hash/{type}/{id}", GetHash).Methods("GET") //ok
  router.HandleFunc("/hash/{type}/{id}", CreateHash).Methods("POST") //post made on collection?
  router.HandleFunc("/hash/{type}/{id}", UpdateHash).Methods("PUT")//update pool todo
  router.HandleFunc("/hash/{type}/{id}", DeleteHash).Methods("DELETE")//ok
  router.HandleFunc("/pool/{type}/{id}", GetAvailableIterations).Methods("GET")//ok
  router.HandleFunc("/pool/{type}/{id}", GetNextToCompute).Methods("POST")//ok
  router.HandleFunc("/pool/{type}/{id}/{iter}", ComputeResult).Methods("POST")//ok
  router.HandleFunc("/token", GenerateToken).Methods("POST")//ok
//TODO check if result of hash is valid
  router.PathPrefix("/build/").Handler(http.StripPrefix("/build/", ServeFile(dir)))
  log.Fatal(http.ListenAndServe(":8080", router))
}
func isValidMD5(text string) bool {
  isMD5 := regexp.MustCompile(`[a-fA-F0-9]{32}`).MatchString
  return isMD5(text)
}
func isValidSHA1(text string) bool {
  isSHA1 := regexp.MustCompile(`[a-fA-F0-9]{40}`).MatchString
  return isSHA1(text)
}
func isValidHash(text string, typez string) bool {
  if(strings.ToUpper(typez) == "MD-5") {
    return isValidMD5(text)
  }
  if(strings.ToUpper(typez) == "SHA-1") {
    return isValidSHA1(text)
  }
  fmt.Println("wrong hash type")
  return false
}
//TypeList returns available types
func TypeList(w http.ResponseWriter, req *http.Request) {
  u := service.GetConfiguration().Types
  b := new(bytes.Buffer)
  json.NewEncoder(b).Encode(u)
  fmt.Fprintln(w, b)
}
//HashTypeList returns all available hashes of type
func HashTypeList(w http.ResponseWriter, req *http.Request) {
  fmt.Println("x0")
  vars := mux.Vars(req)
  typez := vars["type"]
  fmt.Println(typez)
  u := dao.GetByType(typez)
  b := new(bytes.Buffer)
  json.NewEncoder(b).Encode(u)
  fmt.Fprintln(w, b)
}
//CreateHashOfType creates new hash
func CreateHashOfType(w http.ResponseWriter, req *http.Request) {
  fmt.Println("x1")
  decoder := json.NewDecoder(req.Body)
  var t model.HashInfo
  vars := mux.Vars(req)
  typez := vars["type"]
  err := decoder.Decode(&t)
  fmt.Println(t.Hash)
  if !isValidHash(t.Hash, typez) {
    w.WriteHeader(http.StatusBadRequest)
    w.Write([]byte("wrong hash"))
  } else {
    fmt.Println(req.Body)
    if err != nil {
      panic(err)
    }
    defer req.Body.Close()
    t.Type = typez
    var addResult bool
    if dao.CheckToken(t.Token) == true {
      addResult = dao.AddHash(t.Hash, t.Type)
    } else {
      w.WriteHeader(http.StatusUnauthorized)
      w.Write([]byte("get new token at POST /token"))
    }
    if addResult == false {
      w.WriteHeader(http.StatusConflict)
      w.Write([]byte("hash already exists"))
    }
    fmt.Println("newHashUploaded")
    fmt.Println(t.Hash, t.Type)
  }
}
//DeleteHash deletes hash at type and id
func DeleteHash(w http.ResponseWriter, req *http.Request) {
  vars := mux.Vars(req)
  typez := vars["type"]
  id := vars["id"]
  dao.DeleteHash(id, typez)
}
//UpdateHash updates hash of type and id
func UpdateHash(w http.ResponseWriter, req *http.Request) {
  vars := mux.Vars(req)
  typez := vars["type"]
  id := vars["id"]
  etag := fmt.Sprintf("%x",md5.Sum([]byte(fmt.Sprintf("%v",dao.GetHash(typez, id)))))
  if(etag == req.Header.Get("If-Match")) {
    fmt.Println("Update hash")
    fmt.Println(req.Body)
    decoder := json.NewDecoder(req.Body)
    var t model.HashInfo
    err := decoder.Decode(&t)
    fmt.Println(t)
    if err != nil {
      panic(err)
    }
    if !isValidHash(t.Hash, typez) {
      w.WriteHeader(http.StatusBadRequest)
      w.Write([]byte("wrong hash"))
    } else {
      if dao.CheckToken(t.Token) == true {
        dao.UpdateHash(id, typez, t)
      } else {
        w.WriteHeader(http.StatusUnauthorized)
        w.Write([]byte("get new token at POST /token"))
      }
    }
  } else {
    w.WriteHeader(http.StatusConflict)
    w.Write([]byte("Etag didn't match"))
  }
  fmt.Println("x2")
}
//GetHash returns information about signle hash of type and id
func GetHash(w http.ResponseWriter, req *http.Request) {
  vars := mux.Vars(req)
  typez := vars["type"]
  id := vars["id"]
  hash := dao.GetHash(typez, id)
  b := new(bytes.Buffer)
  json.NewEncoder(b).Encode(hash)
  etag := fmt.Sprintf("%x",md5.Sum([]byte(fmt.Sprintf("%v",hash))))
  w.Header().Set("Etag", etag)
  fmt.Fprintln(w, b)
}
//CreateHash creates new hash at {id} or updates
func CreateHash(w http.ResponseWriter, req *http.Request) {

}
//GetAvailableIterations returns all available iterations that aren't finished
func GetAvailableIterations(w http.ResponseWriter, req *http.Request) {
  vars := mux.Vars(req)
  typez := vars["type"]
  id := vars["id"]
  u := dao.GetPool(typez, id)
  b := new(bytes.Buffer)
  json.NewEncoder(b).Encode(u)
  fmt.Fprintln(w, b)
}
//GetNextToCompute returns expired iteration or creates new one
func GetNextToCompute(w http.ResponseWriter, req *http.Request) {

  vars := mux.Vars(req)
  typez := vars["type"]
  id := vars["id"]
  fmt.Println(typez, id)
  hash := dao.GetHash(typez, id)
  var result model.StartInfo
  fmt.Println(hash.Hash)
  if dao.GetHash(typez, id).IsFinished == true {
      w.WriteHeader(http.StatusConflict)
      w.Write([]byte("already completed"))
  } else {
    result.StartHash = service.GetNextIteration(typez, id)
    result.Iterations = service.GetConfiguration().Iterations
    result.Algorithm = typez
    b := new(bytes.Buffer)
    json.NewEncoder(b).Encode(result)
    fmt.Fprintln(w, b)
  }
}
//ComputeResult checks if its correct result and if success -> updates whole hash; fail -> deletes from pool
func ComputeResult(w http.ResponseWriter, req *http.Request) {
  fmt.Println("someone finished")
  vars := mux.Vars(req)
  typez := vars["type"]
  id := vars["id"]
  iter := vars["iter"]
  decoder := json.NewDecoder(req.Body)
  var t model.FinishInfo
  err := decoder.Decode(&t)
  if err != nil {
    panic(err)
  }
  t.IterationStart, err = strconv.Atoi(iter)
  if err != nil {
    panic(err)
  }
  t.Algorithm = typez
  defer req.Body.Close()
  service.RegisterCrackCompletion(t, id, typez)
  w.WriteHeader(http.StatusOK)
  w.Write([]byte("success"))
}
//GenerateToken for POE
func GenerateToken(w http.ResponseWriter, req *http.Request) {
  token := dao.GenerateToken()
  b := new(bytes.Buffer)
  json.NewEncoder(b).Encode(token)
  fmt.Fprintln(w, b)
}
//GetHashInfo returns information about hash
func GetHashInfo(w http.ResponseWriter, req *http.Request) {
  vars := mux.Vars(req)
  id := vars["id"]
  fmt.Println(id)
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
  //service.RegisterCrackCompletion(t)
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

  result.StartHash = service.GetHashToCrack(t.Hash)
  result.Iterations = service.GetConfiguration().Iterations
  result.Algorithm = "MD5"
  b := new(bytes.Buffer)
  json.NewEncoder(b).Encode(result)
  fmt.Fprintln(w, b)

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
  //dao.AddHash(t.Hash)
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
