package service
import (
  "WebWorkersCrackers/dao"
  "gopkg.in/mgo.v2"
  "gopkg.in/mgo.v2/bson"
  "fmt"
  "time"
  "WebWorkersCrackers/model"
)

//GetHashToCrack gets next iteration for hash to crack
func GetHashToCrack(hash string) int {
  pendingHashes := dao.GetHashesFromHashTable(hash)
  for index, pending := range pendingHashes {
    if time.Since(pending.Timestamp).Seconds() > 10.0 {
      change := mgo.Change{
        Update: bson.M{
          "hash": pending.Hash,
          "iterationstarted": pending.IterationStarted,
          "iterationnumber": pending.IterationNumber,
          "timestamp": time.Now(),
        },
        ReturnNew: true,
      }
      dao.UpdateHashTable(change, pending)
      fmt.Printf("giving back old hash %d %d\n",pending.IterationStarted, index)
      return pending.IterationStarted
    }
  }
  foundHash := dao.GetSingleHash(hash)
  nextIteration := foundHash.NextIteration
  fmt.Printf("Im gonna return - %d\n", foundHash.NextIteration)
  if len(foundHash.Hash) > 0 {
    change := mgo.Change{
      Update:    bson.M{"hash": foundHash.Hash, "nextiteration": nextIteration + 10000},
      ReturnNew: true,
    }
    dao.UpdateHash(change, foundHash)
  }
  return nextIteration
}
//RegisterCrackCompletion registers sequence completition
func RegisterCrackCompletion(data model.FinishInfo) {
  complete(data)
  dao.DeleteHashTable(data.Hash, data.IterationStart)
}
func complete( data model.FinishInfo) {
  if(data.IsSuccess) {
    dao.CompleteHash(data.Hash, data.Result)
  }
}
