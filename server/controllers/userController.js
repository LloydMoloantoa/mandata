const mysql = require('mysql2');
const express = require('express');
const fileUpload = require('express-fileupload');
const multer = require('multer');
const session = require('express-session');
//({ dest: 'uploads/' })

const app = express();

// default option
app.use(fileUpload());

// Static Files
app.use(express.static('public'));
app.use(express.static('upload'));

const upload = multer({ storage: multer.memoryStorage() });



/* //Connection Pool
//You don't need the connection here as we have it in userController
let connection = mysql.createConnection({
 host: process.env.DB_HOST,
 user: process.env.DB_USER,
 password: process.env.DB_PASS,
 database: process.env.DB_NAME
}); */


var db_config = {
  /* host: 'us-cdbr-east-05.cleardb.net',
  user: 'b84aa3e74fa1dd',
  password: '6644049e',
  database: 'heroku_f60c767c35f48c9' */
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
};

var connection;

function handleDisconnect() {
  connection = mysql.createConnection(db_config); // Recreate the connection, since
  // the old one cannot be reused.

  connection.connect(function (err) {              // The server is either down
    if (err) {                                     // or restarting (takes a while sometimes).
      console.log('error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
    }                                     // to avoid a hot loop, and to allow our node script to
  });                                     // process asynchronous requests in the meantime.
  // If you're also serving http, display a 503 error.
  connection.on('error', function (err) {
    console.log('db error', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
      handleDisconnect();                         // lost due to either server restart, or a
    } else {                                      // connnection idle timeout (the wait_timeout
      throw err;                                  // server variable configures this)
    }
  });
}

handleDisconnect();

// Session
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}));

// View Users
exports.view = (req, res) => {
  // User the connection
  connection.query('SELECT * FROM orderman', (err, rows) => {
    // When done with the connection, release it
    if (!err) {
      res.render('home', { rows });
    } else {
      console.log(err);
    }
    //console.log('The data from orderman table: \n', rows);
  });
}

exports.edit = (req, res) => {
  // User the connection
  connection.query('SELECT * FROM orderman WHERE id = ?', [req.params.id], (err, rows) => {
    if (!err) {
      res.render('edit-user', { rows });
    } else {
      console.log(err);
    }
    //console.log('The data from orderman table: \n', rows);
  });
}

// Find User by Search
exports.find = (req, res) => {
  let searchTerm = req.body.search;
  // User the connection
  connection.query('SELECT * FROM orderman WHERE name LIKE ? OR email LIKE ?', ['%' + searchTerm + '%', '%' + searchTerm + '%'], (err, rows) => {
    if (!err) {
      res.render('home', { rows });
    } else {
      console.log(err);
    }
    //console.log('The data from order table: \n', rows);
  });
}

exports.form = (req, res) => {
  res.render('add-user');
}

// Add new user
exports.create = (req, res) => {
  /* var post = req.body;
  var name = post.name;
  var category = post.category;
  var price = post.price;
  var description = post.description;
  var picture = req.file.buffer.toString('base64'); */

  var post = req.body
  var name = post.name;
  var email = post.email;
  var address = post.address;
  var gender = post.gender;
  var dob = post.dob;
  var doj = post.doj;
  var description = post.description;
  var type = post.type;
  var picture = req.file.buffer.toString('base64');

  //const { name, category, price, description, picture } = req.body;
  let searchTerm = req.body.search;

  // User the connection
  connection.query('INSERT INTO orderman SET name = ?, email = ?, address = ?, gender = ?, dob = ?, doj = ?, description = ?, type = ?, picture = ?', [name, email, address, gender, dob, doj, description, type, picture], (err, rows) => {
    if (!err) {
      res.render('add-user', { alert: 'User added successfully.' });
    } else {
      console.log(err);
    }
    // console.log('The data from orderman table: \n', rows);
  });
}

// Edit user
exports.edit = (req, res) => {
  // User the connection
  connection.query('SELECT * FROM orderman WHERE id = ?', [req.params.id], (err, rows) => {
    if (!err) {
      res.render('edit-user', { rows });
    } else {
      console.log(err);
    }
    //console.log('The data from orderman table: \n', rows);
  });
}

