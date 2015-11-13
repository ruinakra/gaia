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
                var arrayCount = result.length;
                console.log('arrayCount = ' + arrayCount)
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
   *                If the index is too big or undefined then a newItem will be insert to the end of array.
   *                If the index is negative then a newItem will be insert to the begin of array.
   */
  exports.FavoritesStore.prototype.insertItem = function(newItem, index) {
    console.log("START insertItem");
    if (index === undefined) {
        console.log("Index is undefined");
    } else {
        console.log("Index is: " + index);
    }

    var self = this;
    var datastore = this.favoritesStore;
    return new Promise(function(resolve, reject) {
      datastore.then(function(stores) {
        console.log("hello!: count:" + stores.length);
        if (stores.length > 0) {
          var store = stores[0];
          console.log("FavoritesStore::getAllFavorites: name:" + store.name);

          self.getAllFavorites().then(function(items) {
            console.log(' ================================== items getted !')
            var itemsCount = items.length;
            console.log('itemsCount = ' + itemsCount)

            if (index === undefined || index >= itemsCount) // append
            {
              console.log('  APPEND')
              newItem.setIndex(++itemsCount);
              store.add(newItem).then(function(newId) {
                console.log('added id: ' + newId);
                resolve(newId);
              }).catch(function(reason) {
                console.log("Failed to APPEND, reason:" + reason);
                reject(new Error("Failed to append"));
              });
            }
            else if (index < 0) // prepend
            {
              console.log('  PREPEND')

              newItem.setIndex(0);

              items.forEach(function(item) {
                var currIndex = item.getIndex();
                item.setIndex(++currIndex);
                console.log("__ currIndex: " + currIndex);

                store.put(item, item.getId()).then(function(id) {
                  console.log("__ updated id: " + id);
                }).catch(function(reason) {
                  console.log("Failed to put, reason:" + reason);
                  reject(new Error("Failed to prepend"));
                });
              });

              store.add(newItem).then(function(newId) {
                console.log('added id: ' + newId);
                resolve(newId);
              }).catch(function(reason) {
                console.log("Failed to PREPEND, reason:" + reason);
                reject(new Error("Failed to add"));
              });
            }
            else if (index < itemsCount) // insert
            {
              console.log('  INSERT')
              var foundItem = items.find(function(item) {
                return item && (item.getIndex() === index);
              });

              if (foundItem && (foundItem.getIndex() === index)) {
                console.log("foundItem.Index : " + foundItem.getIndex());
                console.log("foundItem.Id    : " + foundItem.getId());

                newItem.setIndex(index);

                for (var i = index; i < items.length; i++) {
                  var tempItem = items[i];
                  tempItem.setIndex(tempItem.getIndex() + 1);

                  store.put(tempItem, tempItem.getId()).then(function(id) {
                    console.log("__ updated id: " + id);
                  }).catch(function(reason) {
                    console.log("Failed to put, reason:" + reason);
                    reject(new Error("Failed to insert"));
                  });
                }

                store.add(newItem).then(function(newId) {
                  console.log('added id: ' + newId);
                  resolve(newId);
                }).catch(function(reason) {
                   console.log("Failed to INSERT, reason:" + reason);
                   reject(new Error("Failed to add"));
                });
              }
            }
          })
        } else {
           console.log("incorrect store");
           reject(new Error("incorrect store"));
        }
      })
    })
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
            }).catch(function(reason) {
              reject(reason);
            });
          } else {
            var beforeLastItemId = items[maxIndex - 1].getId();
            while (index != maxIndex) {
              var next = (index + 1);
              var nextItem = items[next];
              nextItem.setIndex(index);
              store.put(nextItem, items[index].getId()).then(function(id) {
                console.log("Put:" + id + ", last:" + lastId);
                if (id == beforeLastItemId) {
                  // Moved the last item, delete it
                  store.remove(lastId).then(function(success) {
                    console.log("Success:" + success);
                    resolve(success);
                  }).catch(function(reason) {
                    reject(reason);
                  });
                }
              }).catch(function(reason) {
                reject(reason);
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
  exports.FavoritesStore.prototype.updateFavoritesItem = function(newItem, index) {
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
          var storeId = item.getId();
          newItem.setIndex(index);
          store.put(newItem, storeId).then(function(id) {
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
    this.index = -1;
    this.title = title;
    this.subTitle = subTitle;
    this.image = image;
    this.icon = icon;
    this.actionIds = actionIds;
    this.clientId = clientId;
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
