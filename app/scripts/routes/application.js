App.ApplicationRoute = Ember.Route.extend({
  setupController: function(controller) {
    controller.set('username', 'coderatchet');
    controller.set('appName', 'The Nagle Code');
    controller.set('subTitle', 'Coding Excellence');
  }
});
