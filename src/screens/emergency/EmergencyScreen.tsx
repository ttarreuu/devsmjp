import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Camera, useCameraDevice, useCameraDevices } from "react-native-vision-camera";


const EmergencyScreen = () => {
    const devices = useCameraDevices();
    const device = useCameraDevice('back');
    const camera = useRef<Camera>(null)
    const [imageData, setImageData] = useState('');
    const [takePhotoClicked, setTakePhotoClicked] = useState(false);

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
            const photo = await camera.current?.takePhoto();
            setImageData(photo.path);
            setTakePhotoClicked(false);
            console.log(photo.path);
        }
    };

    return (
        <View style={{flex:1}}>
            {takePhotoClicked ?(
                <View style={{flex:1}}>
                <Camera 
                    ref={camera}
                    style={StyleSheet.absoluteFill} 
                    device={device} 
                    isActive={true}
                    photo
                    />
                <TouchableOpacity 
                style={{
                    width:60,
                    height:60,
                    borderRadius:30,
                    backgroundColor:'#ffff',
                    position:'absolute',
                    bottom:50,
                    alignSelf:'center', 
                }} 
                onPress={() => {
                    takePicture();
                }}></TouchableOpacity>
            </View>
            ):(
                <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
                    {imageData !== '' && <Image source={{uri:'file://' + imageData}} style={{width:"90%", height:200}}/>}
                    <TouchableOpacity 
                    style={{
                        width:'90%',
                        height:50,
                        borderRadius:10,
                        backgroundColor:'#ffff',
                        borderWidth:1,
                        justifyContent:'center',
                        alignSelf:'center' ,
                        alignItems:'center',
                    }} 
                    onPress={() => {
                        setTakePhotoClicked(true);
                    }}>
                    <Text>Click Photo</Text>
                    </TouchableOpacity>
                </View>
            )}
            
        </View>
    );
};

export default EmergencyScreen;