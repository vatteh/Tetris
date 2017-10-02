/* jshint esversion:6 */
import React from 'react';
import ReactDOM from 'react-dom';
import injectTapEventPlugin from 'react-tap-event-plugin';
import Game from './components/Game';

injectTapEventPlugin();
require('./css/game.scss');

const root = document.getElementById('root');
ReactDOM.render(<Game height={16} width={10} />, root);
