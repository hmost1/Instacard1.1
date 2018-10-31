/*import React from 'react';
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
    
    return <ExpoConfigView />;
  }
}*/

import Expo, { AR } from 'expo';
import ExpoTHREE, { THREE, AR as ThreeAR } from 'expo-three';
import React from 'react';
import { View, Linking, TouchableOpacity, Text, Image } from 'react-native';
import Assets from '../Assets'; 
import { View as GraphicsView } from 'expo-graphics';

class ImageExample extends React.Component {
  //static url = 'screens/filters.js';
  componentWillMount() {
    this._anchorsDidUpdate = AR.onAnchorsDidUpdate(({ anchors, eventType }) => {
      for (const anchor of anchors) {
        if (anchor.type === AR.AnchorTypes.Image) {
          console.log('Found image', anchor);
          this.handleImage(anchor, eventType);
        }
      }
    });
  }

  componentWillUnmount() {
    this._anchorsDidUpdate.remove();
  }

  // When the provided image is found in real life, it'll be shown here.
  handleImage = (anchor, eventType) => {
    const { transform } = anchor;
    if (!this.mesh) {
      return;
    }
    this.mesh.matrix.fromArray(transform);
    this.mesh.matrix.decompose(
      this.mesh.position,
      this.mesh.quaternion,
      this.mesh.scale
    );

    //TODO: 
    // make a text object
    // add a position
    // add it to the scene
    // give it some light 

    if (eventType === AR.AnchorEventTypes.Add) {
      this.mesh.visible = true;
      console.log("there was an add");
    } else if (eventType === AR.AnchorEventTypes.Remove) {
      this.mesh.visible = false;
      console.log("there was a remove")
    } else if (eventType === AR.AnchorEventTypes.Update) {
    	console.log("there was an update")
    }
  };

  addDetectionImageAsync = async (resource, width = 0.254) => {
  	console.log("in add detection image")
    let asset = Expo.Asset.fromModule(resource);
    await asset.downloadAsync();
    //console.log(asset.name)
    console.log(asset)
    await AR.setDetectionImagesAsync({
      icon: {
        uri: asset.localUri,
        name: asset.name,
        width,
      },
    });
  };

  openLink = () => {
    Linking.openURL(
      'https://github.com/expo/expo-three/blob/master/example/assets/marker.jpg'
    );
  };

  render() {
  	console.log("rendering")
    return (
      <View style={{ flex: 1 }}>
        <GraphicsView
          style={{ flex: 1 }}
          onContextCreate={this.onContextCreate}
          onRender={this.onRender}
          onResize={this.onResize}
          arTrackingConfiguration={AR.TrackingConfigurations.World}
          isArEnabled
          isArRunningStateEnabled
          isArCameraStateEnabled
        />
        <View
          style={{
            position: 'absolute',
            alignItems: 'stretch',
            justifyContent: 'flex-end',
            bottom: 12,
            right: 12,
            opacity: 0.5,
            width: '30%',
          }}>
          <Text>Point the camera at this image.</Text>
          <TouchableOpacity onPress={this.openLink}>
            <Image
              source={Assets['umino.jpg']}
              style={{ maxWidth: '100%', height: 100, resizeMode: 'contain' }}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  onContextCreate = async ({ gl, scale: pixelRatio, width, height }) => {
    AR.setPlaneDetection(AR.PlaneDetectionTypes.Horizontal);
    console.log("on create")
    await this.addDetectionImageAsync(Assets['marker.jpg']);
    //await this.addDetectionImageAsync(Assets['umino.jpg'], 0.0889);
    console.log("after add DI async")
    this.renderer = new ExpoTHREE.Renderer({ gl, pixelRatio, width, height });
    this.renderer.gammaInput = this.renderer.gammaOutput = true;
    this.renderer.shadowMap.enabled = true;
    console.log("theres a renderer")
    this.scene = new THREE.Scene();
    this.scene.background = new ThreeAR.BackgroundTexture(this.renderer);

    this.camera = new ThreeAR.Camera(width, height, 0.01, 1000);

    await this.loadModel();
    console.log("after add model")
    this.ambient = new ThreeAR.Light();
    this.mesh.add(this.ambient);
    this.mesh.add(this.shadow);
    this.mesh.add(this.point);
  };

  loadModel = async () => {
    console.log("loading model")
    const model = Assets.models.collada.stormtrooper;
    const collada = await ExpoTHREE.loadDaeAsync({
      asset: model['stormtrooper.dae'],
      onAssetRequested: model,
    });
    const { scene: mesh, animations } = collada;
    mesh.traverse(child => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    mesh.castShadow = true;

    ExpoTHREE.utils.scaleLongestSideToSize(mesh, 0.1);

    this.mixer = new THREE.AnimationMixer(mesh);
    this.mixer.clipAction(animations[0]).play();

    const geometry = new THREE.PlaneBufferGeometry(1, 1, 32, 32);
    const material = new THREE.ShadowMaterial();
    material.opacity = 0.7;
    const plane = new THREE.Mesh(geometry, material);
    plane.receiveShadow = true;
    plane.rotation.x = -Math.PI / 2;

    let _mesh = new THREE.Object3D();

    _mesh.add(mesh);
    _mesh.add(plane);
    this.mesh = _mesh; // Save reference for rotation
    this.scene.add(this.mesh);
    this.mesh.visible = false;
  };

  onResize = ({ x, y, scale, width, height }) => {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(scale);
    this.renderer.setSize(width, height);
  };

  
  //This is called every frame, TODO: what is a frame? 
  // how do we anchor to a moving image... 
  onRender = delta => {
  	//console.log("on render")
  	//console.log(delta)
    if (this.mixer && this.mesh.visible) {
      this.mixer.update(delta);
    }
    this.ambient.update();
    this.renderer.render(this.scene, this.camera);
  };

  get point() {
    const light = new THREE.PointLight(0xffffff);
    light.position.set(2, 2, 2);
    return light;
  }

  get shadow() {
    let light = new THREE.DirectionalLight(0xffffff, 0.6);

    light.position.set(0, 0.5, 0.1);
    light.castShadow = true;

    const shadowSize = 0.05;
    light.shadow.camera.left *= shadowSize;
    light.shadow.camera.right *= shadowSize;
    light.shadow.camera.top *= shadowSize;
    light.shadow.camera.bottom *= shadowSize;
    light.shadow.camera.near = 0.01;
    light.shadow.camera.far = 100;

    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;

    return light;
  }
}

export default ImageExample;