import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { Colors } from '../../theme/colors';
import { Api } from '../../services/api';
import { useParentAdminStore } from '../../store/parentAdminStore';
import {
  resetToChildLogin,
} from '../../app/navigation/navigationRef';
import { ParentNavSection } from '../../types/navigation';
import { VideoCategory } from '../../types/models';
import type {
  ChannelItem,
  PlaylistItem,
  VideoItem,
} from '../../types/models';
import type { MaterialIconsIconName } from 'react-native-vector-icons/MaterialIcons';
import type {
  ChannelItemDto,
  ChildDetailDto,
  PlaylistItemDto,
  VideoItemDto,
} from '../../types/api';
import { ParentDashboardView } from './ParentDashboardView';
import { ParentChildrenView } from './ParentChildrenView';
import { ParentContentView } from './ParentContentView';
import { ParentScreenTimeView } from './ParentScreenTimeView';
import { ParentPinManagementView } from './ParentPinManagementView';
import { AddChildDialog } from './dialogs/AddChildDialog';
import { AddVideoDialog } from './dialogs/AddVideoDialog';
import { AddChannelDialog } from './dialogs/AddChannelDialog';
import { AddPlaylistDialog } from './dialogs/AddPlaylistDialog';
import { ResetPasswordDialog } from './dialogs/ResetPasswordDialog';
import { ParentProfileView } from './ParentProfileView';

interface ApprovedContent {
  videos: VideoItem[];
  channels: ChannelItem[];
  playlists: PlaylistItem[];
}

const initialContent: ApprovedContent = {
  videos: [],
  channels: [],
  playlists: [],
};

const toVideo = (video: VideoItemDto): VideoItem => ({
  id: video.id,
  youtubeId: video.youtubeId,
  title: video.title,
  channelTitle: video.channelTitle,
  thumbnailUrl: video.thumbnailUrl,
  durationText: video.durationText,
  category:
    Object.values(VideoCategory).find(
      (category) => category === video.category.toUpperCase()
    ) ?? VideoCategory.ALL,
  description: video.description,
  isBlocked: video.isBlocked,
});

const toChannel = (channel: ChannelItemDto): ChannelItem => ({
  id: channel.id,
  title: channel.title,
  avatarUrl: channel.avatarUrl,
  videoCount: channel.videoCount,
  colorAccentHex: channel.colorAccentHex,
  description: channel.description,
  isBlocked: channel.isBlocked,
});

const toPlaylist = (playlist: PlaylistItemDto): PlaylistItem => ({
  id: playlist.id,
  title: playlist.title,
  channelTitle: playlist.channelTitle,
  thumbnailUrl: playlist.thumbnailUrl,
  videoCount: playlist.videoCount,
  videoIds: playlist.videoIds,
  isBlocked: playlist.isBlocked,
});

const sections: Array<{
  section: ParentNavSection;
  label: string;
  icon: MaterialIconsIconName;
}> = [
  { section: ParentNavSection.DASHBOARD, label: 'Home', icon: 'dashboard' },
  { section: ParentNavSection.CHILDREN, label: 'Children', icon: 'people' },
  { section: ParentNavSection.CONTENT, label: 'Media', icon: 'video-library' },
  { section: ParentNavSection.SCREEN_TIME, label: 'Time', icon: 'timer' },
];

