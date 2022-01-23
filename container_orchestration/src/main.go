package main

import (
	"fmt"
	"os"

	"hugo.dev/container_orchestrator/v2/access"
	"hugo.dev/container_orchestrator/v2/containers"
	"hugo.dev/container_orchestrator/v2/volume"

	"github.com/docker/docker/client"
)

func main() {
	name, ok := os.LookupEnv("NAME")
	if !ok {
		fmt.Print("CRITICAL - Missing User's Name (Environment Key: NAME)\n")
		os.Exit(1)
	}

	email, ok := os.LookupEnv("EMAIL")
	if !ok {
		email = ""
	}

	userId, err := access.AddUser(name, email)
	if err != nil {
		panic(err)
	}

	cli, err := client.NewClientWithOpts(client.FromEnv)
	if err != nil {
		panic(err)
	}

	volumeName, _ := volume.CreateVolume(cli, userId)

	_, err = containers.SpawnVscodeContainer(cli, userId)
	if err != nil {
		panic(err)
	}

	webServerContainer, authServerContainer := containers.GetWebAndAuthContainers(cli)

	err = containers.ReplaceWebServerContainer(cli, webServerContainer, volumeName)
	if err != nil {
		panic(err)
	}

	err = containers.RestartAuthServerContainer(cli, authServerContainer)
	if err != nil {
		panic(err)
	}

	fmt.Println("Setup Complete for user: ", name, "with ID: ", userId)
}
