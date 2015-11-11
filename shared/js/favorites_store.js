'use strict';

/**
 * Examples:
 * @code
 * var favsStore = new FavoritesStore('contacts_favorites');
 * var items = favsStore.getAllItems();
 */

(function(exports) {

  /**
   * This is a constructor for favorites store objects.
   *
   * @param{String} The application ID for the favorites store object.
   */
  exports.FavoritesStore = function(itemsStoreName, actionsStoreName) {
    console.log("FavoritesStore::FavoritesStore: itemsStoreName:" + itemsStoreName +
                ", actionsStoreName:" + actionsStoreName);
    this.itemsStore = navigator.getDataStores(itemsStoreName);
    this.actionsStore = navigator.getDataStores(actionsStoreName);
  }

  /**
   * Gets the name of the favorites store object.
   */
  exports.FavoritesStore.prototype.getName = function() {
    var datastore = this.itemsStore;

    return new Promise(function(resolve, reject) {
      datastore.then(function(stores) {
        console.log("hello!: count:" + stores.length);
        if (stores.length > 0) {
          var store = stores[0];
          console.log("FavoritesStore::getName: name:" + store.name);
          resolve(store.name);
        } else {
          reject(new Error("No store"));
        }
      });
    });
  }

  /**
   * Gets all the items in the current favorites store.
   */
  exports.FavoritesStore.prototype.getAllItems = function() {
    var datastore = this.itemsStore;

    return new Promise(function(resolve, reject) {
      datastore.then(function(stores) {
        console.log("hello!: count:" + stores.length);
        if (stores.length > 0) {
          var store = stores[0];
          console.log("FavoritesStore::getAllItems: name:" + store.name);
          resolve(store.sync());
        } else {
          reject(new Error("No store"));
        }
      });
    });
  }

  /**
   * Deletes all the items in the current favorites store.
   */
  exports.FavoritesStore.prototype.clearAllItems = function() {
    var datastore = this.itemsStore;

    return new Promise(function(resolve, reject) {
      datastore.then(function(stores) {
        console.log("hello!: count:" + stores.length);
        if (stores.length > 0) {
          var store = stores[0];
          console.log("FavoritesStore::clearAllItems: owner:" + store.owner);
          console.log("FavoritesStore::clearAllItems: readOnly:" + stores.readOnly);
          store.clear().then(function(success) {
            if (success) {
              console.log("Success.");
            } else {
              console.log("Failed.");
            }
            console.log("Finished:" + success);
            resolve(success);
          }).catch(function(reason) {
            console.log("Failed to clear, reason:" + reason);
            reject(new Error("Failed to clear"));
          });
        } else {
          reject(new Error("No store"));
        }
      });
    });
  }

  /**
   * Gets the data store for the current favorites store.
   *
   * @note Private method, should be used only for debug perposes.
   */
  exports.FavoritesStore.prototype.getStore = function() {
    var datastore = this.itemsStore;

    return new Promise(function(resolve, reject) {
      datastore.then(function(stores) {
        console.log("hello!: count:" + stores.length);
        if (stores.length > 0) {
          var store = stores[0];
          console.log("FavoritesStore::getName: name:" + store.name);
          resolve(store);
        } else {
          reject(new Error("No store"));
        }
      });
    });
  }

  /**
   * Inserts a new favorites item into the favorites store at optional index.
   *
   * @param{Object} The object to be inserted into the favorites store.
   * @param{Numeric} The optional index at which the item should be inserted.
   */
  exports.FavoritesStore.prototype.insertItem = function(item, index) {
    var datastore = this.itemsStore;

    if (index === undefined) {
      console.log("Index is undefined");
    } else {
      console.log("Index is:" + index);
    }

    return new Promise(function(resolve, reject) {
      datastore.then(function(stores) {
        console.log("hello!: count:" + stores.length);
        if (stores.length > 0) {
          var store = stores[0];
          console.log("FavoritesStore::getName: name:" + store.name);
          store.add(item, index).then(function(id) {
            console.log("Item added, id:" + id);
            resolve(id);
          }).catch(function(reason) {
            console.log("Failed to add the item, reason:" + reason);
            reject(reason);
          });
        } else {
          reject(new Error("No store"));
        }
      });
    });
  }

  /**
   * This is a constructor for favorites item objects.
   *
   * @param{String} The title of the favorites item.
   * @param{String} The sub-title of the favorites item.
   * @param{String} The image URL for the favorites item.
   * @param{String} The icon URL for the favorites item.
   * @param{Array} The array of action IDs for this favorites item.
   */
  exports.FavoritesItem = function(title, subTitle, image, icon, actionIds) {
    console.log("FavoritesItem::FavoritesItem: title:" + title +
                ", subTitle:" + subTitle +
                ", image:" + image +
                ", icon:" + icon +
                ", actionIds:" + actionIds);
    this.title = title;
    this.subTitle = subTitle;
    this.image = image;
    this.icon = icon;
    this.actionIds = actionIds;
  }

})(window);
