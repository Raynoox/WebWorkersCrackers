package dao

import (
	"WebWorkersCrackers/model"
	"fmt"
	"log"
	"time"

	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

func connect() *mgo.Session {
	session, err := mgo.Dial("127.0.0.1:27017")
	if err != nil {
		panic(err)
	}
	session.SetMode(mgo.Monotonic, true)
	return session
}
//GetByType returns all hashes in database
func GetByType(typez string) []model.HashInfo {
	session := connect()
	defer session.Close()
	c := session.DB("rest").C("hashes")
	var results []model.HashInfo
	err := c.Find(bson.M{"type":typez}).All(&results)
	if err != nil {
		panic(err)
	}
	return results
}
//GetHash return hash by type and id
func GetHash(typez string, id string) model.HashInfo {
	session := connect()
	defer session.Close()
	c := session.DB("rest").C("hashes")
	var result model.HashInfo
	fmt.Println(id)
	err := c.Find(bson.M{"_id": bson.ObjectIdHex(id)}).One(&result)
	if err != nil {
		panic(err)
	}
	fmt.Println("xxx", result)
	return result
}
//DeleteHash deletes hash from database
func DeleteHash(id string, typez string) {
	fmt.Printf("delete hash with id %s type %s\n",id, typez)
	session := connect()
	defer session.Close()
	hashes := session.DB("rest").C("hashes")
	var info *mgo.ChangeInfo
	info, err := hashes.RemoveAll(bson.M{"_id": bson.ObjectIdHex(id), "type": typez})
	fmt.Println(info.Removed)
	if err != nil {
		panic(err)
	}
}
//UpdateHash updates hash
func UpdateHash(id string, typez string, newHash model.HashInfo) {
	fmt.Println(typez)
	change := mgo.Change{
		Update: bson.M{"hash": newHash.Hash, "type": typez, "next":newHash.Next, "decoded": newHash.Decoded,"isfinished": newHash.IsFinished},
		ReturnNew: true,
	}
	session := connect()
	defer session.Close()
	hashes := session.DB("rest").C("hashes")
	var foundHash model.HashInfo
	err := hashes.Find(bson.M{"_id": bson.ObjectIdHex(id)}).One(&foundHash)
	if err != nil {
		panic(err)
	}
	info, err2 := hashes.Find(bson.M{"_id": bson.ObjectIdHex(id)}).Apply(change, &foundHash)
	if err2 != nil {
		fmt.Println(info)
		panic(err2)
	}
}
var tokenNumber int
//GenerateToken generates new token
func GenerateToken() string{
	session := connect()
	defer session.Close()
	c := session.DB("rest").C("tokens")
	random := tokenNumber
	tokenNumber = tokenNumber+1
	err := c.Insert(&model.Token{ID: bson.NewObjectId(), Token: fmt.Sprintf("token-%d",random)})
	if err != nil {
		panic(err)
	}
	fmt.Printf("token-%d",random)
	return fmt.Sprintf("token-%d", random)
}
//CheckToken checks if token is valid
func CheckToken(token string) bool{
		session := connect()
		defer session.Close()
		tokens := session.DB("rest").C("tokens")
		var tokenModel model.Token
		err := tokens.Find(bson.M{"token": token}).One(&tokenModel)
		if err != nil {
			return false
		}
		if len(tokenModel.Token) > 0 {
			info, err2 := tokens.RemoveAll(bson.M{"token": token})
			if err2 != nil {
				fmt.Println(info)
				panic(err)
			}
		}
		return len(tokenModel.Token) > 0
}
//AddHash adds hash to database
func AddHash(hash string, typez string) bool{
	session := connect()
	defer session.Close()
	c := session.DB("rest").C("hashes")
	count, err := c.Find(bson.M{"hash": hash,"type": typez}).Count()
	fmt.Println(count)

	if err != nil {
		fmt.Println(err)
		panic(err)
	}
	if count == 0 {
		err = c.Insert(&model.HashInfo{ID: bson.NewObjectId(), Hash: hash, Type: typez, Next: 0})
		if err != nil {
			log.Fatal(err)
		}
		fmt.Println("hash " + hash + " added")
		return true
	}
	fmt.Println("hash already exists")
	return false
}
//GetPool returns pool of iterations for given hash
func GetPool(typez string, id string) []model.HashTable {
	hash := GetHash(typez, id)

	session := connect()
	defer session.Close()
	c := session.DB("rest").C("hashTable")
	var result []model.HashTable
	err := c.Find(bson.M{"hash": hash.Hash, "type": typez}).All(&result)
	if err != nil {
		panic(err)
	}
	return result
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
	fmt.Printf("hash - %s; ID- %s; Next - %d\n", foundHash.Hash, foundHash.ID.String(), foundHash.Next)
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
	Next := foundHash.Next
	return Next
}

//GetHashesFromHashTable gets all information about started cracking process for hash
func GetHashesFromHashTable(hash string, typez string) []model.HashTable {
	session := connect()
	defer session.Close()
	var result []model.HashTable
	hashTable := session.DB("rest").C("hashTable")
	fmt.Printf("looking for hash %s type %s\n", hash, typez)
	err := hashTable.Find(bson.M{"hash": hash, "type": typez}).All(&result)
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
		"hash":             foundHashTable.Hash,
		"type":							foundHashTable.Type,
		"iterationstarted": foundHashTable.IterationStarted,
	}).Apply(change, &foundHashTable)
	if err != nil {
		fmt.Println(info)
		panic(err)
	}
}
//AddHashComputation adds new hash computation to HashTable and updates hash start iteration
func AddHashComputation(hash model.HashInfo) {
	session := connect()
	defer session.Close()
	fmt.Println(hash.Next, hash.Next+100000)
	change := mgo.Change{
			Update: bson.M{"hash": hash.Hash, "type": hash.Type, "next": hash.Next + 100000},
	}
	hashTable := session.DB("rest").C("hashTable")
	hashes := session.DB("rest").C("hashes")
	var hash2 model.HashInfo
	err2 := hashes.Find(bson.M{"_id": hash.ID,"type": hash.Type}).One(&hash2)
	if(err2 != nil) {
		panic(err2)
	}
	hash2.Next = hash2.Next + 100000
	fmt.Println(hash.ID, hash.Type, hash.ID.Hex(), change)
	info, err := hashes.Find(bson.M{"_id": bson.ObjectIdHex(hash.ID.Hex())}).Apply(change, &hash2)
	fmt.Println(info)
	if err != nil {
		fmt.Println(info)
		panic(err)
	}
	err = hashTable.Insert(&model.HashTable{Hash: hash.Hash, Type: hash.Type, IterationStarted: hash.Next, IterationNumber: 100000, Timestamp: time.Now()})
	if err != nil {
		panic(err)
	}
	fmt.Println("ended")
}
//UpdateHash2 updates foundHash with change
func UpdateHash2(change mgo.Change, foundHash model.HashInfo) {
	session := connect()
	defer session.Close()
	iterationStart := foundHash.Next
	hashes := session.DB("rest").C("hashes")
	hashTable := session.DB("rest").C("hashTable")
	info, err := hashes.Find(bson.M{"hash": foundHash.Hash}).Apply(change, &foundHash)
	if err != nil {
		fmt.Println(info)
		panic(err)
	}
	err = hashTable.Insert(&model.HashTable{Hash: foundHash.Hash, IterationStarted: iterationStart, IterationNumber: 100000, Timestamp: time.Now()})
	if err != nil {
		panic(err)
	}
}
//DeleteHashTable delets calculation entry in db
func DeleteHashTable(hash string, typez string, iterationStart int) {

  fmt.Printf("delete hashTable hash %s iteration%d\n",hash, iterationStart)

  session := connect()
  defer session.Close()
  hashTable := session.DB("rest").C("hashTable")
  info, err := hashTable.RemoveAll(bson.M{"hash": hash, "type": typez, "iterationstarted": iterationStart})
  fmt.Println(info.Removed)
  if err != nil {
    panic(err)
  }
}
//CompleteHash sets decoded hash and finished so it will stop calculating
func CompleteHash(id string, typez string, decoded string) {
	fmt.Println("complete ")
	fmt.Println(decoded)
	fmt.Println(id)

	foundHash := GetHash(typez, id)
	change := mgo.Change{
    Update:    bson.M{"decoded": decoded, "isfinished": true, "hash": foundHash.Hash, "type": typez},
		ReturnNew: true,
  }
	session := connect()
	defer session.Close()
	hashes := session.DB("rest").C("hashes")
	info, err2 := hashes.Find(bson.M{"_id": bson.ObjectIdHex(id)}).Apply(change, &foundHash)
	fmt.Println(foundHash)
	if err2 != nil {
		fmt.Println(info)
		panic(err2)
	}
	info2 := hashes.Find(bson.M{"_id": bson.ObjectIdHex(id)}).One(&foundHash)
	fmt.Println(foundHash, info2)

}

//DeleteHashTableForHash deletes every hash table for given hash and type
func DeleteHashTableForHash(hash string, typez string) {
	session := connect()
  defer session.Close()
  hashTable := session.DB("rest").C("hashTable")
  info, err := hashTable.RemoveAll(bson.M{"hash": hash, "type": typez})
	if err != nil {
		fmt.Println(info)
		panic(err)
	}
}
