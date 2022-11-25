DSP REST server Readme
======

### Prerequisites

- [NodeJS 10++](https://nodejs.org/uk/)

 
### Startup/Installation sequence

- `npm i`
- `node server.js`

### Clickhouse installation details

##### install:
 - `sudo apt-key adv --keyserver keyserver.ubuntu.com --recv E0C56BD4`
 - `echo "deb http://repo.yandex.ru/clickhouse/deb/stable/ main/" | sudo tee /etc/apt/sources.list.d/clickhouse.list`
 - `sudo apt-get update`
 - `sudo apt-get install -y clickhouse-server clickhouse-client`
 - `sudo service clickhouse-server start`

### Postgresql installation details

#### 1) install
 - `sudo apt-get update`
 - `sudo apt-get install postgresql postgresql-contrib`
 
### MonogDB installation details

#### 1) install mongoDB:

 - To install the latest stable version of MongoDB:
  ```
  sudo apt-get install -y mongodb
  ```
 - To check the service's status: 
 ```
 sudo systemctl status mongodb
 ```
 
 Also instead of **status** we can use such commands: **stop**, **start**, **restart**
 
 - Start using MongoDB: 
 ```
 mongo
 ```
 - Create database: 
 ```
 use dspActivityLogs
 ```

### Migration DB:
 - `cd src/`
 
 dev:
 - create migration: `../node_modules/.bin/sequelize migration:generate --name NAME`
 - db migrate: `../node_modules/.bin/sequelize db:migrate`
 - revert migration: `../node_modules/.bin/sequelize db:migrate:undo`
 
 host ec2-55
 - `../node_modules/.bin/sequelize db:migrate --env test`

### Create new table:
 - `../node_modules/.bin/sequelize model:generate --name NAME --attributes firstName:string,lastName:string,email:string`
 
### Use es6:
 - npm install babel-cli -g 
 - `babel-node ../node_modules/..`
 
### Fix hot reload:
 - sudo -H /bin/bash
 - cd /etc/
 - nano sysctl.conf
 - Write into file fs.inotify.max_user_watches = 524288
 - close and save changes
 - sudo sysctl -p --system
 - reload IDE

#### doc: 
http://docs.sequelizejs.com/manual/tutorial/migrations.html#migrations
