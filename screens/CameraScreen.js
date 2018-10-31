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
import Assets from '../Assets'; 

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

    //Some text: 
    //TODO: await? Figure out what to do about the font loader and with font
    /*var loader = new THREE.FontLoader();//.setPath()
    console.log("assets: " + Assets['gentilis_bold.typeface.json'].toString());
    var font = loader.load("./assets/fonts/gentilis_bold.typeface.json", // Assets['gentilis_bold.typeface.json'],
      ///assets/fonts/gentilis_bold.typeface.json',
      // onLoad callback
      function ( font ) {
        console.log("loading font callback");
        // do something with the font
        //scene.add( font );
        var textObject = new THREE.TextGeometry( 'Here is a business card', {
          font: font,
          size: 80,
          height: 5,
          curveSegments: 12,
          bevelEnabled: true,
          bevelThickness: 10,
          bevelSize: 8,
          bevelSegments: 5
        });

        //TODO: attach it to the scene with a mesh
        /// Combine our geometry and material
        //this.text = new THREE.Mesh(textObject, material);
        //this.text.position.z = -0.4
        //this.scene.add(this.text);
      },


    
      //onProgress callback
      function ( xhr ) {
        console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
      },
    
      // onError callback
      function ( err ) {
        console.log( 'An error happened' );
        console.log( err );

      }
    );

    const fontJson = Assets['gentilis_bold.typeface.json']; 

    const font = new THREE.Font( fontJson );
    var textObject = new THREE.TextGeometry( 'Here is a business card', {
          font: font,
          size: 80,
          height: 5,
          curveSegments: 12,
          bevelEnabled: true,
          bevelThickness: 10,
          bevelSize: 8,
          bevelSegments: 5
        });

    console.log("font loaded, adding to scene");

    //TODO: might need lights?
    var textMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
    console.log("after text material")
    var mesh = new THREE.Mesh( textObject, textMaterial );
    //TODO: need a better understanding of space 
    mesh.position.set( 0, 0, -1 );

    this.scene.add( mesh );*/

    console.log("at the end of setting up the scene")
  };



  setupLine = () => {
    const geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3());
    geometry.vertices.push(new THREE.Vector3(1, 1, 1));
    geometry.verticesNeedUpdate = true;
    geometry.dynamic = true;

    this.line = new THREE.Line(
      geometry,
      new THREE.LineBasicMaterial({
        color: 0x00ff00,
        opacity: 1,
        linewidth: 7,
        side: THREE.DoubleSide,
        linecap: 'round',
      })
    );
    /// https://stackoverflow.com/questions/36497763/three-js-line-disappears-if-one-point-is-outside-of-the-cameras-view
    this.line.frustumCulled = false; // Avoid flicker
    this.line.visible = false;
    this.scene.add(this.line);
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
    //console.log("renderer from 1.1") 
    //TODO: try having the cube follow the camera around and always be in the middle 
    //this.cube.position.z = -0.4

    this.renderer.render(this.scene, this.camera);
  };
}

