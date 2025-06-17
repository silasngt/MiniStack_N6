const fs = require('fs-extra');

fs.copy('public', 'build/public');
fs.copy('views', 'build/views');