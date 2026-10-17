// src/types/index.ts

// Content Models
export type {
  VideoItem,
  ChannelItem,
  PlaylistItem,
  ChildProfile,
  ChildSession,
  SearchResultBundle,
} from './models';
export { VideoCategory, getVideoCategoryDisplayName, isEmptySearchResult } from './models';

// API Models
export type {
  HealthResponse,
  ChildProfileDto,
  ChildProfilesResponse,
  ChildLoginRequest,
  ChildLoginResponse,
  VideoItemDto,
  ChannelItemDto,
  PlaylistItemDto,
  ApprovedContentResponse,
  SearchContentResponse,
  PinVerifyRequest,
  PinVerifyResponse,
  ExtendTimeRequest,
  SyncWatchRequest,
  ScreenTimeSessionDto,
  ScreenTimeResponse,
  ParentLoginRequest,
  ParentRegisterRequest,
  ParentAccountDto,
  ParentAuthResponse,
  ParentStatsDto,
  ParentDashboardDataDto,
  ParentDashboardResponse,
  ChildDetailDto,
  ParentChildrenResponse,
  CreateChildRequest,
  UpdateDailyLimitRequest,
  UpdatePinRequest,
  ChangePasswordRequest,
  AddChannelRequest,
  AddPlaylistRequest,
  AddVideoRequest,
  GenericActionResponse,
  AdminLoginRequest,
  AdminAccountDto,
  AdminAuthResponse,
  AdminStatsDto,
  AdminDashboardResponse,
  AdminParentItemDto,
  AdminParentsResponse,
  AdminChildItemDto,
  AdminChildrenResponse,
  AdminContentDataDto,
  AdminContentResponse,
  ModerateContentRequest,
} from './api';

// Navigation
export type { RootStackParamList } from './navigation';
export { ScreenState, ChildTab, ParentNavSection, AdminSection, AuthMode } from './navigation';