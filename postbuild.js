const fs = require('fs');

const path = require('path');
 
const buildPath = path.join(__dirname, 'build');

const indexFile = path.join(buildPath, 'index.html');
 
const routes = [

  'callback', 

  'dashboard', 

  'glocalizationFactory', 

  'glocalizationHub', 

  'importContentPage',

  'globalAssetCapture',

  'smartTMTranslationHub',

  'culturalAdaptationWorkspace',

  'regulatoryCompliance',

  'draftTranslationPage',

  'tm-analysis'

];
 
routes.forEach(route => {

  const routeDir = path.join(buildPath, route);

  // 1. Create the directory

  if (!fs.existsSync(routeDir)) {

    fs.mkdirSync(routeDir);

  }

  // 2. Copy index.html into that directory

  fs.copyFileSync(indexFile, path.join(routeDir, 'index.html'));

});
 
console.log("Post-build complete: AWS routing fallback folders created.");
 