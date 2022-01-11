
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

app.get("/crime/:cid", (req, res) => {
    getData(`SELECT CR.CRN, CR.location, C.name, C.Criminal_id, F.FIR_id, F.Summary, CA.Verdict_date, CA.Verdict
    FROM Criminal C, Crime CR, Crime_Committed CC, FIR F, Crime_Archive CA
    WHERE CC.Criminal_id = C.Criminal_id
    AND CR.CRN = CC.CRN
    AND CR.fir_id = F.fir_id
    AND CA.CRN = CR.CRN
    AND CR.CRN ='` + req.params.cid + `';`).then((crime) => {
        if (crime.length == 0) {
            res.render("404Page");
            return;
        }
        let crimeData = {};
        crimeData["CRN"] = crime[0].CRN;
        crimeData["Location"] = crime[0].Location;
        crimeData["Verdict_date"] = crime[0].Verdict_date;
        crimeData["Verdict"] = crime[0].Verdict;
        crimeData["Fir_id"] = crime[0].Fir_id;
        crimeData["Fir_summary"] = crime[0].Summary;
        crimeData["criminals"] = [];
        crime.forEach((c) => {
            crimeData["criminals"].push({"CriminalId" : c.Criminal_Id, "name" : c.Name});
        });
        // res.send(crimeData);
        res.render("crimePage", {crimeData});
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

app.get("/criminal/:criminalId", (req, res) => {
    getData(`SELECT C.Criminal_id, C.name, C.address, C.Phone_no, CR.CRN, F.FIR_id, F.summary
    FROM Criminal C, Crime CR, Crime_Committed CC, FIR F
    WHERE CC.Criminal_id = C.Criminal_id
    AND CR.CRN = CC.CRN
    AND CR.fir_id = F.fir_id
    AND C.Criminal_id ='` + req.params.criminalId + `';`).then((criminal) => {
        if (criminal.length == 0){
            res.render("404Page");
            return;
        }
        let criminalData = {};
        criminalData["CrminalId"] = criminal[0].Criminal_Id;
        criminalData["Name"] = criminal[0].Name;
        criminalData["Address"] = criminal[0].Address;
        criminalData["Phone_no"] = criminal[0].Phone_no;
        criminalData["crimes"] = [];
        criminal.forEach((crime) => {
            criminalData["crimes"].push({"CRN" : crime.CRN, "Fir_id" : crime.Fir_id, "summary" : crime.Summary});
        });
        // res.send(criminalData);
        res.render("criminalPage", {criminalData});
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

app.get("/fir/:firId", (req, res) => {
    getData(`SELECT F.fir_id, CR.CRN, F.witness_name, F.area_code, F.Date_of_filing, C.name, C.Criminal_id, F.Summary
    FROM Crime CR, Criminal C, Crime_Committed CC, FIR F
    WHERE CR.CRN = CC.CRN
    AND CR.fir_id = F.fir_id
    AND C.Criminal_id = CC.Criminal_id
    AND F.FIR_id ='` + req.params.firId + `';`).then((Fir) => {
        if (Fir.length == 0){
            res.render("404Page");
            return;
        }
        let FirData = {};
        FirData["FirId"] = Fir[0].Fir_id;
        FirData["CRN"] = Fir[0].CRN;
        FirData["Witness_name"] = Fir[0].Witness_name;
        FirData["AreaCode"] = Fir[0].area_code;
        FirData["Date_of_filing"] = Fir[0].Date_of_filing;
        FirData["Criminals"] = [];
        FirData["Summary"] = Fir[0].Summary;
        Fir.forEach((criminal) => {
            FirData["Criminals"].push({"CriminalId" : criminal.Criminal_Id, "Name": criminal.Name});
        });
        // res.send(FirData);
        res.render("firPage", {FirData});
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
app.get("/appeals", (req, res) => {
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
