import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  StatusBar,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../theme';
import { useAuth } from '../../hooks/useAuth';
import { services } from '../../services';
import { Priority, Task, TaskStatus } from '../../types';
import { FICHeader } from '../../components/ui/FICHeader';
import { FICCard } from '../../components/ui/FICCard';
import { FICTextInput } from '../../components/ui/FICTextInput';
import { FICPriorityBadge } from '../../components/ui/FICPriorityBadge';
import { FICStatusBadge } from '../../components/ui/FICStatusBadge';
import { FICLoadingState } from '../../components/feedback/FICLoadingState';
import { FICErrorState } from '../../components/feedback/FICErrorState';
import { FICEmptyState } from '../../components/feedback/FICEmptyState';

export interface TasksScreenProps {
  onOpenDrawer?: () => void;
  onNavigateRoute?: (routeName: string, params?: Record<string, any>) => void;
}

export type TaskStatusFilter = 'ALL' | TaskStatus;

export const TasksScreen: React.FC<TasksScreenProps> = ({
  onOpenDrawer,
  onNavigateRoute,
}) => {
  const { manager } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<TaskStatusFilter>('ALL');
  const [selectedPriority, setSelectedPriority] = useState<'ALL' | Priority>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(
    async (isRefresh = false) => {
      if (!isRefresh) setIsLoading(true);
      setError(null);
      try {
        const managerId = manager?.id || 'mgr-001';
        const filterStatus = selectedStatus !== 'ALL' ? (selectedStatus as TaskStatus) : undefined;
        const filterPriority = selectedPriority !== 'ALL' ? (selectedPriority as Priority) : undefined;
        const list = await services.taskRepository.getTasks(managerId, filterStatus, filterPriority);
        setTasks(list);
      } catch {
        setError('Unable to load tasks');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [manager, selectedStatus, selectedPriority]
  );

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchTasks(true);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedStatus('ALL');
    setSelectedPriority('ALL');
  };

  const handleTaskPress = (task: Task) => {
    if (onNavigateRoute) {
      onNavigateRoute('TaskDetail', { taskId: task.id });
    }
  };

  const filteredTasks = tasks.filter(t => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      t.title.toLowerCase().includes(query) ||
      t.description.toLowerCase().includes(query)
    );
  });

  const statusChips: { id: TaskStatusFilter; label: string }[] = [
    { id: 'ALL', label: 'All' },
    { id: TaskStatus.PENDING, label: 'Pending' },
    { id: TaskStatus.IN_PROGRESS, label: 'In Progress' },
    { id: TaskStatus.BLOCKED, label: 'Blocked' },
    { id: TaskStatus.COMPLETED, label: 'Completed' },
  ];

  const priorityChips: { id: 'ALL' | Priority; label: string }[] = [
    { id: 'ALL', label: 'All' },
    { id: Priority.CRITICAL, label: '🚨 Critical' },
    { id: Priority.HIGH, label: '⚠️ High' },
    { id: Priority.MEDIUM, label: '⚡ Medium' },
    { id: Priority.LOW, label: '🟢 Low' },
  ];

  const renderTaskCard = ({ item }: { item: Task }) => {
    const isCritical = item.priority === Priority.CRITICAL;
    const isHighPriority = item.priority === Priority.HIGH || isCritical;
    return (
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={() => handleTaskPress(item)}
        accessibilityRole="button"
        accessibilityLabel={`Task: ${item.title}`}
      >
        <FICCard style={[styles.card, isCritical ? styles.criticalCardBorder : (isHighPriority ? styles.highPriorityCardBorder : null)]}>
          {isCritical && (
            <View style={[styles.highPriorityBanner, { backgroundColor: '#FEF2F2', borderColor: '#FCA5A5' }]}>
              <Text style={[styles.highPriorityBannerText, { color: '#991B1B' }]}>
                🚨 CRITICAL DIRECTIVE — IMMEDIATE ACTION REQUIRED
              </Text>
            </View>
          )}

          <View style={styles.cardHeader}>
            <View style={styles.badgeRow}>
              <FICPriorityBadge priority={item.priority} />
              <FICStatusBadge status={item.status} style={styles.statusBadge} />
            </View>
            <Text style={styles.chevron}>›</Text>
          </View>

          <Text style={styles.taskTitle}>{item.title}</Text>
          <Text style={styles.taskDescription} numberOfLines={2}>
            {item.description}
          </Text>

          <View style={styles.metadataGrid}>
            {item.territory ? (
              <Text style={styles.metaTerritoryText}>📍 {item.territory}</Text>
            ) : null}
            {item.dueSla ? (
              <Text style={styles.metaSlaText}>⏱️ Due/SLA: {item.dueSla}</Text>
            ) : null}
          </View>

          <View style={styles.cardFooter}>
            <Text style={styles.taskDate}>
              📅 Created: {new Date(item.createdAt).toLocaleDateString()}
            </Text>
            {item.completedAt && (
              <Text style={styles.completedDate}>
                ✓ Done: {new Date(item.completedAt).toLocaleDateString()}
              </Text>
            )}
          </View>
        </FICCard>
      </TouchableOpacity>
    );
  };

  if (isLoading && !isRefreshing) {
    return <FICLoadingState message="Loading field tasks..." />;
  }

  if (error) {
    return (
      <FICErrorState
        title="Unable to load tasks"
        message={error}
        onRetry={() => fetchTasks()}
      />
    );
  }

  const isFiltered = searchQuery.trim().length > 0 || selectedStatus !== 'ALL' || selectedPriority !== 'ALL';

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={theme.colors.primaryDark} barStyle="light-content" />
      <FICHeader
        title="Tasks"
        leftActionIcon={<Text style={styles.headerIcon}>☰</Text>}
        onLeftAction={onOpenDrawer}
      />

      <View style={styles.container}>
        {/* Top Search Section */}
        <View style={styles.topSection}>
          <Text style={styles.subtitleText}>Assigned field operational tasks</Text>

          <FICTextInput
            placeholder="Search tasks by title or details..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            leftIcon={<Text style={styles.searchIcon}>🔍</Text>}
            rightIcon={
              searchQuery.length > 0 ? (
                <TouchableOpacity onPress={handleClearSearch} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  <Text style={styles.clearIcon}>✕</Text>
                </TouchableOpacity>
              ) : undefined
            }
            containerStyle={styles.searchInputWrapper}
          />
        </View>

        {/* Status Filter Chips */}
        <View style={styles.filterSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsContainer}
          >
            {statusChips.map(chip => {
              const isSelected = selectedStatus === chip.id;
              return (
                <TouchableOpacity
                  key={chip.id}
                  style={[styles.chip, isSelected && styles.activeChip]}
                  onPress={() => setSelectedStatus(chip.id)}
                  accessibilityRole="button"
                >
                  <Text style={[styles.chipText, isSelected && styles.activeChipText]}>
                    {chip.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Priority Filter Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.priorityChipsContainer}
          >
            {priorityChips.map(chip => {
              const isSelected = selectedPriority === chip.id;
              return (
                <TouchableOpacity
                  key={chip.id}
                  style={[styles.priorityChip, isSelected && styles.activePriorityChip]}
                  onPress={() => setSelectedPriority(chip.id)}
                  accessibilityRole="button"
                >
                  <Text style={[styles.priorityChipText, isSelected && styles.activePriorityChipText]}>
                    {chip.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Task Count Bar */}
        <View style={styles.countBar}>
          <Text style={styles.countText}>
            Showing {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
          </Text>
        </View>

        {/* Task List */}
        <FlatList
          data={filteredTasks}
          keyExtractor={item => item.id}
          renderItem={renderTaskCard}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          ListEmptyComponent={
            <FICEmptyState
              title={isFiltered ? 'No matching tasks' : 'No tasks assigned'}
              description={
                isFiltered
                  ? 'Try modifying your search or priority/status filters.'
                  : 'You have no pending tasks assigned at this moment.'
              }
              actionTitle={isFiltered ? 'Clear Filters' : undefined}
              onAction={isFiltered ? handleClearFilters : undefined}
            />
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerIcon: {
    fontSize: 22,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  container: {
    flex: 1,
  },
  topSection: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.divider,
  },
  subtitleText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  searchInputWrapper: {
    marginBottom: theme.spacing.xs,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: theme.spacing.xs,
  },
  clearIcon: {
    fontSize: 14,
    color: theme.colors.textMuted,
    paddingHorizontal: theme.spacing.xs,
  },
  filterSection: {
    backgroundColor: theme.colors.surface,
    paddingBottom: theme.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  chipsContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    gap: theme.spacing.xs,
  },
  priorityChipsContainer: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.xs,
    gap: theme.spacing.xs,
  },
  chip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 6,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  activeChip: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipText: {
    ...theme.typography.caption,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  activeChipText: {
    color: '#FFFFFF',
  },
  priorityChip: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: theme.colors.divider,
  },
  activePriorityChip: {
    backgroundColor: theme.colors.primaryDark,
    borderColor: theme.colors.primaryDark,
  },
  priorityChipText: {
    ...theme.typography.caption,
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.textSecondary,
  },
  activePriorityChipText: {
    color: '#FFFFFF',
  },
  countBar: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.background,
  },
  countText: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    fontWeight: '500',
  },
  listContent: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xl * 2,
    flexGrow: 1,
  },
  card: {
    marginBottom: theme.spacing.sm,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
  },
  highPriorityCardBorder: {
    borderColor: '#EF4444',
    borderWidth: 1.5,
  },
  criticalCardBorder: {
    borderColor: '#DC2626',
    borderWidth: 2,
  },
  metadataGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 8,
  },
  metaTerritoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1D4ED8',
  },
  metaSlaText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#D97706',
  },
  highPriorityBanner: {
    backgroundColor: '#FEE2E2',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: theme.radius.sm,
    marginBottom: theme.spacing.xs,
    alignSelf: 'flex-start',
  },
  highPriorityBannerText: {
    color: '#B91C1C',
    fontSize: 11,
    fontWeight: '700',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  statusBadge: {
    marginLeft: theme.spacing.xs,
  },
  chevron: {
    fontSize: 22,
    color: theme.colors.textMuted,
    fontWeight: '600',
    lineHeight: 24,
  },
  taskTitle: {
    ...theme.typography.title,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  taskDescription: {
    ...theme.typography.bodyMedium,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.spacing.xs,
    borderTopWidth: 1,
    borderTopColor: theme.colors.divider,
  },
  taskDate: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
  },
  completedDate: {
    ...theme.typography.caption,
    color: '#059669',
    fontWeight: '600',
  },
});
