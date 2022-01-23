FROM alpine:3.15.0
RUN mkdir /source

COPY ./source/pcre-8.45.tar.gz /source/pcre-8.45.tar.gz

RUN apk add --update alpine-sdk perl linux-headers ca-certificates && update-ca-certificates

#Install pcre
RUN cd /source && \
	tar -zxf pcre-8.45.tar.gz && \
	cd pcre-8.45 && \
	./configure && \
	make && \
	make install 

#Install zlib
RUN cd /source && \ 
	wget http://zlib.net/zlib-1.2.11.tar.gz && \
	tar -zxf zlib-1.2.11.tar.gz && \
	cd zlib-1.2.11 && \
	./configure && \
	make && make install

#Install OpenSSL
# RUN apk add openssl openssl-dev --update
RUN cd /source && \ 
	wget https://www.openssl.org/source/openssl-1.1.1l.tar.gz && \
	tar -zxf openssl-1.1.1l.tar.gz && \
	cd openssl-1.1.1l && \
	./config && \
	# ./Configure darwin64-x86_64-cc --prefix=/usr && \
	make && make install

COPY ./source/echo-nginx-module-0.62 /source/echo-nginx-module-0.62/

#Install nginx
RUN cd /source && \ 
	wget https://nginx.org/download/nginx-1.19.0.tar.gz && \
	tar zxf nginx-1.19.0.tar.gz && \
	cd nginx-1.19.0 && \
	./configure \ 
	--with-debug \
	--with-http_auth_request_module \
	--with-http_addition_module \
	--with-http_degradation_module \
	--with-http_gunzip_module \
	--with-http_gzip_static_module \
	--with-http_realip_module \
	--with-http_secure_link_module \
	--with-http_slice_module \
	--with-http_ssl_module \
	--with-http_stub_status_module \
	--with-http_sub_module \
	--with-stream \
	--with-stream_ssl_module \
	--add-module=/source/echo-nginx-module-0.62 && \
	make && make install

#Send logs to stdout
RUN ln -sf /dev/stdout /usr/local/nginx/logs/access.log \
	&& ln -sf /dev/stderr /usr/local/nginx/logs/error.log

ENTRYPOINT ["/usr/local/nginx/sbin/nginx", "-g", "daemon off;"]