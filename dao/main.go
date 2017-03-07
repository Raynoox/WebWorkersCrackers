package dao

import (
  "fmt"
  "gopkg.in/mgo.v2"
  "gopkg.in/mgo.v2/bson"
  "log"
  "WebWorkersCrackers/model"
  "time"
)

func connect() *mgo.Session {
  session, err := mgo.Dial("127.0.0.1:27017")
  if err != nil {
    panic(err)
  }
  session.SetMode(mgo.Monotonic, true)
  return session
}

//AddHash adds hash to database
func AddHash(hash string) {
  session := connect()
  defer session.Close()
  c := session.DB("rest").C("hashes")
  err := c.Insert(&model.HashInfo{ID: bson.NewObjectId(), Hash: hash, NextIteration: 0})
  if err != nil {
    log.Fatal(err)
  }
  fmt.Println("hash " + hash + " added")
}

//GetHashes returns all hashes in database
func GetHashes() []model.HashInfo {
  session := connect()
  defer session.Close()
  c := session.DB("rest").C("hashes")
  var results []model.HashInfo
  err := c.Find(nil).All(&results)
  if err != nil {
    panic(err)
}
  return results
}
//GetSingleHash gets all information about single hash
func GetSingleHash(hash string) model.HashInfo {
  session := connect()
  defer session.Close()
  hashes := session.DB("rest").C("hashes")
  var foundHash model.HashInfo
  err := hashes.Find(bson.M{"hash": hash}).One(&foundHash)
  fmt.Printf("hash - %s; ID- %s; NextIteration - %d\n",foundHash.Hash, foundHash.ID.String(), foundHash.NextIteration)
  if err != nil {
    panic(err)
  }
  return foundHash
}
//GetHashToCrack gets next iteration for hash to crack
func GetHashToCrack(hash string) int {
  session := connect()
  defer session.Close()
  hashTable := session.DB("rest").C("hashTable")
  hashes := session.DB("rest").C("hashes")
  var pendingHashes []model.HashTable
  err := hashTable.Find(bson.M{"hash": hash}).All(&pendingHashes)
  if err != nil {
    panic(err)
  }
  var foundHash model.HashInfo
  err = hashes.Find(bson.M{"hash": hash}).One(&foundHash)
  if err != nil {
    panic(err)
  }
  nextIteration := foundHash.NextIteration
  return nextIteration
}
//GetHashesFromHashTable gets all information about started cracking process for hash
func GetHashesFromHashTable(hash string) []model.HashTable {
  session := connect()
  defer session.Close()
  var result []model.HashTable
  hashTable := session.DB("rest").C("hashTable")
  err := hashTable.Find(bson.M{"hash": hash}).All(&result)
  if err != nil {
    panic(err)
  }
  return result
}
//UpdateHashTable updates foundHashTable with change
func UpdateHashTable(change mgo.Change, foundHashTable model.HashTable) {
  session := connect()
  defer session.Close()
  hashTable := session.DB("rest").C("hashTable")
  info, err := hashTable.Find(bson.M{
    "hash": foundHashTable.Hash,
    "iterationstarted": foundHashTable.IterationStarted,
    }).Apply(change, &foundHashTable)
  if err != nil {
    fmt.Println(info)
    panic(err)
  }
}
//UpdateHash updates foundHash with change
func UpdateHash(change mgo.Change, foundHash model.HashInfo) {
  session := connect()
  defer session.Close()
  iterationStart := foundHash.NextIteration
  hashes := session.DB("rest").C("hashes")
  hashTable := session.DB("rest").C("hashTable")
  info, err := hashes.Find(bson.M{"hash": foundHash.Hash}).Apply(change, &foundHash)
  if err != nil {
    fmt.Println(info)
    panic(err)
  }
  err = hashTable.Insert(&model.HashTable{Hash: foundHash.Hash, IterationStarted:iterationStart, IterationNumber:10000, Timestamp: time.Now()})
  if err != nil {
    panic(err)
  }
}

func DeleteHashTable(hash string, iterationStart int) {
  session := connect()
  defer session.Close()
  hashTable := session.DB("rest").C("hashTable")
  _, err := hashTable.RemoveAll(bson.M{"hash": hash, "iterationstart": iterationStart})
  if err != nil {
    panic(err)
  }
}

func CompleteHash(hash string, decoded string) {
  session := connect()
  defer session.Close()
  hashes := session.DB("rest").C("hashes")
  err := hashes.Find(bson.M{})
  if err != nil {
    panic(err)
  }
}
