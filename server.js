const express = require("express");
const app = express();
const port = 8080;

app.use(express.static("src"));
app.listen(port, function appStarted() {
    console.log(`App listening on port ${port}!`);
});
