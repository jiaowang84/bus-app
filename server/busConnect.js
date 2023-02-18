const express = require('express');
const request = require('request-promise');
const app = express();
const path = require('path');

let port = process.env.PORT;
if (port == null || port == "") {
    port = 4000;
}
const accountKey = 'put accountKey here from datamall';

// Express only serves static assets in production
if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, '..', 'build')));

    app.get('/', function (req, res) {
        res.sendFile(path.join(__dirname, 'build', '..', 'index.html'));
    });
}

app.get('/getBusSchedule', (req, res) => {
    getBusSchedule(req.query.busStopCode).then(result => res.send(result));
});

app.get('/getAllBusStops', (req, res) => {
    getAllBusStops().then(result => res.send(result));
});

function getBusSchedule(busStopCode) {
    return request.get({
        url: 'http://datamall2.mytransport.sg/ltaodataservice/BusArrivalv2?BusStopCode=' + busStopCode,
        headers: {
            "AccountKey": accountKey,
            "Content-Type": "application/json"
        },
        json: true
    })
        .then(function (body) {
            return body;
        })
        .catch(function (err) {
            return err;
        });
}

function getAllBusStops() {
    return request.get({
        url: 'http://datamall2.mytransport.sg/ltaodataservice/BusStops',
        headers: {
            "AccountKey": accountKey,
            "Content-Type": "application/json"
        },
        json: true
    })
        .then(function (body) {
            return body;
        })
        .catch(function (err) {
            return err;
        });
}

app.listen(port, () => console.log(`Example app listening on port ${port}!`));