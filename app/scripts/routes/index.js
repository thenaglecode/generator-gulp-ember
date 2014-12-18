App.IndexRoute = Ember.Route.extend({
  setupController: function(controller) {
    controller.set('username', 'jared');
    controller.set('appName', 'The Nagle Code');
    controller.set('subTitle', 'Coding Excellence');
  }
});
