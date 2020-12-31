'use strict';

import './index.html';
import { Elm } from './Main.elm';

var app = Elm.Main.init({
  node: document.getElementById('main'),
});
