'use strict';

//promise化mysql的query方法

let slice = [].slice;

module.exports = pool => {

    let query = pool.query;
    let mysql_db = {};

    mysql_db.query = function () {
        let args = slice.call(arguments);
        let promise = new Promise((resolve, reject) => {
            args.push((err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });

            query.apply(pool, args);
        });

        return promise;
    };

    return mysql_db;
}

