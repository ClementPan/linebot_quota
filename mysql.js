const mysql = require('mysql')

// create pool
const pool = mysql.createPool({
  host: 'host',
  user: 'user',
  password: 'password',
  database: 'database name',
  connectionLimit: 10 // as you please
});

// query
const query = {
  createTable(userId, callback) {  // create table
    // set query syntax
    const sql = `CREATE TABLE IF NOT EXISTS ${userId}(id INT AUTO_INCREMENT PRIMARY KEY, title NVARCHAR(255), number VARCHAR(255))`

    // get connection of database
    pool.getConnection((err, conn) => {
      if (err) console.error(err)   // connection error
      else {                        // connection success
        conn.query(sql, (err, result) => {
          if (err) return console.error(err)
          else {
            console.log('---------- TABLE CREATED  ---------')
            console.log(result)
            callback()
          }
        })
        // release connection
        conn.release()
      }
    })
  },

  // CHAR 存資料有固定長度，並且都為英文數字。
  // NCHAR 存資料有固定長度，但不確定是否都是英文數字。
  // VARCHAR 存資料沒有固定長度，並且都為英文數字。
  // NVARCHAR 存資料沒有固定長度，且不確定是否皆為英文數字。

  // DROP TABLE IF EXISTS
  dropTable(userId, callback) {
    const sql = `DROP TABLE IF EXISTS ${userId}`

    pool.getConnection((err, conn) => {
      if (err) console.error(err)
      else {
        conn.query(sql, (err, result) => {
          if (err) console.error(err)
          else {
            console.log('------------ TABLE DROPPED ------------')
            console.log(result)
            callback()
          }
        })
        conn.release()
      }
    })
  },


  insertData(userId, title, number, callback) {  // insert data //
    const data = { title: title, number: number }
    const sql = `INSERT INTO ${userId} SET ?`

    // get connection of database
    pool.getConnection((err, conn) => {
      if (err) console.error(err)   // connection error
      else {                        // connection success
        conn.query(sql, data, (err, result) => {
          if (err) return console.error(err)
          else {
            console.log('------------ insert one Data   --------')
            console.log(result)
            callback()
          }
        })
        // release connection
        conn.release()
      }
    })
  },

  // select all datum
  selectAll(userId, callback) {
    const sql = `SELECT * FROM ${userId}`

    // get connection of database
    pool.getConnection((err, conn) => {
      if (err) console.error(err)   // connection error
      else {                        // connection success
        conn.query(sql, (err, results) => {
          if (err) return console.error(err)
          else {
            console.log('------------ select all Data   --------')
            console.log(JSON.parse(JSON.stringify(results)))
            callback(results)
          }
        })
        // release connection
        conn.release()
      }
    })
  },

  // select single data
  selectOne: (userId, limit, callback) => {
    // 字串比需有 '' ? (in limit)
    const sql = `SELECT * FROM ${userId} WHERE title = '${limit}'`

    // get connection of database
    pool.getConnection((err, conn) => {
      if (err) console.error(err)   // connection error
      else {                        // connection success
        conn.query(sql, (err, result) => {
          if (err) return console.error(err)
          else {
            console.log('------------ select one Data   --------')
            console.log(result)
            callback(result)
          }
        })
        // release connection
        conn.release()
      }
    })
  },

  // update one data
  updateOne: (userId, updateTarget, number, callback) => {
    // title 裡面要有 ''
    const sql = `UPDATE ${userId} SET number = '${number}' WHERE title = '${updateTarget}'`

    // get connection of database
    pool.getConnection((err, conn) => {
      if (err) console.error(err)   // connection error
      else {                        // connection success
        conn.query(sql, (err, result) => {
          if (err) return console.error(err)
          else {
            console.log('------------ update one Data   --------')
            console.log(result)
            callback()
          }
        })
        // release connection
        conn.release()
      }
    })
  },

  // delete one data
  deleteOne: (userId, deleteTarget) => {
    const sql = `DELETE FROM ${userId} WHERE id = '${deleteTarget}'`
    pool.getConnection((err, conn) => {
      if (err) console.error(err)
      else {
        conn.query(sql, (err, result) => {
          if (err) return console.error(err)
          else {
            console.log("[DATABASE] DELETE ONE DATA")
            console.log(result)
            console.log('----------------------')
          }
        })
        conn.release()
        process.exit()
      }
    })
  }
}

module.exports = query