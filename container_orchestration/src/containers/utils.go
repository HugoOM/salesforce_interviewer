package containers

import (
	"context"

	"github.com/docker/docker/api/types"
	containerTypes "github.com/docker/docker/api/types/container"
	"github.com/docker/docker/client"
)

type empty struct{}

type WebServerConfig containerTypes.Config

func (config *WebServerConfig) addVolume(volumePath string) {
	config.Volumes[volumePath] = empty{}
}

func GetWebAndAuthContainers(cli *client.Client) (webContainer types.Container, authContainer types.Container) {
	var containersByName map[string]types.Container = make(map[string]types.Container)

	containers, err := cli.ContainerList(context.Background(), types.ContainerListOptions{All: false})
	if err != nil {
		panic(err)
	}

	for _, container := range containers {
		for _, name := range container.Names {
			containersByName[name] = container
		}
	}

	webContainer, ok := containersByName["/sf_interviewer-web_server-1"]
	if !ok {
		panic("Web Server Container not found!")
	}

	authContainer, ok = containersByName["/sf_interviewer-auth_server-1"]
	if !ok {
		panic("Auth Server Container not found!")
	}

	return
}
