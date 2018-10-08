/*import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { ExpoLinksView } from '@expo/samples';

export default class CameraScreen extends React.Component {
  static navigationOptions = {
    title: 'Camera',
  };

  render() {
    return (
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 15,
    backgroundColor: '#fff',
  },
});*/

console.disableYellowBox= true; //TODO: this hides the warnings, put back if something isn't working

import React from 'react';
import { AR } from 'expo';
// Let's alias ExpoTHREE.AR as ThreeAR so it doesn't collide with Expo.AR.
import ExpoTHREE, { AR as ThreeAR, THREE } from 'expo-three';
// Let's also import `expo-graphics`
// expo-graphics manages the setup/teardown of the gl context/ar session, creates a frame-loop, and observes size/orientation changes.
// it also provides debug information with `isArCameraStateEnabled`
import { View as GraphicsView } from 'expo-graphics';

export default class CameraScreen extends React.Component {
  /*/static navigationOptions = {
    title: 'Camera',
  };*/
  componentDidMount() {
    // Turn off extra warnings
    //THREE.suppressExpoWarnings()
    console.log("mounted")
  }
  
  render() {
    // You need to add the `isArEnabled` & `arTrackingConfiguration` props.
    // `isArRunningStateEnabled` Will show us the play/pause button in the corner.
    // `isArCameraStateEnabled` Will render the camera tracking information on the screen.
    // `arTrackingConfiguration` denotes which camera the AR Session will use. 
    // World for rear, Face for front (iPhone X only)
    return (
      <GraphicsView
        style={{ flex: 1 }}
        onContextCreate={this.onContextCreate}
        onRender={this.onRender}
        onResize={this.onResize}
        arEnabled={true}
        isArEnabled
        isArRunningStateEnabled
        isArCameraStateEnabled
        arTrackingConfiguration={AR.TrackingConfigurations.World}
      />
    );
  }

  // When our context is built we can start coding 3D things.
  onContextCreate = async ({ gl, scale: pixelRatio, width, height }) => {
    console.log("hi again")
    // This will allow ARKit to collect Horizontal surfaces
    AR.setPlaneDetection(AR.PlaneDetectionTypes.Horizontal);
    AR.setPlaneDetection(AR.PlaneDetectionTypes.Vertical);

    // Create a 3D renderer
    this.renderer = new ExpoTHREE.Renderer({
          gl,
          pixelRatio,
          width,
          height,
    });
    console.log("post renderer")
    // We will add all of our meshes to this scene.
    this.scene = new THREE.Scene();
    // This will create a camera texture and use it as the background for our scene
    this.scene.background = new ThreeAR.BackgroundTexture(this.renderer);
    // Now we make a camera that matches the device orientation. 
    // Ex: When we look down this camera will rotate to look down too!
    this.camera = new ThreeAR.Camera(width, height, 0.01, 1000);
    // Make a cube - notice that each unit is 1 meter in real life, we will make our box 0.1 meters
    const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    // Simple color material
    const material = new THREE.MeshPhongMaterial({
      color: 0xff00ff,
    });
    
    // Combine our geometry and material
    this.cube = new THREE.Mesh(geometry, material);
    // Place the box 0.4 meters in front of us.
    this.cube.position.z = -0.4
    // Add the cube to the scene
    this.scene.add(this.cube);
    // Setup a light so we can see the cube color
    // AmbientLight colors all things in the scene equally.
    this.scene.add(new THREE.AmbientLight(0xffffff));
    console.log("at the end")
  };

  // When the phone rotates, or the view changes size, this method will be called.
  onResize = ({ x, y, scale, width, height }) => {
    // Let's stop the function if we haven't setup our scene yet
    if (!this.renderer) {
      return;
    }
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(scale);
    this.renderer.setSize(width, height);
  };

  // Called every frame.
  onRender = () => {
    console.log("renderer from 1.1") 
    //TODO: try having the cube follow the camera around and always be in the middle 
    //this.cube.position.z = -0.4

    this.renderer.render(this.scene, this.camera);
  };
}

