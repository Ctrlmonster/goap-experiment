import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './react-components/App';
import '../scss/main.scss';
import {WorldProvider} from "koota/react";
import {createWorld, trait} from "koota";
import {EntityManager} from "yuka";
//import {YukaSteering} from "./react-components/planner-scene/planner-scene";

import "rc-collapse/assets/index.css";


export const YukaEntityManager = trait({ref: new EntityManager});
export const world = createWorld(YukaEntityManager);



let container: null | HTMLElement = null;
document.addEventListener('DOMContentLoaded', function () {
  if (!container) {
    container = document.getElementById('root') as HTMLElement;
    const root = ReactDOM.createRoot(container);
    root.render(
      <React.StrictMode>
        <WorldProvider world={world}>
          <App/>
        </WorldProvider>
      </React.StrictMode>
    );
  }
});

/*
In case the following warning appears: ---------------------------------------------------------------------------------

You are calling ReactDOMClient.createRoot() on a container that has already been passed to createRoot() before.
Instead, call root.render() on the existing root instead if you want to update it.

------------------------------------------------------------------------------------------------------------------------

Then replace the above code with the following
(from: https://stackoverflow.com/questions/71792005/react-18-you-are-calling-reactdomclient-createroot-on-a-container-that-has-a):

let container: null | HTMLElement = null;
document.addEventListener('DOMContentLoaded', function(event) {
  if (!container) {
    container = document.getElementById('root') as HTMLElement;
    const root = createRoot(container)
    root.render(
      <React.StrictMode>
        <App/>
      </React.StrictMode>
    );
  }
});*/