// Update User
exports.update = (req, res) => {
  /* var post = req.body;
  var name = post.name;
  var category = post.category;
  var price = post.price;
  var description = post.description;
  var picture = req.file.buffer.toString('base64'); */

  var post = req.body
  var name = post.name;
  var email = post.email;
  var address = post.address;
  var gender = post.gender;
  var dob = post.dob;
  var doj = post.doj;
  var description = post.description;
  var type = post.type;
  var picture = req.file.buffer.toString('base64');
  // User the connection
  connection.query('UPDATE orderman SET name = ?, email = ?, address = ?, gender = ?, dob = ?, doj = ?, description = ?, type = ?, picture = ?', [name, email, address, gender, dob, doj, description, type, picture], (err, rows) => {

    if (!err) {
      // User the connection
      connection.query('SELECT * FROM orderman WHERE id = ?', [req.params.id], (err, rows) => {
        // When done with the connection, release it

        if (!err) {
          res.render('edit-user', { rows, alert: `${name} has been updated.` });
        } else {
          console.log(err);
        }
        console.log('The data from orderman table: \n', rows);
      });
    } else {
      console.log(err);
    }
    //console.log('The data from orderman table: \n', rows);
  });
}

// Delete User
exports.delete = (req, res) => {
  // Delete a record
  // User the connection
  connection.query('DELETE FROM orderman WHERE id = ?', [req.params.id], (err, rows) => {
    if (!err) {
      res.render('home');
    } else {
      console.log(err);
    }
    //console.log('The data from orderman table: \n', rows);
  });
}

// Hide a record

/*   connection.query('UPDATE orderman WHERE id = ?', [req.params.id], (err, rows) => {
    if (!err) {
      let removedUser = encodeURIComponent('User successeflly removed.');
      res.redirect('/?removed=' + removedUser);
    } else {
      console.log(err);
    }
    console.log('The data from orderman table are: \n', rows);
  }); 

} */

// View Users
exports.viewall = (req, res) => {
  // User the connection
  connection.query('SELECT * FROM orderman WHERE id = ?', [req.params.id], (err, rows) => {
    if (!err) {
      res.render('view-user', { rows });
    } else {
      console.log(err);
    }
    //console.log('The data from orderman table: \n', rows);
  });
}

exports.viewprod = (req, res) => {
  // User the connection
  connection.query('SELECT * FROM orderman WHERE id = ?', [req.params.id], (err, rows) => {
    if (!err) {
      res.render('view-prod', { rows });
    } else {
      console.log(err);
    }
    //console.log('The data from orderman table: \n', rows);
  });
}

exports.grid = (req, res) => {
  // User the connection
  connection.query('SELECT * FROM orderman', (err, rows) => {
    // When done with the connection, release it
    if (!err) {
      res.render('grid', { rows });
    } else {
      console.log(err);
    }
    //console.log('The data from orderman table: \n', rows);
  });
}

exports.userreg = (req, res) => {
  res.render('user-reg');
}

exports.addreg = (req, res) => {
  var post = req.body;
  var name = post.name;
  var surname = post.surname;
  var email = post.email;
  var role = post.role;
  var password = post.password;

  // User the connection
  connection.query('INSERT INTO orderuser SET name = ?, surname = ?, email = ?, role = ?, password = ?', [name, surname, email, role, password], (err, rows) => {
    if (!err) {
      connection.query('SELECT * FROM orderman', (err, rows) => {
        // When done with the connection, release it
        if (!err) {
          res.render('grid', { rows });
        } else {
          console.log(err);
        }
        //console.log('The data from orderman table: \n', rows);
      });
    } else {
      console.log(err);
    }
    //console.log('The data from orderuser table: \n', rows);
  });
}

exports.log = (req, res) => {
  res.render('login');
}

exports.loggrid = (req, res) => {
  res.render('loggrid');
}

