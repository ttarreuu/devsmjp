import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import ReactNativeForegroundService from '@supersami/rn-foreground-service';

const config = {
  config: {
    alert: true,
    onServiceErrorCallBack: function () {
      console.warn('[ReactNativeForegroundService] onServiceErrorCallBack', arguments);
    },
  },
};

ReactNativeForegroundService.register(config);
AppRegistry.registerComponent(appName, () => App);
