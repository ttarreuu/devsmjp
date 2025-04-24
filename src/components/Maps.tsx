import Mapbox from '@rnmapbox/maps';
import AsyncStorage from '@react-native-async-storage/async-storage';
import realmInstance from '../data/realmConfig'; // Adjust the path

Mapbox.setAccessToken(
  'pk.eyJ1IjoiYnJhZGkyNSIsImEiOiJjbHloZXlncTUwMmptMmxvam16YzZpYWJ2In0.iAua4xmCQM94oKGXoW2LgA',
);

export const deleteOfflineMapboxRegions = async () => {
  try {
    const regions = await Mapbox.offlineManager.getPacks();
    if (regions.length > 0) {
      for (const region of regions) {
        await Mapbox.offlineManager.deletePack(region.name);
      }
      console.log('Offline maps deleted');
    }
  } catch (error) {
    console.error('Error deleting offline maps:', error);
  }
};

export function downloadMapboxOfflineRegion(
  onProgressUpdate?: (percentage: number) => void,
): Promise<void> {
  return new Promise(async (resolve, reject) => {
    try {
      const company = realmInstance.objects('Company')[0]; // Get the first company

      if (!company) {
        console.log('No local company data found.');
        return resolve();
      }

      const radiusInMeters = company.radius;

      const latDiff = radiusInMeters / 111320;
      const longDiff =
        radiusInMeters / (111320 * Math.cos((company.Lat * Math.PI) / 180));

      const bounds = [
        [company.Long - longDiff, company.Lat - latDiff],
        [company.Long + longDiff, company.Lat + latDiff],
      ];

      const options = {
        name: `offlinePack_${company.companyID}`, // ← uses Realm companyID
        styleURL: Mapbox.StyleURL.Street,
        bounds,
        minZoom: 10,
        maxZoom: 17,
      };

      const existingPacks = await Mapbox.offlineManager.getPacks();
      const alreadyDownloaded = existingPacks.some(
        pack => pack.name === options.name,
      );

      if (alreadyDownloaded) {
        console.log('Offline pack already downloaded.');
        await AsyncStorage.setItem('offlineMapDownloaded', 'true');
        return resolve();
      }

      const progressListener = (
        _region: any,
        status: {percentage: number; state: string},
      ) => {
        console.log('Download progress:', status.percentage);
        onProgressUpdate?.(status.percentage);

        if (status.percentage === 100 && status.state === 'complete') {
          console.log('Offline map download complete!');
          AsyncStorage.setItem('offlineMapDownloaded', 'true');
          resolve();
        }
      };

      const errorListener = (_region: any, error: any) => {
        console.error('Offline map download error:', error);
        reject(error);
      };

      await Mapbox.offlineManager.createPack(
        options,
        progressListener,
        errorListener,
      );
    } catch (error) {
      console.error('Error downloading offline region:', error);
      reject(error);
    }
  });
}
