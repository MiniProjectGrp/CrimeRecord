
const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const stdin = process.stdin;
stdin.setRawMode( true );
stdin.resume();
stdin.setEncoding( 'utf8' );

const app = express();
app.set('view engine', 'ejs');
app.use("/styles", express.static(__dirname + "/styles"));
app.use("/img" ,express.static(__dirname + "/images"));

const PORT = 3000;

const db = new sqlite3.Database( __dirname + "/../CrimeRecord.db", (err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log('Connected to the in-memory SQlite database.');
});

db.serialize(() => {
    db.each(`SELECT Criminal_Id,
                Name,
                Address,
                Phone_no
            FROM Criminal;
            `, (err, row) => {
      if (err) {
        console.error(err.message);
      }
      console.log(row);
    });
});

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/crime", (req, res) => {
    res.render("crime");
});

app.get("/criminal", (req, res) => {
    res.render("criminal");
});

const server = app.listen(PORT, () => {
    console.log("Crime Record Server is running on port : " + PORT);
});

stdin.on( 'data', function( key ){
    if( key == "\u0003" ) {
        server.close((err) => {
            if (err) {
                console.error(err);
            }
            console.log("Crime Record Server is stopped. ");
        });
        db.close((err) => {
            if (err) {
                console.error(err.message);
            }
            console.log('Close the database connection.');
        });
        console.log("Exit");
        process.exit();
    }
    process.stdout.write( key );
});
