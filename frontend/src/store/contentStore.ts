import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { Api } from '../services/api';
import type {
  VideoItem,
  ChannelItem,
  PlaylistItem,
  ChildProfile,
  ChildSession,
  SearchResultBundle,
} from '../types/models';
import { VideoCategory } from '../types/models';
import { secureStorage } from '../services/storage/secureStorage';

/**
 * KidsContentStore
 * Migrated from Kotlin KidsContentRepository.kt
 * 
 * Handles:
 * - App initialization (health check + fetch profiles + fetch content)
 * - Child login/logout
 * - Approved content management
 * - Search
 */

interface ContentState {
  // Data
  approvedVideos: VideoItem[];
  approvedChannels: ChannelItem[];
  approvedPlaylists: PlaylistItem[];
  childProfiles: ChildProfile[];
  selectedProfile: ChildProfile | null;
  session: ChildSession;
  isBackendConnected: boolean;
  likedVideoIds: string[];

  // Auth token (private, not exposed in state shape publicly)
  childToken: string | null;

  // Actions
  initializeAppData: () => Promise<boolean>;
  loginChild: (
    username: string,
    passwordOrPin: string,
    profileId?: string | null
  ) => Promise<{ success: boolean; error?: string }>;
  logoutChild: () => void;
  selectProfile: (profile: ChildProfile) => void;
  fetchApprovedContent: (token?: string) => Promise<void>;
  getVideosForCategory: (category: VideoCategory) => VideoItem[];
  getVideosForChannel: (channelTitle: string) => VideoItem[];
  getVideosForPlaylist: (playlist: PlaylistItem) => VideoItem[];
  getChannelById: (id: string) => ChannelItem | undefined;
  getPlaylistById: (id: string) => PlaylistItem | undefined;
  getVideoById: (id: string) => VideoItem | undefined;
  searchApprovedContent: (query: string) => SearchResultBundle;
  addApprovedVideo: (video: VideoItem) => void;
  blockOrRemoveVideo: (id: string) => void;
  getCurrentToken: () => string | null;
  toggleLikeVideo: (videoId: string) => Promise<void>;
  updateCurrentChildAvatar: (
    avatarEmoji: string,
    colorHex?: number
  ) => Promise<{ success: boolean; error?: string }>;
}

const initialSession: ChildSession = {
  isAuthenticated: false,
  username: '',
  profile: null,
};

