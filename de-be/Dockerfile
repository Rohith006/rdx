FROM ubuntu:18.04

#variables

RUN mkdir /opt/rest-server
WORKDIR /opt/rest-server
COPY ./ /opt/rest-server/

RUN apt-get update && apt update -y
#RUN apt-get install curl supervisor -y
RUN apt-get install curl -y
#COPY supervisor/ /etc/supervisor/conf.d
RUN apt-get install npm -y
RUN curl -sL https://deb.nodesource.com/setup_13.x |   bash -
RUN apt-get install -y nodejs
RUN npm i pm2 -g
RUN npm i -f
EXPOSE 3000
#CMD ["/usr/bin/supervisord"]
CMD ["pm2-runtime","/opt/rest-server/service-start.yaml"]

