import { PermissionsAndroid, Platform } from 'react-native';

async function requestMultiplePermissions() {
    try {
        const permissions = [
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
            PermissionsAndroid.PERMISSIONS.CAMERA,
            PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        ];

        // Add ACCESS_BACKGROUND_LOCATION only for Android 10 (API level 29) and above
        if (Platform.Version >= 29) {
            permissions.push(PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION);
        }

        // Add POST_NOTIFICATIONS only for Android 13 (API level 33) and above
        if (Platform.Version >= 33) {
            permissions.push(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
        }

        // Request permissions
        const granted = await PermissionsAndroid.requestMultiple(permissions);

        // Check each permission
        const locationGranted = granted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] === PermissionsAndroid.RESULTS.GRANTED;
        const coarseLocationGranted = granted[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION] === PermissionsAndroid.RESULTS.GRANTED;
        const cameraGranted = granted[PermissionsAndroid.PERMISSIONS.CAMERA] === PermissionsAndroid.RESULTS.GRANTED;
        const readStorageGranted = granted[PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE] === PermissionsAndroid.RESULTS.GRANTED;
        const writeStorageGranted = granted[PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE] === PermissionsAndroid.RESULTS.GRANTED;

        let backgroundLocationGranted = true; // Default true for versions below 29
        if (Platform.Version >= 29) {
            backgroundLocationGranted = granted[PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION] === PermissionsAndroid.RESULTS.GRANTED;
        }

        let notificationsGranted = true; // Default true for versions below 33
        if (Platform.Version >= 33) {
            notificationsGranted = granted[PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS] === PermissionsAndroid.RESULTS.GRANTED;
        }

        if (
            locationGranted &&
            coarseLocationGranted &&
            cameraGranted &&
            readStorageGranted &&
            writeStorageGranted &&
            backgroundLocationGranted &&
            notificationsGranted
        ) {
            console.log('All requested permissions granted');
            return true;
        } else {
            console.log('One or more permissions denied');
            return false;
        }
    } catch (err) {
        console.warn('Permission request error:', err);
        return false;
    }
}

export default requestMultiplePermissions;