package service
import (
  "WebWorkersCrackers/dao"
  "gopkg.in/mgo.v2"
  "gopkg.in/mgo.v2/bson"
  "fmt"
  "time"
  "WebWorkersCrackers/model"
  "crypto/md5"
)
//GetNextIteration returns next iteration for hash to crack
func GetNextIteration(typez string, id string) int {
  hash := dao.GetHash(typez, id)
  pendingHashes := dao.GetHashesFromHashTable(hash.Hash, typez)
  fmt.Println(len(pendingHashes))
  for index, pending := range pendingHashes {
    if time.Since(pending.Timestamp).Seconds() > 10.0 {
      change := mgo.Change{
        Update: bson.M{
          "hash": pending.Hash,
          "type": pending.Type,
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
  fmt.Println(hash)
  nextIteration := hash.Next
  fmt.Printf("Im gonna return - %d\n", nextIteration)
  dao.AddHashComputation(hash)
  return nextIteration
}
//GetHashToCrack gets next iteration for hash to crack
func GetHashToCrack(hash string) int {
  hash2 := dao.GetHash(hash, hash)

  pendingHashes := dao.GetHashesFromHashTable(hash2.Hash, hash2.Type)
  fmt.Println("pending", len(pendingHashes))
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
  nextIteration := foundHash.Next
  fmt.Printf("Im gonna return - %d\n", foundHash.Next)
  if len(foundHash.Hash) > 0 {
    change := mgo.Change{
      Update:    bson.M{"hash": foundHash.Hash, "next": nextIteration + GetConfiguration().Iterations},
      ReturnNew: true,
    }
    fmt.Println(change)
    //dao.UpdateHash(change, foundHash)
  }
  return nextIteration
}
//RegisterCrackCompletion registers sequence completition
func RegisterCrackCompletion(data model.FinishInfo, id string, typez string) {
  complete(data, id, typez)
}

func complete( data model.FinishInfo, id string, typez string) {
  if(data.IsSuccess && isResultCorrect(data, id , typez)) { // && Algorithm(hash) == result
    dao.CompleteHash(id, typez, data.Result)
    dao.DeleteHashTableForHash(data.Hash, data.Algorithm)
  } else {
    if dao.GetHash(typez, id).IsFinished == true {
      fmt.Println("already finished")
    } else {
      dao.DeleteHashTable(data.Hash, typez, data.IterationStart)
    }
  }
}
func isResultCorrect(data model.FinishInfo, id string, typez string) bool {
  hash := dao.GetHash(typez, id)
  return hash.Hash == fmt.Sprintf("%x",md5.Sum([]byte(data.Result)))
}
