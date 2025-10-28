import {
  Image,
  StyleSheet,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import React, { useState, useCallback } from 'react';
import { launchImageLibrary } from 'react-native-image-picker';
import { mvs } from '../../config/metrices';
import { colors } from '../../styles/colors';
import { EditSvg } from '../../assets/icons';

interface UserProfileProps {
  /** Current profile picture URL (may be empty) */
  profileImage?: string;
  /** Called after a new picture is selected */
  onImageSelected?: (uri: string) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({
  profileImage: initialProfileImage = '',
  onImageSelected,
}) => {
  const [profileImage, setProfileImage] = useState(initialProfileImage);
  const [isUploading, setIsUploading] = useState(false);

  /* --------------------------------------------------------------------- *
   *  Open the image library (no permission request)
   * --------------------------------------------------------------------- */
  const openImagePicker = useCallback(() => {
    const options = {
      mediaType: 'photo' as const,
      quality: 0.8,
    };

    launchImageLibrary(options, async response => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
        return;
      }
      if (response.errorCode) {
        console.log('ImagePicker Error:', response.errorMessage);
        Alert.alert('Error', response.errorMessage ?? 'Unknown error');
        return;
      }

      const uri = response.assets?.[0]?.uri;
      if (!uri) return;

      // ----> Simulate upload – replace with your real mutation <----
      setIsUploading(true);
      try {
        // Example: await uploadToBackend(uri);
        await new Promise(resolve => setTimeout(resolve, 1000)); // demo delay

        setProfileImage(uri);
        onImageSelected?.(uri);
      } catch (e) {
        console.error('Upload failed', e);
        Alert.alert('Upload failed', 'Please try again.');
      } finally {
        setIsUploading(false);
      }
    });
  }, [onImageSelected]);

  const imageSource = profileImage
    ? { uri: profileImage }
    : require('../../assets/images/image.png');

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.profileImageContainer}
        onPress={openImagePicker}
        activeOpacity={0.8}
        disabled={isUploading}
      >
        <Image
          source={imageSource}
          style={[styles.profileImage, styles.profilePic]}
        />

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
    width: mvs(90),
    height: mvs(90),
    borderRadius: mvs(45),
  },
  profilePic: {
    borderRadius: mvs(45),
    borderWidth: 1,
    borderColor: colors.gray,
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
