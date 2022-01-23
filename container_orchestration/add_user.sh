docker run -it \
	-v /var/run/docker.sock:/var/run/docker.sock \
	-v sf_interviewer_access-list:/data \
	-v ${PWD}/code-server:/code-server \
	-e NAME="$1" \
	-e EMAIL="$2" \
	--rm \
	containerorch