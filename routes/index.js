var mysql = require('mysql');

function getConnection() {
    var conn = mysql.createConnection({
        host: 'hngomrlb3vfq3jcr.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
        user: 'd045cvkiqo6cg4v3',
        password: 'uh5qd4yhru5ho53d',
        database: 'wa9kw4y5rrxpy24t',
        port: 3306

    });
    return conn;
}

var pool = mysql.createPool({
    connectionLimit: 8,
    host: 'hngomrlb3vfq3jcr.cbetxkdyhwsb.us-east-1.rds.amazonaws.com',
    user: 'd045cvkiqo6cg4v3',
    password: 'uh5qd4yhru5ho53d',
    database: 'wa9kw4y5rrxpy24t',
    port: 3306,
    multipleStatements: true
});


function getParkingCharges(start, end, garageId, callback) {
    console.log(start);
    console.log(end);

    // var t1 = start.split(/[- :]/);
    // var startTime = new Date(Date.UTC(t1[0], t1[1]-1, t1[2], t1[3], t1[4], t1[5]));
    //
    // var t2 = end.split(/[- :]/);
    // var endTime = new Date(Date.UTC(t2[0], t2[1]-1, t2[2], t2[3], t2[4], t2[5]));

    var startTime = start;
    var endTime = end;

    var response = {};
    pool.getConnection(function (err, conn) {
        if (err) {
            console.log(err);
            response.status = "error connecting to database";
            callback(response);
        } else {
            var query = "Select rate from Garage where id = ?";

            conn.query(query, [garageId], function (err, results) {
                if (err) {
                    console.log(err);
                    response.status = "Failed executing the query";
                    conn.release();
                    callback(response);
                } else {
                    if (results.length > 0) {
                        var rate = results[0].rate;
                        var diffMs = endTime - startTime;
                        var diffHrs = Math.ceil((diffMs % 86400000) / 3600000);
                        diffHrs = Math.ceil(diffHrs);
                        console.log("diffHrs: "+diffHrs);

                        var charge = rate * diffHrs;
                        response.status = "success";
                        response.charges = charge;
                    } else {
                        response.status = "Could not find rate for given garage id";
                    }
                    conn.release();
                    callback(response);
                }
            });
        }
    });
}

function executeQuery(sqlQuery, callback) {
    pool.getConnection(function (err, conn) {
        if (err) {
            console.log(err);
        } else {
            conn.query(sqlQuery, function (err, rows, fields) {
                if (err) {
                    console.log(err.message);
                    callback(err, rows);
                } else {
                    callback(err, rows);
                }
                conn.release();
            });
        }
    });

}

function randomPinGenerator() {
    return Math.floor(100000 + Math.random() * 900000);
}

exports.login_user = function (req, res) {
    var email = req.body.email;
    var password = req.body.password;

    var query = "Select * from Driver where email = '" + email + "' AND password = '" + password + "';";

    var data = {};
    executeQuery(query, function (err, rows) {
        console.log(rows);
        if (!err && rows.length > 0) {
            data.value = "success";
            data.responseData = {
                user: rows[0]
            };
        } else {
            if (err)
                console.log(err);
            data.value = "Failed Login";
        }
        res.send(data);
    });
};

exports.create_user = function (req, res) {
    var email = req.body.email;
    var password = req.body.password;
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var phone = req.body.phone;
    var carModel = req.body.carModel;
    var carRegistration = req.body.carRegistration;

    var insertSet = {
        email: email,
        password: password,
        firstName: firstName,
        lastName: lastName,
        phone: phone,
        carModel: carModel,
        carRegistration: carRegistration
    };

    var query = "Insert into Driver SET ?";

    console.log("Create user sql query: " + query);

    var data = {};

    pool.getConnection(function (err, conn) {
        if (err) {
            console.log(err);
            data.value = "Failed connecting to database";
            res.send(data);
        } else {
            conn.query(query, insertSet, function (err, results) {
                if (err) {
                    console.log(err);
                    data.value = "Failed connecting to database";
                } else {
                    console.log(results);
                    data.value = "success";
                }
                conn.release();
                res.send(data);
            });
        }
    });

};


exports.login_owner = function (req, res) {
    var email = req.body.email;
    var password = req.body.password;

    var query = "Select * from Owner where email = '" + email + "' AND password = '" + password + "';";
    var data = {};
    executeQuery(query, function (err, rows) {
        if (!err && rows.length > 0) {
            data.value = "success";
            data.responseData = {
                owner: rows[0]
            };
        } else {
            if (err)
                console.log(err);
            data.value = "Failed Login";
        }
        res.send(data);
    });
};

exports.create_owner = function (req, res) {
    var email = req.body.email;
    var password = req.body.password;
    var firstName = req.body.firstName;
    var lastName = req.body.lastName;
    var phone = req.body.phone;

    var insertSet = {
        email: email,
        password: password,
        firstName: firstName,
        lastName: lastName,
        phone: phone
    };

    var query = "Insert into Owner SET ?";

    var data = {};

    pool.getConnection(function (err, conn) {
        if (err) {
            console.log(err);
            data.value = "Failed connecting to database";
            res.send(data);
        } else {
            conn.query(query, insertSet, function (err, results) {
                if (err) {
                    console.log(err);
                    data.value = "Failed connecting to database";
                } else {
                    console.log(results);
                    data.value = "success";
                }
                conn.release();
                res.send(data);
            });
        }
    });
};


