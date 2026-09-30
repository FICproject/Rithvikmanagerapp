import { AppRegistry, LogBox } from 'react-native';
import App from './src/app/App';

// Suppress LogBox warnings and development error popups on standalone device
LogBox.ignoreAllLogs(true);

AppRegistry.registerComponent('FICManagerApp', () => App);
