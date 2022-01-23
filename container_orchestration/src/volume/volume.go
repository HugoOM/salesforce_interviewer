package volume

import (
	"context"
	"fmt"
	"os"

	"github.com/docker/docker/api/types"
	containerTypes "github.com/docker/docker/api/types/container"
	"github.com/docker/docker/api/types/mount"
	volumeTypes "github.com/docker/docker/api/types/volume"
	"github.com/docker/docker/client"
)

func CreateVolume(cli *client.Client, userId string) (string, error) {
	volume, err := cli.VolumeCreate(context.Background(), volumeTypes.VolumeCreateBody{
		Driver: "local",
		Name:   userId,
		Labels: map[string]string{
			"com.docker.compose.project": "sf_interviewer",
			"com.docker.compose.volume":  userId,
		},
		DriverOpts: nil,
	})
	if err != nil {
		fmt.Println("An error occured creating volume: ", err)
		os.Exit(1)
	}

	r, err := cli.ContainerCreate(
		context.Background(),
		&containerTypes.Config{
			Image: "sf_interviewer_setup",
			Volumes: map[string]struct{}{
				"/source":   {},
				"/mnt/dest": {},
			},
			Labels: map[string]string{
				"com.docker.compose.project": "sf_interviewer",
			},
		},
		&containerTypes.HostConfig{
			Mounts: []mount.Mount{
				{
					Type:     mount.TypeVolume,
					Source:   volume.Name,
					Target:   "/mnt/dest",
					ReadOnly: false,
					VolumeOptions: &mount.VolumeOptions{
						NoCopy: false,
						DriverConfig: &mount.Driver{
							Name: "local",
						},
					},
				},
				{
					Type:     mount.TypeVolume,
					Source:   "sf_interviewer_exercises-source",
					Target:   "/source",
					ReadOnly: false,
					VolumeOptions: &mount.VolumeOptions{
						NoCopy: false,
						DriverConfig: &mount.Driver{
							Name: "local",
						},
					},
				},
			},
		},
		nil,
		nil,
		fmt.Sprint("setup-", userId),
	)
	if err != nil {
		panic(err)
	}

	err = cli.ContainerStart(context.Background(), r.ID, types.ContainerStartOptions{})
	if err != nil {
		panic(err)
	}

	return volume.Name, nil
}
