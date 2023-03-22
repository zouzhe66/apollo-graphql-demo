# apollo-graphql-demo

include：server / clients / gateway / cache / subscription / pagination

step 1. install

```
npm install
```

step2. install clients & servers package

```
npm run pre-install
```

step 3. start all sub services(sub graphs)

- book: http://localhost:4001/graphql
- user: http://localhost:4002/graphql

```
npm run start-sub-services
```

step 4. start gateway(super graph) & start clients (

- gateway: http://localhost:4000/graphql
- vue-client:http://localhost:3000
- react-client:http://localhost:3001

```
 npm run start
```
