import { Camera as VisionCamera, useCameraDevice } from "react-native-vision-camera";
import ImageResizer from 'react-native-image-resizer';
import { useRef, useState } from "react";
import RNFS from "react-native-fs";
import { StyleSheet, TouchableOpacity, View } from "react-native";

const CameraScreen = () => {

    const [photoUri, setPhotoUri] = useState('');
    const [picture, setPicture] = useState('');

    const device = useCameraDevice('back');
    const cameraRef = useRef<VisionCamera>(null);

    const takePicture = async () => {
        if (cameraRef.current) {
          const photo = await cameraRef.current.takePhoto();
          setPhotoUri(photo.path);
    
          const compressedImage = await ImageResizer.createResizedImage(photo.path, 800, 600, 'JPEG', 50, 0);
          const base64Image = await RNFS.readFile(compressedImage.uri, 'base64');
          setPicture(base64Image);
        }
    };

    return(
        <View style={styles.page}>
            {device && (
                <>
                <TouchableOpacity style={styles.captureButton} onPress={takePicture} />
                <VisionCamera ref={cameraRef} style={styles.camera} isActive={true} photo={true} device={device} />
                </>
            )};
        </View>
    );
};

const styles = StyleSheet.create({
  page: { 
    flex: 1 
  },
  captureButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
  },
  camera: { 
    width: "100%", 
    height: "100%" 
  }
});


export default CameraScreen;