'use strict';

(function(exports) {

  var dataStoreName;

  function init(dbName) {
    console.log("FavoritesStore::init(" + dbName + ")");
    dataStoreName = dbName;
    return;
  }

  function getAllItems() {
    console.log("FavoritesStore::getAllItems(" + dataStoreName + ")");
    return;
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
    return;
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
    clearAll: clearAllItems,

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
