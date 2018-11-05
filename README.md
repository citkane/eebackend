# Backend technical challenge for Electricity Exchange
## Assumptions
**Operating environment:**

Built and tested with;
* Ubuntu 18.04
* mySql Ver 14.14 Distrib 5.7.24
* Node v8.12.0
* NPM 6.4.1

**RPC command line interface**

Not tested for multiple parallel connections. May have unexpected results if used this way.

**Database**

Only tested for localhost install and connection.

## How to install ##
```
mkdir <yourdirectory>
cd <yourdirectory>
git clone https://github.com/citkane/eebackend.git ./
npm install
```
Create an empty mySql database and give a user all privileges on it, then:
```
npm run install
```
Follow the console prompts to provide database connection details.
## How to use ##
Start the application server with one of the following:
```
npm run production
npm run development
```
An interface for the application is available with:
```
npm run cli
```
A production instance will release the console. To stop the process, do:
```
npm run stop
```
Logs are at:
```
<yourdirectory>/logs/...
```
## Testing ##
Run tests with:
```
npm run test
```


