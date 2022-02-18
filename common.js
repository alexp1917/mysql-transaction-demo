var mysql = require('mysql');

var schema = `
  create table if not exists balance(
    id int unsigned auto_increment primary key,
    name varchar(100) null,
    balance int not null default 0
  );
  insert into balance() values ();
`;

function dropDbQuery(name) {
  return `drop database if exists \`${name}\``;
}

function createDbQuery(name) {
  return `create database if not exists \`${name}\``;
}

function useDbQuery(name) {
  return `use \`${name}\``;
}

// todo: error handling inside this function (close connections on failure)
async function getConnection(dbName = 'my_db') {
  var config = {
    host     : 'localhost',
    user     : 'root',
    password : 'toor'
  };
  
  var connection = mysql.createConnection(config);
  await new Promise((r, j) => connection.connect({}, e => e ? j(e) : r()));
  // console.log('got done: connect');
  await new Promise((r, j) => connection.query(dropDbQuery(dbName), e => e ? j(e) : r()));
  // console.log('got done: query: dropDbQuery');
  await new Promise((r, j) => connection.query(createDbQuery(dbName), e => e ? j(e) : r()));
  // console.log('got done: query: createDbQuery');
  await new Promise((r, j) => connection.query(useDbQuery(dbName), e => e ? j(e) : r()));
  // console.log('got done: query: useDbQuery');

  var schemaConnection = mysql.createConnection({ ...config, database: dbName, multipleStatements: true, });
  await new Promise((r, j) => schemaConnection.query(schema, e => e ? j(e) : r()));
  // console.log('got done: schemaConnection.query: schema');
  await new Promise((r, j) => schemaConnection.end(e => e ? j(e) : r()));
  // console.log('got done: schemaConnection.end');
  
  return connection;
}

module.exports = {
  getConnection,
};