exports.get_garage_locations = function (req, res) {
    var lat = req.body.lat;
    var long = req.body.lng;
    var query = "CALL sorted_garages(?,?);";
    var data = {};

    pool.getConnection(function (err, conn) {
        if (err) {
            console.log(err);
            data.value = "Failed connecting to database";
            res.send(data);
        } else {
            conn.query(query, [lat, long], function (err, rows) {
                if (!err && rows.length > 0) {
                    data.value = "success";
                    data.responseData = {
                        garages: rows[0]
                    };
                } else {
                    if (err) {
                        console.log(err);
                        data.value = "Failed getting garage locations from database";
                    } else {
                        data.value = "No garages entered into database";
                    }
                }
                conn.release();
                res.send(data);
            });
        }
    });
};

exports.add_garage = function (req, res) {
    var name = req.body.name;
    var lat = req.body.lat;
    var long = req.body.long;
    var spots = req.body.spots;
    var availableSpots = req.body.availableSpots;
    var rate = req.body.rate;
    var ownerId = req.body.ownerId;

    var query = "Insert into Garage SET ?";

    var insertSet = {
        name: name,
        lat: lat,
        long: long,
        spots: spots,
        availableSpots: availableSpots,
        rate: rate,
        ownerId: ownerId
    };

    var data = {};
    // executeQuery(query, function (err, rows) {
    //     if (!err) {
    //         data.value = "success";
    //     } else {
    //         console.log(err);
    //         data.value = "error";
    //     }
    //     res.send(data);
    // });

    pool.getConnection(function (err, conn) {
        if (err) {
            console.log(err);
            data.value = "Failed connecting to database";
            res.send(data);
        } else {
            conn.query(query, insertSet, function (err, results) {
                if (err) {
                    console.log(err);
                    data.value = "Failed executing query";
                } else {
                    console.log(results);
                    data.value = "success";
                }
                conn.release();
                res.send(data);
            });
        }
    });
};

exports.generate_pin = function (req, res) {

    var driverId = req.body.driverId;
    var garageId = req.body.garageId;
    var pin = randomPinGenerator();

    var query = "select * from GaragePins where garageId = '" + garageId + "';";
    var data = {};
    executeQuery(query, function (err, rows) {
        if (!err) {
            console.log(rows);

            if (rows.length > 0) {
                var flag = false;
                do {
                    for (var i in rows) {
                        if (rows[i].pin === pin) {
                            flag = true;
                            break;
                        } else if (rows[i].driverId + "" === driverId + "") {
                            console.log("pin already present");
                            data.value = "success";
                            data.responseData = {
                                pin: rows[i].pin
                            };
                            res.send(data);
                            res.end();
                            return;
                        }
                    }

                    if (flag) {
                        pin = randomPinGenerator();
                    }
                } while (flag);
            }


            var insertSet = {
                driverId: driverId,
                garageId: garageId,
                pin: pin,
                used: 0
            };
            var query2 = "INSERT INTO GaragePins SET ?";

            pool.getConnection(function (err, conn) {
                if (err) {
                    console.log(err);
                    data.value = "Failed connecting to database";
                    res.send(data);
                } else {
                    conn.query(query2, insertSet, function (err, results) {
                        if (err) {
                            console.log(err);
                            data.value = "Failed connecting to database";
                        } else {
                            data.value = "success";
                            data.responseData = {
                                pin: pin
                            };
                        }
                        conn.release();
                        res.send(data);
                    });
                }
            });


        } else {
            console.log(err);
        }
    });
};

exports.pin_entered = function (req, res) {
    var pin = req.body.pin;
    var garageId = req.body.garageId;

    var query = "select * from GaragePins where garageId = ? AND pin = ? AND used = 0";
    var data = {};
    pool.getConnection(function (err, conn) {
        if (err) {
            console.log(err);
            data.value = "Failed connecting to database";
            res.send(data);
        } else {
            conn.query(query, [garageId, pin], function (err, rows) {
                if (err) {
                    console.log(err);
                    data.value = "Failed connecting to database";
                    conn.release();
                    res.send(data);
                } else {
                    if (rows.length > 0) {
                        var tm = (new Date().toISOString().slice(0, 19).replace('T', ' '));
                        // var query2 = "Update GaragePins set used = 1, startTime = " + conn.escape(tm) + " where garageId = ? AND pin = ?";
                        var query2 = "Update GaragePins set used = 1, startTime = ? where garageId = ? AND pin = ?";
                        conn.query(query2, [new Date(), garageId, pin], function (err, results) {
                            if (err) {
                                console.log(err);
                                data.value = "Failed connecting to database";
                            } else {
                                data.value = "success";
                            }
                            conn.release();
                            res.send(data);
                        });
                    } else {
                        conn.release();
                        data.value = "Invalid pin";
                        res.send(data);
                    }
                }
            });
        }
    });
};

