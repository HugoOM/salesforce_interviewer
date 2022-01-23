package containers

import (
	"context"
	"fmt"

	"github.com/docker/docker/api/types"
	containerTypes "github.com/docker/docker/api/types/container"
	"github.com/docker/docker/api/types/mount"
	"github.com/docker/docker/api/types/network"
	"github.com/docker/docker/client"
)

func ReplaceWebServerContainer(
	cli *client.Client,
	webServerContainer types.Container,
	volumeName string,
) error {
	currentWebServerConfig, err := cli.ContainerInspect(context.Background(), webServerContainer.ID)
	if err != nil {
		return err
	}

	err = cli.ContainerRemove(context.Background(), webServerContainer.ID, types.ContainerRemoveOptions{
		Force:         true,
		RemoveLinks:   false,
		RemoveVolumes: false,
	})
	if err != nil {
		return err
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

	for _, mountPoint := range currentWebServerConfig.Mounts {
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

	wsConfig := WebServerConfig(*currentWebServerConfig.Config)
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
			EndpointsConfig: currentWebServerConfig.NetworkSettings.Networks,
		},
		nil,
		"sf_interviewer-web_server-1",
	)
	if err != nil {
		return err
	}

	err = cli.ContainerStart(context.Background(), containerCreatedResponse.ID, types.ContainerStartOptions{})

	return err
}
