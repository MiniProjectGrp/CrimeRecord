
const express = require('express');
const app = express();

app.set('view engine', 'ejs');
app.use("/styles",express.static(__dirname + "/styles"));

const PORT = 3000;

app.get("/", (req, res) => {
    res.render("index");
});

app.listen(PORT, () => {
    console.log("Crime Record Frontend Server is running on port : " + PORT);
});
