App.Router.map(function () {
  // Add your routes here
  this.route('index', {path: '/'});
  this.resource('technology', {path: '/tech'}, function(){
  });
  this.resource('contact');
  this.resource('profile');
  this.resource('about');
});
