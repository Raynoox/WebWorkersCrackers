package model
import (
        "gopkg.in/mgo.v2/bson"
        "time"
      )
//HashInfo struct of single hash in database
type HashInfo struct {
  ID bson.ObjectId `bson:"_id,omitempty"`
  Hash string
  NextIteration int
  Decoded string
  IsFinished bool
}
//StartInfo struct for staring cracking
type StartInfo struct {
  StartHash int
  Iterations int
  Algorithm string
}
//FinishInfo is a struct that contains information about finished sequence on node
type FinishInfo struct {
  Hash string
  IterationStart int
  Iterations int
  Algorithm string
  IsSuccess bool
  Result string
}
//HashListStruct list of HashInfo
type HashListStruct struct {
  Hashes []HashInfo
}
//HashTable struct of hash operation in database
type HashTable struct {
  Hash string
  IterationStarted int
  IterationNumber int
  Timestamp time.Time
}
