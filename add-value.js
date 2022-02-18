var { getConnection } = require('./common');

async function main(sleep = 5000) {
  try {
    var conn = await getConnection();

    await new Promise((r, j) => conn.query('SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;', e => e ? j(e) : r()));
    await new Promise((r, j) => conn.query('START TRANSACTION;', e => e ? j(e) : r()));

    var returned = await new Promise((r, j) => conn.query('select balance from balance where id = 1;', (e, data) => e ? j(e) : r(data)));
    console.log('returned:', returned);
    console.log('returned:', returned[0].balance);
    var newValue = returned[0].balance + 10;
    console.log('newValue:', newValue);

    console.log('sleeping for', sleep, 'ms');
    await new Promise(r => setTimeout(r, sleep));
    console.log('sleeping for', sleep, 'ms', 'done');

    await new Promise((r, j) => conn.query('update balance set balance = ? where id = 1;', [newValue], (e) => e ? j(e) : r()));
    await new Promise((r, j) => conn.query('COMMIT;', e => e ? j(e) : r()));
    console.log('balance is', (await new Promise((r, j) => conn.query('select balance from balance where id = 1;', (e, data) => e ? j(e) : r(data)))));

  } catch (e) {
    console.error(e);
  } finally {
    try {
      await new Promise((r, j) => conn.end(e => e ? j(e) : r()));
    } catch (e) {
      console.error(e);
    }
  }
}

if (require.main === module) {
  main();
}
