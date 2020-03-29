var sql = require('sql');
var express = require('express');
var app = express();
var mysql = require('mysql');
var pug = require('pug');

app.use(express.static('public'));
/**
 *  задаем шаблонизатор
 */
app.set('view engine', 'pug');
app.listen(3500, function() {
    console.log('server started on port 3500');
});
let con = mysql.createConnection({
    database: 'tech_main',
    host: 'localhost',
    user: 'root',
    password: 'root'
});
con.connect(function () {
    console.log('connection to db tech_main is succesfull!');
});

app.get('/start', function (req, res) {
    res.render('index.pug');
    console.log('page is rendered')
})

app.get('/calculate', function (req, res) {

    let promise1 = new Promise(function (resolve, reject) {
        console.log('PREPARE stmt1 FROM \'SELECT request.idrequest, modem_list_metering_station_id, request_date FROM request WHERE idrequest NOT IN (?)  \';');
        con.query('PREPARE stmt1 FROM \'SELECT request.idrequest, modem_list_metering_station_id, request_date FROM request WHERE idrequest NOT IN (?) LIMIT 10\'; ', function (error,result1) {
            if (error) reject (error)
             resolve (result1);
        }); 
    });
    let promise2 = new Promise(function (resolve, reject) {
        con.query('SET @reqid = \'SELECT work_request.idrequest FROM work_request\';', function (error, result2) {
            if (error) reject(error)
            resolve(result2);
        });
    });
    let promise3 = new Promise(function (resolve, reject) {
        con.query('EXECUTE stmt1 USING	@reqid;', function (error, result3) {
            if (error) reject(error)
            resolve(result3);
        });
    });
    Promise.all([promise1,promise2,promise3]).then(function (result3) {
        
        result3 = JSON.parse(JSON.stringify(result3));
       
        console.log(result3[2]);
        res.render('calc', { result: result3[2] });
        console.log('calculate');
    })
    
})