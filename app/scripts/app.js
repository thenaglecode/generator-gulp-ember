/* jshint devel: true */
/* global Ember: true */
(function() {
    'use strict';

    var App = window.App = Ember.Application.create();

    App.Router.map(function() {
        this.route('favorites');
    });
})();