export const useContentStore = create<ContentState>((set, get) => ({
  approvedVideos: [],
  approvedChannels: [],
  approvedPlaylists: [],
  childProfiles: [],
  selectedProfile: null,
  session: initialSession,
  isBackendConnected: false,
  childToken: null,
  likedVideoIds: [],

  /**
   * Initializes app during Splash:
   * 1. Health check
   * 2. Fetch child profiles
   * 3. Fetch approved content
   */
  initializeAppData: async (): Promise<boolean> => {
    let connected = false;

    // Load persisted liked video IDs
    try {
      const rawLiked = await AsyncStorage.getItem('@kids_liked_video_ids');
      if (rawLiked) {
        const ids = JSON.parse(rawLiked);
        if (Array.isArray(ids)) {
          set({ likedVideoIds: ids });
        }
      }
    } catch (e: any) {
      console.warn('[ContentStore] Failed to load liked videos:', e.message);
    }

    // 1. Health check
    try {
      const health = await Api.getHealth();
      if (health.status === 'ok') {
        connected = true;
        set({ isBackendConnected: true });
        console.log('[ContentStore] Backend health OK:', health.service);
      }
    } catch (e: any) {
      console.warn('[ContentStore] Health check failed:', e.message);
    }

    const savedToken = await secureStorage.getChildToken();
    if (savedToken) {
      set({ childToken: savedToken });
      try {
        const auth = await Api.getCurrentUser();
        const details = auth.user?.details;
        if (
          auth.authenticated &&
          auth.user?.role === 'CHILD' &&
          auth.user.childId &&
          details &&
          typeof details.avatarEmoji === 'string' &&
          typeof details.colorHex === 'number'
        ) {
          const profile: ChildProfile = {
            id: auth.user.childId,
            name:
              typeof details.displayName === 'string'
                ? details.displayName
                : auth.user.username,
            avatarEmoji: details.avatarEmoji,
            colorHex: details.colorHex,
            dailyLimitMinutes: 60,
            minutesWatchedToday: 0,
          };
          set({
            selectedProfile: profile,
            session: {
              isAuthenticated: true,
              username: profile.name,
              profile,
            },
          });
        } else {
          set({ childToken: null });
          await secureStorage.clearChildToken();
        }
      } catch (e: any) {
        console.warn('[ContentStore] Saved child session restore failed:', e.message);
        set({ childToken: null });
        await secureStorage.clearChildToken();
      }
    }

    // 2. Fetch child profiles
    try {
      const profileResponse = await Api.getChildProfiles();
      if (profileResponse.success && profileResponse.profiles.length > 0) {
        const mapped: ChildProfile[] = profileResponse.profiles.map((dto: any) => ({
          id: dto.id,
          name: dto.name,
          username: dto.username || dto.name,
          avatarEmoji: dto.avatarEmoji,
          colorHex: dto.colorHex,
          dailyLimitMinutes: dto.dailyLimitMinutes,
          minutesWatchedToday: 0,
          parentId: dto.parentId,
        }));
        set((state) => ({
          childProfiles: mapped,
          selectedProfile: state.selectedProfile ?? mapped[0] ?? null,
        }));
      }
    } catch (e: any) {
      console.warn('[ContentStore] Profile load failed:', e.message);
    }

    // 3. Fetch approved content
    try {
      const contentResponse = await Api.getApprovedContent();
      if (contentResponse.success) {
        applyContentResponse(contentResponse, set, get().likedVideoIds);
      }
    } catch (e: any) {
      console.warn('[ContentStore] Content load failed:', e.message);
    }

    return connected;
  },

  /**
   * Child login via backend
   * Maps to Kotlin loginChild()
   */
  loginChild: async (username, passwordOrPin, profileId) => {
    const trimmedUser = username.trim();
    const cleanPass = passwordOrPin.trim();
    const { childProfiles } = get();

    let resolvedProfileId: string | null = null;
    if (trimmedUser) {
      const matched = childProfiles.find(
        (p) =>
          p.name.toLowerCase() === trimmedUser.toLowerCase() ||
          p.username?.toLowerCase() === trimmedUser.toLowerCase()
      );
      if (matched) resolvedProfileId = matched.id;
    } else if (profileId) {
      resolvedProfileId = profileId;
    }

    try {
      const response = await Api.loginChild({
        username: trimmedUser || null,
        password: cleanPass || null,
        profileId: resolvedProfileId,
      });

      const childData = response.child || (response as any).data;
      if (response.success && childData) {
        const profile: ChildProfile = {
          id: childData.id,
          name: childData.displayName || childData.name || childData.username,
          username: childData.username || childData.displayName || childData.name,
          avatarEmoji: childData.avatarEmoji || '🚀',
          colorHex: childData.colorHex || 0xff00a6fb,
          dailyLimitMinutes: childData.dailyLimitMinutes || 60,
          minutesWatchedToday: 0,
          parentId: childData.parentId,
        };

        set({
          childToken: response.token ?? null,
          selectedProfile: profile,
          session: {
            isAuthenticated: true,
            username: profile.name,
            profile,
          },
        });

        // Persist token securely and clear parent state
        if (response.token) {
          await Promise.all([
            secureStorage.clearParentToken(),
            secureStorage.clearAdminToken(),
          ]);
          await secureStorage.setChildToken(response.token);
        }

        // Fetch child's content with authenticated session
        try {
          await get().fetchApprovedContent(response.token ?? undefined);
        } catch (fetchErr: any) {
          console.warn('[ContentStore] Post-login content load notice:', fetchErr.message);
        }

        return { success: true };
      } else {
        const errorMsg =
          response.error ||
          response.message ||
          'Incorrect password. Ask mom or dad for help!';
        return { success: false, error: errorMsg };
      }
    } catch (e: any) {
      console.error('[ContentStore] Login error:', e.message);
      return {
        success: false,
        error:
          e.message ||
          'Unable to connect to safety server. Please check your network connection!',
      };
    }
  },

  /**
   * Logout child — clears all state
   * Maps to Kotlin logoutChild()
   */
  logoutChild: () => {
    secureStorage.clearChildToken();
    set({
      childToken: null,
      session: initialSession,
      selectedProfile: null,
      approvedVideos: [],
      approvedChannels: [],
      approvedPlaylists: [],
    });
  },

  /**
   * Select profile (switch active child)
   * Maps to Kotlin selectProfile()
   */
  selectProfile: (profile) => {
    set({ selectedProfile: profile });
  },

  updateCurrentChildAvatar: async (avatarEmoji, colorHex) => {
    try {
      const res = await Api.updateChildAvatar(avatarEmoji, colorHex);
      if (res.success && res.child) {
        const current = get().selectedProfile;
        if (current) {
          const updated: ChildProfile = {
            ...current,
            avatarEmoji: res.child.avatarEmoji,
            colorHex: res.child.colorHex ?? current.colorHex,
          };
          set((state) => ({
            selectedProfile: updated,
            session: {
              ...state.session,
              profile: updated,
            },
            childProfiles: state.childProfiles.map((p) =>
              p.id === updated.id ? updated : p
            ),
          }));
        }
        return { success: true };
      }
      return {
        success: false,
        error: res.error || 'Failed to update avatar',
      };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },

  /**
   * Fetch approved content with authenticated token
   * Maps to Kotlin fetchApprovedContent()
   */
  fetchApprovedContent: async (token) => {
    const activeToken = token ?? get().childToken;
    if (!activeToken) return;

    try {
      const contentResponse = await Api.getChildHome();
      if (contentResponse.success) {
        applyContentResponse(contentResponse, set, get().likedVideoIds);
      }
    } catch (e: any) {
      console.warn('[ContentStore] Fetch home content failed:', e.message);
    }
  },

  /**
   * Filter videos by category with like/favorite ranking at the top
   */
  getVideosForCategory: (category) => {
    const list = get().approvedVideos.filter((v) => !v.isBlocked);
    const filtered =
      category === VideoCategory.ALL
        ? list
        : list.filter((v) => v.category === category);

    // Rank favorited/liked videos at the top
    return [...filtered].sort((a, b) => {
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      return 0;
    });
  },

  /**
   * Filter videos by channel title
   */
  getVideosForChannel: (channelTitle) => {
    return get().approvedVideos.filter(
      (v) =>
        !v.isBlocked &&
        v.channelTitle.toLowerCase() === channelTitle.trim().toLowerCase()
    );
  },

  /**
   * Get videos in a playlist
   */
  getVideosForPlaylist: (playlist) => {
    const active = get().approvedVideos.filter((v) => !v.isBlocked);
    const matching = active.filter((v) =>
      playlist.videoIds?.includes(v.id)
    );
    if (matching.length > 0) return matching;
    return active.slice(0, playlist.videoCount);
  },

  getChannelById: (id) => {
    return get().approvedChannels.find((c) => c.id === id && !c.isBlocked);
  },

  getPlaylistById: (id) => {
    return get().approvedPlaylists.find((p) => p.id === id && !p.isBlocked);
  },

  getVideoById: (id) => {
    return get().approvedVideos.find((v) => v.id === id && !v.isBlocked);
  },

  /**
   * Local search across approved content
   * Maps to Kotlin searchApprovedContent()
   */
  searchApprovedContent: (query) => {
    if (!query.trim()) {
      return { videos: [], channels: [], playlists: [] };
    }
    const q = query.trim().toLowerCase();

    const matchedVideos = get().approvedVideos.filter(
      (v) =>
        !v.isBlocked &&
        (v.title.toLowerCase().includes(q) ||
          v.channelTitle.toLowerCase().includes(q) ||
          (v.description ?? '').toLowerCase().includes(q))
    );

    const matchedChannels = get().approvedChannels.filter(
      (c) =>
        !c.isBlocked &&
        (c.title.toLowerCase().includes(q) ||
          (c.description ?? '').toLowerCase().includes(q))
    );

    const matchedPlaylists = get().approvedPlaylists.filter(
      (p) =>
        !p.isBlocked &&
        (p.title.toLowerCase().includes(q) ||
          p.channelTitle.toLowerCase().includes(q))
    );

    return {
      videos: matchedVideos,
      channels: matchedChannels,
      playlists: matchedPlaylists,
    };
  },

  addApprovedVideo: (video) => {
    set((state) => ({
      approvedVideos: [video, ...state.approvedVideos],
    }));
  },

  blockOrRemoveVideo: (id) => {
    set((state) => ({
      approvedVideos: state.approvedVideos.filter((v) => v.id !== id),
    }));
  },

  getCurrentToken: () => get().childToken,

  toggleLikeVideo: async (videoId: string) => {
    const { likedVideoIds, approvedVideos } = get();
    const isLiked = likedVideoIds.includes(videoId);
    const updatedIds = isLiked
      ? likedVideoIds.filter((id) => id !== videoId)
      : [...likedVideoIds, videoId];

    const updatedVideos = approvedVideos.map((v) => {
      if (v.id === videoId) {
        return {
          ...v,
          isFavorite: !isLiked,
          likesCount: Math.max(0, (v.likesCount ?? 0) + (isLiked ? -1 : 1)),
        };
      }
      return v;
    });

    set({
      likedVideoIds: updatedIds,
      approvedVideos: updatedVideos,
    });

    try {
      await AsyncStorage.setItem(
        '@kids_liked_video_ids',
        JSON.stringify(updatedIds)
      );
    } catch (err: any) {
      console.warn('[ContentStore] Save liked video failed:', err.message);
    }
  },
}));

/**
 * Helper: apply backend content response to store
 * Maps DTOs → domain models
 */
function applyContentResponse(
  response: any,
  set: (partial: any) => void,
  likedIds: string[] = []
): void {
  set({
    approvedVideos: (response.videos ?? []).map((v: any) =>
      mapVideoDto(v, likedIds)
    ),
    approvedChannels: (response.channels ?? []).map(mapChannelDto),
    approvedPlaylists: (response.playlists ?? []).map(mapPlaylistDto),
  });
}

function mapVideoDto(dto: any, likedIds: string[] = []): VideoItem {
  const isFav = likedIds.includes(dto.id) || dto.isFavorite === true;
  return {
    id: dto.id,
    youtubeId: dto.youtubeId,
    title: dto.title,
    channelTitle: dto.channelTitle,
    thumbnailUrl: dto.thumbnailUrl,
    durationText: dto.durationText,
    category: parseCategory(dto.category),
    description: dto.description ?? '',
    isBlocked: dto.isBlocked ?? false,
    isFavorite: isFav,
    likesCount: isFav ? 1 : 0,
  };
}

function mapChannelDto(dto: any): ChannelItem {
  return {
    id: dto.id,
    title: dto.title,
    avatarUrl: dto.avatarUrl,
    videoCount: dto.videoCount,
    colorAccentHex: dto.colorAccentHex ?? 0xff00a6fb,
    description: dto.description ?? '',
    isBlocked: dto.isBlocked ?? false,
  };
}

function mapPlaylistDto(dto: any): PlaylistItem {
  return {
    id: dto.id,
    title: dto.title,
    channelTitle: dto.channelTitle,
    thumbnailUrl: dto.thumbnailUrl,
    videoCount: dto.videoCount,
    videoIds: dto.videoIds ?? [],
    isBlocked: dto.isBlocked ?? false,
  };
}

function parseCategory(raw: string): VideoCategory {
  const upper = (raw ?? '').toUpperCase();
  if (upper in VideoCategory) {
    return upper as VideoCategory;
  }
  return VideoCategory.ALL;
}

/**
 * Convenience selectors
 * Maps to Kotlin's `contentRepository.approvedVideos.collectAsState()`
 */
export const selectApprovedVideos = (s: ContentState) => s.approvedVideos;
export const selectApprovedChannels = (s: ContentState) => s.approvedChannels;
export const selectApprovedPlaylists = (s: ContentState) => s.approvedPlaylists;
export const selectChildProfiles = (s: ContentState) => s.childProfiles;
export const selectCurrentProfile = (s: ContentState) => s.selectedProfile;
export const selectSession = (s: ContentState) => s.session;