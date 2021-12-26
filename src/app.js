
const express = require('express');
const app = express();

const PORT = 4000;

app.listen(PORT, () => {
    console.log("Crime Record Backend Server is running on port : " + PORT);
});
