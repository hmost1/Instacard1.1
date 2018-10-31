//FIXME:(current issues) 
//1) show a photo 
//2) updates/tracking 
//3) have to press pause then play to actually have the image recognized... it's weird
//4) bundled and able to be run on another phone 
//5) 

import Expo, { AR } from 'expo';
import ExpoTHREE, { THREE, AR as ThreeAR } from 'expo-three';
import React from 'react';
import { View, Linking, TouchableOpacity, Text, Image } from 'react-native';
import Assets from '../Assets'; 
import { View as GraphicsView } from 'expo-graphics';

class ImageExample extends React.Component {
  constructor(props) {
    super(props);
    this.counter = 0; //internal, does not need to be a part of state 
    this.state = { animate: false, image: {name: 'sunrise.jpg', width: 0.054, height: 0.088} };
  }

  componentWillMount() {
    this._anchorsDidUpdate = AR.onAnchorsDidUpdate(({ anchors, eventType }) => {
      for (const anchor of anchors) {
        if (anchor.type === AR.AnchorTypes.Image) {
          this.handleImageShowPlane(anchor, eventType);
        }
      }
    });
  }

  componentWillUnmount() {
    this._anchorsDidUpdate.remove();
  }

  handleImageShowPlane = (anchor, eventType) => {
    const { transform } = anchor;
    var matrix = new THREE.Matrix4().fromArray(transform);
    
    if (eventType === AR.AnchorEventTypes.Add) {
      console.log("there was an add");
      //Add a plane for the first time 

      //TODO: this should really all happen in an "add plane" fxn.
      //material also needs to be loaded there 
      var material = new THREE.MeshBasicMaterial(
        {color: 0x008000, transparent: true, opacity: 0.6, side: THREE.DoubleSide}
      );
      var geometry  = new THREE.PlaneGeometry(this.state.image.width, this.state.image.height);
      this.plane = new THREE.Mesh(geometry, material);
      this.plane.applyMatrix(matrix);
      this.plane.rotation.x += Math.PI / 2;
      //TODO: this only works when image is parallel to original camera view, try using planes normal
      this.scene.add( this.plane );

      //this.plane.visible = true;
      //TODO: what's the benefit of loading it earlier and then flipping visibility vs adding it later
    } else if (eventType === AR.AnchorEventTypes.Remove) {
      //this.plane.visible = false;
      //TODO: remove plane 
      console.log("there was a remove")
    } else if (eventType === AR.AnchorEventTypes.Update) {
      console.log("there was an update")
      //TODO: update the matrix of the plane. Or redraw. 
      //var matrix = new THREE.Matrix4().fromArray(transform);
      //this.plane3.applyMatrix(matrix);
      //console.log(JSON.stringify(this.plane3))
      //console.log(anchor)
      //TODO: here, if it's off the screen, treat it as a remove. If it's on the 
      //screen, show it!
    }
  }

  //TODO: this is really just material loading at this point
  loadMaterialAsync = async () => {

    // create a plane geometry for the image with a width of 10
    // and a height that preserves the image's aspect ratio
    // TODO: this should actually match the found item later. 
    //this.planeGeometry = new THREE.PlaneGeometry(.1, .1);

     // Create a texture loader so we can load our image file
    var loader = new THREE.TextureLoader();

    // Load an image file into a custom material
    var material = new THREE.MeshLambertMaterial({
      //color: 0xfffff
      //map: loader.load('https://s3.amazonaws.com/duhaime/blog/tsne-webgl/assets/cat.jpg')
      color: 0xafeeee,
      /*map: await ExpoTHREE.createTextureAsync({
        asset: Expo.Asset.fromModule(Assets['marker.jpg'])
      }),*/
      transparent: true, 
      opacity: 0.6
    });
    this.material = material; 
    //this.plane = new THREE.Mesh(this.planeGeometry, material);
    //this.plane.position.set(0,0,-0.4)
 
    // add the image to the scene
    //this.scene.add(this.plane);
  }

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

  flipAnimation = () => {
    this.setState(previousState => {
      return {animate: !previousState.animate};
    });
  };

  render() {
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
            top: 12,
            opacity: 0.5,
            width: '30%',
          }}>
          <TouchableOpacity onPress={this.flipAnimation}><Text>{this.state.animate ? 'stop' : 'start'}</Text></TouchableOpacity> 
        </View> 
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
              source={Assets[this.state.image.name]}
              style={{ maxWidth: '100%', height: 100, resizeMode: 'contain' }}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  onContextCreate = async ({ gl, scale: pixelRatio, width, height }) => {
    AR.setPlaneDetection(AR.PlaneDetectionTypes.Horizontal);
    //await this.addDetectionImageAsync(Assets['umino.jpg'], 0.0889);
    await this.addDetectionImageAsync(Assets[this.state.image.name], this.state.image.width);
    
    this.renderer = new ExpoTHREE.Renderer({ gl, pixelRatio, width, height });
    this.renderer.gammaInput = this.renderer.gammaOutput = true;
    this.renderer.shadowMap.enabled = true;

    this.scene = new THREE.Scene();
    this.scene.background = new ThreeAR.BackgroundTexture(this.renderer);

    this.camera = new ThreeAR.Camera(width, height, 0.01, 1000);
    
    //TODO: this should be when the card is located. Or should they all load ahead of time?
    await this.loadMaterialAsync();
    console.log("Material has loaded");

    //TODO: remove these: 
    var axesHelper = new THREE.AxesHelper( 30 );
    this.scene.add( axesHelper );

    //TODO: do we need the ambient light? 
    this.scene.add(new THREE.AmbientLight(0xffffff));
  };

  onResize = ({ x, y, scale, width, height }) => {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setPixelRatio(scale);
    this.renderer.setSize(width, height);
  };

  onRender = delta => {
    //TODO: remove? why update ambient light?
    //this.ambient.update();

    //TODO: remove. I think this is rotating around the worlds axis, not the objects. 
    //
    this.counter++; 
    if(this.plane && this.state.animate && this.counter % 10 == 0  ){ 
      this.plane.rotation.x +=0.4;
     }
    this.renderer.render(this.scene, this.camera);
  };
}

export default ImageExample;