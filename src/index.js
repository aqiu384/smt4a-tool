import React from 'react';
import ReactDom from 'react-dom';
import registerServiceWorker from './registerServiceWorker';
import App from './smt4a-tool/Smt4ATool'

ReactDom.render(<App />, document.getElementById('root'));
registerServiceWorker();
