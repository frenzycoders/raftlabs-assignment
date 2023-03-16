# Api Docs
- Api: [https://documenter.getpostman.com/view/11583515/2s93JxqLLh](https://documenter.getpostman.com/view/11583515/2s93JxqLLh)
- video walkthrough: 



## Setup

This project requires [Node.js](https://nodejs.org/) v10+ to run.

Install the dependencies and devDependencies and start the server.
```sh
sudo docker-compose docker-compose.yml -d
```

```sh
cd raftlabs-assignment
npm i && npm i -D
npm run dev
```

For production environments...

```sh
npm run start
```
or run 
```sh
pm2 start pm2.json
```

if you run command with pm2 start pm2.json then you can see logs using pm2 logs

