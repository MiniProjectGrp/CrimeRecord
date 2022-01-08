
// importing all the required modules.
// express is used for hosting the server.
// sqlite3 is database driver.
// sqlite is wraper for the db driver.
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const open = require('sqlite').open;

const stdin = process.stdin;
// stdin.setRawMode( true );
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
    getData(`SELECT CR.CRN, CR.location, CR.type_of_crime, CR.date_of_crime, F.fir_id, count(C.name) as Criminal_Count
    FROM Criminal C, Crime CR, Crime_Committed CC, FIR F
    WHERE CC.Criminal_id = C.Criminal_id
    AND CR.CRN = CC.CRN
    AND CR.fir_id = F.fir_id
    group by CR.CRN;`).then((crimes) => {
        res.render("crime", {crimes});
    });
});

// criminal route / page.
app.get("/criminal", (req, res) => {
    getData(`SELECT C.Criminal_id, C.name, C.address, C.Phone_no, count(CR.CRN) as Crime_Count
    FROM Criminal C, Crime CR, Crime_Committed CC, FIR F
    WHERE CC.Criminal_id = C.Criminal_id
    AND CR.CRN = CC.CRN
    AND CR.fir_id = F.fir_id
    group by CC.Criminal_id;`).then((criminals) => {
        res.render("criminal", {criminals});
    });
});

// fir route / page.
app.get("/fir", (req, res) => {
    getData(`SELECT F.fir_id, CR.CRN, F.witness_name, F.area_code, F.Date_of_filing, Count(CC.Criminal_id) as Criminal_Count
    FROM Crime CR, Crime_Committed CC, FIR F
    WHERE CR.CRN = CC.CRN
    AND CR.fir_id = F.fir_id
    group by CR.CRN;`).then((Firs) => {
        res.render("fir", {Firs});
    });
});

// verdict route / page.
app.get("/verdict", (req, res) => {
    getData(`SELECT CR.CRN, CR.FIR_id, CA.Court_id, CA.Verdict, CA.Verdict_date
    FROM Crime_Archive CA, Crime CR
    WHERE CA.CRN = CR.CRN;`).then((Verdicts) => {
        res.render("verdict", {Verdicts});
    });
});

// appelas route / page.
app.get("/appelas", (req, res) => {
    getData(`SELECT * FROM Appeals;`).then((Appelas) => {
        res.render("appeals", {Appelas});
    });
});

// res.send("<h1>WAIT IDIOT, IM CODING THAT PAGE</h1>");

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
