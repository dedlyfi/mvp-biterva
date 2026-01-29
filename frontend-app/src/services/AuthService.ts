import { MMKV } from 'react-native-mmkv';
import DeviceInfo from 'react-native-device-info';

export const storage = new MMKV();
const DEVICE_IDENTITY_KEY = 'biterva_device_id';

/**
 * AuthService manages the identity of the device.
 * It uses a hardware-bound Unique ID to ensure the wallet persists 
 * even after app reinstalls.
 */
export const AuthService = {
    /**
     * Returns the physical hardware ID of the device.
     */
    getDeviceIdentity: (): string => {
        const hardwareId = DeviceInfo.getUniqueIdSync();
        return `btv_${hardwareId}`;
    },

    /**
     * Returns a formatted name including Brand, Model and ID.
     */
    getDeviceName: (): string => {
        const brand = DeviceInfo.getBrand();
        const model = DeviceInfo.getModel();
        const hardwareId = DeviceInfo.getUniqueIdSync();
        return `${brand} ${model} (${hardwareId})`;
    },

    /**
     * Returns the identity based on the hardware ID.
     */
    getIdentity: (): string => {
        return AuthService.getDeviceIdentity();
    },

    /**
     * Legacy support: Returns the ID stored in MMKV if it exists.
     * Used for one-time migration if needed.
     */
    getLegacyId: (): string | undefined => {
        return storage.getString(DEVICE_IDENTITY_KEY);
    },

    /**
     * Clears local cache for troubleshooting.
     */
    resetIdentity: () => {
        storage.delete(DEVICE_IDENTITY_KEY);
    }
};
