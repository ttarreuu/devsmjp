import React, {useEffect, useState} from 'react';
import {Switch, Text, View} from 'react-native';

import BackgroundGeolocation, {
  Location,
  Subscription,
} from 'react-native-background-geolocation';

const HelloWorld = () => {
  const [enabled, setEnabled] = useState(false);
  const [location, setLocation] = useState('');

  useEffect(() => {
    const onLocation: Subscription = BackgroundGeolocation.onLocation(
      location => {
        console.log('[onLocation]', location);
        setLocation(JSON.stringify(location, null, 2));
      },
      error => {
        console.warn('[onLocation] ERROR:', error);
      },
    );

    const onMotionChange: Subscription = BackgroundGeolocation.onMotionChange(
      event => {
        console.log('[onMotionChange]', event);
      },
    );

    const onActivityChange: Subscription =
      BackgroundGeolocation.onActivityChange(event => {
        console.log('[onActivityChange]', event);
      });

    const onProviderChange: Subscription =
      BackgroundGeolocation.onProviderChange(event => {
        console.log('[onProviderChange]', event);
      });

    BackgroundGeolocation.ready({
      desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
      distanceFilter: 5, 
      stopTimeout: 1,
      debug: true,
      locationUpdateInterval: 10000,
      fastestLocationUpdateInterval: 10000,
      logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
      stopOnTerminate: false,
      startOnBoot: true,
      url: 'https://672fc91b66e42ceaf15eb4cc.mockapi.io/testLog',
      batchSync: false,
      autoSync: true,
      headers: {
        'X-FOO': 'bar',
      },
      params: {
        auth_token: 'maybe_your_server_authenticates_via_token_YES?',
      },
    }).then(state => {
      setEnabled(state.enabled);
      console.log('- BackgroundGeolocation is ready: ', state.enabled);

      BackgroundGeolocation.changePace(true);
    });

    return () => {
      onLocation.remove();
      onMotionChange.remove();
      onActivityChange.remove();
      onProviderChange.remove();
    };
  }, []);

  useEffect(() => {
    if (enabled) {
      BackgroundGeolocation.start().then(() => {
        console.log('[start] BackgroundGeolocation tracking started');
      });
    } else {
      BackgroundGeolocation.stop();
      setLocation('');
    }
  }, [enabled]);

  return (
    <View style={{alignItems: 'center', marginTop: 10}}>
        <Text>
          Click to enable BackgroundGeolocation
        </Text>
        <Switch value={enabled} onValueChange={setEnabled} />
        <Text style={{fontFamily: 'monospace', fontSize: 12}}>
          {location}
        </Text>
    </View>
  );
};

export default HelloWorld;
