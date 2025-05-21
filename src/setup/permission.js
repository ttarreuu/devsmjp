import { PermissionsAndroid, Platform, Alert, Linking } from 'react-native';

export const requestMultiplePermissions = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') return true;

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

  const allPermissions = [
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

  const nonRuntimePermissions = new Set([
    PermissionsAndroid.PERMISSIONS.INTERNET,
    PermissionsAndroid.PERMISSIONS.FOREGROUND_SERVICE,
    PermissionsAndroid.PERMISSIONS.VIBRATE,
    PermissionsAndroid.PERMISSIONS.RECEIVE_BOOT_COMPLETED,
    PermissionsAndroid.PERMISSIONS.WAKE_LOCK,
    PermissionsAndroid.PERMISSIONS.NFC,
  ]);

  const runtimePermissions: string[] = [];

  for (const permission of allPermissions) {
    // ACCESS_BACKGROUND_LOCATION only exists on Android 10+ (API 29+)
    if (
      permission === PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION &&
      apiLevel < 29
    )
      continue;

    // POST_NOTIFICATIONS only exists on Android 13+ (API 33+)
    if (
      permission === PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS &&
      apiLevel < 33
    )
      continue;

    if (nonRuntimePermissions.has(permission)) continue;

    runtimePermissions.push(permission);
  }

  try {
    const results = await PermissionsAndroid.requestMultiple(runtimePermissions);

    console.log('Permission Results:');
    Object.entries(results).forEach(([permission, status]) => {
      const statusText =
        status === PermissionsAndroid.RESULTS.GRANTED
          ? 'GRANTED'
          : status === PermissionsAndroid.RESULTS.DENIED
          ? 'DENIED'
          : status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN
          ? 'NEVER ASK AGAIN'
          : 'UNKNOWN';
      console.log(`• ${permission}: ${statusText}`);
    });

    const denied = Object.entries(results).filter(
      ([, status]) => status !== PermissionsAndroid.RESULTS.GRANTED,
    );

    if (denied.length > 0) {
      console.warn('Some permissions were denied or blocked:');
      denied.forEach(([permission, status]) => {
        const reason =
          status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN
            ? 'Blocked (Never Ask Again)'
            : 'Denied';
        console.warn(`- ${permission}: ${reason}`);
      });

      Alert.alert(
        'Permission Warning',
        'Some permissions were denied or blocked. Location features may not work correctly.',
      );

      // If any permission is permanently blocked, suggest opening settings
      const blocked = denied.filter(
        ([, status]) => status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN,
      );

      if (blocked.length > 0) {
        Alert.alert(
          'Permission Blocked',
          'Some permissions were permanently denied. Please enable them from the app settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Open Settings',
              onPress: () => Linking.openSettings(),
            },
          ],
        );
      }

      // Critical permission check: require at least one location permission
      const isLocationGranted =
        results[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] ===
          PermissionsAndroid.RESULTS.GRANTED ||
        results[PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION] ===
          PermissionsAndroid.RESULTS.GRANTED;

      if (!isLocationGranted) {
        Alert.alert(
          'Location Required',
          'Location permission is required for this feature to work. Please enable it in app settings.',
        );
        return false;
      }

      return false;
    } else {
      console.log('All requested permissions granted.');
      return true;
    }
  } catch (error) {
    console.error('Permission request error:', error);
    return false;
  }
};
