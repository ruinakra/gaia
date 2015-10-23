'use strict';

(function (exports) {

  function PinnedAppItem(index, entry) {
    if (index === null || index === undefined){
      return false;
    }
    this.index = index;
    //creating pinned app element
    var pinnedElem = document.createElement('div');
    var pinnedAppIcon = document.createElement('img');
    var pinnedAppTitle = document.createElement('span');
    var pinnedList = document.getElementById('pinned-apps-list');
    var moreAppsLi = document.getElementById('moreApps');
    var unreadNotif = document.createElement('div');


    pinnedElem.className = 'pinned-app-item';
    pinnedAppIcon.className = 'pinned-app-icon';
    pinnedAppTitle.className = 'title';
    unreadNotif.className = 'unread_notif item-hidden';

    pinnedElem.setAttribute('data-index', this.index);
    pinnedElem.appendChild(pinnedAppIcon);
    pinnedElem.appendChild(pinnedAppTitle);
    pinnedElem.appendChild(unreadNotif);

    pinnedList.insertBefore(pinnedElem, moreAppsLi);

    this.element = pinnedElem;
    this.icon = pinnedAppIcon;
    this.title = pinnedAppTitle;

    if (entry){
      this.entry = entry;
      this.entry.index = this.index;
      this.targetApp = app.getAppByURL(this.entry.manifestURL);
      this.render();
    }
  }

  PinnedAppItem.prototype = {

    render: function() {

      var self = this;
      function getName() {
        var name = self.entry.locales[document.documentElement.lang].name;
        return  name ? name : self.entry.name;
      }

      //TODO: it is necessary to delete elements from pinned app list from
      //page not hide them and refresh target app for example when application
      //is being uninstalled.
      if(this.targetApp) {
        var manifest = this.targetApp.manifest;
        var entry_point = this.entry.entry_point;
        var appIcons = [];

        this.icon.style.visibility = 'visible';
        this.title.style.visibility = 'visible';

        if (this.entry){
          this.element.addEventListener('click', this);

          this.element.dataset.manifesturl = this.entry.manifestURL;
          this.element.dataset.entrypoint = this.entry.entry_point;

          if (manifest.entry_points) {
            if (entry_point) {
              appIcons = manifest.entry_points[entry_point].icons;
            }else{
              console.error('Entry point must be defined');
            }
          } else {
            appIcons = manifest.icons;
          }

          for (var size in appIcons) {
            if (size >= 75) {
              var mainURL = this.entry.manifestURL.split('/');
              mainURL.splice(-1, 1);
              this.icon.src = mainURL.join('/') + appIcons[size];
              break;
            }
          }

          if (this.entry.locales) {
            this.title.textContent = getName();
          } else {
            this.entry.locales = manifest.entry_points && entry_point ?
              manifest.entry_points[entry_point].locales :
              manifest.locales;
            this.title.textContent = getName();
          }
        }

      } else {
        this.icon.style.visibility = 'hidden';
        this.title.style.visibility = 'hidden';
      }
    },

    refreshDomElem: function(elem){
      this.element = elem;
      this.icon = this.element.querySelector('.pinned-app-icon');
      this.title = this.element.querySelector('.title');
      this.render();
    },

    clear: function() {
      this.entry = {
        entry_point: null,
        name: null,
        manifest: null,
        index: this.index
      };
      this.element.removeEventListener('click', this);
      this.targetApp = null;
    },

    launch: function() {
      if(!this.targetApp) {
        return;
      }

      if(this.entry.entry_point) {
        this.targetApp.launch(this.entry.entry_point);
      } else {
        this.targetApp.launch();
      }
    },

    getEntry: function() {
      return this.entry;
    },

    save: function() {
      app.savePinnedAppItem(this.entry);
    },

    handleEvent: function(e) {
      this.launch();
    }
  };

  function PinnedAppsManager() {
    if (PinnedAppsManager.instance){
      return PinnedAppsManager.instance;
    }

    PinnedAppsManager.instance = this;

    this.items = [];
    this._storeRef = null;
  }

  function LoadAllNotifications(store) {
    return new Promise( (resolve, reject) => {
      var storedNotifications = {};
      var cursor = store.sync();
      function cursorResolve(task) {
        switch (task.operation) {
          case 'update':
          case 'add':
            storedNotifications[task.id] = task.data;
            break;

          case 'remove':
            delete storedNotifications[task.id];
            break;

          case 'clear':
            storedNotifications = {};
            break;

          case 'done':
            resolve(storedNotifications);
            break;
        }

        cursor.next().then(cursorResolve, reject);
      }
      cursor.next().then(cursorResolve, reject);

    });
  }

  function CleanAllBubbles() {
    app.getPinAppList().forEach( app => {
      ShowNotifBubble(app.manifestURL, 0);
    });
  }

  function ShowNotifBubble(appId,notifCount){
    var items = app.pinnedAppsManager.items;
    for(var i=0;items.length; i++){
      if(items[i].entry.manifestURL == appId){
        var unreadNotif = items[i].element
          .getElementsByClassName('unread_notif')[0];

          var notifCountBase;
          notifCountBase = parseInt(notifCount);

          if(notifCountBase > 0 || notifCountBase){
            unreadNotif.classList.remove('item-hidden');
            unreadNotif.textContent = notifCountBase;
          }
          else{
            unreadNotif.classList.add('item-hidden');
            unreadNotif.textContent = 0;
          }

      }
    }
  }

  PinnedAppsManager.prototype = {
    STORE_NAME: 'notifications_count',
    init: function () {
      var pinnedAppsList = app.getPinnedAppsList();

      for (var i = 0; i < pinnedAppsList.length; i++) {
        this.items[i] = new PinnedAppItem(i, pinnedAppsList[i]);
      }

      this.items[0].element.classList.add('middle');

      if(!document.getElementById('moreApps')){
        var moreApps = document.createElement('div');
        moreApps.className = 'pinned-app-item';
        moreApps.setAttribute('data-index', '999');
        moreApps.setAttribute('id', 'moreApps');

          var moreAppsInput = document.createElement('input');
          moreAppsInput.setAttribute('id', 'moreAppsButton');
          moreAppsInput.setAttribute('type','button');

          var moreAppsSpan = document.createElement('span');
          moreAppsSpan.className = 'title';
          moreAppsSpan.textContent = 'More Apps';

        moreAppsInput.appendChild(moreAppsSpan);
        moreApps.appendChild(moreAppsInput);

        var pinList = document.getElementById('pinned-apps-list');
        pinList.appendChild(moreApps);
      }

       this.initStore().then(store => {
        store.onchange = e => {
          switch (e.operation) {
          case 'removed':
            ShowNotifBubble(e.id, 0);
            break;
          case 'cleared':
            CleanAllBubbles();
            break;
          case 'added':
            case 'updated':
            break;
            }

          this._storeRef.get(e.id).then( count => {
            // trying to workaround bunch removal of notifications e.g. when
            //opening 'Missed calls'
            // screen, which leads to almost simultaneous 'close' of all
            //missed calls notifications
            if (count) {
              ShowNotifBubble(e.id, count);
            }
          });
        };
        LoadAllNotifications(store).then( data => {
          Object.getOwnPropertyNames(data).forEach( item => {
            ShowNotifBubble(item, data[item]);
          });
        });

      });
    },

    debug: function pa_debug(msg) {
      console.log('[el] ' + msg);
    },

    initStore: function pa_initStore() {
      return new Promise(resolve => {
        if (this._storeRef) {
          return resolve(this._storeRef);
        }
        navigator.getDataStores(this.STORE_NAME).then(stores => {
          this._storeRef = stores[0];
          //TODO: need to iterate through obtained store, to read initial
          //values for notifications.
          return resolve(this._storeRef);
        });
      });
    },

    addEntry: function(i,manifestURL,img,name) {

      app.itemStore._pinnedAppsList[i] = {};
      app.itemStore._pinnedAppsList[i].icon = img;
      app.itemStore._pinnedAppsList[i].index = i;
      app.itemStore._pinnedAppsList[i].manifestURL = manifestURL;
      app.itemStore._pinnedAppsList[i].name = name;

      this.items[i] = new PinnedAppItem(i,app.itemStore._pinnedAppsList[i]);

      return this.items[i];
    }
  };

  exports.PinnedAppsManager = PinnedAppsManager;
})(window);
