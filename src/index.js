import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter as Router, Route } from "react-router-dom"; 
/*
HashRouter
1.用这个了就代表路径加上/#/
2.换成BrowserRouter了；路径就不需要加/#/
*/
import { Provider } from "react-redux";
import store from './store'
import App from './App';
// import registerServiceWorker from '@utils/registerServiceWorker';

ReactDOM.render(
  <Provider store={store}>
    <Router>
      <Route component={App} />
    </Router>
  </Provider>,
  document.getElementById('app')
);
// registerServiceWorker();
