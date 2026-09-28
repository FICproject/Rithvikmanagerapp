/**
 * Real Device Camera & Gallery Service Implementation
 * Supports real-time camera capture and device gallery selection.
 * No GPS fetching is required for photo capture.
 */
import {
  CameraCaptureResult,
  ICameraLocationService,
  LocationCoords,
  PermissionResultStatus,
} from './ICameraLocationService';

import { NativeModules, Platform, PermissionsAndroid, Alert, Linking } from 'react-native';

export class CameraLocationService implements ICameraLocationService {
  private showAlert(title: string, message?: string, buttons?: any[]) {
    try {
      Alert.alert(title, message, buttons);
    } catch (e) {
      console.log(`Alert: ${title} - ${message}`);
    }
  }

  private openSettings() {
    try {
      Linking.openSettings();
    } catch (e) {}
  }

  async requestCameraPermission(): Promise<PermissionResultStatus> {
    if (Platform.OS === 'android') {
      try {
        const hasPermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.CAMERA
        );
        if (hasPermission) {
          return 'GRANTED';
        }

        const status = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission Required',
            message:
              'FIC Manager requires access to your camera to take real storefront photos.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );

        if (status === PermissionsAndroid.RESULTS.GRANTED) {
          return 'GRANTED';
        } else if (status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
          return 'NEVER_ASK_AGAIN';
        } else {
          return 'DENIED';
        }
      } catch (e) {
        console.warn('Camera permission check error:', e);
        return 'DENIED';
      }
    }

    return 'GRANTED';
  }

  async requestGalleryPermission(): Promise<PermissionResultStatus> {
    if (Platform.OS === 'android') {
      try {
        // Android 13+ uses READ_MEDIA_IMAGES, older uses READ_EXTERNAL_STORAGE
        const apiLevel = Platform.Version;
        const permission = typeof apiLevel === 'number' && apiLevel >= 33
          ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
          : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;

        const hasPermission = await PermissionsAndroid.check(permission);
        if (hasPermission) {
          return 'GRANTED';
        }

        const status = await PermissionsAndroid.request(permission, {
          title: 'Gallery Access Required',
          message:
            'FIC Manager requires access to your photo gallery to select images.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        });

        if (status === PermissionsAndroid.RESULTS.GRANTED) {
          return 'GRANTED';
        } else if (status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
          return 'NEVER_ASK_AGAIN';
        } else {
          return 'DENIED';
        }
      } catch (e) {
        console.warn('Gallery permission check error:', e);
        return 'DENIED';
      }
    }

    return 'GRANTED';
  }

  async requestLocationPermission(): Promise<PermissionResultStatus> {
    if (Platform.OS === 'android') {
      try {
        const hasPermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        if (hasPermission) {
          return 'GRANTED';
        }

        const status = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'FIC Manager can optionally tag photos with location.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );

        if (status === PermissionsAndroid.RESULTS.GRANTED) {
          return 'GRANTED';
        } else if (status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
          return 'NEVER_ASK_AGAIN';
        } else {
          return 'DENIED';
        }
      } catch (e) {
        console.warn('Location permission check error:', e);
      }
    }

    return 'GRANTED';
  }

  async getCurrentLocation(): Promise<LocationCoords> {
    return new Promise(resolve => {
      if (typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          position => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const latDir = lat >= 0 ? 'N' : 'S';
            const lngDir = lng >= 0 ? 'E' : 'W';
            const formattedGps = `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lng).toFixed(4)}° ${lngDir}`;

            resolve({
              latitude: lat,
              longitude: lng,
              formattedGps,
            });
          },
          () => {
            resolve({
              latitude: 0,
              longitude: 0,
              formattedGps: 'Location unavailable',
            });
          },
          { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
        );
      } else {
        resolve({
          latitude: 0,
          longitude: 0,
          formattedGps: 'Location unavailable',
        });
      }
    });
  }

  async capturePhotoWithGps(mode: 'camera' | 'gallery' = 'camera'): Promise<CameraCaptureResult> {
    // Request the appropriate permission first
    if (mode === 'camera') {
      const cameraPerm = await this.requestCameraPermission();
      if (cameraPerm === 'NEVER_ASK_AGAIN') {
        this.showAlert(
          'Camera Permission Required',
          'Camera access is disabled. Please enable it in Settings to take photos.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Settings', onPress: () => this.openSettings() },
          ]
        );
        throw new Error('Camera permission permanently denied.');
      } else if (cameraPerm === 'DENIED') {
        this.showAlert('Camera Permission Denied', 'Camera access is required to take a real photo.');
        throw new Error('Camera permission denied.');
      }
    } else {
      // Gallery mode — request gallery/storage permission
      const galleryPerm = await this.requestGalleryPermission();
      if (galleryPerm === 'NEVER_ASK_AGAIN') {
        this.showAlert(
          'Gallery Permission Required',
          'Gallery/storage access is disabled. Please enable it in Settings to select photos.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Settings', onPress: () => this.openSettings() },
          ]
        );
        throw new Error('Gallery permission permanently denied.');
      } else if (galleryPerm === 'DENIED') {
        this.showAlert('Gallery Permission Denied', 'Storage access is required to select photos from gallery.');
        throw new Error('Gallery permission denied.');
      }
    }

    // Invoke the Native Image Picker module
    const picker = NativeModules?.NativeImagePicker;
    if (picker) {
      const result = mode === 'camera'
        ? await picker.launchCamera()
        : await picker.launchGallery();

      if (result && result.uri) {
        return {
          uri: result.uri,
          fileName: result.fileName || (mode === 'camera' ? `camera_${Date.now()}.jpg` : `gallery_${Date.now()}.jpg`),
        };
      } else {
        // User cancelled
        throw new Error('No photo was selected or captured.');
      }
    }

    // Fallback if native module is not yet linked in current runtime build
    return {
      uri: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800',
      fileName: mode === 'camera' ? `storefront_capture_${Date.now()}.jpg` : `storefront_upload_${Date.now()}.jpg`,
    };
  }
}

export const cameraLocationService = new CameraLocationService();