exports.login = (req, res) => {
  var email = req.body.email;
  var password = req.body.password;

  connection.query('select password , email from orderuser where email = ? AND password = ?', [email, password], (err, rows) => {

    var ret;
    ret = JSON.stringify(rows);
    var a = ret.replaceAll("[", "");
    var b = a.replaceAll("]", "");
    var c = b.replaceAll("{", "");
    var d = c.replaceAll("}", "");
    var e = d.replaceAll("password", "");
    var f = e.replace(/"/g, "");
    var g = f.replace("email", "");
    var h = g.replaceAll(":", "");
    var i = h.split(",");

    var dpassword = i[0];
    var demail = i[1];

    if (email == demail && password == dpassword) {
      connection.query('SELECT * FROM orderman', (err, rows) => {
        if (!err) {
          res.render('loggrid', { rows });
        } else {
          res.render('login', { alert: `Incorrect information.` });
          // console.log(err);
        }
        //console.log('The data from orderman table: \n', rows);
      });
    } else {
      res.render('login', { alert: `Incorrect information.` });
      // console.log(err);
    }
    //console.log('The data from orderman table: \n', rows);
  });
}

exports.admin = (req, res) => {
  res.render('admin');
}

exports.usersview = (req, res) => {
  // User the connection
  connection.query('SELECT * FROM orderuser', (err, rows) => {
    // When done with the connection, release it
    if (!err) {
      res.render('usersview', { rows });
    } else {
      console.log(err);
    }
    //console.log('The data from orderman table: \n', rows);
  });
}

exports.usersfind = (req, res) => {
  let searchTerm = req.body.search;
  // User the connection
  connection.query('SELECT * FROM orderuser WHERE name LIKE ? OR surname LIKE ?', ['%' + searchTerm + '%', '%' + searchTerm + '%'], (err, rows) => {
    if (!err) {
      res.render('usersview', { rows });
    } else {
      console.log(err);
    }
    //console.log('The data from order table: \n', rows);
  });
}

// Delete User
exports.deleteu = (req, res) => {
  // Delete a record
  // User the connection
  connection.query('DELETE FROM orderuser WHERE id = ?', [req.params.id], (err, rows) => {

    if (!err) {
      connection.query('SELECT * FROM orderuser', (err, rows) => {
        // When done with the connection, release it
        if (!err) {
          res.render('usersview', { rows });
        } else {
          console.log(err);
        }
        //console.log('The data from orderman table: \n', rows);
      });

    } else {
      console.log(err);
    }
    //console.log('The data from orderman table: \n', rows);

  });
}

exports.formu = (req, res) => {
  res.render('add-useru');
}

exports.editu = (req, res) => {
  // User the connection
  connection.query('SELECT * FROM orderuser WHERE id = ?', [req.params.id], (err, rows) => {
    if (!err) {
      res.render('edit-useru', { rows });
    } else {
      console.log(err);
    }
    //console.log('The data from orderman table: \n', rows);
  });
}

// Update User
exports.updateu = (req, res) => {
  var post = req.body;
  var name = post.name;
  var surname = post.surname;
  var email = post.email;
  var role = post.role;
  var password = post.password;
  // User the connection
  connection.query('UPDATE orderuser SET name = ?, surname = ?, email = ?, role = ?, password = ? WHERE id = ?', [name, surname, email, role, password, req.params.id], (err, rows) => {

    if (!err) {
      // User the connection
      connection.query('SELECT * FROM orderuser WHERE id = ?', [req.params.id], (err, rows) => {
        // When done with the connection, release it

        if (!err) {
          res.render('edit-useru', { rows, alert: `${name} has been updated.` });
        } else {
          console.log(err);
        }
        console.log('The data from orderuser table: \n', rows);
      });
    } else {
      console.log(err);
    }
    //console.log('The data from orderuser table: \n', rows);
  });
}

exports.createform = (req, res) => {
  res.render('createform');
}

exports.createformuser = (req, res) => {
  var post = req.body;
  var name = post.name;
  var surname = post.surname;
  var email = post.email;
  var role = post.role;
  var password = post.password;


  // User the connection
  connection.query('INSERT INTO orderuser SET name = ?, surname = ?, email = ?, role = ?, password = ?', [name, surname, email, role, password], (err, rows) => {
    if (!err) {
      res.render('createform', { rows, alert: `${name} has been added.` });
    } else {
      console.log(err);
    }
    //console.log('The data from orderuser table: \n', rows);
  });
}

exports.message = (req, res) => {
  var post = req.body;
  var name = post.name;
  var email = post.email;
  var message = post.message;


  // User the connection
  connection.query('INSERT INTO messages SET name = ?, email = ?, message = ?', [name, email, message], (err, rows) => {
    if (!err) {
      connection.query('SELECT * FROM orderman', (err, rows) => {
        // When done with the connection, release it
        if (!err) {
          res.render('grid', { rows });
        } else {
          console.log(err);
        }
        //console.log('The data from orderman table: \n', rows);
      });
    } else {
      console.log(err);
    }
    //console.log('The data from orderuser table: \n', rows);
  });
}

exports.messageview = (req, res) => {
  // User the connection
  connection.query('SELECT * FROM messages', (err, rows) => {
    // When done with the connection, release it
    if (!err) {
      res.render('messageview', { rows });
    } else {
      console.log(err);
    }
    //console.log('The data from orderman table: \n', rows);
  });
}

exports.deletemassges = (req, res) => {
  // Delete a record
  // User the connection
  connection.query('DELETE FROM messages WHERE id = ?', [req.params.id], (err, rows) => {

    if (!err) {
      connection.query('SELECT * FROM messages', (err, rows) => {
        // When done with the connection, release it
        if (!err) {
          res.render('messageview', { rows });
        } else {
          console.log(err);
        }
        //console.log('The data from orderman table: \n', rows);
      });

    } else {
      console.log(err);
    }
    //console.log('The data from orderman table: \n', rows);

  });
}