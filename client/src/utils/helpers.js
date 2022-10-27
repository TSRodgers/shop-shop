export function pluralize(name, count) {
  if (count === 1) {
    return name
  }
  return name + 's'
}

export function idbPromise(storeName, method, object) {
  return new Promise((resolve, reject) => {
    // open connection to the databse `shop-shop` with the version of 1
    const request = window.indexedDB.open('shop-shop', 1);

    // create variable to hold reference to the database, transaction, and object store
    let db, tx, store;

    // if version has changed (or is this is the first time using the database), run this method and create the three object stores
    request.onupgradeneeded = function(e) {
      const db = request.result;
      // create object store for each type of data and set 'primary' key index to the `_id` of the data
      db.createObjectStore('products', { keyPath: '_id' });
      db.createObjectStore('categories', { keyPath: '_id' });
      db.createObjectStore('cart', { keyPath: '_id' });
    };

    // handle any erros with connecting
    request.onerror = function(e) {
      console.log('There was an error');
    };

    // on db open success
    request.onsuccess = function(e) {
      // save reference of the database to the db variable
      db = request.result;
      //open a tx do whatever we pass into storeName
      tx = db.transaction(storeName, 'readwrite');
      // save a refernce to that object store
      store = tx.objectStore(storeName);

      // if there are any errors let us know
      db.onerror = function(e) {
        console.log('error', e);
      };

      switch (method) {
        case 'put':
          store.put(object);
          resolve(object);
          break;
        case 'get':
          const all = store.getAll();
          all.onsuccess = function() {
          resolve(all.result);
          };
          break;
        case 'delete':
          store.delete(object._id);
          break;
        default:
          console.log('No valid method');
          break;
      }
      
      // when the tx is complete, close the connection
      tx.oncomplete = function() {
        db.close();
      };
    };
  });
}