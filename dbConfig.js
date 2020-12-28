// Set server's listening
const listeningPort = 8080;

// Define mysql connection
const mysqlConnectionParams = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'filebin'
};

const maxUploadFileSize = 20 * 1024 * 1024; // 20 MB

const baseURL = "http://localhost:8080";

module.exports = {
    listeningPort, mysqlConnectionParams, maxUploadFileSize, baseURL
};
