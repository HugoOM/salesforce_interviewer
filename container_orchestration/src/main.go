package main

import (
	"context"
	"fmt"
	"os"

	"hugo.dev/container_orchestrator/v2/access"
	"hugo.dev/container_orchestrator/v2/volume"
	"hugo.dev/container_orchestrator/v2/vscode_container"

	"github.com/docker/docker/api/types"
	containerTypes "github.com/docker/docker/api/types/container"
	"github.com/docker/docker/api/types/mount"
	"github.com/docker/docker/api/types/network"
	"github.com/docker/docker/client"
)

type empty struct{}

func main() {
	name, ok := os.LookupEnv("NAME")
	if !ok {
		fmt.Print("CRITICAL - Missing User's Name\n")
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

	fmt.Println("User's ID: ", userId)

	cli, err := client.NewClientWithOpts(client.FromEnv)
	if err != nil {
		panic(err)
	}

	volumeName, _ := volume.CreateVolume(cli, userId)

	_, err = vscode_container.SpawnVscodeContainer(cli, userId)
	if err != nil {
		panic(err)
	}

	var webServerContainer, authServerContainer types.Container

	containers, err := cli.ContainerList(context.Background(), types.ContainerListOptions{})
	if err != nil {
		panic(err)
	}

	for _, container := range containers {
		for _, name := range container.Names {
			if name == "/sf_interviewer-web_server-1" {
				webServerContainer = container
			}
			if name == "/sf_interviewer-auth_server-1" {
				authServerContainer = container
			}
		}
	}

	currWsConfig, err := cli.ContainerInspect(context.Background(), webServerContainer.ID)
	if err != nil {
		panic(err)
	}

	err = cli.ContainerRemove(context.Background(), webServerContainer.ID, types.ContainerRemoveOptions{
		Force:         true,
		RemoveLinks:   false,
		RemoveVolumes: false,
	})
	if err != nil {
		fmt.Println("Web Server Container Removal Error: ", err)
		os.Exit(1)
	}

	var bindMounts []string
	var volumeMounts []mount.Mount

	newVolumeMountPath := fmt.Sprintf("/testers/%s", volumeName)

	volumeMounts = append(
		volumeMounts, mount.Mount{
			Type:     mount.TypeVolume,
			Source:   volumeName,
			Target:   newVolumeMountPath,
			ReadOnly: false,
			VolumeOptions: &mount.VolumeOptions{
				NoCopy: false,
				DriverConfig: &mount.Driver{
					Name: "local",
				},
			},
		},
	)

	for _, mountPoint := range currWsConfig.Mounts {
		switch mountPoint.Type {
		case mount.TypeBind:
			bindMounts = append(bindMounts, fmt.Sprintf("%s:%s", mountPoint.Source, mountPoint.Destination))
		case mount.TypeVolume:
			volumeMounts = append(volumeMounts, mount.Mount{
				Type:     mountPoint.Type,
				Source:   mountPoint.Name,
				Target:   mountPoint.Destination,
				ReadOnly: false,
				VolumeOptions: &mount.VolumeOptions{
					NoCopy: false,
					DriverConfig: &mount.Driver{
						Name: "local",
					},
				},
			})
		}
	}

	wsConfig := WebServerConfig(*currWsConfig.Config)
	wsConfig.addVolume(newVolumeMountPath)
	containerConfig := containerTypes.Config(wsConfig)

	containerCreatedResponse, err := cli.ContainerCreate(
		context.Background(),
		&containerConfig,
		&containerTypes.HostConfig{
			Binds:  bindMounts,
			Mounts: volumeMounts,
		},
		&network.NetworkingConfig{
			EndpointsConfig: currWsConfig.NetworkSettings.Networks,
		},
		nil,
		"sf_interviewer-web_server-1",
	)
	if err != nil {
		panic(err)
	}

	err = cli.ContainerStart(context.Background(), containerCreatedResponse.ID, types.ContainerStartOptions{})
	if err != nil {
		fmt.Println("Start error: ", err)
	}

	err = cli.ContainerRestart(context.Background(), authServerContainer.ID, nil)
	if err != nil {
		fmt.Println("Auth restart error: ", err)
	}

	fmt.Println("Setup Complete for user: ", name)
}

type WebServerConfig containerTypes.Config

func (config *WebServerConfig) addVolume(volumePath string) {
	config.Volumes[volumePath] = empty{}
}
