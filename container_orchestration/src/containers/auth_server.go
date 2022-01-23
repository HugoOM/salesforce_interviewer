package containers

import (
	"context"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/client"
)

func RestartAuthServerContainer(cli *client.Client, authServerContainer types.Container) error {
	return cli.ContainerRestart(context.Background(), authServerContainer.ID, nil)
}
