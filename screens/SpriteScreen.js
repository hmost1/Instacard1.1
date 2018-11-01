//FIXME:(current issues) 
//1) show a photo   X
//1 b) have at appear above the card 
//2) updates/tracking X -- sort of. Redraws every time, doesn't transform
//3) have to press pause then play to actually have the image recognized... it's weird
//4) bundled and able to be run on another phone (might just be enough to publish on expo)
//5) Fix/Understand transforms and rotation+position vectors. Should not naively be using x or y. Movement
//and rotation is in 3d space, needs to transform via a Vector. 
//6) rename this from spritescreen to a real name

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
    this.state = { animate: false, image: {name: 'sunrise.jpg', width: 0.054, height: 0.088, display: 'sunrise_1.jpg'} };
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

  addPlane(matrix) {
    this.plane = new THREE.Mesh(this.planeGeometry, this.material);
    this.plane.applyMatrix(matrix);

    //TODO: keep it in the middle for now. This will only work when a plane is straight up and down
    this.plane.position.y += (this.state.image.height/2 + this.state.image.width/2); //TODO: use transforms?
    this.plane.rotation.x += -Math.PI / 2;
    //TODO: this only works when image is parallel to original camera view, try using planes normal

    this.plane.name = "diplay_image"

    this.scene.add( this.plane );
  }

  handleImageShowPlane = (anchor, eventType) => {
    const { transform } = anchor;
    var matrix = new THREE.Matrix4().fromArray(transform);
    
    if (eventType === AR.AnchorEventTypes.Add) {
      console.log("Image detected for the first time")

      //Add a plane for the first time 
      this.addPlane(matrix);
 
      //this.plane.visible = true;
      //TODO: what's the benefit of loading it earlier and then flipping visibility vs adding it later
    } else if (eventType === AR.AnchorEventTypes.Remove) {
      //TODO: this is never triggered. It should happen when it's off the screen right?
      var selectedObject = this.scene.getObjectByName(this.plane.name);
      this.scene.remove( selectedObject );
      console.log("there was a remove")
    } else if (eventType === AR.AnchorEventTypes.Update) {
      console.log("There was an update detecting, removing and redrawing the plane.")

      //strategy 1: remove the object then redraw -- this is really laggy. figure out why or how to improve
      var selectedObject = this.scene.getObjectByName(this.plane.name);
      this.scene.remove( selectedObject );
      this.addPlane(matrix);
      //end strategy 1

      //strategy 2: figure out how to move or transform a plane
    }
  }

  //TODO: this is really just material loading at this point. 
  //Once we are showing various images this should happen when a detection image is found
  loadMaterialAsync = async () => {
    console.log("starting the material load")

    // Create a texture loader so we can load our image file
    var loader = new THREE.TextureLoader();
    this.planeGeometry  = new THREE.PlaneGeometry(this.state.image.width, this.state.image.width);

    // Load an image file into a custom material
    this.material = new THREE.MeshLambertMaterial({
      color: 0xafeeee,
      map: await ExpoTHREE.createTextureAsync({
        asset: Expo.Asset.fromModule(Assets[this.state.image.display])
      }),
      transparent: true, 
      opacity: 0.6, 
      side: THREE.DoubleSide
    });
  }

  addDetectionImageAsync = async (resource, width = 0.254) => {
    console.log("In add detection image")
    let asset = Expo.Asset.fromModule(resource);
    await asset.downloadAsync();
    console.log(asset)
    await AR.setDetectionImagesAsync({
      icon: {
        uri: asset.localUri,
        name: asset.name,
        width,
      },
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
            bottom: 12,
            right: 12,
            opacity: 0.5,
            width: '30%',
          }}>
          <Text>Point the camera at this image.</Text>
          <Image
            source={Assets[this.state.image.name]}
            style={{ maxWidth: '100%', height: 100, resizeMode: 'contain' }}
          />
        </View>
      </View>
    );
  }

  onContextCreate = async ({ gl, scale: pixelRatio, width, height }) => {
    AR.setPlaneDetection(AR.PlaneDetectionTypes.Horizontal);
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

    //TODO: remove these. Handy when there is confusion about the axes.
    /*var axesHelper = new THREE.AxesHelper( 30 );
    this.scene.add( axesHelper );*/

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

    this.renderer.render(this.scene, this.camera);
  };
}

export default ImageExample;