const express = require('express');
const multer = require('multer');
const ejs = require('ejs');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const config = require('./dbConfig.js');
const dbConnection = mysql.createConnection(config.mysqlConnectionParams);
const path = require('path');
// Set The Storage Engine
const storage = multer.diskStorage({
  destination: './public/uploads/',  //this the destination folder where files are stored
  //we can also have other storage mechanism as s3 etc.
});

// Init Upload
const upload = multer({
  storage: storage,
  limits: {
    fileSize: config.maxUploadFileSize // file size can be max of 20 MB
  },
}).single('fileToUpload');



dbConnection.connect((err) => {
  if (err) throw err;
  console.log("Connected!");
});
// Init app
const app = express();
// EJS
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.use(bodyParser.urlencoded({ extended: false }));
app.listen(config.listeningPort, () =>
  console.log(`Server started on port ${config.listeningPort}`));


app.get("/", (req, res) => {
  let stmt = `SELECT * FROM uploadinformation`;
  // execute the select statment
  dbConnection.query(stmt, (err, results, fields) => {
    if (err) {
      return console.error(err.message);
    }
    res.render('filebin', {
      items: results, url: '', msg: ''
    });
  });
});

app.post('/upload', (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      res.render('filebin', {
        items: '', url: '', msg: err
      });
    }
    else if (req.file == undefined) {
      res.render('filebin', {
        items: '', url: '', msg: 'Error: No File Selected!'  //if no file has been choosen
      });
    }

    let stmt = `INSERT INTO uploadinformation( name,uploaded_date,download_status) VALUES (?,now(),?)`;
    let todos = [req.file.originalname, false];  //initially download_status is false
    // execute the insert statment
    dbConnection.query(stmt, todos, (err, results, fields) => {
      if (err) {
        return console.error(err.message);
      }
      var id = results.insertId;
      var fileNameWithId = req.file.originalname.replace(".", "_" + id + ".").replace(" ", "-"); //need to have filename with id to map specific file when downloading and replacing space with -
      var fs = require('fs');  //
      fs.rename(path.join(__dirname + req.file.destination.replace(".", "") + req.file.filename), path.join(__dirname + req.file.destination.replace(".", "") + fileNameWithId), function (err) {
        if (err) console.log('ERROR: ' + err);
      }); //rename the file to have mapping
      setValue(id, config.baseURL + '/download/' + fileNameWithId);
    });
  });


  function setValue(id, link) {
    dbConnection.query(`UPDATE uploadinformation SET link=(?) where id=` + id, link, (err, results, fields) => {
      if (err) {
        return console.error(err.message);
      }
    });   //update the link and returns all the values
    let stmt = `SELECT * FROM uploadinformation`;
    dbConnection.query(stmt, (err, results, fields) => {
      if (err) {
        return console.error(err.message);
      }
      res.render('filebin', {
        items: results, url: link, msg: ''
      });
    });
  }
});





app.get('/download/:fileId', function (req, res) {
  filename = req.params.fileId;
  id = req.params.fileId.substring(req.params.fileId.indexOf('_') + 1, req.params.fileId.indexOf(".")); //get the id from filename
  let stmt = `SELECT download_status FROM uploadinformation where id=` + id; //update the download status  to true once after the successful download 
  dbConnection.query(stmt, (err, results, fields) => {
    if (err) {
      return console.error(err.message);
    }
    downloadFile(results, res, filename, id);
  });

});

function downloadFile(status, res, filename, id) {
  if (0 == status[0].download_status) {
    res.download(path.join(__dirname + '/public/uploads/' + filename));
    dbConnection.query(`UPDATE uploadinformation SET downloaded_date=now(), download_status=(?) where id=` + id, true, (err, results, fields) => {
      if (err) {
        return console.error(err.message);
      }
    });

  } else {
    res.render('filebin', {
      items: '', url: '', msg: 'File Already downloaded'  //if file has alreadty been downloaded
    });
  }
}
