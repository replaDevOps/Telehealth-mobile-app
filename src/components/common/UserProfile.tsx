import {
  Image,
  StyleSheet,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import React, { useState, useCallback, useEffect } from 'react';
import { launchImageLibrary, ImagePickerResponse, Asset } from 'react-native-image-picker';
import { mvs } from '../../config/metrices';
import { colors } from '../../styles/colors';
import { EditSvg, SingleLogo } from '../../assets/icons';
import { API } from '../../services/api/api-endpoint';
import { BASE_URL } from '../../constants';
import { Toast } from 'toastify-react-native';
import { useAuthStore } from '@store';

interface UserProfileProps {
  profileImage?: string;
  onImageSelected?: (uri: string) => void;
  autoUpload?: boolean; // If true, uploads immediately. If false, just returns the image URI
  onImageAssetSelected?: (asset: Asset) => void; // Callback with full asset object when autoUpload is false
}

const UserProfile: React.FC<UserProfileProps> = ({
  profileImage: initialProfileImage = '',
  onImageSelected,
  autoUpload = true, // Default to true for backward compatibility
  onImageAssetSelected,
}) => {
  const [profileImage, setProfileImage] = useState(initialProfileImage);
  const [isUploading, setIsUploading] = useState(false);
  const [hasLoadError, setHasLoadError] = useState(false);

  // Update profile image when prop changes
  useEffect(() => {
    setProfileImage(initialProfileImage || '');
    setHasLoadError(false);
  }, [initialProfileImage]);

  const uploadProfileImage = useCallback(async (asset: Asset) => {
    if (!asset.uri) return;
  
    setIsUploading(true);
  
    try {
      const formData = new FormData();
      
      const uriParts = asset.uri.split('.');
      const fileExtension = uriParts[uriParts.length - 1] || 'jpg';
      const fileName = asset.fileName || `profile_${Date.now()}.${fileExtension}`;
      
      let fileType = asset.type || 'image/jpeg';
      if (!asset.type) {
        const ext = fileExtension.toLowerCase();
        if (ext === 'png') fileType = 'image/png';
        else if (ext === 'jpg' || ext === 'jpeg') fileType = 'image/jpeg';
      }
      console.log("🚀 ~ uploadProfileImage ~ useAuthStore.getState():", useAuthStore.getState())
      formData.append('image', {
        uri: asset.uri,
        type: fileType,
        name: fileName,
      } as any);
      // Use fetch instead of axios
      const response = await fetch(`${BASE_URL}${API.SETTINGS.UPDATE_PROFILE_IMAGE}`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
          // Add your auth token if needed
          'Authorization': `Bearer ${useAuthStore.getState().auth?.token}`,
        },
      });
  
      const data = await response.json();
  
      if (!response.ok || data.success === false) {
        throw new Error(data.message || 'Upload failed');
      }
  
      const imageUrl = data.data?.image || data.image || asset.uri;
      setProfileImage(imageUrl);
      onImageSelected?.(imageUrl);
      Toast.success(data.message || 'Profile image updated successfully');
  
    } catch (error: any) {
      console.error('Upload failed:', error);
      // Set local image even if upload fails to make it appear as if image is set
      setProfileImage(asset.uri);
      onImageSelected?.(asset.uri);
      Toast.error(error?.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  }, [onImageSelected]);

  const openImagePicker = useCallback(() => {
    const options = {
      mediaType: 'photo' as const,
      quality: 0.6 as const, // client-side compression
      maxWidth: 500, // max dimensions
      maxHeight: 500,
      includeBase64: false,
    };

    launchImageLibrary(options, async (response: ImagePickerResponse) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
        return;
      }
      if (response.errorCode) {
        console.log('ImagePicker Error:', response.errorMessage);
        Alert.alert('Error', response.errorMessage ?? 'Unknown error');
        return;
      }

      const asset = response.assets?.[0];
      if (!asset?.uri) return;

      // If autoUpload is false, just return the image URI/asset without uploading
      if (!autoUpload) {
        setProfileImage(asset.uri);
        onImageSelected?.(asset.uri);
        onImageAssetSelected?.(asset);
        return;
      }

      // Upload the selected image (default behavior)
      await uploadProfileImage(asset);
    });
  }, [uploadProfileImage, autoUpload, onImageSelected, onImageAssetSelected]);

  const getFullImageUrl = (path?: string) => {
    if (!path) return '';
    const trimmed = path.trim().toLowerCase();
    if (
      trimmed === '' || 
      trimmed === 'null' || 
      trimmed === 'undefined' || 
      trimmed.includes('default') || 
      trimmed.includes('image.png')
    ) {
      return '';
    }
    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('file://')) {
      return path;
    }
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `https://telehealth.repla-projects.com/${cleanPath}`;
  };

  const resolvedUri = getFullImageUrl(profileImage);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.profileImageContainer}
        onPress={openImagePicker}
        activeOpacity={0.8}
        disabled={isUploading}
      >
        {resolvedUri && !hasLoadError ? (
          <Image 
            source={{ uri: resolvedUri }} 
            style={[styles.profileImage]} 
            onError={() => setHasLoadError(true)}
          />
        ) : (
          <View style={[styles.profileImage, { backgroundColor: '#E8DDF7', justifyContent: 'center', alignItems: 'center' }]}>
            <SingleLogo width={mvs(50)} height={mvs(50)} fill="#7625D7" />
          </View>
        )}

        {/* Edit / Loading overlay */}
        {isUploading ? (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="small" color={colors.white} />
          </View>
        ) : (
          <View style={styles.iconOverlay}>
            <EditSvg style={styles.editIcon} />
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

/* --------------------------------------------------------------------- *
 *  Styles (unchanged)
 * --------------------------------------------------------------------- */
const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: mvs(15),
  },
  profileImageContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImage: {
    width: mvs(100),
    height: mvs(100),
    borderRadius: mvs(50),
    borderWidth: 2,
    borderColor: colors.primary,
  },
  iconOverlay: {
    position: 'absolute',
    bottom: mvs(5),
    right: mvs(0),
    width: mvs(28),
    height: mvs(28),
    backgroundColor: colors.primary,
    borderRadius: mvs(14),
    borderWidth: 1,
    borderColor: colors.gray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingOverlay: {
    position: 'absolute',
    bottom: mvs(5),
    right: mvs(5),
    width: mvs(28),
    height: mvs(28),
    backgroundColor: colors.red,
    borderRadius: mvs(14),
    borderWidth: 1,
    borderColor: colors.gray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editIcon: {
    width: mvs(16),
    height: mvs(16),
    tintColor: colors.white,
  },
});

export default UserProfile;
