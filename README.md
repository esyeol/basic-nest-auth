## NestJS BoilerPlate 

- Yarn
- Node 20.xx


### DB Container 

- mariadb 10.6.16 

</br>

> Setup Log

```bash
$ docker-compose up  # start docker container
$ docker-compose down # kill docker container
```

<hr></hr>

### Package 

- Hot Reload Module
- TypeORM(mysql)
- class-validator
- class-transformer
- nest config
- jwt 
- bcrypt
- throttler
- csurf 
- helmet
- hpp

> Install Log

```bash 
$ yarn add --save-dev webpack-node-externals run-script-webpack-plugin webpack # hot-reload-module 
$ yarn add @nestjs/typeorm typeorm mysql2 # typeorm & mysql2 
$ yarn add class-validator class-transformer # class validator - transformer
$ yarn add @nestjs/config # nest config 
$ yarn add @nestjs/jwt bcrypt # jwt & bcrpyt module 
$ yarn add @nestjs/throttler # rate-limit module
$ yarn add helmet # helmet 
$ yarn add @types/csurf csurf # csurf
$ yarn add @types/hpp hpp # hpp

```

<hr></hr>

### How to start 

> setup

```bash 
$ git clone project # clone this project
$ cd nest-plate
$ yarn 
```


</br>

> start 

```bash
$ docker-compose up 
$ yarn start:dev # start development mode 
$ yarn start:hot # start development mode with hot reload module 
```

</br>

> product

```bash 
$ yarn build 
$ yarn start:deploy # run pm2 ecosystem
```
