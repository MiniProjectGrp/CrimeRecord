
// importing all the required modules.
// express is used for hosting the server.
// sqlite3 is database driver.
// sqlite is wraper for the db driver.
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const open = require('sqlite').open;

const stdin = process.stdin;
stdin.setRawMode( true );
stdin.resume();
stdin.setEncoding( 'utf8' );

// creating express app and connecting all the static files to express to server to the clients.
// and setting up the templeting engine (ejs).
const app = express();
app.set('view engine', 'ejs');
app.use("/styles", express.static(__dirname + "/styles"));
app.use("/img" ,express.static(__dirname + "/images"));

// decleraing the port number for serving.
const PORT = 3000;

// async function to open the database.
async function openDb () {
    return open({
      filename: __dirname + "/../CrimeRecord.db",
      driver: sqlite3.Database
    });
}

// async function to get the data from database.
async function getData (sqlQuery) {
    const db = await openDb();
    const data = await db.all(sqlQuery);
    db.close();
    return data;
}

// getData(`select * from crime;`).then((data) => {
//     console.log(data);
// });

// home route / index page.
app.get("/", (req, res) => {
    res.render("index");
});

// crime route / page.
app.get("/crime", (req, res) => {
    res.render("crime");
});

// crime route / page.
app.get("/criminal", (req, res) => {
    res.render("criminal");
});

// opening the express app and allowing clients to connect to the server on given port.
const server = app.listen(PORT, () => {
    console.log("Crime Record Server is running on port : " + PORT);
});

// function call to take inputs from cmd.
// it is setup such a way that pressing ctr+c will close the express server.
stdin.on( 'data', function( key ){
    if( key == "\u0003" ) {
        server.close((err) => {
            if (err) {
                console.error(err);
            }
            console.log("Crime Record Server is stopped. ");
        });
        console.log("Exit");
        process.exit();
    }
    process.stdout.write( key );
});
