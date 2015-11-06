'use strict';

(function(exports) {

    var dataStoreName;
    var datastore;

    // Indicates the initialization state
    var readyState;

    function init(dbName) {
        console.log("FavoritesStore::init(" + dbName + ")");

        if (dbName ==='') {
            return;
        }
        dataStoreName = dbName;
    }
    function doInitialize() {
        return new Promise(function doInit(resolve, reject) {
            if (readyState === 'initialized') {
                resolve();
                return;
            }

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

            navigator.getDataStores(dataStoreName).then(function(ds) {
                if (ds.length < 1) {
                    console.error('Bookmark store: Cannot get access to the ' + dataStoreName);
                    reject({ name: 'NO_ACCESS_TO_DATASTORE' });
                    readyState = 'failed';
                    return;
                }

                datastore = ds[0];
                //datastore.addEventListener('change', onchangeHandler);

                // document.dispatchEvent(new CustomEvent('ds-initialized'));
                resolve();
            }, reject);

        });
    }

    function doGetAll(resolve, reject) {
        console.log(' doGetAll(),  datastore:' + dataStoreName)
        //console.log(datastore)

        var result = Object.create(null);
        var cursor = datastore.sync();

        function cursorResolve(task) {
            switch (task.operation) {
            case 'update':
            case 'add':
                result[task.data.id] = task.data;
                break;

            case 'remove':
                delete result[task.data.id];
                break;

            case 'clear':
                result = Object.create(null);
                break;

            case 'done':
                resolve(result);
                return;
            }

            cursor.next().then(cursorResolve, reject);
        }

        cursor.next().then(cursorResolve, reject);
    }

    function getAllItems() {
        console.log("FavoritesStore::getAllItems(" + dataStoreName + ")");

        return new Promise(function (resolve, reject) {
            doInitialize().then(doGetAll(resolve, reject), reject);
        });
    }

    function insertItem(newItem, index) {
        console.log("FavoritesStore::insertItem(" + dataStoreName + "), at:" + index);
        return;
    }

    function moveItem(currentIndex, newIndex) {
        console.log("FavoritesStore::moveItem(" + dataStoreName +
                    "), from:" + currentIndex + ", to:" + newIndex);
        return;
    }

    function updateItem(newItem, index) {
        console.log("FavoritesStore::updateItem(" + dataStoreName + "), at:" + index);
        return;
    }

    function deleteItem(index) {
        console.log("FavoritesStore::deleteItem(" + dataStoreName + "), at:" + index);
        return;
    }

    function clearAllItems() {
        console.log("FavoritesStore::clearAllItems(" + dataStoreName + ")");

        return new Promise(function doClear(resolve, reject) {
            doInitialize().then(function onInitialized() {
                // datastore.clear().then(resolve, reject);
                datastore.clear().then(function(success) {
                    if (success) {
                        console.log(success)
                    } else {
                        getAll('settings')
                    }


                }, reject)

            }, reject);
        });
    }

    function addItemEventListener(callback) {
        console.log("FavoritesStore::addItemEventListener(" + dataStoreName + ")");
        return;
    }

    function removeItemEventListener(callback) {
        console.log("FavoritesStore::removeItemEventListener(" + dataStoreName + ")");
        return;
    }

    function initActions(actions) {
        console.log("FavoritesStore::initActions(" + dataStoreName + ")");
        return;
    }

    function getAction(actionId) {
        console.log("FavoritesStore::getAction(" + dataStoreName + "), ID:" + actionId);
        return;
    }

    function getAllActions() {
        console.log("FavoritesStore::getActions(" + dataStoreName + ")");
        return;
    }

    exports.FavoritesStore = {
        // **************************************
        // FavoritesStore API definition        *
        // **************************************
        /**
     * Initializes the favorites store object with provided application ID.
     *
     * @param{String} The application ID for the current favorites store object.
     */
    init: init,

    /**
     * Gets all the favorite items in the store.
     *
     * @param {Date|Numeric} start start hour.
     * @param {Date|Numeric} end end hour.
     */
    getAllItems: getAllItems,

    /**
     * Inserts a new favorite item into the store.
     *
     * @param{Object} The new favorite item to be inserted.
     * @param{Numeric} The index at which the item will be inserted.
     */
    insertItem: insertItem,

    /**
     * Moves an existing item to a new location.
     *
     * @param{Numeric} The current index of the item to be moved.
     * @param{Numeric} The new location for the item.
     */
    moveItem: moveItem,

    /**
     * Replace the existing item in the store with the new item.
     *
     * @param{Object} The updated item to be used in the store.
     * @param{Numeric} The index at which the new item will be placed.
     */
    updateItem: updateItem,

    /**
     * Removes the existing item in the store at provided index.
     *
     * @param{Numeric} The index at which the item will be removed.
     */
    deleteItem: deleteItem,

    /**
     * Removes all the favorites items in the store.
     */
    clearAllItems: clearAllItems,

    /**
     * Registers a new listener object to listen to updates in the store.
     *
     * @param{Function} callback The callback function to be invoked when the store changes
     */
    addItemEventListener: addItemEventListener,

    /**
     * Removes the specified event listener.
     *
     * @param{Function} The listener callback to be removed.
     */
    removeItemEventListener: removeItemEventListener,

    /**
     * Initializes the array of actions for the application.
     *
     * @param{Array} The array of all the actions supported by the application.
     */
    initActions: initActions,

    /**
     * Gets an action for the specified action ID.
     *
     * @param{Numeric} The action ID to be retrieved.
     */
    getAction: getAction,

    /**
     * Gets all the actions for the current application.
     */
    getAllActions: getAllActions,
  };

}(window));
