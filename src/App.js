import React, { Component } from "react";
import {withRouter, Route, Switch } from "react-router-dom";
import routes from "./router";
import InitPage from '@pages/home/init';
import './assets/css/reset.less';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    return (
      <Switch>
        {
          routes.map((route, key) => {
            if (route.exact) {
              return <Route key={key} exact path={route.path}
              render={() => {
                document.title = route.title || "威缴费";
                return <InitPage><route.component/></InitPage>
              }}
              />
            } else {
              return <Route key={key} path={route.path}
              render={() => {
                document.title = route.title || "威缴费";
                return <InitPage><route.component/></InitPage>
              }}
              />
            }
          })
        }
      </Switch>
    );
  }
}
export default withRouter(App);
