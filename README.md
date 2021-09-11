## Sample project for OpenMeetings API using JavaScript ES6

This project illustrates how to use the https://www.npmjs.com/package/openmeetings-node-client 
In order to integrate with https://openmeetings.apache.org/

This project is using JavaScript/ES6 and exposes an API using the Express Framework.

If you looking for the TypeScript version see: https://github.com/om-hosting/openmeetings-node-sample-project

## Running this project

```bash
npm run start
```

Open a browser and go to http://localhost:3000

If you host user/password are correct it will display
```json
Login result: {"serviceResult":{"message":"4835c9c5-1b58-491b-9bee-903879c96048","type":"SUCCESS"}}
```

To configure the WebService hostname and login/password modify:
```typescript
const config: Configuration = new Configuration({
    basePath: "http://localhost:5080/openmeetings/services"
})

//and later
const { data } = await userService.login("admin", "!HansHans")
```
See /src/app.ts

## Sample project code

Install the library:
```bash
npm install openmeetings-node-client
```

In your project JavaScript/ES6 file, eg assuming you are using the Express framework:
```javascript
const express = require("express");
const {UserServiceApi, Configuration} = require("openmeetings-node-client");
const app = express();
const port = 3000;

const BASE_URL = "http://localhost:5080/openmeetings"

const config = new Configuration({
    basePath: BASE_URL + "/services"
})

app.get('/', async (req, res) => {
    const userService = new UserServiceApi(config);
    // *****************
    // 1. Login to service
    const loginResult = await userService.login("admin", "!HansHans").then(value => {
        return {
            message: value.data.serviceResult.message,
            type: value.data.serviceResult.type
        };
    }).catch(error => {
        return {
            message: error.message,
            type: 'ERROR'
        };
    });
    if (loginResult.type !== 'SUCCESS') {
        res.send('Login failed, result: ' + JSON.stringify(loginResult))
        return
    }
    // *****************
    // 2. Generate Hash for entering a conference room
    const sessionId = loginResult.message;

    const hashResult = await userService.getRoomHash(sessionId, {
        firstname: "John",
        lastname: "Doe",
        externalId: "uniqueId1",
        externalType: "myCMS",
        login: "john.doe",
        email: "john.doe@gmail.com"
    }, {
        roomId: 1,
        moderator: true
    }).then(value => {
        return {
            message: value.data.serviceResult.message,
            type: value.data.serviceResult.type
        };
    }).catch(error => {
        return {
            message: error.message,
            type: 'ERROR'
        };
    });
    console.log("hashResult", hashResult);
    if (hashResult.type === "SUCCESS") {
        // *****************
        // 3. Construct Login URL
        const loginUrl = `${BASE_URL}/hash?secure=${hashResult.message}`
        res.send(`Click URL to login <a href="${loginUrl}">${loginUrl}`)
    } else {
        res.send("Error executing call" + hashResult.message)
    }
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
})
```

See also the code in /src/app.ts
