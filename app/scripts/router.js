App.Router.map(function () {
  // Add your routes here
  this.resource('posts', function() {
      this.route('favorites');
  });
});


App.ApplicationRoute = Ember.Route.extend({
  setupController: function(controller) {
    // `controller` is the instance of ApplicationController
    controller.set('title', 'Hello world!');
  }
});

App.IndexRoute = Ember.Route.extend({
    setupController: function(controller) {
        controller.set('username', 'jared');
    }
});

App.ApplicationController = Ember.Controller.extend({
  appName: 'My First Example'
});