exports.exit_garage = function (req, res) {
    var pin = req.body.pin;
    var garageId = req.body.garageId;

    var query = "select * from GaragePins where garageId = ? AND pin = ? AND used = 1";
    var data = {};
    pool.getConnection(function (err, conn) {
        if (err) {
            console.log(err);
            data.value = "Failed connecting to database";
            res.send(data);
        } else {
            conn.query(query, [garageId, pin], function (err, rows) {
                if (err) {
                    console.log(err);
                    data.value = "Failed connecting to database";
                    conn.release();
                    res.send(data);
                } else {
                    if (rows.length > 0) {
                        var query2 = "Delete from GaragePins where garageId = ? AND pin = ? AND used = 1";
                        conn.query(query2, [garageId, pin], function (err, results) {
                            if (err) {
                                console.log(err);
                                data.value = "Failed connecting to database";
                                res.send(data);
                                conn.release();
                            } else {
                                var endTime = new Date();
                                getParkingCharges(rows[0].startTime, endTime, rows[0].garageId, function (response) {
                                    if (response.status === "success") {
                                        var query3 = "Insert into ParkHistory SET ?";
                                        var insertSet = {
                                            userId: rows[0].driverId,
                                            garageId: rows[0].garageId,
                                            startTime: rows[0].startTime,
                                            endTime: endTime,
                                            charges: response.charges
                                        };

                                        conn.query(query3, insertSet, function (err, results) {
                                            if (err) {
                                                console.log(err);
                                                data.value = "Failed connecting to database";
                                                res.send(data);
                                                conn.release();
                                            } else {
                                                data.value = "success";
                                                res.send(data);
                                                conn.release();
                                            }
                                        });

                                    } else {
                                        console.log(response.status);
                                        data.value = "Failed executing query on database";
                                        res.send(data);
                                        conn.release();
                                    }
                                });
                            }
                        });
                    } else {
                        conn.release();
                        data.value = "Invalid pin";
                        res.send(data);
                    }
                }
            });
        }
    });
};

exports.poll_update = function (req, res) {
    var userId = req.body.id;
    var query = "select * from GaragePins where driverId = ?";
    var data = {};

    pool.getConnection(function (err, conn) {
        if (err) {
            console.log(err);
            data.value = "Failed connecting to database";
            res.send(data);
        } else {
            conn.query(query, [userId], function (err, rows) {
                if (err) {
                    console.log(err);
                    data.value = "Failed running query on database";
                    conn.release();
                    res.send(data);
                } else {
                    if (rows.length > 0) {
                        data.value = "success";
                        data.responseData = {
                            pin: rows[0].pin,
                            used: rows[0].used > 0 ? true : false
                        };
                    } else {
                        data.value = "Not present in database";
                    }
                    conn.release();
                    res.send(data);
                }
            });
        }

    });
};

exports.get_user_history = function (req, res) {
    var userId = req.body.id;
    var query = "select p.userId as userId, p.garageId as garageId, p.startTime as startTime, p.endTime as endTime, p.charges as charges, g.lat as lat, g.long as `long`, g.name as name from ParkHistory p JOIN Garage g ON p.garageId = g.id where userId = ?";

    var data = {};
    pool.getConnection(function (err, conn) {
        if (err) {
            console.log(err);
            data.value = "Failed connecting to database";
            res.send(data);
        } else {
            conn.query(query, [userId], function (err, rows) {
                if (err) {
                    console.log(err);
                    data.value = "Failed running query on database";
                    conn.release();
                    res.send(data);
                } else {
                    if (rows.length > 0) {
                        data.value = "success";
                        data.responseData = {
                            history: rows
                        };
                    } else {
                        data.value = "No history present in database";
                    }
                    conn.release();
                    res.send(data);
                }
            });
        }
    });
};

exports.owner_garages = function(req, res){
    var ownerId = req.body.id;

    var query = "select g.id as id, g.name as name, g.lat as lat, g.long as `long`, g.spots as spots, g.availableSpots as availableSpots, g.rate as rate, g.ownerId as ownerId, IFNULL(h.earnings, 0) as earnings from Garage g LEFT JOIN (select garageId, sum(charges) as earnings from ParkHistory) h on g.id = h.garageId where g.ownerId = ?";

    var data = {};
    pool.getConnection(function (err, conn) {
        if (err) {
            console.log(err);
            data.value = "Failed connecting to database";
            res.send(data);
        } else {
            conn.query(query, [ownerId], function (err, rows) {
                if (err) {
                    console.log(err);
                    data.value = "Failed running query on database";
                    conn.release();
                    res.send(data);
                } else {
                    if (rows.length > 0) {
                        console.log(rows);
                        data.value = "success";
                        data.responseData = {
                            garages: rows
                        };
                    } else {
                        data.value = "No garages present in database for the user";
                    }
                    conn.release();
                    res.send(data);
                }
            });
        }
    });
};







