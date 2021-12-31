
const express = require('express');
const app = express();

app.set('view engine', 'ejs');
app.use("/styles", express.static(__dirname + "/styles"));
app.use("/img" ,express.static(__dirname + "/images"));

const PORT = 3000;

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/crime", (req, res) => {
    res.render("crime");
});

app.get("/criminal", (req, res) => {
    res.render("criminal");
});

app.listen(PORT, () => {
    console.log("Crime Record Server is running on port : " + PORT);
});
