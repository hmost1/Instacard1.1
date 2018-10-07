import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { ExpoLinksView } from '@expo/samples';

export default class CameraScreen extends React.Component {
  static navigationOptions = {
    title: 'Camera',
  };

  render() {
    return (
      <ScrollView style={styles.container}>
        <Text>Open the camera here with some instructions... </Text>
        {/* Go ahead and delete ExpoLinksView and replace it with your
           * content, we just wanted to provide you with some helpful links */}
        {/*<ExpoLinksView />*/}
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 15,
    backgroundColor: '#fff',
  },
});
