FROM ubuntu:18.04
COPY ./ /tmp/ui

RUN apt update -y
RUN apt install curl lsb-release gnupg2 ca-certificates -y
RUN echo "deb http://nginx.org/packages/ubuntu `lsb_release -cs` nginx"  |  tee /etc/apt/sources.list.d/nginx.list
RUN curl -fsSL https://nginx.org/keys/nginx_signing.key |  apt-key add -
RUN apt-key fingerprint ABF5BD827BD9BF62
RUN apt update -y
RUN apt install  nginx supervisor -y

RUN curl -sL https://deb.nodesource.com/setup_14.x |   bash -
RUN apt-get install -y nodejs

RUN mkdir -p /opt/ui
WORKDIR /tmp/ui
RUN npm i
RUN npm rebuild node-sass
#RUN npm run build
#RUN mv /tmp/ui/dist /opt/ui/
COPY supervisor/ /etc/supervisor/conf.d
#RUN chown -R nginx /opt/ui/dist
RUN rm /etc/nginx/conf.d/default.conf
COPY ./nginx_conf/ui.conf /etc/nginx/conf.d/
COPY docker-entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
#WORKDIR /opt/ui
EXPOSE 8080

CMD ["/entrypoint.sh"]
#CMD ["/usr/bin/supervisord"]
