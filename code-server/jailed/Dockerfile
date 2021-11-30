FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt update && apt install curl wget build-essential python2 systemctl ca-certificates -y --no-install-recommends

RUN curl -fOL https://github.com/cdr/code-server/releases/download/v3.12.0/code-server_3.12.0_amd64.deb && \
	dpkg -i /code-server_3.12.0_amd64.deb

# Install Jailkit
RUN ln -s /usr/bin/python2 /usr/bin/python && \
	cd /tmp && wget -O - "http://olivier.sessink.nl/jailkit/jailkit-2.16.tar.gz" | tar xzvf - && \
	cd jailkit-* && \
	./configure && make && make install

# Setup Jail
RUN groupadd -g 999 tester && \
	useradd -m -r -u 999 -g tester tester && \
	jk_init -v -j /jail basicshell && \
	jk_jailuser -m -s /bin/sh -j /jail tester && \
	jk_cp -k -v /jail code-server

# Oracle JDK for Apex Language Server
COPY jdk-11.0.12_linux-x64_bin.tar.gz /jdk.tar.gz
RUN tar zxvf /jdk.tar.gz && rm /jdk.tar.gz
RUN mv -f jdk-11.0.12 /jail/home/tester

# VSCode settings
COPY settings.json /jail/home/tester/User/settings.json

# Ownership of chrooted home directory
RUN chown -R tester: /jail/home/tester

RUN systemctl enable --now code-server@$tester

USER tester

RUN code-server --force --install-extension salesforce.salesforcedx-vscode --extensions-dir /jail/home/tester/extensions

ENTRYPOINT ["/jail/usr/bin/code-server", "--bind-addr", "0.0.0.0:80", ".", "--user-data-dir", "/jail/home/tester", "--disable-update-check", "-e", "-n", "--extensions-dir", "/jail/home/tester/extensions", "--auth", "none"]