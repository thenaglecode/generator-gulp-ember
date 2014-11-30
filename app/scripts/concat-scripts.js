(function(){
"use strict";
/* jshint devel: true */
/* global Ember: true */
(function() {
    'use strict';

    var App = window.App = Ember.Application.create();

    App.Router.map(function() {
        this.route('favorites');
    });
})();

})();
(function(){
"use strict";
/* jshint devel:true 
   global Ember: false
   global App: true
*/

App.ApplicationRoute = Ember.Route.extend({
  setupController: function(controller) {
    // `controller` is the instance of ApplicationController
    controller.set('title', "Hello world!");
  }
});

App.ApplicationController = Ember.Controller.extend({
  appName: 'My First Example'
});
})();
(function(){
"use strict";
App.FavoritesRoute = Ember.Route.extend({
    model: function() {
        return this.store.find('post');
    }
});
})();