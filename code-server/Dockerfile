FROM codercom/code-server:3.12.0

# RUN sudo apt update && \
# 	sudo apt install -y python && \
# 	sudo apt install -y build-essential && \
# 	sudo apt install -y wget

# Jailkit chroot jail setup
# RUN cd /tmp && sudo wget -O - "http://olivier.sessink.nl/jailkit/jailkit-2.16.tar.gz" | tar xzvf - && \
# 	cd jailkit-* && \
# 	./configure && make && sudo make install && \
# 	sudo groupadd -g 999 tester && \
# 	sudo useradd -r -u 999 -g tester tester && \
# 	sudo jk_init -v -j /jail basicshell code-server && \
# 	sudo jk_jailuser -m -s /bin/sh -j /jail tester && \
# 	sudo jk_cp -v -f /jail /usr/bin/code-server

# Oracle JDK for Apex Language Server
COPY jdk-11.0.12_linux-x64_bin.tar.gz /jdk.tar.gz
RUN tar zxvf /jdk.tar.gz && sudo rm /jdk.tar.gz

# VSCode settings
COPY settings.json /home/coder/User/settings.json

# Ownership of chrooted home directory
# RUN sudo chown -R tester: /jail/home/tester/
# RUN sudo chmod -R u+rwx /jail/home/tester/

# RUN sudo mv /home/coder/jdk-11.0.12 /jail/home/tester

# RUN sudo userdel coder

# USER tester

RUN code-server --force --install-extension salesforce.salesforcedx-vscode

ENTRYPOINT ["code-server", "--bind-addr", "0.0.0.0:80", ".", "--disable-update-check", "-e", "-n", "--auth", "none"]