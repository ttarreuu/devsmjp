import React, { useEffect, useRef, useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  ScrollView, 
  Platform, 
  Alert,
  Image
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import NFCIcon from '../../assets/nfc.svg';
import CameraIcon from '../../assets/camera.svg';
import Checklist from '../../assets/checklist.svg';
import NfcManager, { Ndef, NfcTech } from 'react-native-nfc-manager';
import { Camera, Camera as VisionCamera, useCameraDevice } from "react-native-vision-camera";
import RNFS from "react-native-fs";
import ImageResizer from 'react-native-image-resizer';
import { saveLogPatrolTempLog } from '../../data/log_patrol_temp';
import { saveLogPatrol } from '../../data/log_patrol';

const NfcConfirmScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { nearestCheckpoint } = route.params || {};

    const device = useCameraDevice('back');
    const cameraRef = useRef<VisionCamera>(null);

    const [selectedValue, setSelectedValue] = useState('');
    const [notes, setNotes] = useState('');
    const [nfcTagData, setNfcTagData] = useState('');
    const [photoUri, setPhotoUri] = useState('');
    const [picture, setPicture] = useState('');
    
    const [enable, setEnable] = useState(false);
    const [openCamera, setOpenCamera] = useState(false);
    const [preview, setPreview] = useState(false);
    const [isSubmitEnabled, setIsSubmitEnabled] = useState(false); // State for submit button
    const [isPhotoTaken, setIsPhotoTaken] = useState(false); // State to track if photo is taken

    useEffect(() => {
        NfcManager.start();
        readNdef(); 
    }, []);

    useEffect(() => {
        checkSubmitButtonState();
    }, [enable, photoUri, notes, selectedValue]);

    const takePicture = async () => {
        if (cameraRef.current) {
            const photo = await cameraRef.current.takePhoto();
            setPhotoUri(photo.path);
    
            const compressedImage = await ImageResizer.createResizedImage(photo.path, 800, 600, 'JPEG', 50, 0);
            const base64Image = await RNFS.readFile(compressedImage.uri, 'base64');
            setPicture(base64Image);
    
            setOpenCamera(false); 
            setPreview(true);
            setIsPhotoTaken(true); // Mark photo as taken
        }
    };

    const readNdef = async () => {
        try {
            await NfcManager.requestTechnology(NfcTech.Ndef);
            const tag = await NfcManager.getTag();

            if (tag?.ndefMessage) {
                const ndefPayload = tag.ndefMessage[0].payload;
                const decodedData = Ndef.text.decodePayload(ndefPayload);
                console.log("NFC Data:", decodedData);
                setNfcTagData(decodedData);
                if (nearestCheckpoint && decodedData === nearestCheckpoint.checkpointID) {
                    setEnable(true);
                } else {
                    console.log("Data on NFC does not match");
                    Alert.alert("Data on NFC does not match. Please try again or use a valid NFC tag.");
                    navigation.goBack();
                }
            } else {
                console.log("No NDEF data found");
                Alert.alert("No data found on NFC. Please scan a valid NFC tag.");
                navigation.goBack();
            }
        } catch (ex) {
            console.warn('Oops!', ex);
        } finally {
            NfcManager.cancelTechnologyRequest();
        }
    };

    const checkSubmitButtonState = () => {
        // Check if all conditions are met
        const isEnabled = enable && photoUri !== '' && notes.trim() !== '' && selectedValue !== '';
        setIsSubmitEnabled(isEnabled);
    };

    const handleSubmit = async () => {
        try {
          const dateTime = new Date().toISOString();
          saveLogPatrolTempLog(dateTime, picture, selectedValue, notes, nearestCheckpoint?.checkpointID, 'NFC');
          saveLogPatrol(dateTime, picture, selectedValue, notes, nearestCheckpoint?.checkpointID, 'NFC');  
          navigation.goBack();
        } catch (err) {
          console.log(err);
        }
    };

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
            style={styles.container}
        >
            {openCamera && device && (
                <View style={styles.camera}>
                    <Camera
                        ref={cameraRef}
                        style={StyleSheet.absoluteFill}
                        device={device}
                        isActive={true}
                        photo
                    />
                    <TouchableOpacity
                        style={styles.captureButton}
                        onPress={takePicture}
                    />
                </View>
            )}
            {preview && photoUri !== '' && (
                <View style={styles.camera}>
                    <Image
                        source={{ uri: 'file://' + photoUri }}
                        style={styles.imagePreview}
                    />
                    <TouchableOpacity
                        style={styles.confirmButton}
                        onPress={() => setPreview(false)}
                    >
                        <Text style={styles.buttonText}>Confirm</Text>
                    </TouchableOpacity>       
                </View>
            )}

            <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
                <View style={styles.content}>
                    <View style={styles.box}>
                        <TouchableOpacity onPress={readNdef}>
                            <NFCIcon width={150} height={150} />
                        </TouchableOpacity>
                        <Text style={[styles.nfcStatus, enable && styles.nfcStatusEnabled]}>
                            {enable ? "NFC Tag Matched!" : "Approach NFC Tag"}
                        </Text>
                    </View>

                    <Text style={styles.subtitle}>Status</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={selectedValue}
                            style={styles.picker}
                            onValueChange={(itemValue) => {
                                setSelectedValue(itemValue);
                                checkSubmitButtonState(); // Check state when value changes
                            }}
                        >
                            <Picker.Item label="" value=""/>
                            <Picker.Item label="Safe" value="Safe" style={styles.option}/>
                            <Picker.Item label="Not Safe" value="Not Safe" style={styles.option}/>
                        </Picker>
                    </View>

                    <Text style={styles.subtitle}>Description</Text>
                    <TextInput
                        style={styles.textInput}
                        multiline
                        value={notes}            
                        onChangeText={(text) => {
                            setNotes(text);
                            checkSubmitButtonState(); // Check state when notes change
                        }}
                    />

                    <View>
                        <TouchableOpacity style={styles.buttonOpenCamera} disabled={!enable} onPress={() => setOpenCamera(true)}>
                            <CameraIcon height={20} width={20}/>
                            <Text style={styles.buttonTextOpenCamera}>Add Photo</Text>
                            {isPhotoTaken && (
                                <Checklist width={15} height={15} style={styles.checklist}/>
                            )}
                        </TouchableOpacity>


                        <TouchableOpacity style={[styles.button, { backgroundColor: isSubmitEnabled ? 'blue' : 'grey' }]} disabled={!isSubmitEnabled} onPress={handleSubmit}>
                            <Text style={styles.buttonText}>Submit</Text>
                        </TouchableOpacity>
                    </View>            
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    }, 
    scrollContainer: {
        marginTop: 75,
        paddingHorizontal: 20,
    },
    content: {
        justifyContent: 'flex-start'
    },
    box: {
        width: '100%',
        backgroundColor: 'white',
        borderRadius: 10,
        elevation: 5,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 5, 
        marginTop: -10,
    },
    nfcStatus: {
        fontSize: 12, 
        color: 'red',
        marginTop: -20,
        marginBottom: 10 
    },
    nfcStatusEnabled: {
        color: 'green', // Change color when enabled
    },
    subtitle: {
        fontWeight: 'bold',
        color: '#6A6A6A',
        marginTop: 10,
    },
    pickerContainer: {
        width: '100%',
        backgroundColor: 'white',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 0,
        height: 40,
    },
    picker: {
        width: '100%',
    },
    option: {
        fontSize: 14
    },
    textInput: {
        width: '100%',
        minHeight: 100, 
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 8,
        textAlignVertical: 'top',
        borderColor: '#ccc',
        borderWidth: 1,
    },
    buttonOpenCamera: {
        padding: 12,
        backgroundColor: '#ffff',
        borderRadius: 8,
        alignItems: 'center',
        flexDirection: 'row',
        marginVertical: 10,
        justifyContent: 'center',
        borderColor: '#ccc',
        borderWidth: 1,
    },
    buttonTextOpenCamera: {
        marginLeft: 10,
        color: 'black',
        fontSize: 14,
        fontWeight: 'bold'
    },
    checklist: {
        marginLeft: 5
    },
    button: {
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    camera: { 
        width: "100%", 
        height: "100%" 
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
    confirmButton: {
        height: 50,
        width: 200,
        backgroundColor: 'green',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
        position: 'absolute',
        bottom: 30,
        alignSelf: 'center',
    },
    imagePreview: {
        width: '90%',
        height: 200,
        marginBottom: 20,
    },
});

export default NfcConfirmScreen;