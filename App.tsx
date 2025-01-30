import React from 'react';

import Router from './src/Router/index';
import {GestureHandlerRootView} from 'react-native-gesture-handler';


const App = () => {
 
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <Router />
    </GestureHandlerRootView>
  );
};
export default App;