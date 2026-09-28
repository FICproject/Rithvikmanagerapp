import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../theme';
import { useAuth } from '../../hooks/useAuth';
import { services } from '../../services';
import { LeaderboardEntry } from '../../types';
import { LeaderboardPeriod, LeaderboardResponse } from '../../services/repositories/ILeaderboardRepository';
import { FICHeader } from '../../components/ui/FICHeader';
import { FICAvatar } from '../../components/ui/FICAvatar';
import { FICCard } from '../../components/ui/FICCard';
import { FICLoadingState } from '../../components/feedback/FICLoadingState';
import { FICErrorState } from '../../components/feedback/FICErrorState';
import { FICEmptyState } from '../../components/feedback/FICEmptyState';

export interface LeaderboardScreenProps {
  onOpenDrawer?: () => void;
  onNavigateRoute?: (routeName: string) => void;
}

const PERIOD_OPTIONS: { label: string; value: LeaderboardPeriod }[] = [
  { label: 'Today', value: 'TODAY' },
  { label: 'This Week', value: 'THIS_WEEK' },
  { label: 'This Month', value: 'THIS_MONTH' },
];

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({
  onOpenDrawer,
}) => {
  const { manager } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<LeaderboardPeriod>('THIS_MONTH');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadLeaderboardData = useCallback(
    async (period: LeaderboardPeriod, isRefresh = false) => {
      if (!isRefresh) setIsLoading(true);
      setError(null);
      try {
        const managerId = manager?.id || 'mgr-001';
        const res = await services.leaderboardRepository.getLeaderboard(managerId, period);
        setLeaderboardData(res);
      } catch (err) {
        setError('Unable to load leaderboard');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [manager],
  );

  useEffect(() => {
    loadLeaderboardData(selectedPeriod);
  }, [selectedPeriod, loadLeaderboardData]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadLeaderboardData(selectedPeriod, true);
  };

  const handlePeriodChange = (period: LeaderboardPeriod) => {
    if (period !== selectedPeriod) {
      setSelectedPeriod(period);
    }
  };

  const formatRankNumber = (rank: number): string => {
    return rank < 10 ? `#0${rank}` : `#${rank}`;
  };

  const formatTopBadge = (rank: number): string => {
    if (rank === 1) return '1st';
    if (rank === 2) return '2nd';
    if (rank === 3) return '3rd';
    return `${rank}th`;
  };

  if (isLoading && !isRefreshing) {
    return <FICLoadingState message="Loading leaderboard standings..." />;
  }

  if (error) {
    return (
      <FICErrorState
        title="Leaderboard Error"
        message={error}
        onRetry={() => loadLeaderboardData(selectedPeriod)}
      />
    );
  }

  const entries = leaderboardData?.entries || [];
  const currentUserEntry =
    leaderboardData?.currentUserEntry ||
    entries.find(e => e.managerId === manager?.id);

  const topThree = entries.slice(0, 3);
  const remainingEntries = entries.slice(3);

  const renderCurrentManagerCard = () => {
    if (!currentUserEntry && !manager) return null;

    const rankDisplay = currentUserEntry ? formatRankNumber(currentUserEntry.rank) : '#--';
    const vendors = currentUserEntry?.vendorsOnboarded ?? 0;
    const activities = currentUserEntry?.activitiesCount ?? 0;
    const displayName = manager?.name || currentUserEntry?.managerName || 'Manager';

    return (
      <FICCard style={styles.currentManagerCard}>
        <View style={styles.currentCardHeader}>
          <Text style={styles.currentCardSubtitle}>Your Position</Text>
          <View style={styles.currentRankBadge}>
            <Text style={styles.currentRankText}>{rankDisplay}</Text>
          </View>
        </View>

        <View style={styles.currentCardBody}>
          <FICAvatar name={displayName} size={44} />
          <View style={styles.currentCardInfo}>
            <Text style={styles.currentManagerName}>{displayName}</Text>
            <Text style={styles.currentMetricsText}>
              {vendors} Vendors • {activities} Activities
            </Text>
          </View>
          {currentUserEntry?.score ? (
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreValue}>{currentUserEntry.score}</Text>
              <Text style={styles.scoreLabel}>pts</Text>
            </View>
          ) : null}
        </View>
      </FICCard>
    );
  };

  const renderTopThree = () => {
    if (topThree.length === 0) return null;

    // Arrange in order: 2nd, 1st, 3rd for podium layout, or simple clean list
    return (
      <View style={styles.topThreeContainer}>
        <Text style={styles.sectionHeaderTitle}>Top Performers</Text>
        <View style={styles.topThreeRow}>
          {topThree.map(item => {
            const isFirst = item.rank === 1;
            const isSecond = item.rank === 2;

            let borderStyle = styles.topCardBorderNormal;
            let badgeStyle = styles.badgeNormal;
            if (isFirst) {
              borderStyle = styles.topCardBorderFirst;
              badgeStyle = styles.badgeFirst;
            } else if (isSecond) {
              borderStyle = styles.topCardBorderSecond;
              badgeStyle = styles.badgeSecond;
            } else {
              borderStyle = styles.topCardBorderThird;
              badgeStyle = styles.badgeThird;
            }

            return (
              <View
                key={item.managerId}
                style={[
                  styles.topCard,
                  borderStyle,
                  isFirst && styles.topCardFirstElevated,
                ]}
              >
                <View style={[styles.badge, badgeStyle]}>
                  <Text style={styles.badgeText}>{formatTopBadge(item.rank)}</Text>
                </View>
                <FICAvatar name={item.managerName} size={40} />
                <Text style={styles.topManagerName} numberOfLines={1}>
                  {item.managerName}
                </Text>
                <Text style={styles.topManagerSub} numberOfLines={1}>
                  {item.territoryName || item.role}
                </Text>
                <Text style={styles.topMetricText}>
                  {item.activitiesCount ?? item.vendorsOnboarded} activities
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const renderRankingItem = ({ item }: { item: LeaderboardEntry }) => {
    const isCurrentUser = item.managerId === manager?.id;
    const formattedRank = item.rank < 10 ? `0${item.rank}` : `${item.rank}`;

    return (
      <View
        style={[
          styles.rankItemRow,
          isCurrentUser && styles.rankItemRowHighlight,
        ]}
      >
        <Text style={styles.rankNumberText}>{formattedRank}</Text>
        <FICAvatar name={item.managerName} size={36} />
        <View style={styles.rankItemContent}>
          <View style={styles.rankItemNameRow}>
            <Text style={styles.rankItemName} numberOfLines={1}>
              {item.managerName}
            </Text>
            {isCurrentUser && (
              <View style={styles.youBadge}>
                <Text style={styles.youBadgeText}>YOU</Text>
              </View>
            )}
          </View>
          <Text style={styles.rankItemSub} numberOfLines={1}>
            {item.role} {item.territoryName ? `• ${item.territoryName}` : ''}
          </Text>
        </View>
        <View style={styles.rankItemRight}>
          <Text style={styles.rankItemMetric}>
            {item.activitiesCount ?? item.vendorsOnboarded} activities
          </Text>
          <Text style={styles.rankItemScore}>{item.score} pts</Text>
        </View>
      </View>
    );
  };

  const renderHeaderComponent = () => (
    <View style={styles.headerContentWrapper}>
      {/* Title & Subtitle banner */}
      <View style={styles.subtitleRow}>
        <View>
          <Text style={styles.headerSubtitle}>Track your ranking and activity</Text>
          {leaderboardData?.territoryScopeName && (
            <Text style={styles.territoryScopeText}>
              📍 {leaderboardData.territoryScopeName}
            </Text>
          )}
        </View>
      </View>

      {/* Period Filter Tabs */}
      <View style={styles.periodSelectorContainer}>
        {PERIOD_OPTIONS.map(opt => {
          const isSelected = selectedPeriod === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.periodPill,
                isSelected && styles.periodPillSelected,
              ]}
              activeOpacity={0.7}
              onPress={() => handlePeriodChange(opt.value)}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`Filter leaderboard by ${opt.label}`}
            >
              <Text
                style={[
                  styles.periodPillText,
                  isSelected && styles.periodPillTextSelected,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Current Manager Position Card */}
      {renderCurrentManagerCard()}

      {/* Top Three Section */}
      {renderTopThree()}

      {/* List Header if remaining entries exist */}
      {remainingEntries.length > 0 && (
        <Text style={styles.sectionHeaderTitle}>Full Ranking</Text>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={theme.colors.primaryDark} barStyle="light-content" />
      <FICHeader
        title="Leaderboard"
        leftActionIcon={<Text style={styles.headerIcon}>☰</Text>}
        onLeftAction={onOpenDrawer}
        rightActionIcon={<Text style={styles.headerIcon}>↻</Text>}
        onRightAction={handleRefresh}
      />

      {entries.length === 0 ? (
        <View style={styles.emptyContainer}>
          {renderHeaderComponent()}
          <FICEmptyState
            title="No leaderboard data available"
            description="Rankings will appear once field activities are recorded for this timeframe."
          />
        </View>
      ) : (
        <FlatList
          data={remainingEntries}
          keyExtractor={item => item.managerId}
          renderItem={renderRankingItem}
          ListHeaderComponent={renderHeaderComponent}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerIcon: {
    fontSize: 20,
    color: theme.colors.surface,
  },
  listContent: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
  emptyContainer: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
  },
  headerContentWrapper: {
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xs,
  },
  subtitleRow: {
    marginBottom: theme.spacing.sm,
  },
  headerSubtitle: {
    ...theme.typography.bodyMedium,
    color: theme.colors.textSecondary,
  },
  territoryScopeText: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  periodSelectorContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.xxs,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  periodPill: {
    flex: 1,
    paddingVertical: theme.spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.sm,
  },
  periodPillSelected: {
    backgroundColor: theme.colors.primary,
  },
  periodPillText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  periodPillTextSelected: {
    color: theme.colors.surface,
    fontWeight: '700',
  },
  currentManagerCard: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.primary,
    borderWidth: 1.5,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.sm,
  },
  currentCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  currentCardSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  currentRankBadge: {
    backgroundColor: theme.colors.primaryLight + '25',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.radius.sm,
  },
  currentRankText: {
    ...theme.typography.bodyMedium,
    color: theme.colors.primary,
    fontWeight: '800',
  },
  currentCardBody: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentCardInfo: {
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
  currentManagerName: {
    ...theme.typography.title,
    color: theme.colors.text,
    fontWeight: '700',
  },
  currentMetricsText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  scoreContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  scoreValue: {
    ...theme.typography.headingMedium,
    color: theme.colors.primary,
  },
  scoreLabel: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    fontSize: 10,
  },
  sectionHeaderTitle: {
    ...theme.typography.title,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    marginTop: theme.spacing.xs,
  },
  topThreeContainer: {
    marginBottom: theme.spacing.md,
  },
  topThreeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: theme.spacing.xs,
  },
  topCard: {
    flex: 1,
    marginHorizontal: 3,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.xs,
    alignItems: 'center',
    borderWidth: 1,
    ...theme.elevation.card,
  },
  topCardFirstElevated: {
    paddingVertical: theme.spacing.sm,
    transform: [{ translateY: -4 }],
  },
  topCardBorderFirst: {
    borderColor: '#D4AF37', // Restrained Gold
  },
  topCardBorderSecond: {
    borderColor: '#A8A8A8', // Silver
  },
  topCardBorderThird: {
    borderColor: '#CD7F32', // Bronze
  },
  topCardBorderNormal: {
    borderColor: theme.colors.border,
  },
  badge: {
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.radius.sm,
    marginBottom: 6,
  },
  badgeFirst: {
    backgroundColor: '#FFF8E7',
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  badgeSecond: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#A8A8A8',
  },
  badgeThird: {
    backgroundColor: '#FFF3E0',
    borderWidth: 1,
    borderColor: '#CD7F32',
  },
  badgeNormal: {
    backgroundColor: theme.colors.background,
  },
  badgeText: {
    ...theme.typography.caption,
    fontSize: 11,
    fontWeight: '800',
    color: theme.colors.text,
  },
  topManagerName: {
    ...theme.typography.caption,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: 4,
    textAlign: 'center',
  },
  topManagerSub: {
    ...theme.typography.caption,
    fontSize: 10,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  topMetricText: {
    ...theme.typography.caption,
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.primary,
    marginTop: 4,
  },
  rankItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.elevation.card,
  },
  rankItemRowHighlight: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLight + '10',
  },
  rankNumberText: {
    ...theme.typography.bodyMedium,
    fontWeight: '700',
    color: theme.colors.textSecondary,
    width: 28,
    textAlign: 'center',
    marginRight: theme.spacing.xs,
  },
  rankItemContent: {
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
  rankItemNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankItemName: {
    ...theme.typography.bodyMedium,
    fontWeight: '600',
    color: theme.colors.text,
  },
  youBadge: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: theme.radius.sm,
    marginLeft: 6,
  },
  youBadgeText: {
    ...theme.typography.caption,
    fontSize: 9,
    fontWeight: '800',
    color: theme.colors.text,
  },
  rankItemSub: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    fontSize: 11,
    marginTop: 1,
  },
  rankItemRight: {
    alignItems: 'flex-end',
  },
  rankItemMetric: {
    ...theme.typography.caption,
    fontWeight: '600',
    color: theme.colors.primary,
    fontSize: 11,
  },
  rankItemScore: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    fontSize: 10,
    marginTop: 1,
  },
});
