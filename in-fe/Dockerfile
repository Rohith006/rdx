FROM ubuntu:18.04 AS build
RUN apt-get update -yq && apt-get upgrade -yq
RUN apt-get install build-essential curl  -y
RUN apt-get install python3.7 -y
RUN ln -s /usr/bin/python3.7 /usr/bin/python 
RUN curl -sL https://deb.nodesource.com/setup_14.x  | bash -
RUN apt-get -y install nodejs
RUN npm install -g npm@8.6.0
RUN node --version
RUN npm --version
RUN npm install -g node-gyp

# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# install app dependencies
COPY package.json ./
COPY package-lock.json ./
RUN npm install --legacy-peer-deps
#--silent
# RUN npm install react-scripts@5.0.0 -g --silent

# add app
COPY . ./

# start app
# CMD ["npm", "start"]
RUN npm run build

FROM nginx:1.15
COPY --from=build /app/build/ /usr/share/nginx/html
# Copy the default nginx.conf provided by tiangolo/node-frontend
COPY --from=build /app/nginx/conf/conf.d/*.conf /etc/nginx/conf.d/




# FROM node:14.17.0-alpine as build
# WORKDIR /app
# ENV PATH /app/node_modules/.bin:$PATH

# COPY package.json ./
# COPY yarn.lock ./
# COPY src ./src
# COPY public ./public
# COPY src/config.prod.js ./src/config.js

# RUN yarn install --network-timeout 180000
# COPY . ./
# RUN yarn build

# # Production environment
# FROM nginx:stable-alpine
# RUN rm -rf /etc/nginx/conf.d
# COPY nginx/conf /etc/nginx

# # Static build
# COPY --from=build /app/build /usr/share/nginx/html

# # Copy .env file and shell script to container
# WORKDIR /usr/share/nginx/html
# COPY ./env.sh .
# COPY .env .

# # Make our shell script executable
# RUN chmod +x env.sh

# # Add bash
# RUN apk add --no-cache bash

# RUN ls -l /usr/share/nginx/html

# EXPOSE 80

# CMD ["/bin/bash", "-c", "/usr/share/nginx/html/env.sh && nginx -g \"daemon off;\""]
