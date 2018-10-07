import React from 'react';
import { ExpoConfigView } from '@expo/samples';
import {
  View,
  Text
} from 'react-native';
export default class FiltersScreen extends React.Component {
  static navigationOptions = {
    title: 'Filters',
  };

  render() {
  	return (
  		<View>
  			<Text> Some filters....  </Text>
    	</View>
    );
    /* Go ahead and delete ExpoConfigView and replace it with your
     * content, we just wanted to give you a quick view of your config
    
    return <ExpoConfigView />; */
  }
}
