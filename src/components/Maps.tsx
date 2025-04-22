import Mapbox from '@rnmapbox/maps';
import AsyncStorage from '@react-native-async-storage/async-storage';

Mapbox.setAccessToken("pk.eyJ1IjoiYnJhZGkyNSIsImEiOiJjbHloZXlncTUwMmptMmxvam16YzZpYWJ2In0.iAua4xmCQM94oKGXoW2LgA");

export async function downloadMapboxOfflineRegion() {
  try {
    const response = await fetch('https://672fc91b66e42ceaf15eb4cc.mockapi.io/company');
    const data = await response.json();

    if (!data || data.length === 0) {
      console.log('No company data found.');
      return;
    }

    const company = data[0]; 

    const bounds = [
      [company.swLong, company.swLat], 
      [company.neLong, company.neLat], 
    ];

    const options = {
      name: `offlinePack_${company.companyID}`,
      styleURL: Mapbox.StyleURL.Street,
      bounds,
      minZoom: 10,
      maxZoom: 17,
    };

    const existingPacks = await Mapbox.offlineManager.getPacks();
    const alreadyDownloaded = existingPacks.some(pack => pack.name === options.name);

    if (alreadyDownloaded) {
      console.log('Offline pack already downloaded.');
      await AsyncStorage.setItem('offlineMapDownloaded', 'true');
      return;
    }

    const progressListener = (_offlineRegion: any, status: { percentage: number; state: string }) => {
      console.log('Download progress:', status);

      if (status.percentage === 100 && status.state === 'complete') {
        console.log('Offline map download complete!');
        AsyncStorage.setItem('offlineMapDownloaded', 'true');
      }
    };

    const errorListener = (_offlineRegion: any, error: any) => {
      console.log('Offline map download error:', error);
    };

    await Mapbox.offlineManager.createPack(options, progressListener, errorListener);
  } catch (error) {
    console.error('Error downloading offline region:', error);
  }
}
