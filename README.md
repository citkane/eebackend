# Backend technical challenge for Electricity Exchange
## Assumptions
**Operating environment:**

Built and tested with;
* Ubuntu 22.04
* mySql Ver 8.0.29
* Node v10.24.1
* NPM 6.14.12

**RPC command line interface**

Not tested for multiple parallel connections. May have unexpected results if used this way.

**Database**

Only tested for localhost install and connection.

## How to install ##
```
mkdir <yourdirectory>
cd <yourdirectory>
git clone https://github.com/citkane/eebackend.git ./
```
Create an empty mySql database and give a user all privileges on it, then:
```
npm install
```
Follow the console prompts to provide and save database connection details.
## How to use ##
Start the application server with one of the following:
```
npm run production
npm run development
```
A production instance will release the console. To stop the process, do:
```
npm run stop
```
An RPC interface for the application is available with:
```
npm run cli
```
Possible commands are:
```
help   : this info
q      : quit the command line console
make   : make a site or DSU
move   : move a site to a different DSU
delete : delete a site or DSU
report : write the active state of the network to a file
list   : list all sites or DSUs to the console
```
Logs are at:
```
<yourdirectory>/logs/...
```
## Testing ##
Run tests with:
```
npm test
```


