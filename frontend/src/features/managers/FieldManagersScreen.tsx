import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  ScrollView,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../theme';
import { useAuth } from '../../hooks/useAuth';
import { services } from '../../services';
import { Manager, ManagerRole } from '../../types';
import {
  ManagerStatusFilter,
  TerritoryHierarchyItem,
} from '../../services/repositories/IManagerRepository';
import { FICHeader } from '../../components/ui/FICHeader';
import { FICAvatar } from '../../components/ui/FICAvatar';
import { FICCard } from '../../components/ui/FICCard';
import { FICTextInput } from '../../components/ui/FICTextInput';
import { FICLoadingState } from '../../components/feedback/FICLoadingState';
import { FICErrorState } from '../../components/feedback/FICErrorState';
import { FICEmptyState } from '../../components/feedback/FICEmptyState';

export interface FieldManagersScreenProps {
  onOpenDrawer?: () => void;
  onNavigateRoute?: (routeName: string, params?: Record<string, unknown>) => void;
  onSelectManager?: (manager: Manager) => void;
}

export type HierarchyStepType = 'DISTRICTS' | 'DIVISIONS' | 'PINCODES' | 'MANAGERS';

export interface BreadcrumbNode {
  type: HierarchyStepType;
  id: string;
  title: string;
}

const FILTER_OPTIONS: { label: string; value: ManagerStatusFilter }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Inactive', value: 'INACTIVE' },
];

