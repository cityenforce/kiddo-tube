// src/components/branding/KiddoTubeLogo.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

export type LogoPalette = 'original' | 'playful-lagoon' | 'cozy-sunset';
export type LogoSize = 'small' | 'medium' | 'large' | 'icon-only';

interface KiddoTubeLogoProps {
  size?: LogoSize;
  palette?: LogoPalette;
  showTagline?: boolean;
}

const PALETTES = {
  original: {
    sunYellow: '#FFC93C',
    skyBlue: '#3A9BE8',
    coral: '#FF6F61',
    navyText: '#1E293B',
    white: '#FFFFFF',
    taglineColor: '#64748B',
  },
  'playful-lagoon': {
    sunYellow: '#FFB703',
    skyBlue: '#0284C7',
    coral: '#FB7185',
    navyText: '#0F172A',
    white: '#FFFFFF',
    taglineColor: '#475569',
  },
  'cozy-sunset': {
    sunYellow: '#FDE047',
    skyBlue: '#2563EB',
    coral: '#F43F5E',
    navyText: '#18181B',
    white: '#FFFFFF',
    taglineColor: '#71717A',
  },
};

export const KiddoTubeLogo: React.FC<KiddoTubeLogoProps> = ({
  size = 'medium',
  palette = 'cozy-sunset',
  showTagline = true,
}) => {
  const p = PALETTES[palette] || PALETTES['cozy-sunset'];

  const isIconOnly = size === 'icon-only';
  const isSmall = size === 'small';
  const isLarge = size === 'large';

  const badgeSize = isSmall ? 36 : isLarge ? 80 : 54;
  const playSize = isSmall ? 20 : isLarge ? 44 : 30;
  const titleSize = isSmall ? 18 : isLarge ? 34 : 26;
  const taglineSize = isSmall ? 9 : isLarge ? 13 : 11;

  return (
    <View style={styles.container}>
      {/* Concept 3: Flying Sun App Icon Emblem */}
      <View
        style={[
          styles.badgeOuter,
          {
            width: badgeSize,
            height: badgeSize,
            borderRadius: badgeSize * 0.32,
            backgroundColor: p.sunYellow,
            shadowColor: p.coral,
          },
        ]}
      >
        {/* Flying Sun decorative rays / wings */}
        <View style={styles.sunRaysWrap}>
          <View
            style={[
              styles.sunRayPill,
              { backgroundColor: p.coral, transform: [{ rotate: '-45deg' }] },
            ]}
          />
          <View
            style={[
              styles.sunRayPill,
              { backgroundColor: p.coral, transform: [{ rotate: '45deg' }] },
            ]}
          />
        </View>

        {/* Inner Sky Blue Lens with Play Triangle */}
        <View
          style={[
            styles.badgeInner,
            {
              width: badgeSize * 0.68,
              height: badgeSize * 0.68,
              borderRadius: badgeSize * 0.34,
              backgroundColor: p.skyBlue,
            },
          ]}
        >
          <MaterialIcons
            name="play-arrow"
            size={playSize}
            color={p.white}
            style={{ marginLeft: 2 }}
          />
        </View>
      </View>

      {/* Typography Lockup: KiddoTube + Tagline */}
      {!isIconOnly && (
        <View style={styles.textColumn}>
          <View style={styles.brandRow}>
            <Text
              style={[
                styles.brandKiddo,
                {
                  fontSize: titleSize,
                  color: p.skyBlue,
                },
              ]}
            >
              Kiddo
            </Text>
            <View
              style={[
                styles.tubeBadge,
                {
                  backgroundColor: p.coral,
                  borderRadius: titleSize * 0.3,
                  paddingHorizontal: titleSize * 0.32,
                  paddingVertical: titleSize * 0.08,
                },
              ]}
            >
              <Text
                style={[
                  styles.brandTube,
                  {
                    fontSize: titleSize * 0.95,
                    color: p.white,
                  },
                ]}
              >
                Tube
              </Text>
            </View>
          </View>

          {showTagline && (
            <Text
              style={[
                styles.tagline,
                {
                  fontSize: taglineSize,
                  color: p.taglineColor,
                },
              ]}
            >
              Safe screens. Big smiles.
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  badgeOuter: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
    position: 'relative',
  },
  sunRaysWrap: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sunRayPill: {
    position: 'absolute',
    width: '120%',
    height: '18%',
    borderRadius: 999,
    opacity: 0.15,
  },
  badgeInner: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  textColumn: {
    justifyContent: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  brandKiddo: {
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  tubeBadge: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandTube: {
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  tagline: {
    fontWeight: '700',
    letterSpacing: 0.3,
    marginTop: 2,
  },
});
