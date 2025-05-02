import { PermissionsAndroid, Platform, Alert } from 'react-native';

export const requestMultiplePermissions = async () => {
  if (Platform.OS === 'android') {
    const apiLevel = Platform.Version;

    const legacyStoragePermissions = [
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    ];

    const scopedStoragePermissions = [
      PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
      PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
      PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
    ];

    const permissions = [
      PermissionsAndroid.PERMISSIONS.INTERNET,
      PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      PermissionsAndroid.PERMISSIONS.FOREGROUND_SERVICE,
      PermissionsAndroid.PERMISSIONS.VIBRATE,
      PermissionsAndroid.PERMISSIONS.RECEIVE_BOOT_COMPLETED,
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      PermissionsAndroid.PERMISSIONS.WAKE_LOCK,
      PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
      PermissionsAndroid.PERMISSIONS.CAMERA,
      PermissionsAndroid.PERMISSIONS.NFC,
      ...(apiLevel >= 33 ? scopedStoragePermissions : legacyStoragePermissions),
    ];

    const runtimePermissions = [];

    // Skip certain permissions based on Android version
    for (const permission of permissions) {
      if (permission === PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION && apiLevel < 29) continue;
      if (permission === PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS && apiLevel < 33) continue;

      if (
        permission === PermissionsAndroid.PERMISSIONS.INTERNET ||
        permission === PermissionsAndroid.PERMISSIONS.FOREGROUND_SERVICE ||
        permission === PermissionsAndroid.PERMISSIONS.VIBRATE ||
        permission === PermissionsAndroid.PERMISSIONS.RECEIVE_BOOT_COMPLETED ||
        permission === PermissionsAndroid.PERMISSIONS.WAKE_LOCK ||
        permission === PermissionsAndroid.PERMISSIONS.NFC
      ) {
        continue;
      }

      runtimePermissions.push(permission);
    }

    try {
      const results = await PermissionsAndroid.requestMultiple(runtimePermissions);

      console.log('Permission check results:');
      Object.entries(results).forEach(([permission, status]) => {
        const statusText =
          status === PermissionsAndroid.RESULTS.GRANTED ? 'GRANTED' :
          status === PermissionsAndroid.RESULTS.DENIED ? 'DENIED' :
          status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN ? 'NEVER_ASK_AGAIN' :
          'UNKNOWN';
        console.log(`${permission}: ${statusText}`);
      });

      const denied = Object.entries(results).filter(
        ([_, status]) => status !== PermissionsAndroid.RESULTS.GRANTED
      );

      if (denied.length > 0) {
        console.warn('These permissions were NOT granted:');
        denied.forEach(([permission, status]) => {
          const reason = status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN ? 'Blocked (Never Ask Again)' : 'Denied';
          console.warn(`- ${permission}: ${reason}`);
        });

        Alert.alert('Warning', 'Some permissions were denied and the app may not function properly.');
      }
    } catch (error) {
      console.error('Permission request error:', error);
    }
  }
};
