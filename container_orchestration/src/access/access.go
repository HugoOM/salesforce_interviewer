package access

import (
	"encoding/json"
	"fmt"
	"math/rand"
	"os"
	"strconv"
	"time"
)

type User struct {
	ValidFromEpoch   int64  `json:"validFromEpoch"`
	ExpiresAtEpoch   int64  `json:"expiresAtEpoch"`
	SubmittedAtEpoch int64  `json:"submittedAtEpoch,omitempty"`
	Active           bool   `json:"active"`
	Name             string `json:"name"`
	Email            string `json:"email,omitempty"`
}

var users map[string]User

const filePath = "/data/access.json"

func init() {
	rand.Seed(time.Now().UnixNano())

	readUsersList()
}

func readUsersList() {
	contents, err := os.ReadFile(filePath)
	if err != nil {
		fmt.Println("Couldn't read access / users file")
		os.Exit(1)
	}

	err = json.Unmarshal(contents, &users)
	if err != nil {
		panic(err)
	}
}

func AddUser(name string, email string) (userId string, err error) {
	userId = getRandomizedUserId()

	for _, isPresent := users[userId]; isPresent; _, isPresent = users[userId] {
		userId = getRandomizedUserId()
	}

	users[userId] = User{
		ValidFromEpoch: time.Now().Unix(),
		ExpiresAtEpoch: time.Now().AddDate(0, 0, 5).Unix(),
		Active:         false,
		Name:           name,
		Email:          email,
	}

	usersPrettyJson, err := json.MarshalIndent(users, "", "  ")

	os.WriteFile(filePath, usersPrettyJson, 0777)

	return
}

func getRandomizedUserId() string {
	return strconv.FormatUint(uint64(rand.Uint32()), 10)
}
