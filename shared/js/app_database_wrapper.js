
'use strict';

/* global Promise */

(function(exports) {

  var datastore;


  // Datastore name declared on the manifest.webapp
  var DATASTORE_NAME = '';//'bookmarks_store';

  // Indicates the initialization state
  var readyState;

  // Event listeners
  var listeners = Object.create(null);

  function init(dbName) {

      console.log(' init 0, db = ' + dbName);

      if (dbName ==='') {
          return;
      }

      DATASTORE_NAME = dbName;

    return new Promise(function doInit(resolve, reject) {
      if (readyState === 'initialized') {
        resolve();
        return;
      }

      console.log(' init 1');
      if (readyState === 'initializing') {
        document.addEventListener('ds-initialized', function oninitalized() {
          document.removeEventListener('ds-initialized', oninitalized);
          resolve();
        });
        return;
      }

      readyState = 'initializing';

      if (!navigator.getDataStores) {
        console.error('Bookmark store: DataStore API is not working');
        reject({ name: 'NO_DATASTORE' });
        readyState = 'failed';
        return;
      }

      console.log(' init 2');
///////////////////////////////////////////////////////////////////////
      navigator.getDataStores(DATASTORE_NAME).then(function(ds) {
        if (ds.length < 1) {
          console.error('Bookmark store: Cannot get access to the ' + DATASTORE_NAME);
          reject({ name: 'NO_ACCESS_TO_DATASTORE' });
          readyState = 'failed';
          return;
        }
         console.log(' init 3');
        datastore = ds[0];
        //datastore.addEventListener('change', onchangeHandler);

        console.log(' init 4');

       // document.dispatchEvent(new CustomEvent('ds-initialized'));
        resolve();
      }, reject);
     console.log(' init 5');
///////////////////////////////////////////////////////////////////////
    });
      console.log(' init 6');
  }

  function doGetAll(resolve, reject) {
      console.log('   doGetAll  0 ***, datastore = ' + datastore)

    var result = Object.create(null);
    var cursor = datastore.sync(); // datastore undefined

    function cursorResolve(task) {
      switch (task.operation) {
        case 'update':
        case 'add':
           // console.log('   doGetAll  Add')
          result[task.data.id] = task.data;
          break;

        case 'remove':
        //    console.log('   doGetAll  remove')
          delete result[task.data.id];
          break;

        case 'clear':
          //  console.log('   doGetAll  clear')
          result = Object.create(null);
          break;

        case 'done':
            console.log('   doGetAll  done')
            console.log(result)



          resolve(result);
          return;
      }

      cursor.next().then(cursorResolve, reject);
    }

    cursor.next().then(cursorResolve, reject);

      console.log(' ***** doGetAll  END ***')
  }

  function get(dbName, id) {
      if (dbName === '')
          return;

    return new Promise(function doGet(resolve, reject) {
      init(dbName).then(function onInitialized() {
        // datastore.get(id).then(resolve, reject);
          var obj =  datastore.get(id).then(resolve, reject);
          console.log(obj);
      }, reject);
    });
  }
// ==============================================================
    function getAll(dbName) {
        if (dbName === '')
            return;

        console.log('    inside getAll 0, datastore= ' + datastore)

        var promise = new Promise(
          function (resolve, reject) {
            init(dbName).then(doGetAll(resolve, reject), reject);
        });

        return promise;
    }
// --------------------------------------------------------------------------------- MY
    function httpGet(url) {

      return new Promise(
          function(resolve, reject) {

        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);

        xhr.onload = function() {
          if (this.status == 200) {
            resolve(this.response);
          } else {
            var error = new Error(this.statusText);
            error.code = this.status;
            reject(error);
          }
        };

        xhr.onerror = function() {
          reject(new Error("Network Error"));
        };

        xhr.send();
      });

    } // ------------------------------------ MY

  function clear(dbName) {
      if (dbName === '')
          return;

    return new Promise(function doClear(resolve, reject) {
      init(dbName).then(function onInitialized() {
        datastore.clear().then(resolve, reject);
      }, reject);
    });
  }

  exports.FavoritesStore = {
   /*
    * This method returns a bookmark object
    *
    * @param{String} String param that represents an identifier
    */
    get: get,

   /*
    * This method returns an object of bookmarks indexed by id
    */
    getAll: getAll,

//   /*
//    * Returns the latest revision UUID
//    */
//    getRevisionId: getRevisionId,

//    /*
//     * Method registers the specified listener on the API
//     *
//     * @param{String} A string representing the event type to listen for
//     *
//     * @param{Function} The method that receives a notification when an event of
//     *                  the specified type occurs
//     *
//     */
//    addEventListener: addEventListener,

//    /*
//     * Method removes the specified listener on the API
//     *
//     * @param{String} A string representing the event type to listen for
//     *
//     * @param{Function} The method that received a notification when an event of
//     *                  the specified type occurs
//     *
//     */
//    removeEventListener: removeEventListener,

//    /*
//     * This method adds a bookmark in the datastore
//     *
//     * @param{Object} The bookmark's data
//     */
//    add: add,

//    /*
//     * This method updates a bookmark in the datastore
//     *
//     * @param{Object} The bookmark's data
//     */
//     put: put,

//    /*
//     * This method removes a bookmark from the datastore
//     *
//     * @param{String} The bookmark's id
//     */
//     remove: remove,

//    /*
//     *
//     * This method clears the entire datastore, removing all entries.
//     *
//     */
     clear: clear
  };

}(window));
