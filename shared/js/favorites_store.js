'use strict';

/**
 * Examples:
 * @code
 * var favsStore = new FavoritesStore('contacts_favorites');
 * var favorites = favsStore.getAllFavorites();
 */

(function(exports) {

  /**
   * This is a constructor for favorites store objects.
   *
   * @param{String} favoritesStoreName - The store ID for the favorites items.
   * @param{String} actionsStoreName - The store ID for the actions items.
   */
  exports.FavoritesStore = function(favoritesStoreName, actionsStoreName) {
    var self = this;
    console.log("FavoritesStore::FavoritesStore: favoritesStoreName:" + favoritesStoreName +
                ", actionsStoreName:" + actionsStoreName);
    this.favoritesStore = navigator.getDataStores(favoritesStoreName);
    this.actionsStore = navigator.getDataStores(actionsStoreName);
    this.callbacks = [];

    function onFavoritesStoreChanged(event) {
      self.getName().then(function(name) {
        console.log("Store updated:" + name +
                    ", ID:" + event.id +
                    ", operation:" + event.operation);
      });
    }

    this.favoritesStore.then(function(stores) {
      if (stores.length > 0) {
        var store = stores[0];
        store.onchange = onFavoritesStoreChanged;
        console.log("Registered listener, store name:" + store.name);
      }
    });
  }

  /**
   * Gets the name of the favorites store object.
   */
  exports.FavoritesStore.prototype.getName = function() {
    var datastore = this.favoritesStore;

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
   * Gets all the favorite items in the current store.
   */
  exports.FavoritesStore.prototype.getAllFavorites = function() {
    var datastore = this.favoritesStore;

    return new Promise(function(resolve, reject) {
      datastore.then(function(stores) {
        console.log("hello!: count:" + stores.length);
        if (stores.length > 0) {
          var store = stores[0];
          console.log("FavoritesStore::getAllFavorites: name:" + store.name);

          var result = [];
          var cursor = store.sync();

          function cursorResolve(task) {
            switch (task.operation) {
            case 'update':
            case 'add':
              var item = new FavoritesItem(task.data.title, task.data.subTitle,
                                           task.data.image, task.data.icon,
                                           task.data.actionIds, task.data.clientId);
              item.setIndex(task.data.index);
              item.setId(task.id);
              result[task.data.index] = item;
              break;
            case 'remove':
              delete result[task.data.index];
              break;
            case 'clear':
              result = [];
              break;
            case 'done':
              resolve(result);
              return;
            }

            cursor.next().then(cursorResolve, reject);
          }
          cursor.next().then(cursorResolve, reject);

        } else {
          reject(new Error("No store"));
        }
      });
    });
  }

  /**
   * Deletes all the favorite items in the current store.
   */
  exports.FavoritesStore.prototype.clearAllFavorites = function() {
    var datastore = this.favoritesStore;

    return new Promise(function(resolve, reject) {
      datastore.then(function(stores) {
        console.log("hello!: count:" + stores.length);
        if (stores.length > 0) {
          var store = stores[0];
          console.log("FavoritesStore::clearAllFavorites: owner:" + store.owner);
          console.log("FavoritesStore::clearAllFavorites: readOnly:" + stores.readOnly);
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
    var datastore = this.favoritesStore;

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
    var datastore = this.favoritesStore;

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

  exports.FavoritesStore.prototype.insertItem2 = function(item, index) {
    console.log("START insertItem2");

    var datastore = this.favoritesStore;

    if (index === undefined) {
      console.log("Index is undefined");
    } else {
      console.log("Index is: " + index);
    }

    this.getAllFavorites().then(function(items) {
      var itemsCount = Object.keys(items).length
      console.log('itemsCount = ' + itemsCount)

      if (index === undefined || index >= itemsCount) // uppend
      {
        console.log('  UPPEND')
      }
      else if (index < 0) // prepend
      {
        console.log('  PREPEND')
//            item.setIndex(0);
//            var i = 1;
//            items.forEach(function(item) { item.setIndex(i++); });
//            var newItems = [item] + items;
        }
      else if (index < itemsCount) // insert
      {
        console.log('  INSERT')
      }
    });
  }

  /**
   * Request to delete existing favorites item in the favorites store.
   *
   * @param{Numeric} index - The index of the item to be removed.
   */
  exports.FavoritesStore.prototype.deleteFavoritesItem = function(index) {
    var self = this;
    return new Promise(function(resolve, reject) {
      self.getAllFavorites().then(function(items) {
        var item = items.find(function(item) {
          return item && (item.getIndex() === index);
        });
        if (!item || (item.getIndex() != index)) {
          reject(new Error("Item not found"));
          return;
        }

        self.favoritesStore.then(function(stores) {
          if (stores.length < 1) {
            reject(new Error("No store"));
            return;
          }
          var store = stores[0];
          var maxIndex = (items.length - 1);
          var lastId = items[maxIndex].getId();
          if (index === maxIndex) {
            // Removing the last item in the array.
            store.remove(lastId).then(function(success) {
              console.log("Removed last item, success:" + success);
              resolve(success);
            });
          } else {
            while (index != maxIndex) {
              var next = (index + 1);
              var nextItem = items[next];
              nextItem.setIndex(index);
              store.put(nextItem, items[index].getId()).then(function(id) {
                console.log("Put:" + id + ", last:" + lastId);
                if (id == lastId) {
                  // Moved the last item, delete it
                  store.remove(lastId).then(function(success) {
                    console.log("Success:" + success);
                    resolve(success);
                  });
                }
              });

              // Move to the next item.
              index = next;
            }
          }
        }).catch(function(reason) {
          console.log("Failed getting the favorites store.");
          reject(reason);
        });
      }).catch(function(reason) {
        console.log("Failed getting favorite items.");
        reject(reason);
      });
    });
  }

  /**
   * Request to update existing favorites item in the favorites store.
   *
   * @param{Object} item - The updated favorites item.
   * @param{Numeric} index - The index of the item to be updated.
   */
  exports.FavoritesStore.prototype.updateFavoritesItem = function(item, index) {
    var self = this;
    return new Promise(function(resolve, reject) {
      self.getAllFavorites().then(function(items) {
        var item = items.find(function(item) {
          return item && (item.getIndex() === index);
        });

        if (item && (item.getIndex() === index)) {
          self.favoritesStore.then(function(stores) {
            if (stores.length < 0) {
              reject(new Error("No store"));
              return;
            }
            var store = stores[0];
            var storeId = item.getId();
            store.put(item, storeId).then(function(id) {
              console.log("Updated:" + id);
              resolve(id);
            }).catch(function(reason) {
              console.log("Failed removing item");
              reject(reason);
            });
          }).catch(function(reason) {
            console.log("Failed getting the favorites store.");
            reject(reason);
          });
        } else {
          reject(new Error("Item not found"));
        }
      }).catch(function(reason) {
        console.log("Failed getting favorite items.");
        reject(reason);
      });
    });
  }

  function onchangeHandler(event) {
    var callbacks = listeners;
    callbacks && callbacks.forEach(function iterCallback(callback) {
      datastore.get(event.id).then(function got(result) {
        callback.method.call(callback.context || this, { target: result || event });
      });
    });
  }

  /**
   * Register the supplied listener for updates in the favorites store.
   *
   * @param{Function|Object} listener - The listener that receives notifications
   *                                    about changes in the favorites store.
   */
  exports.FavoritesStore.prototype.addFavoritesEventListener = function(listener) {
    this.callbacks.push(listener);
  }

  /**
   * Unregister the supplied listener for updates in the favorites store.
   *
   * @param{Function|Object} listener - The listener to be removed/unregitered.
   */
  exports.FavoritesStore.prototype.removeFavoritesEventListener = function(callback) {
    var index = this.callbacks.indexOf(callback);
    if (index >= 0) {
      this.callbacks.splice(index, 1);
    }
  }





  function addEventListener(type, callback) {
    var context;
    if (!(type in listeners)) {
      listeners[type] = [];
    }

    var cb = callback;
    if (typeof cb === 'object') {
      context = cb;
      cb = cb.handleEvent;
    }

    if (cb) {
      listeners[type].push({
        method: cb,
        context: context
      });
      init();
    }
  }

  function removeEventListener(type, callback) {
    if (!(type in listeners)) {
      return false;
    }

    var callbacks = listeners[type];
    var length = callbacks.length;
    for (var i = 0; i < length; i++) {

      var thisCallback = callback;
      if (typeof thisCallback === 'object') {
        thisCallback = callback.handleEvent;
      }

      if (callbacks[i] && callbacks[i].method === thisCallback) {
        callbacks.splice(i, 1);
        return true;
      }
    }

    return false;
  }

  /**
   * This is a constructor for favorites item objects.
   *
   * @param{String} The title of the favorites item.
   * @param{String} The sub-title of the favorites item.
   * @param{String} The image URL for the favorites item.
   * @param{String} The icon URL for the favorites item.
   * @param{Array} The array of action IDs for this favorites item.
   * @param{String} The application-specific ID.
   */
  exports.FavoritesItem = function(title, subTitle, image, icon, actionIds, clientId) {
    console.log("FavoritesItem::FavoritesItem: title:" + title +
                ", subTitle:" + subTitle +
                ", image:" + image +
                ", icon:" + icon +
                ", actionIds:" + actionIds +
                ", clientId:" + clientId);
    this.title = title;
    this.subTitle = subTitle;
    this.image = image;
    this.icon = icon;
    this.actionIds = actionIds;
    this.clientId = clientId;
    this.index = -1;
  }

  exports.FavoritesItem.prototype.setIndex = function(index) {
    this.index = index;
  }

  exports.FavoritesItem.prototype.getIndex = function(index) {
    return this.index;
  }

  exports.FavoritesItem.prototype.setId = function(id) {
    this.storeId = id;
  }

  exports.FavoritesItem.prototype.getId = function() {
    return this.storeId;
  }

})(window);
