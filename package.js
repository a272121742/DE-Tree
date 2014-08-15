Package.describe({
  summary:'HC封装的DE-Tree'
});

Package.on_use(function(api){
  api.use('underscore',['client','server']);
  api.use('ui','client');
  api.use('templating','client');
  api.use('reactive-dict',['client','server']);
  api.use('Appliance');

  api.add_files('css/DE-Tree-style.css','client');
  api.add_files('js/DE-Tree-client.js','client');
  api.export('TreeManager', 'client')
});