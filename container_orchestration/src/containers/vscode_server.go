package containers

import (
	"bufio"
	"context"
	"fmt"

	"github.com/docker/docker/api/types"
	containerTypes "github.com/docker/docker/api/types/container"
	"github.com/docker/docker/api/types/mount"
	"github.com/docker/docker/api/types/network"
	"github.com/docker/docker/client"
	"github.com/docker/docker/pkg/archive"
	"github.com/docker/go-connections/nat"
)

func SpawnVscodeContainer(cli *client.Client, userId string) (containerId string, err error) {
	checkOrGenerateImage(cli)

	containerInfo, err := cli.ContainerCreate(
		context.Background(),
		&containerTypes.Config{
			Image: "sf_interviewer_vscode",
			User:  "999",
			ExposedPorts: nat.PortSet{
				"80/tcp": {},
			},
			Volumes: map[string]struct{}{
				"/home/jail/home/tester/exercises": {},
			},
			Labels: map[string]string{
				"com.docker.compose.project": "sf_interviewer",
			},
		},
		&containerTypes.HostConfig{
			Mounts: []mount.Mount{
				{
					Type:     mount.TypeVolume,
					Source:   userId,
					Target:   "/home/jail/home/tester/exercises",
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
		&network.NetworkingConfig{
			EndpointsConfig: map[string]*network.EndpointSettings{
				"sf_interviewer_isolate": {
					Aliases: []string{
						fmt.Sprintf("vscode_%s", userId),
					},
				},
			},
		},
		nil,
		fmt.Sprintf("sf_interviewer-vscode-%s", userId),
	)

	cli.ContainerStart(context.Background(), containerInfo.ID, types.ContainerStartOptions{})

	containerId = containerInfo.ID

	return
}

func checkOrGenerateImage(cli *client.Client) {
	images, err := cli.ImageList(context.Background(), types.ImageListOptions{})
	if err != nil {
		panic(err)
	}

	var isVsCodeServerImagePresent bool

	for _, image := range images {
		for _, tag := range image.RepoTags {
			if tag == "sf_interviewer_vscode:latest" {
				isVsCodeServerImagePresent = true
				break
			}
		}
	}

	if isVsCodeServerImagePresent {
		return
	}

	fmt.Println("VSCode image not found - Building from source ... (This may take a while)")

	tar, err := archive.TarWithOptions("/code-server", &archive.TarOptions{})
	if err != nil {
		panic(err)
	}

	r, err := cli.ImageBuild(
		context.Background(),
		tar,
		types.ImageBuildOptions{
			Tags:       []string{"sf_interviewer_vscode:latest"},
			Remove:     false,
			Dockerfile: "Dockerfile",
		},
	)
	if err != nil {
		panic(err)
	}

	defer r.Body.Close()

	var lastLine string

	scanner := bufio.NewScanner(r.Body)
	for scanner.Scan() {
		lastLine = scanner.Text()
	}

	if err := scanner.Err(); err != nil {
		panic(err)
	}

	fmt.Println("End of build output: ", lastLine)
}
