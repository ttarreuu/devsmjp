import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from "react-native";
import { Camera, useCameraDevice, useCameraDevices } from "react-native-vision-camera";


const CameraScreen = () => {
    const devices = useCameraDevices();
    const device = useCameraDevice('back');
    const camera = useRef<Camera>(null)
    const [imageData, setImageData] = useState('');

    useEffect (() => {
        checkPermission();
    }, []);

    const checkPermission = async () => {
        const newCameraPermission = await Camera.requestCameraPermission;
        console.log(newCameraPermission);
    };

    if(device == null) {
        return <ActivityIndicator/>
    }

    const takePicture = async () => {
        if(camera != null) {
            const photo = await camera.current?.takePhoto()
            // setImageData(photo.path);
            // console.log(photo.path);
        }
    };

    return (
        <View style={{flex:1}}>
            {}
            <Camera 
                ref={camera}
                style={StyleSheet.absoluteFill} 
                device={device} 
                isActive={true}
                photo
                />
            <TouchableOpacity style={{
                width:60,
                height:60,
                borderRadius:30,
                backgroundColor:'#0000',
                position:'absolute',
                bottom:50,
                alignSelf:'center', 
            }} 
            onPress={() => {
                takePicture();
            }}></TouchableOpacity>
        </View>
    );

};

export default CameraScreen;