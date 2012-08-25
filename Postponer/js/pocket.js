/// <reference path="/js/jquery-1.8.0.min.js" />
/// <reference path="/js/sugar-1.3.min.js" />

(function () {
    'use strict';

    var Pocket = function (username, password, apikey, since) {
        this.domain = 'https://readitlaterlist.com/v2';
        this.username = username;
        this.password = password;
        this.apikey = apikey;
        this.since = since;
    };

    Pocket.prototype.auth = function (callback) {
        var url = this.domain + '/auth';
        var params = {
            username: this.username,
            password: this.password,
            apikey: this.apikey
        };

        $.ajax({
            url: url,
            data: params,
            complete: function (xhr, status) {
                callback(xhr.status);
            }
        });
    };

    Pocket.prototype.signup = function (username, password, callback) {
        var url = this.domain + '/signup';
        var params = {
            username: username,
            password: password,
            apikey: this.apikey
        };

        $.ajax({
            url: url,
            data: params,
            complete: function (xhr, status) {
                callback(xhr.status);
            }
        });
    };

    Pocket.prototype.getNumUnread = function (callback) {
        var url = this.domain + '/stats';

        var params = {
            username: this.username,
            password: this.password,
            apikey: this.apikey
        };

        $.getJSON(
            url,
            params,
            function (data) {
                callback(data.count_unread);
            }
        );
    };

    Pocket.prototype.add = function (url, title, callback) {
        var url = this.domain + '/add';
        var params = {
            username: this.username,
            password: this.password,
            apikey: this.apikey,
            url: url
        };

        if (title) {
            params.title = title;
        }

        $.ajax({
            url: url,
            data: params,
            complete: function (xhr, status) {
                callback(xhr.status);
            }
        });
    };

    Pocket.prototype.markRead = function (url, callback) {
        var reqUrl = this.domain + '/send';

        var params = {
            username: this.username,
            password: this.password,
            apikey: this.apikey,
            read: '{"0":{"url":' + url + '}}',
        };

        $.ajax({
            url: reqUrl,
            data: params,
            complete: function (xhr, status) {
                callback(xhr.status);
            }
        });
    };

    Pocket.prototype.getUnreadList = function (count, page, callback) {
        var url = this.domain + '/get';

        var params = {
            username: this.username,
            password: this.password,
            apikey: this.apikey,
            state: 'unread',
            count: count,
            page: page
        };

        if (this.since) {
            params.since = this.since;
        }

        $.getJSON(
            url,
            params,
            function (data) {
                if (data.since) {
                    this.since = data.since;
                }
                callback(data);
            }
        );
    };

    window.Pocket = Pocket;
})();