export const ParentPanelScreen: React.FC = () => {
  const [currentSection, setCurrentSection] = useState(
    ParentNavSection.DASHBOARD
  );
  const [content, setContent] = useState(initialContent);
  const [showAddChild, setShowAddChild] = useState(false);
  const [showAddVideo, setShowAddVideo] = useState(false);
  const [showAddChannel, setShowAddChannel] = useState(false);
  const [showAddPlaylist, setShowAddPlaylist] = useState(false);
  const [childToReset, setChildToReset] = useState<ChildDetailDto | null>(null);
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const parentDashboard = useParentAdminStore((state) => state.parentDashboard);
  const parentAccount = useParentAdminStore((state) => state.parentAccount);
  const parentChildren = useParentAdminStore((state) => state.parentChildren);
  const fetchParentDashboard = useParentAdminStore(
    (state) => state.fetchParentDashboard
  );
  const fetchParentChildren = useParentAdminStore(
    (state) => state.fetchParentChildren
  );
  const createChild = useParentAdminStore((state) => state.createChild);
  const updateDailyLimit = useParentAdminStore(
    (state) => state.updateDailyLimit
  );
  const updateParentPin = useParentAdminStore(
    (state) => state.updateParentPin
  );
  const updateParentProfile = useParentAdminStore(
    (state) => state.updateParentProfile
  );
  const changeParentPassword = useParentAdminStore(
    (state) => state.changeParentPassword
  );
  const logoutParent = useParentAdminStore((state) => state.logoutParent);
  const resetChildPassword = useParentAdminStore(
    (state) => state.resetChildPassword
  );
  const deleteChild = useParentAdminStore((state) => state.deleteChild);
  const addVideo = useParentAdminStore((state) => state.addVideo);
  const removeVideo = useParentAdminStore((state) => state.removeVideo);
  const addChannel = useParentAdminStore((state) => state.addChannel);
  const removeChannel = useParentAdminStore((state) => state.removeChannel);
  const addPlaylist = useParentAdminStore((state) => state.addPlaylist);
  const removePlaylist = useParentAdminStore((state) => state.removePlaylist);

  const refreshContent = useCallback(async () => {
    try {
      const response = await Api.getApprovedContent();
      if (!response.success) {
        throw new Error('Unable to load approved content.');
      }
      setContent({
        videos: response.videos.map(toVideo),
        channels: response.channels.map(toChannel),
        playlists: response.playlists.map(toPlaylist),
      });
    } catch (error) {
      Alert.alert(
        'Content unavailable',
        error instanceof Error ? error.message : 'Unable to load approved content.'
      );
    }
  }, []);

  const refresh = useCallback(async () => {
    await Promise.all([
      fetchParentDashboard(),
      fetchParentChildren(),
      refreshContent(),
    ]);
  }, [fetchParentChildren, fetchParentDashboard, refreshContent]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const showActionError = (title: string, result: { success: boolean; error?: string }) => {
    if (!result.success) {
      Alert.alert(title, result.error ?? 'Please try again.');
    }
  };

  const handleDeleteChild = (child: ChildDetailDto) => {
    Alert.alert(
      'Delete child profile',
      `Delete ${child.displayName}'s profile?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteChild(child.id);
            showActionError('Unable to delete profile', result);
          },
        },
      ]
    );
  };

  const handleRemoveContent = async (
    action: () => Promise<{ success: boolean; error?: string }>,
    title: string
  ) => {
    const result = await action();
    showActionError(title, result);
    if (result.success) {
      await refreshContent();
    }
  };

  const dailyLimit = parentDashboard?.stats.dailyLimitMinutes ?? 60;

  const handleLogout = () => {
    setIsMenuVisible(false);
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          await logoutParent();
          resetToChildLogin();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.root} testID="parent_panel_screen">
      <View style={styles.topBar}>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>KiddoTube Parent Dashboard</Text>
          <Text style={styles.subtitle}>
            {parentDashboard?.parent?.displayName ?? 'Family controls'} • Safe screens. Big smiles.
          </Text>
        </View>
      </View>

      <View style={styles.body}>
        {currentSection === ParentNavSection.DASHBOARD && (
          <ParentDashboardView
            dashboardData={parentDashboard}
            childrenCount={parentChildren.length}
            onNavigate={setCurrentSection}
            onRefresh={refresh}
          />
        )}
        {currentSection === ParentNavSection.CHILDREN && (
          <ParentChildrenView
            children={parentChildren}
            onAddChildClick={() => setShowAddChild(true)}
            onResetPasswordClick={setChildToReset}
            onDeleteChildClick={handleDeleteChild}
          />
        )}
        {currentSection === ParentNavSection.CONTENT && (
          <ParentContentView
            {...content}
            onAddVideoClick={() => setShowAddVideo(true)}
            onAddChannelClick={() => setShowAddChannel(true)}
            onAddPlaylistClick={() => setShowAddPlaylist(true)}
            onRemoveVideo={(video) =>
              handleRemoveContent(
                () => removeVideo(video.id),
                'Unable to remove video'
              )
            }
            onRemoveChannel={(channel) =>
              handleRemoveContent(
                () => removeChannel(channel.id),
                'Unable to remove channel'
              )
            }
            onRemovePlaylist={(playlist) =>
              handleRemoveContent(
                () => removePlaylist(playlist.id),
                'Unable to remove playlist'
              )
            }
          />
        )}
        {currentSection === ParentNavSection.SCREEN_TIME && (
          <ParentScreenTimeView
            key={dailyLimit}
            currentLimit={dailyLimit}
            children={parentChildren}
            onSaveDailyLimit={async (limit) => {
              showActionError(
                'Unable to update daily limit',
                await updateDailyLimit(limit)
              );
            }}
          />
        )}
        {currentSection === ParentNavSection.PIN && (
          <ParentPinManagementView
            onUpdatePin={async (currentPin, newPin) => {
              showActionError(
                'Unable to update PIN',
                await updateParentPin(currentPin, newPin)
              );
            }}
          />
        )}
        {currentSection === ParentNavSection.ACCOUNT && (
          <ParentProfileView
            account={parentAccount}
            onSaveProfile={updateParentProfile}
            onChangePassword={changeParentPassword}
          />
        )}
      </View>

      <View style={styles.bottomNav}>
        {sections.map(({ section, label, icon }) => {
          const isSelected = currentSection === section;
          return (
            <TouchableOpacity
              key={section}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              onPress={() => setCurrentSection(section)}
              style={styles.navItem}
            >
              <MaterialIcons
                name={icon}
                size={21}
                color={isSelected ? '#38BDF8' : '#94A3B8'}
              />
              <Text
                style={[
                  styles.navLabel,
                  isSelected
                    ? styles.navLabelSelected
                    : styles.navLabelUnselected,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Open menu"
          onPress={() => setIsMenuVisible(true)}
          style={styles.navItem}
        >
          <MaterialIcons name="menu" size={21} color="#94A3B8" />
          <Text style={[styles.navLabel, styles.navLabelUnselected]}>Menu</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={isMenuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsMenuVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsMenuVisible(false)}>
          <View style={styles.drawerBackdrop}>
            <TouchableWithoutFeedback>
              <View style={styles.drawer}>
                <Text style={styles.drawerTitle}>Parent Menu</Text>
                <Text style={styles.drawerAccount}>
                  {parentAccount?.username ?? 'Family account'}
                </Text>
                <TouchableOpacity
                  style={styles.drawerItem}
                  onPress={() => {
                    setIsMenuVisible(false);
                    setCurrentSection(ParentNavSection.ACCOUNT);
                  }}
                >
                  <MaterialIcons name="person" size={21} color="#0284C7" />
                  <MaterialIcons name="person" size={21} color={Colors.kidsSkyBlue} />
                  <Text style={styles.drawerItemText}>Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.drawerItem}
                  onPress={() => {
                    setIsMenuVisible(false);
                    setCurrentSection(ParentNavSection.PIN);
                  }}
                >
                  <MaterialIcons name="key" size={21} color="#7C3AED" />
                  <MaterialIcons name="key" size={21} color={Colors.kidsSkyBlue} />
                  <Text style={styles.drawerItemText}>Security PIN</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.drawerItem, styles.logoutItem]}
                  onPress={handleLogout}
                >
                  <MaterialIcons name="logout" size={21} color="#DC2626" />
                  <MaterialIcons name="logout" size={21} color={Colors.kidsCoral} />
                  <Text style={[styles.drawerItemText, styles.logoutText]}>
                    Log out
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <AddChildDialog
        visible={showAddChild}
        onDismiss={() => setShowAddChild(false)}
        onConfirm={(...args) => createChild(...args)}
      />
      <AddVideoDialog
        visible={showAddVideo}
        onDismiss={() => setShowAddVideo(false)}
        onConfirm={async (title, channel, youtubeId, category) => {
          const result = await addVideo(title, channel, youtubeId, category);
          showActionError('Unable to add video', result);
          if (result.success) await refreshContent();
        }}
      />
      <AddChannelDialog
        visible={showAddChannel}
        onDismiss={() => setShowAddChannel(false)}
        onConfirm={async (title, channelUrlOrId, description, category) => {
          const result = await addChannel(title, channelUrlOrId, description, category);
          showActionError('Unable to add channel', result);
          if (result.success) await refreshContent();
        }}
      />
      <AddPlaylistDialog
        visible={showAddPlaylist}
        onDismiss={() => setShowAddPlaylist(false)}
        onConfirm={async (title, playlistId, channelTitle, category) => {
          const result = await addPlaylist(title, playlistId, channelTitle, category);
          showActionError('Unable to add playlist', result);
          if (result.success) await refreshContent();
        }}
      />
      <ResetPasswordDialog
        visible={childToReset !== null}
        childName={childToReset?.displayName ?? ''}
        onDismiss={() => setChildToReset(null)}
        onConfirm={async (password) => {
          if (!childToReset) return;
          showActionError(
            'Unable to reset password',
            await resetChildPassword(childToReset.id, password)
          );
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  titleBlock: {
    flex: 1,
    marginLeft: 10,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  subtitle: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  body: {
    flex: 1,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    paddingVertical: 6,
  },
  drawerBackdrop: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  drawer: {
    width: 300,
    maxWidth: '82%',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 24,
    elevation: 16,
  },
  drawerTitle: { color: '#0F172A', fontSize: 21, fontWeight: '900' },
  drawerAccount: { color: '#64748B', marginTop: 5, marginBottom: 24 },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    paddingHorizontal: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
    gap: 12,
  },
  drawerItemText: { color: '#1E293B', fontSize: 15, fontWeight: '700' },
  logoutItem: { marginTop: 12, borderBottomWidth: 0 },
  logoutText: { color: '#DC2626' },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  navLabel: {
    fontSize: 10,
    marginTop: 2,
    fontWeight: '600',
  },
  navLabelSelected: {
    color: '#38BDF8',
  },
  navLabelUnselected: {
    color: '#94A3B8',
  },
});