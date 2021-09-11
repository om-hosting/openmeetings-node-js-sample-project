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
      // @ts-ignore
      message: value.data.serviceResult.message,
      // @ts-ignore
      type: value.data.serviceResult.type
    };
  }).catch(error => {
    console.log(error);
    return {
      message: 'Server Error',
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
      // @ts-ignore
      message: value.data.serviceResult.message,
      // @ts-ignore
      type: value.data.serviceResult.type
    };
  }).catch(error => {
    console.log(error.message);
    return {
      message: 'Server Error',
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
