import React, { useState, useEffect } from 'react';
import {
  Image,
  StyleSheet,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchImageLibrary } from 'react-native-image-picker';
import { mvs } from '../../config/metrices';
import { colors } from '../../styles/colors';

const UserProfile = ({
  profileImage: initialProfileImage,
  onImageSelected,
}) => {
  const [profileImage, setProfileImage] = useState(initialProfileImage || '');
  const [userId, setUserId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        if (storedUserId) {
          setUserId(storedUserId);
        }
      } catch (error) {
        console.error('Error fetching user ID:', error);
      }
    };
    fetchUserId();
  }, []);

  const openImagePicker = () => {
    if (!userId) {
      return; // Handle user ID not available silently or with a UI feedback
    }

    const options = {
      mediaType: 'photo',
      includeBase64: false, // Adjust based on your backend needs
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) return;
      if (response.errorCode) {
        console.log('ImagePicker Error:', response.errorMessage);
        return;
      }

      const selectedImageUri = response.assets?.[0]?.uri;
      if (selectedImageUri) {
        setProfileImage(selectedImageUri);
        if (onImageSelected) onImageSelected(selectedImageUri);
      }
    });
  };

  const imageSource = profileImage
    ? { uri: profileImage }
    : require('../../assets/images/image.png');

  return (
    <View style={styles.container}>
      <View style={styles.profileImageContainer}>
        <View style={styles.profilePic}>
          <Image
            source={imageSource}
            style={styles.profileImage}
            resizeMode="cover"
          />
          {isUploading ? (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="small" color={colors.white} />
            </View>
          ) : (
            <TouchableOpacity
              onPress={openImagePicker}
              style={styles.iconOverlay}
              disabled={!userId || isUploading}
            >
              <Image
                source={require('../../assets/images/image.png')}
                style={styles.editIcon}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: mvs(15),
  },
  profileImageContainer: {
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
    position: 'relative',
  },
  iconOverlay: {
    position: 'absolute',
    bottom: mvs(5),
    right: mvs(5),
    width: mvs(28),
    height: mvs(28),
    backgroundColor: colors.black,
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
