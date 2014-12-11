/* exported App */
var App = window.App = Ember.Application.create();

App.Router.map(function() {
    this.route('favorites');
});
