import { isAndroid } from './os';
import { ENDPOINTS } from '../utils/endpoints';
import instance, { authInstance } from './api';
import RNFetchBlob, { FetchBlobResponse } from 'rn-fetch-blob';
import { Image as CropPickerImage } from 'react-native-image-crop-picker';

import CameraRoll from '@react-native-community/cameraroll';

const directories = RNFetchBlob.fs.dirs;
const STORAGE_PATH = directories.DocumentDir + '/nuli/';
const ALBUM_NAME = 'Nuli';

export const PICTURE_DIMENSIONS = { width: 1200, height: 1600 };
export const COLLAGE_DIMENSIONS = { width: 600, height: 1600 };

export function getImageUri (path: string): string {
    return isAndroid ? 'file://' + path : path;
}

export async function uploadProgressPicture (image: CropPickerImage, onSuccess?: (uuid: string) => void, onTimeout?: () => void): Promise<void> {
    const preSignedURL = await getProgressPicturePreSignedURL();
    const fileUid = preSignedURL?.fields?.key.substr(preSignedURL?.fields?.key?.lastIndexOf('/') + 1);

    // Create formData with required fields and image data
    let formData = new FormData();
    Object.keys(preSignedURL.fields).forEach((key: string) => {
        formData.append(key, preSignedURL.fields[key]);
    });
    // @ts-ignore
    formData.append('file', { uri: image.path, type: 'image/jpeg' });

    // Start upload picture
    await authInstance.post(preSignedURL.url, formData, { headers: {
        'Content-Type': 'multipart/form-data'
    }});

    // Start interval that will check the upload status every 2 seconds
    // This is the only way for us to now that the upload has succeeded

    const polling = setInterval(async () => {
        const uploaded = await instance.get(ENDPOINTS.progressPictures + '/' + fileUid);

        if (uploaded?.data?.status === 'processed') {
            // Upload succeeded
            clearTimeout(pollingTimeout);
            clearInterval(polling);
            onSuccess(fileUid);
        }
    }, 2000);

    // Start failure timeout of 20 seconds
    const pollingTimeout = setTimeout(() => {
        // Upload failed
        clearTimeout(pollingTimeout);
        clearInterval(polling);
        onTimeout();
    }, 20000);
}

export async function uploadCollagePart (preSignedURL: PreSignedURL, imagePath: string): Promise<void> {
    // Create formData with required fields and image data
    let formData = new FormData();
    Object.keys(preSignedURL.fields).forEach((key: string) => {
        formData.append(key, preSignedURL.fields[key]);
    });
    // @ts-ignore
    formData.append('file', { uri: imagePath, type: 'image/jpeg' });
    // formData.append('Content-Type', 'image/jpeg');

    // Start upload picture
    await authInstance.post(preSignedURL.url, formData, { headers: {
        'Content-Type': 'multipart/form-data'
    }});
    return Promise.resolve();
}

interface PreSignedURL { url: string; fields: Record<string, string> }

export async function getProgressPicturePreSignedURL (): Promise<PreSignedURL> {
    const preSignedRequest = await instance.post(ENDPOINTS.progressPictures);
    console.log(preSignedRequest);
    return preSignedRequest?.data?.preSignedURL;
}

export async function getCollagePreSignedURLs (labels?: string[]): Promise<PreSignedURL[]> {
    const preSignedRequests = await instance.post(ENDPOINTS.collages, { labels });
    console.log(preSignedRequests);
    return preSignedRequests?.data?.preSignedURLs;
}

/**
 * Downloads an image from a remote url and stores it in a "Nuli" album
 *
 * Returns the path to the downloaded image (plateform specific)
 *
 * `fileName` must contain the image's extension
 */
export async function saveImageInAlbum (url: string): Promise<void> {
    const tempFileName = 'temp.jpg';

    // Download temp image
    const imageUri = await downloadImage(url, tempFileName);

    // Save image in album
    await CameraRoll.save(imageUri, { type: 'auto', album: ALBUM_NAME });

    // Delete temp image
    await deleteFile(tempFileName);
}

/**
 * Downloads an image from a remote url and stores it in the document directory
 *
 * Returns the path to the downloaded image (plateform specific)
 *
 * `fileName` must contain the image's extension
 *
 * !! Files will not be deleted automatically !!
 */
export async function downloadImage (url: string, fileName: string): Promise<string> {
    try {
        const result: FetchBlobResponse = await downloadFile(url, fileName);
        // Android requires a specific prefix
        return getImageUri(result.path());
    } catch (error) {
        console.log(error);
        return error;
    }
}

/**
 * Downloads a file from a remote url and stores it in the document directory
 *
 * Returns `FetchBlobResponse` (use `FetchBlobResponse.path()` to get the file's path)
 *
 * `fileName` must contain the file's extension
 *
 * !! Files will not be deleted automatically !!
 */
export async function downloadFile (url: string, fileName: string): Promise<FetchBlobResponse> {
    try {
        return await RNFetchBlob.config({ path : STORAGE_PATH + fileName }).fetch('GET', url);
    } catch (error) {
        console.log(error);
        return error;
    }
}

/**
 * Deletes a file from the document directory
 *
 * `fileName` must contain the file's extension
 */
export async function deleteFile (fileName: string): Promise<void> {
    try {
        await RNFetchBlob.fs.unlink(STORAGE_PATH + fileName);
    } catch (error) {
        console.log(error);
        return error;
    }
}
