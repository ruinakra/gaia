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
    this.actions = [];

    this.favoritesStore.then(function(stores) {
      if (stores.length > 0) {
        var store = stores[0];

        var onFavoritesStoreChanged = function(event) {
          console.log("Store event:" + event.operation);
          if (event.operation == "removed") {
            console.log("Store update: removed:" + event.id);
            reportFavoritesStoreUpdate.call(self, exports.FavoritesChangeEvent.OperationEnum.removed, event.id);
          } else if (event.operation == "cleared") {
            reportFavoritesStoreUpdate.call(self, exports.FavoritesChangeEvent.OperationEnum.cleared, -1);
          } else {
            self._getFavoritesItem(event.id).then(function(item) {
              console.log("Got item:" + item.index);
              console.log("--- clientId:" + item.clientId + ", id:" + event.id);
              reportFavoritesStoreUpdate.call(self, (event.operation == "added") ?
                exports.FavoritesChangeEvent.OperationEnum.added : exports.FavoritesChangeEvent.OperationEnum.updated,
                item.clientId);
            }).catch(function(reason) {
              console.log("Failed, reason:" + reason.message);
            });
          }
        }

        store.onchange = onFavoritesStoreChanged;
        console.log("Registered listener, store name:" + store.name);
      }
    });
  }

  /**
   * Sets all the action items.
   */
  exports.FavoritesStore.prototype.initActions = function(newActions) {
    if(newActions.length == 0) {
      console.log('newActions is empty');
      return(new Error("newActions is empty"));
    }

    var self = this;
    var datastore = this.actionsStore;

    return new Promise(function(resolve, reject) {
      datastore.then(function(stores) {
        console.log("stores count:" + stores.length);
        if (stores.length > 0) {
          var store = stores[0];

          store.clear().then(function(success) {
            console.log("Finished:" + success);
          }).catch(function(reason) {
            console.log("Failed to clear, reason:" + reason);
            reject(new Error("Failed to clear"));
          });

          for(var i = 0; i < newActions.length; i++) {
            store.add(newActions[i]).then(function(newId) {
              console.log('added id: ' + newId);
            }).catch(function(reason) {
              console.log("Failed to APPEND, reason:" + reason);
              reject(new Error("Failed to append"));
              return;
            });
          }
          resolve(newActions.length);
        } else {
          console.log("incorrect store");
          reject(new Error("incorrect store"));
        }
      })
    })
  }

  /**
   * Get all the actions.
   */
  exports.FavoritesStore.prototype.getActions = function() {

    var self = this;
    var datastore = this.actionsStore;

    return new Promise(function(resolve, reject) {
      datastore.then(function(stores) {
        if (stores.length > 0) {
          var store = stores[0];

          self.getAllFavorites(true).then(function(items) {
            console.log('items.length = ' + items.length)
            resolve(items)
          })
        } else {
          console.log("incorrect store");
          reject(new Error("incorrect store"));
        }
      })
    })
  }

  /**
   * Sets all the action items.
   */
  exports.FavoritesStore.prototype.getAction = function(actionId) {

    if (actionId === undefined) {
      console.log("actionId is undefined");
      return undefined;
    }

    var item = {};
    var self = this;
    var datastore = this.actionsStore;

    return new Promise(function(resolve, reject) {
      datastore.then(function(stores) {
        if (stores.length > 0) {
          var store = stores[0];

          self.getAllFavorites(true).then(function(items) {
            var itemsCount = items.length;
            console.log('itemsCount = ' + itemsCount)

            for (var i = 0; i < items.length; i++) {
              if (items[i].actionId == actionId) {
                  item = items[i];
                  resolve(item)
                  return;
              }
            }

            console.log("action not found");
            reject(new Error("action not found"));

          })
        } else {
          console.log("incorrect store");
          reject(new Error("incorrect store"));
        }
      })
    })
  }

  /**
   * Gets the name of the favorites store object.
   */
  exports.FavoritesStore.prototype.getName = function() {
    var datastore = this.favoritesStore;

    return new Promise(function(resolve, reject) {
      datastore.then(function(stores) {
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

  exports.FavoritesStore.prototype._getFavoritesItem = function(storeId) {
    var datastore = this.favoritesStore;

    return new Promise(function(resolve, reject) {
      datastore.then(function(stores) {
        if (stores.length > 0) {
          var store = stores[0];

          store.get(storeId).then(function(storeItem) {
            var item = new FavoritesItem(storeItem.title, storeItem.subTitle,
                                         storeItem.image, storeItem.icon,
                                         storeItem.actionIds, storeItem.clientId);
            item.setId(storeId);
            item.setIndex(storeItem.index);
            item.setOkAction(storeItem.okAction);
            item.setSendAction(storeItem.sendAction);
            resolve(item);
          }).catch(function(reason) {
            reject(reason);
          });
        } else {
          reject(new Error("No store"));
        }
      });
    });
  }

  /**
   * Gets all the favorite items in the current store.
   */
  exports.FavoritesStore.prototype.getAllFavorites = function(getActivity) {
    var datastore = this.favoritesStore;

    if (getActivity != undefined) {
        datastore = this.actionsStore;
    }

    return new Promise(function(resolve, reject) {
      datastore.then(function(stores) {
        if (stores.length > 0) {
          var store = stores[0];

          var result = [];
          var cursor = store.sync();

          var cursorResolve = function(task) {
            switch (task.operation) {
            case 'update':
            case 'add':
              {
              var item;
              if (getActivity === undefined) {
                item = new FavoritesItem(task.data.title, task.data.subTitle,
                                         task.data.image, task.data.icon,
                                         task.data.actionIds, task.data.clientId);
                item.setOkAction(task.data.okAction);
                item.setSendAction(task.data.sendAction);
              } else {
                item = new ActionsItem(task.data.activityName, task.data.actionId, task.data.filters);
              }

              item.setId(task.id);
              item.setIndex(task.data.index);
              result[task.data.index] = item;

              }
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
        if (stores.length > 0) {
          var store = stores[0];
          console.log("FavoritesStore::clearAllFavorites: owner:" + store.owner);
          console.log("FavoritesStore::clearAllFavorites: readOnly:" + stores.readOnly);
          store.clear().then(function(success) {
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
        if (stores.length > 0) {
          var store = stores[0];
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
  exports.FavoritesStore.prototype.insertFavoritesItem = function(newItem, index) {
    var self = this;
    var datastore = this.favoritesStore;

    return new Promise(function(resolve, reject) {
      datastore.then(function(stores) {

        if (stores.length > 0) {
          var store = stores[0];

          self.getAllFavorites().then(function(items) {
            var itemsCount = items.length;

            if (index === undefined || index >= itemsCount) // APPEND
            {
              newItem.setIndex(itemsCount);
              store.add(newItem).then(function(newId) {
                resolve(newId);
              }).catch(function(reason) {
                console.log("Failed to APPEND, reason:" + reason);
                reject(new Error("Failed to append"));
              });
            } else if (index < 0) { // PREPEND
              newItem.setIndex(0);

              items.forEach(function(item) {
                var currIndex = item.getIndex();
                item.setIndex(++currIndex);

                store.put(item, item.getId()).then(function(id) {
                  console.log("updated id: " + id);
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
            } else if (index < itemsCount) { // INSERT
              var foundItem = items.find(function(item) {
                return item && (item.getIndex() === index);
              });

              if (foundItem && (foundItem.getIndex() === index)) {
                newItem.setIndex(index);

                for (var i = index; i < items.length; i++) {
                  var tempItem = items[i];
                  tempItem.setIndex(tempItem.getIndex() + 1);

                  store.put(tempItem, tempItem.getId()).then(function(id) {
                    console.log("updated id: " + id);
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
   * This method moves the favorite item from currentIndex position to newIndex position.
   * This method for rearrange items.
   *
   * @param{Numeric} Curent position of an item.
   * @param{Numeric} New position of an item.
   */
  exports.FavoritesStore.prototype.moveFavoritesItem = function(currentIndex, newIndex) {
    var self = this;
    var datastore = this.favoritesStore;
    return new Promise(function(resolve, reject) {
      datastore.then(function(stores) {
        if (stores.length > 0) {
          var store = stores[0];

          self.getAllFavorites().then(function(items) {
            var itemsCount = items.length;
            console.log('itemsCount = ' + itemsCount)

            if (currentIndex === undefined || currentIndex >= itemsCount)
            {
              console.log("incorrect currentIndex");
              reject(new Error("incorrect currentIndex"));
            }

            if (newIndex === undefined || newIndex >= itemsCount)
            {
              console.log("incorrect newIndex");
              reject(new Error("incorrect newIndex"));
            }

            var currentItem = items[currentIndex];
            var newItem = items[newIndex];

            if (currentItem === undefined || newItem === undefined) {
              console.log("items were not found");
              reject(new Error("items were not found"));
            }

            currentItem.setIndex(newIndex);
            newItem.setIndex(currentIndex);

            store.put(currentItem, currentItem.getId()).then(function(id) {
              console.log("updated currentItem, id: " + id);
            }).catch(function(reason) {
              console.log("Failed to put in currentItem, reason:" + reason);
              reject(new Error("Failed to put"));
            });

            store.put(newItem, newItem.getId()).then(function(id) {
              console.log("updated newItem, id: " + id);
              resolve(id);
            }).catch(function(reason) {
              console.log("Failed to put in newItem, reason:" + reason);
              reject(new Error("Failed to put"));
            });
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
    console.log("Item found at:" + index);
    if (index >= 0) {
      this.callbacks.splice(index, 1);
    }
  }

  function reportFavoritesStoreUpdate(operation, id) {
    console.log("Reporting favorites store udpate, operation:" + operation +
                ", id:" + id);
    this.callbacks.forEach(function(item) {
      item(operation, id);
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
   * @param{String} The application-specific ID.
   */
  exports.FavoritesItem = function(title, subTitle, image, icon, actionIds, clientId) {
    this.index = -1;
    this.title = title;
    this.subTitle = subTitle;
    this.image = image;
    this.icon = icon;
    this.actionIds = actionIds;
    this.clientId = clientId;
  }

  /**
   * Set the index for the favorites item object.
   *
   * @param{Numeric} index - The new value for the favorites item index.
   */
  exports.FavoritesItem.prototype.setIndex = function(index) {
    this.index = index;
  }

  /**
   * Get the index for the favorites item object.
   */
  exports.FavoritesItem.prototype.getIndex = function(index) {
    return this.index;
  }

  /**
   * Set the internal store ID for the favorites item.
   *
   * @param{Numeric} id - The store ID for this favorites item.
   */
  exports.FavoritesItem.prototype.setId = function(id) {
    this.storeId = id;
  }

  /**
   * Get the internal store ID for this favorites item.
   */
  exports.FavoritesItem.prototype.getId = function() {
    return this.storeId;
  }

  /**
   * Set the 'send-action' for this favorites item.
   *
   * @param{String} sendAction - The new send action for this favorites item.
   */
  exports.FavoritesItem.prototype.setSendAction = function(sendAction) {
    this.sendAction = sendAction;
  }

  /**
   * Get the 'send-action' for this favorites item.
   */
  exports.FavoritesItem.prototype.getSendAction = function() {
    return this.sendAction;
  }

  /**
   * Set the 'ok-action' for this favorites item.
   *
   * @param{String} okAction - The new ok action for this favorites item.
   */
  exports.FavoritesItem.prototype.setOkAction = function(okAction) {
    this.okAction = okAction;
  }

  /**
   * Get the 'ok-action' for this favorites item.
   */
  exports.FavoritesItem.prototype.getOkAction = function() {
    return this.okAction;
  }

  /**
   * This is a constructor for objects describing changes in the favorites store.
   *
   * @param{Numeric} index - The index of the updated item.
   * @param{Object} operation - Object of class 'FavoritesChangeEvent.OperationEnum'
   *                            describing the current update.
   */
  exports.FavoritesChangeEvent = function(index, operation) {
    this.index = index;
    this.operation = operation;
  }

  exports.FavoritesChangeEvent.OperationEnum = {
    "added" : 1,
    "updated" : 2,
    "removed" : 3,
    "cleared" : 4,
  };

  /**
   * This is a constructor for actions item objects.
   *
   * @param{String} The name of the activity.
   * @param{Numeric} The action id for the actions item.
   * @param{object} Contains capability information for the actions item.
   */
// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
  exports.ActionsItem = function(activityName, actionId, filters) {
    this.index = -1;
    this.activityName = activityName;
    this.actionId = actionId;
    this.filters = Object.assign({}, filters);
  }

  /**
   * Set the index for the actions item object.
   *
   * @param{Numeric} index - The new value for the actions item index.
   */
  exports.ActionsItem.prototype.setIndex = function(index) {
    this.index = index;
  }

  /**
   * Get the index for the actions item object.
   */
  exports.ActionsItem.prototype.getIndex = function() {
    return this.index;
  }

  /**
   * Set the internal store ID for the actions item.
   *
   * @param{Numeric} id - The store ID for this actions item.
   */
  exports.ActionsItem.prototype.setId = function(id) {
    this.storeId = id;
  }

  /**
   * Get the internal store ID for this actions item.
   */
  exports.ActionsItem.prototype.getId = function() {
    return this.storeId;
  }


})(window);
