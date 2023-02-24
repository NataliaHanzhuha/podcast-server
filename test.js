const express = require('express');
const bodyParser = require('body-parser')
const port = 4000;
const paths = require("./router");
const app = express();

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use('/',paths)

app.listen(port, () => {
  console.log('app started...')
})