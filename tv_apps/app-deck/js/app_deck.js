/* global SpatialNavigator, SharedUtils, Applications, URL,
  KeyNavigationAdapter, ContextMenu, CardManager */

(function(exports) {
  'use strict';

  var AppDeck = function() {
  };

  AppDeck.prototype = evt({
    _navigableElements: [],

    _spatialNavigator: undefined,

    _keyNavigationAdapter: undefined,

    _contextMenu: undefined,

    _focusElem: undefined,

    _appDeckGridViewElem: document.getElementById('app-deck-grid-view'),

    _appDeckListScrollable: undefined,

    _cardManager: undefined,

    init: function ad_init() {
      var that = this;
      this._keyNavigationAdapter = new KeyNavigationAdapter();
      this._keyNavigationAdapter.init();
      this._cardManager = new CardManager();
      this._cardManager.init('readonly').then(function() {
        that._cardManager.on('cardlist-changed', that.onCardListChanged.bind(that));
      });

      Applications.init(function() {
        var apps = Applications.getAllAppEntries();
        var appGridElements = apps.map(that._createAppGridElement.bind(that));
        appGridElements.forEach(function(appGridElem) {
          that._appDeckGridViewElem.appendChild(appGridElem);
        });
        that._appDeckListScrollable = new XScrollable({
          frameElem: 'app-deck-list-frame',
          listElem: 'app-deck-list',
          itemClassName: 'app-banner',
          margin: 1.4
        });
        that._navigableElements =
          SharedUtils.nodeListToArray(
            document.querySelectorAll('.navigable:not(.app-banner)'))
            .concat(appGridElements);
        that._navigableElements.unshift(that._appDeckListScrollable);
        that._spatialNavigator = new SpatialNavigator(that._navigableElements);

        that._keyNavigationAdapter.on('move', that.onMove.bind(that));
        that._keyNavigationAdapter.on('enter', that.onEnter.bind(that));
        that._spatialNavigator.on('focus', that.onFocus.bind(that));
        that._spatialNavigator.on('unfocus', that.onUnfocus.bind(that));
        that._appDeckListScrollable.on('focus',
          that.onFocusOnAppDeckListScrollable.bind(that));
        that._spatialNavigator.focus();
        that._contextMenu = new ContextMenu();
        that._contextMenu.init(that);
      });
    },

    _createAppGridElement: function ad_createAppGridElement(app) {
      var appButton = document.createElement('smart-button');
      appButton.dataset.manifestURL = app.manifestURL;
      appButton.dataset.entryPoint = app.entryPoint;
      appButton.dataset.name = app.name;
      appButton.setAttribute('type', 'app-button');
      appButton.setAttribute('app-type', 'app');
      appButton.classList.add('app-button');
      appButton.classList.add('navigable');
      appButton.setAttribute('label', app.name);

      var ICON_SIZE_VIEWPORT_WIDTH_RATIO = 10;
      // XXX: width of container is 10vw, so the best fit icon will be
      // viewport size * (10/100) if viewport is not scalable. However this
      // value is subject to change once UX spec has definition on it.
      var bestFitIconSize =
        Math.max(window.innerWidth, window.innerHeight) /
        ICON_SIZE_VIEWPORT_WIDTH_RATIO;
      Applications.getIconBlob(
        app.manifestURL, app.entryPoint, bestFitIconSize, function(blob) {
          var iconURL = blob ? URL.createObjectURL(blob) :
            'style/icons/appic_developer.png';
          // XXX: make sure to revoke iconURL once it is no longer needed.
          // For example, icon is changed or app is uninstalled
          appButton.dataset.revokableURL = iconURL;
          appButton.style.backgroundImage = 'url("' + iconURL + '")';
        });

      return appButton;
    },

    onCardListChanged: function ad_onCardListChanged() {
      if (this._focusElem) {
        this.fireFocusEvent(this._focusElem);
      }
    },

    fireFocusEvent: function ad_fireFocusEvent(elem) {
      var that = this;
      if (elem && elem.dataset && elem.dataset.manifestURL) {
        this._cardManager.isPinned({
          manifestURL: elem.dataset.manifestURL,
          entryPoint: elem.dataset.entryPoint
        }).then(function(pinned) {
          that.fire('focus-on-pinable', {
            pinned: pinned,
            manifestURL: elem.dataset.manifestURL,
            entryPoint: elem.dataset.entryPoint,
            name: elem.dataset.name
          });
        });
      } else {
        this.fire('focus-on-nonpinable');
      }
    },

    onFocus: function ad_onFocus(elem) {
      if (elem instanceof XScrollable) {
        elem.catchFocus();
      } else if (elem.nodeName) {
        if (this._focusElem) {
          this._focusElem.blur();
        }

        // When we move focus back to app-deck-grid-view area
        // (e.g. area contains smart-button), we should always focus on
        // last focused smart-button if there is any
        if (elem.nodeName === 'SMART-BUTTON' && this._lastFocusedSmartButton) {
          elem = this._lastFocusedSmartButton;
          this._spatialNavigator.focus(elem);
        }
        elem.focus();
        this._focusElem = elem;
      }

      this.fireFocusEvent(elem);
    },

    onUnfocus: function ad_onUnfocus(elem) {
      // When we move focus from smart-button to another smart-button,
      // we don't have to remember last focused smart-button
      if (elem.nodeName === 'SMART-BUTTON') {
        this._lastFocusedSmartButton = undefined;
      }
    },

    onFocusOnAppDeckListScrollable:
      function ad_onFocusOnAppDeckListScrollable(scrollable, itemElem) {
        // When we move focus from smart-button to scrollable,
        // we have to remember the last focused smart-button in case
        // we move focus back to app-deck-grid-view area afterwards
        if (this._focusElem) {
          if (this._focusElem.nodeName === 'SMART-BUTTON') {
            this._lastFocusedSmartButton = this._focusElem;
          }
          this._focusElem.blur();
        }
        itemElem.focus();
        this._focusElem = itemElem;
      },

    onEnter: function ad_onEnter() {
      var focused = this._spatialNavigator.getFocusedElement();
      if (focused.dataset && focused.dataset.manifestURL) {
        Applications.launch(
          focused.dataset.manifestURL, focused.dataset.entryPoint);
      }
    },

    onMove: function ad_onMove(key) {
      var focused = this._spatialNavigator.getFocusedElement();
      if (focused instanceof XScrollable) {
        if (focused.spatialNavigator.move(key)) {
          return;
        }
      }
      this._spatialNavigator.move(key);
    }
  });

  exports.appDeck = new AppDeck();
  exports.appDeck.init();

}(window));