export const FieldManagersScreen: React.FC<FieldManagersScreenProps> = ({
  onOpenDrawer,
  onNavigateRoute,
  onSelectManager,
}) => {
  const { manager: authenticatedManager } = useAuth();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<ManagerStatusFilter>('ALL');

  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbNode[]>([]);
  const [territoryItems, setTerritoryItems] = useState<TerritoryHierarchyItem[]>([]);
  const [managerItems, setManagerItems] = useState<Manager[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const formatRoleName = (role: ManagerRole | string): string => {
    switch (role) {
      case ManagerRole.STATE_MANAGER:
        return 'State Manager';
      case ManagerRole.DISTRICT_MANAGER:
        return 'District Manager';
      case ManagerRole.DIVISION_MANAGER:
        return 'Division Manager';
      case ManagerRole.PINCODE_MANAGER:
        return 'Pincode Manager';
      default:
        return typeof role === 'string' ? role : 'Field Manager';
    }
  };

  // Determine starting level & breadcrumbs based on logged-in manager role & territory IDs
  useEffect(() => {
    const role = authenticatedManager?.role || ManagerRole.STATE_MANAGER;
    let initialNodes: BreadcrumbNode[] = [];

    if (role === ManagerRole.STATE_MANAGER) {
      initialNodes = [
        {
          type: 'DISTRICTS',
          id: authenticatedManager?.stateId || 'st-tn-01',
          title: authenticatedManager?.territoryName || 'Tamil Nadu',
        },
      ];
    } else if (role === ManagerRole.DISTRICT_MANAGER) {
      initialNodes = [
        {
          type: 'DIVISIONS',
          id: authenticatedManager?.districtId || 'dt-chn-01',
          title: authenticatedManager?.territoryName || 'Chennai District',
        },
      ];
    } else if (role === ManagerRole.DIVISION_MANAGER) {
      initialNodes = [
        {
          type: 'PINCODES',
          id: authenticatedManager?.divisionId || 'div-chn-north',
          title: authenticatedManager?.territoryName || 'Chennai North Division',
        },
      ];
    } else if (role === ManagerRole.PINCODE_MANAGER) {
      initialNodes = [
        {
          type: 'MANAGERS',
          id: authenticatedManager?.pincodeId || '600001',
          title: authenticatedManager?.territoryName || 'Pincode 600001',
        },
      ];
    } else {
      initialNodes = [
        {
          type: 'DISTRICTS',
          id: authenticatedManager?.stateId || 'st-tn-01',
          title: authenticatedManager?.territoryName || 'State Territory',
        },
      ];
    }

    setBreadcrumbs(initialNodes);
  }, [authenticatedManager]);

  // Load hierarchy list data
  const loadData = useCallback(
    async (isRefresh = false) => {
      if (!isRefresh) setIsLoading(true);
      setError(null);
      try {
        const managerId = authenticatedManager?.id || 'mgr-000';

        if (searchQuery.trim().length > 0) {
          const res = await services.managerRepository.getManagersInScope(
            managerId,
            searchQuery,
            selectedFilter,
          );
          setManagerItems(res);
          setTerritoryItems([]);
          setIsLoading(false);
          setIsRefreshing(false);
          return;
        }

        if (breadcrumbs.length === 0) {
          setIsLoading(false);
          setIsRefreshing(false);
          return;
        }

        const currentNode = breadcrumbs[breadcrumbs.length - 1];

        if (currentNode.type === 'DISTRICTS') {
          const districts = await services.managerRepository.getDistrictsInState(
            currentNode.id,
            managerId,
          );
          setTerritoryItems(districts);
          setManagerItems([]);
        } else if (currentNode.type === 'DIVISIONS') {
          const divisions = await services.managerRepository.getDivisionsInDistrict(
            currentNode.id,
            managerId,
          );
          setTerritoryItems(divisions);
          setManagerItems([]);
        } else if (currentNode.type === 'PINCODES') {
          const pincodes = await services.managerRepository.getPincodesInDivision(
            currentNode.id,
            managerId,
          );
          setTerritoryItems(pincodes);
          setManagerItems([]);
        } else if (currentNode.type === 'MANAGERS') {
          const mgrs = await services.managerRepository.getManagersInPincode(
            currentNode.id,
            selectedFilter,
          );
          setManagerItems(mgrs);
          setTerritoryItems([]);
        }
      } catch (err) {
        setError('Unable to load managers directory');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [authenticatedManager, breadcrumbs, searchQuery, selectedFilter],
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Intercept hardware back press to move back up hierarchy level first
  useEffect(() => {
    const onBackPress = () => {
      if (breadcrumbs.length > 1) {
        setBreadcrumbs(prev => prev.slice(0, prev.length - 1));
        return true;
      }
      return false;
    };

    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [breadcrumbs]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData(true);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleManagerPress = (mgr: Manager) => {
    if (onSelectManager) {
      onSelectManager(mgr);
    } else if (onNavigateRoute) {
      onNavigateRoute('ManagerDetail', { managerId: mgr.id });
    }
  };

  const handleTerritoryPress = (item: TerritoryHierarchyItem) => {
    if (item.type === 'DISTRICT') {
      setBreadcrumbs(prev => [
        ...prev,
        { type: 'DIVISIONS', id: item.id, title: item.name },
      ]);
    } else if (item.type === 'DIVISION') {
      setBreadcrumbs(prev => [
        ...prev,
        { type: 'PINCODES', id: item.id, title: item.name },
      ]);
    } else if (item.type === 'PINCODE') {
      setBreadcrumbs(prev => [
        ...prev,
        { type: 'MANAGERS', id: item.id, title: item.name },
      ]);
    }
  };

  const handleBreadcrumbPress = (index: number) => {
    setBreadcrumbs(prev => prev.slice(0, index + 1));
  };

  const handleGoBackLevel = () => {
    if (breadcrumbs.length > 1) {
      setBreadcrumbs(prev => prev.slice(0, prev.length - 1));
    }
  };

  if (isLoading && !isRefreshing) {
    return <FICLoadingState message="Loading territory hierarchy..." />;
  }

  if (error) {
    return (
      <FICErrorState
        title="Manager Directory Failure"
        message={error}
        onRetry={() => loadData()}
      />
    );
  }

  const currentBreadcrumb = breadcrumbs[breadcrumbs.length - 1];
  const isSearchActive = searchQuery.trim().length > 0;
  const isViewingManagers = isSearchActive || currentBreadcrumb?.type === 'MANAGERS';

  const renderBreadcrumbBar = () => {
    if (breadcrumbs.length === 0 || isSearchActive) return null;
    return (
      <View style={styles.breadcrumbBar}>
        {breadcrumbs.length > 1 && (
          <TouchableOpacity
            style={styles.backLevelBtn}
            onPress={handleGoBackLevel}
            accessibilityLabel="Back to previous level"
          >
            <Text style={styles.backLevelText}>‹ Back</Text>
          </TouchableOpacity>
        )}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.breadcrumbScroll}
        >
          {breadcrumbs.map((node, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return (
              <React.Fragment key={`${node.type}-${node.id}-${index}`}>
                <TouchableOpacity
                  onPress={() => handleBreadcrumbPress(index)}
                  disabled={isLast}
                  style={styles.breadcrumbPill}
                  accessibilityRole="button"
                  accessibilityLabel={`Breadcrumb ${node.title}`}
                >
                  <Text
                    style={[
                      styles.breadcrumbPillText,
                      isLast && styles.breadcrumbPillTextActive,
                    ]}
                    numberOfLines={1}
                  >
                    {node.title}
                  </Text>
                </TouchableOpacity>
                {!isLast && <Text style={styles.breadcrumbDivider}>›</Text>}
              </React.Fragment>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  const renderTerritoryCard = (item: TerritoryHierarchyItem) => {
    const subLabel =
      item.type === 'DISTRICT'
        ? `${item.subItemCount ?? 0} Divisions`
        : item.type === 'DIVISION'
        ? `${item.subItemCount ?? 0} Pincodes`
        : `${item.managerCount ?? 0} Managers`;

    const initials = item.name.substring(0, 2).toUpperCase();

    return (
      <TouchableOpacity
        key={item.id}
        activeOpacity={0.8}
        onPress={() => handleTerritoryPress(item)}
        accessibilityRole="button"
        accessibilityLabel={`Open ${item.name}`}
      >
        <FICCard style={styles.managerCard}>
          <View style={styles.cardHeaderRow}>
            <FICAvatar name={item.name || initials} size={44} />
            <View style={styles.cardMainContent}>
              <Text style={styles.managerName} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.roleText}>
                {item.type === 'DISTRICT'
                  ? 'District Territory'
                  : item.type === 'DIVISION'
                  ? 'Division Territory'
                  : 'Pincode Territory'}
              </Text>
              {item.assignedManagerName ? (
                <Text style={styles.territoryText}>
                  👤 Assigned: {item.assignedManagerName}
                </Text>
              ) : null}
              <Text style={styles.employeeIdText}>
                {subLabel} • {item.managerCount ?? 0} Managers Total
              </Text>
            </View>

            <View style={styles.rightActionCol}>
              <View style={[styles.statusBadge, styles.statusActive]}>
                <Text style={[styles.statusBadgeText, styles.statusActiveText]}>
                  ACTIVE
                </Text>
              </View>
              <Text style={styles.chevronIcon}>›</Text>
            </View>
          </View>
        </FICCard>
      </TouchableOpacity>
    );
  };

  const renderManagerItem = ({ item }: { item: Manager }) => {
    const isActive = item.status !== 'INACTIVE';
    const isSelf = item.id === authenticatedManager?.id;

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => handleManagerPress(item)}
        accessibilityRole="button"
        accessibilityLabel={`View details for ${item.name}`}
      >
        <FICCard
          style={
            isSelf
              ? StyleSheet.flatten([styles.managerCard, styles.selfManagerCard])
              : styles.managerCard
          }
        >
          <View style={styles.cardHeaderRow}>
            <FICAvatar name={item.name} size={44} />
            <View style={styles.cardMainContent}>
              <View style={styles.nameRow}>
                <Text style={styles.managerName} numberOfLines={1}>
                  {item.name}
                </Text>
                {isSelf && (
                  <View style={styles.youChip}>
                    <Text style={styles.youChipText}>YOU</Text>
                  </View>
                )}
              </View>

              <Text style={styles.roleText}>{formatRoleName(item.role)}</Text>

              {item.territoryName && (
                <Text style={styles.territoryText}>📍 {item.territoryName}</Text>
              )}

              {item.employeeId && (
                <Text style={styles.employeeIdText}>Employee ID: {item.employeeId}</Text>
              )}
            </View>

            <View style={styles.rightActionCol}>
              <View
                style={[
                  styles.statusBadge,
                  isActive ? styles.statusActive : styles.statusInactive,
                ]}
              >
                <Text
                  style={[
                    styles.statusBadgeText,
                    isActive ? styles.statusActiveText : styles.statusInactiveText,
                  ]}
                >
                  {isActive ? 'ACTIVE' : 'INACTIVE'}
                </Text>
              </View>
              <Text style={styles.chevronIcon}>›</Text>
            </View>
          </View>
        </FICCard>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.headerContentWrapper}>
      <Text style={styles.headerSubtitle}>Managers in your territory</Text>
      <Text style={styles.scopeBadgeText}>
        📍 Scope: {currentBreadcrumb?.title || authenticatedManager?.territoryName || 'Authorized Scope'}
      </Text>

      {renderBreadcrumbBar()}

      {/* Search Input Bar */}
      <View style={styles.searchContainer}>
        <FICTextInput
          placeholder="Search managers..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.clearSearchBtn}
            onPress={handleClearSearch}
            accessibilityLabel="Clear search"
          >
            <Text style={styles.clearSearchText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Status Filter Tabs */}
      <View style={styles.filterContainer}>
        {FILTER_OPTIONS.map(opt => {
          const isSelected = selectedFilter === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.filterPill,
                isSelected && styles.filterPillSelected,
              ]}
              activeOpacity={0.7}
              onPress={() => setSelectedFilter(opt.value)}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={`Filter by ${opt.label}`}
            >
              <Text
                style={[
                  styles.filterPillText,
                  isSelected && styles.filterPillTextSelected,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const isListEmpty = isViewingManagers
    ? managerItems.length === 0
    : territoryItems.length === 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={theme.colors.primaryDark} barStyle="light-content" />
      <FICHeader
        title="Field Managers"
        leftActionIcon={<Text style={styles.headerIcon}>☰</Text>}
        onLeftAction={onOpenDrawer}
        rightActionIcon={<Text style={styles.headerIcon}>↻</Text>}
        onRightAction={handleRefresh}
      />

      {isListEmpty ? (
        <View style={styles.emptyContainer}>
          {renderHeader()}
          <FICEmptyState
            title={
              searchQuery.trim().length > 0 || selectedFilter !== 'ALL'
                ? 'No matches found'
                : 'No territory items found'
            }
            description={
              searchQuery.trim().length > 0
                ? `No results for "${searchQuery}". Try searching by another name, employee ID, or territory.`
                : 'No sub-territories or managers are registered in this territory scope.'
            }
            actionTitle={
              searchQuery.trim().length > 0 || selectedFilter !== 'ALL'
                ? 'Clear Filters'
                : undefined
            }
            onAction={
              searchQuery.trim().length > 0 || selectedFilter !== 'ALL'
                ? () => {
                    setSearchQuery('');
                    setSelectedFilter('ALL');
                  }
                : undefined
            }
          />
        </View>
      ) : isViewingManagers ? (
        <FlatList
          data={managerItems}
          keyExtractor={item => item.id}
          renderItem={renderManagerItem}
          ListHeaderComponent={renderHeader}
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
      ) : (
        <FlatList
          data={territoryItems}
          keyExtractor={item => item.id}
          renderItem={({ item }) => renderTerritoryCard(item)}
          ListHeaderComponent={renderHeader}
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
  headerSubtitle: {
    ...theme.typography.bodyMedium,
    color: theme.colors.textSecondary,
  },
  scopeBadgeText: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '600',
    marginTop: 2,
    marginBottom: theme.spacing.xs,
  },
  breadcrumbBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.sm,
    paddingVertical: theme.spacing.xxs,
    paddingHorizontal: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  backLevelBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: theme.colors.primary + '15',
    borderRadius: theme.radius.sm,
    marginRight: 6,
  },
  backLevelText: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '700',
  },
  breadcrumbScroll: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breadcrumbPill: {
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  breadcrumbPillText: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '600',
    fontSize: 12,
  },
  breadcrumbPillTextActive: {
    color: theme.colors.text,
    fontWeight: '700',
  },
  breadcrumbDivider: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginHorizontal: 4,
    fontSize: 12,
  },
  searchContainer: {
    position: 'relative',
    marginBottom: theme.spacing.xs,
  },
  searchInput: {
    marginBottom: 0,
  },
  clearSearchBtn: {
    position: 'absolute',
    right: 12,
    top: 14,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearSearchText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontWeight: '700',
    fontSize: 11,
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.xxs,
    marginVertical: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterPill: {
    flex: 1,
    paddingVertical: theme.spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.sm,
  },

  filterPillSelected: {
    backgroundColor: theme.colors.primary,
  },
  filterPillText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  filterPillTextSelected: {
    color: theme.colors.surface,
    fontWeight: '700',
  },
  managerCard: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.xs,
    padding: theme.spacing.sm,
  },
  selfManagerCard: {
    borderColor: theme.colors.primary,
    borderWidth: 1.5,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardMainContent: {
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  managerName: {
    ...theme.typography.title,
    color: theme.colors.text,
    fontWeight: '700',
  },
  youChip: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: theme.radius.sm,
    marginLeft: 6,
  },
  youChipText: {
    ...theme.typography.caption,
    fontSize: 9,
    fontWeight: '800',
    color: theme.colors.text,
  },
  roleText: {
    ...theme.typography.caption,
    color: theme.colors.primary,
    fontWeight: '600',
    marginTop: 1,
  },
  territoryText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  employeeIdText: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
  rightActionCol: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 48,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.radius.sm,
  },
  statusActive: {
    backgroundColor: theme.colors.success + '15',
    borderWidth: 1,
    borderColor: theme.colors.success + '40',
  },
  statusInactive: {
    backgroundColor: theme.colors.textMuted + '15',
    borderWidth: 1,
    borderColor: theme.colors.textMuted + '40',
  },
  statusBadgeText: {
    ...theme.typography.caption,
    fontSize: 9,
    fontWeight: '800',
  },
  statusActiveText: {
    color: theme.colors.success,
  },
  statusInactiveText: {
    color: theme.colors.textMuted,
  },
  chevronIcon: {
    fontSize: 20,
    color: theme.colors.textMuted,
    fontWeight: '300',
  },
});

