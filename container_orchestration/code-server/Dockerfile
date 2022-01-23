FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

USER 0

RUN apt update && apt install curl wget build-essential python2 systemctl ca-certificates -y --no-install-recommends

RUN curl -fOL https://github.com/cdr/code-server/releases/download/v3.12.0/code-server_3.12.0_amd64.deb && \
	dpkg -i /code-server_3.12.0_amd64.deb

# Install Jailkit
RUN ln -s /usr/bin/python2 /usr/bin/python && \
	cd /tmp && wget -O - "http://olivier.sessink.nl/jailkit/jailkit-2.16.tar.gz" | tar xzvf - && \
	cd jailkit-* && \
	./configure && make && make install

# Setup Jail
RUN mkdir /home/jail && \
	chown root:root /home/jail && \
	chmod 0755 /home/jail && \ 
	groupadd -g 999 tester && \
	useradd -m -r -u 999 -g tester tester && \
	jk_init -v -j /home/jail basicshell && \
	jk_jailuser -m -s /bin/sh -j /home/jail tester && \
	jk_cp -k -v /home/jail code-server 
# jk_cp -k -v /home/jail /usr/lib/code-server/lib/node


# Oracle JDK for Apex Language Server
COPY jdk-11.0.12_linux-x64_bin.tar.gz /jdk.tar.gz
RUN tar zxvf /jdk.tar.gz && rm /jdk.tar.gz
RUN mv -f jdk-11.0.12 /home/jail/home/tester

# VSCode settings
COPY settings.json /home/jail/home/tester/User/settings.json

# Ownership of chrooted home directory
RUN chown -R tester: /home/jail/home/tester

# RUN systemctl enable --now code-server@$tester

# USER tester
USER 999:999

WORKDIR /home/jail/home/tester

RUN code-server --force --install-extension salesforce.salesforcedx-vscode --extensions-dir ./extensions

ENTRYPOINT ["/home/jail/bin/code-server", "--bind-addr", "0.0.0.0:80", ".", "--user-data-dir", ".", "--disable-update-check", "-e", "-n", "--extensions-dir", "./extensions", "--auth", "none"]