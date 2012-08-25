/// <reference path="/js/jquery-1.8.0.min.js" />
/// <reference path="/js/sugar-1.3.min.js" />
/// <reference path="/js/pocket.js" />

(function () {
    "use strict";

    var appView = Windows.UI.ViewManagement.ApplicationView;
    var appViewState = Windows.UI.ViewManagement.ApplicationViewState;
    var nav = WinJS.Navigation;
    var ui = WinJS.UI;

    var pocket = new Pocket('limitedmage', 'w5bs4t5', '6a1gGdT4p0Z4cD573dTf3aMk3aA0l54b');

    var unreadList = [];
    var bindedList = new WinJS.Binding.List([]);

    var currentPage = 1;
    var count = 20;

    ui.Pages.define("/pages/groupedItems/groupedItems.html", {
        // Navigates to the groupHeaderPage. Called from the groupHeaders,
        // keyboard shortcut and iteminvoked.
        navigateToGroup: function (key) {
            nav.navigate("/pages/groupDetail/groupDetail.html", { groupKey: key });
        },

        // This function is called whenever a user navigates to this page. It
        // populates the page elements with the app's data.
        ready: function (element, options) {
            var listView = element.querySelector(".groupeditemslist").winControl;
            listView.itemTemplate = element.querySelector(".itemtemplate");
            listView.oniteminvoked = this._itemInvoked.bind(this);

            // Set up a keyboard shortcut (ctrl + alt + g) to navigate to the
            // current group when not in snapped mode.
            listView.addEventListener("keydown", function (e) {
                if (appView.value !== appViewState.snapped && e.ctrlKey && e.keyCode === WinJS.Utilities.Key.g && e.altKey) {
                    var data = listView.itemDataSource.list.getAt(listView.currentItem.index);
                    this.navigateToGroup(data.group.key);
                    e.preventDefault();
                    e.stopImmediatePropagation();
                }
            }.bind(this), true);

            this._initializeLayout(listView, appView.value);
            listView.element.focus();

            this._sync();

            var lve = ".groupeditemslist .win-viewport";

            var that = this;
            $(lve).bind('scroll', function () {
                var width = $(this).width();
                if ($(this)[0].scrollLeft + width >= $(this)[0].scrollWidth) {
                    that._sync();
                }
            });
        },

        // This function updates the page layout in response to viewState changes.
        updateLayout: function (element, viewState, lastViewState) {
            /// <param name="element" domElement="true" />

            var listView = element.querySelector(".groupeditemslist").winControl;
            if (lastViewState !== viewState) {
                if (lastViewState === appViewState.snapped || viewState === appViewState.snapped) {
                    var handler = function (e) {
                        listView.removeEventListener("contentanimating", handler, false);
                        e.preventDefault();
                    }
                    listView.addEventListener("contentanimating", handler, false);
                    this._initializeLayout(listView, viewState);
                }
            }
        },

        // This function updates the ListView with new layouts
        _initializeLayout: function (listView, viewState) {
            /// <param name="listView" value="WinJS.UI.ListView.prototype" />

            if (viewState === appViewState.snapped) {
                listView.itemDataSource = bindedList.dataSource;
                listView.layout = new ui.ListLayout();
            } else {
                listView.itemDataSource = bindedList.dataSource;
                listView.layout = new ui.GridLayout();
            }
        },

        _itemInvoked: function (args) {
            if (appView.value === appViewState.snapped) {
                // If the page is snapped, the user invoked a group.
                var group = Data.groups.getAt(args.detail.itemIndex);
                this.navigateToGroup(group.key);
            } else {
                // If the page is not snapped, the user invoked an item.
                var item = Data.items.getAt(args.detail.itemIndex);
                nav.navigate("/pages/itemDetail/itemDetail.html", { item: Data.getItemReference(item) });
            }
        },

        _sync: function () {
            pocket.getUnreadList(count, currentPage, function (data) {
                if (data.list) {
                    unreadList = data.list;
                    currentPage += 1;

                    for (var i in unreadList) {
                        if (unreadList.hasOwnProperty(i)) {
                            bindedList.push(unreadList[i]);
                        }
                    }
                }
            });
        }
    });
})();
