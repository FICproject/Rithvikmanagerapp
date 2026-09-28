import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Alert,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../theme';
import { useAuth } from '../../hooks/useAuth';
import { services } from '../../services';
import { Priority, Task, TaskStatus } from '../../types';
import { FICHeader } from '../../components/ui/FICHeader';
import { FICCard } from '../../components/ui/FICCard';
import { FICButton } from '../../components/ui/FICButton';
import { FICTextInput } from '../../components/ui/FICTextInput';
import { FICPriorityBadge } from '../../components/ui/FICPriorityBadge';
import { FICStatusBadge } from '../../components/ui/FICStatusBadge';
import { FICLoadingState } from '../../components/feedback/FICLoadingState';
import { FICErrorState } from '../../components/feedback/FICErrorState';

export interface TaskDetailScreenProps {
  taskId?: string;
  onBack: () => void;
  onOpenDrawer?: () => void;
  onNavigateRoute?: (routeName: string, params?: Record<string, any>) => void;
}

export const TaskDetailScreen: React.FC<TaskDetailScreenProps> = ({
  taskId,
  onBack,
  onOpenDrawer,
  onNavigateRoute,
}) => {
  const { manager } = useAuth();
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // High Priority Resolution
  const [resolutionNotes, setResolutionNotes] = useState<string>('');

  // Rejection modal
  const [isRejectModalVisible, setIsRejectModalVisible] = useState<boolean>(false);
  const [rejectionReason, setRejectionReason] = useState<string>('');

  const fetchTask = useCallback(async () => {
    if (!taskId) {
      // Default to t-302 if opened without explicit id
      const defaultId = 't-302';
      const data = await services.taskRepository.getTaskById(defaultId);
      setTask(data);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await services.taskRepository.getTaskById(taskId);
      if (!data) {
        setError('Task details could not be found');
      } else {
        setTask(data);
      }
    } catch {
      setError('Unable to load task');
    } finally {
      setIsLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    fetchTask();
  }, [fetchTask]);

  const handleAccept = async () => {
    if (!task) return;
    setIsUpdating(true);
    try {
      const updated = await services.taskRepository.acceptTask(task.id);
      setTask(updated);
      Alert.alert('Task Accepted', 'Task moved to In Progress state.');
    } catch (err: any) {
      Alert.alert('Action Blocked', err.message || 'Unable to accept task.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleBlock = async () => {
    if (!task) return;
    setIsUpdating(true);
    try {
      const updated = await services.taskRepository.blockTask(task.id, 'Task temporarily blocked by manager.');
      setTask(updated);
      Alert.alert('Task Blocked', 'Task has been marked as Blocked.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Unable to block task.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResume = async () => {
    if (!task) return;
    setIsUpdating(true);
    try {
      const updated = await services.taskRepository.resumeTask(task.id);
      setTask(updated);
      Alert.alert('Task Resumed', 'Task has been moved back to In Progress.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Unable to resume task.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReject = async () => {
    if (!task) return;
    if (!rejectionReason.trim()) {
      Alert.alert('Reason Required', 'Please enter a reason for rejecting this task.');
      return;
    }
    setIsUpdating(true);
    try {
      const updated = await services.taskRepository.rejectTask(task.id, rejectionReason.trim());
      setTask(updated);
      setIsRejectModalVisible(false);
      Alert.alert('Task Rejected', 'Task marked as rejected.');
    } catch (err: any) {
      Alert.alert('Action Blocked', err.message || 'Unable to reject task.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleComplete = async () => {
    if (!task) return;
    setIsUpdating(true);
    try {
      const updated = await services.taskRepository.completeTask(task.id);
      setTask(updated);
      await services.activityRepository.logActivity({
        managerId: manager?.id || 'mgr-001',
        activityType: 'TASK_COMPLETED',
        entityId: task.id,
        entityName: task.title,
        stateId: manager?.stateId || 'st-mp-01',
        districtId: manager?.districtId || 'dt-indore-01',
        divisionId: manager?.divisionId || 'div-north-01',
        pincodeId: manager?.pincodeId || '452001',
      });
      Alert.alert('Task Completed', 'Task has been completed and logged to activity feed.');
    } catch {
      Alert.alert('Error', 'Unable to complete task.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResolveHighPriority = async () => {
    if (!task) return;
    if (resolutionNotes.trim().length < 5) {
      Alert.alert(
        'Resolution Notes Required',
        'High-priority tasks require mandatory resolution documentation before closing.'
      );
      return;
    }

    setIsUpdating(true);
    try {
      const updated = await services.taskRepository.resolveHighPriorityTask(
        task.id,
        resolutionNotes.trim()
      );
      setTask(updated);
      await services.activityRepository.logActivity({
        managerId: manager?.id || 'mgr-001',
        activityType: 'HIGH_TASK_RESOLVED',
        entityId: task.id,
        entityName: task.title,
        stateId: manager?.stateId || 'st-mp-01',
        districtId: manager?.districtId || 'dt-indore-01',
        divisionId: manager?.divisionId || 'div-north-01',
        pincodeId: manager?.pincodeId || '452001',
      });
      Alert.alert(
        'Task Resolved',
        'Mandatory resolution logged. Supervisor has been notified.',
        [
          {
            text: 'OK',
            onPress: () => {
              if (onNavigateRoute) onNavigateRoute('Tasks');
              else onBack();
            },
          },
        ]
      );
    } catch {
      Alert.alert('Error', 'Unable to resolve task.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return <FICLoadingState message="Loading task details..." />;
  }

  if (error || !task) {
    return (
      <FICErrorState
        title="Task Not Found"
        message={error || 'Unable to find task.'}
        onRetry={fetchTask}
      />
    );
  }

  const isCritical = task.priority === Priority.CRITICAL;
  const isHighPriority = task.priority === Priority.HIGH || isCritical;
  const isCompleted = task.status === TaskStatus.COMPLETED || task.status === TaskStatus.RESOLVED;
  const isPending = task.status === TaskStatus.PENDING || task.status === TaskStatus.ASSIGNED;
  const isInProgress = task.status === TaskStatus.IN_PROGRESS || task.status === TaskStatus.ACCEPTED;
  const isBlocked = task.status === TaskStatus.BLOCKED;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={theme.colors.primaryDark} barStyle="light-content" />
      <FICHeader
        title="Task Details"
        leftActionIcon={<Text style={styles.headerIcon}>←</Text>}
        onLeftAction={onBack}
        rightActionIcon={onOpenDrawer ? <Text style={styles.headerIcon}>☰</Text> : undefined}
        onRightAction={onOpenDrawer}
      />

      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Completed State Banner */}
        {isCompleted ? (
          <FICCard style={[styles.card, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#065F46', marginBottom: 2 }}>
              ✓ Task Completed & Verified
            </Text>
            <Text style={{ fontSize: 12, color: '#047857' }}>
              {task.completedAt ? `Completed on ${new Date(task.completedAt).toLocaleString()}` : 'Task marked complete.'}
            </Text>
          </FICCard>
        ) : null}

        {/* Priority Banner for High / Critical Priority */}
        {isHighPriority && !isCompleted ? (
          <FICCard style={[styles.card, isCritical ? styles.criticalNotice : styles.highPriorityNotice]}>
            <Text style={[styles.highPriorityTitle, isCritical && { color: '#991B1B' }]}>
              {isCritical ? '🚨 CRITICAL DIRECTIVE' : '⚡ MANDATORY RESOLUTION'}
            </Text>
            <Text style={styles.highPriorityDesc}>
              This is a high-priority operational directive. Please ensure resolution within the assigned SLA window.
            </Text>
          </FICCard>
        ) : null}

        {/* Title & Status */}
        <FICCard style={styles.card}>
          <Text style={styles.taskTitle}>{task.title}</Text>
          <View style={styles.badgeRow}>
            <FICPriorityBadge priority={task.priority} />
            <FICStatusBadge status={task.status} showIcon={true} />
          </View>
        </FICCard>

        {/* Task Metadata & Scope */}
        <FICCard style={styles.card}>
          <Text style={styles.sectionTitle}>Task Metadata</Text>
          <View style={styles.metaList}>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Created Date:</Text>
              <Text style={styles.metaValue}>{new Date(task.createdAt).toLocaleDateString()}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Assigned By:</Text>
              <Text style={styles.metaValue}>{task.assignedBy || 'Central Operations'}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Territory:</Text>
              <Text style={styles.metaValueBold}>{task.territory || 'Assigned Zone'}</Text>
            </View>
            {task.dueSla ? (
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Due / SLA:</Text>
                <Text style={[styles.metaValue, { color: '#D97706', fontWeight: '700' }]}>{task.dueSla}</Text>
              </View>
            ) : null}
            {task.notes ? (
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Notes:</Text>
                <Text style={styles.metaValue}>{task.notes}</Text>
              </View>
            ) : null}
          </View>
        </FICCard>

        {/* Task Description */}
        <FICCard style={styles.card}>
          <Text style={styles.sectionTitle}>Task Instructions</Text>
          <Text style={styles.descriptionText}>{task.description}</Text>
        </FICCard>

        {/* High Priority Resolution Input */}
        {isHighPriority && !isCompleted ? (
          <FICCard style={styles.card}>
            <Text style={styles.sectionTitle}>Resolution Summary *</Text>
            <Text style={styles.sectionSubtitle}>
              Document steps taken to resolve this critical task:
            </Text>
            <FICTextInput
              placeholder="e.g., Reconciled outstanding vendor invoice and initiated disbursement..."
              multiline={true}
              numberOfLines={4}
              value={resolutionNotes}
              onChangeText={setResolutionNotes}
            />
            <FICButton
              title="Resolve & Complete Task"
              variant="primary"
              loading={isUpdating}
              onPress={handleResolveHighPriority}
              style={styles.resolveBtn}
            />
          </FICCard>
        ) : null}

        {/* Action Workflow Buttons */}
        {!isCompleted && (
          <View style={styles.actionsContainer}>
            {isPending ? (
              <View style={styles.actionsRow}>
                <FICButton
                  title="Reject"
                  variant="outline"
                  loading={isUpdating}
                  onPress={() => setIsRejectModalVisible(true)}
                  style={styles.actionBtnHalf}
                />
                <FICButton
                  title="Accept Task"
                  variant="primary"
                  loading={isUpdating}
                  onPress={handleAccept}
                  style={styles.actionBtnHalf}
                />
              </View>
            ) : isInProgress ? (
              <View style={styles.actionsRow}>
                <FICButton
                  title="Mark Blocked"
                  variant="outline"
                  loading={isUpdating}
                  onPress={handleBlock}
                  style={styles.actionBtnHalf}
                />
                <FICButton
                  title="Complete Task"
                  variant="primary"
                  loading={isUpdating}
                  onPress={handleComplete}
                  style={styles.actionBtnHalf}
                />
              </View>
            ) : isBlocked ? (
              <FICButton
                title="Resume Task"
                variant="primary"
                loading={isUpdating}
                onPress={handleResume}
                style={styles.completeBtn}
              />
            ) : null}
          </View>
        )}
      </ScrollView>

      {/* Reject Modal */}
      <Modal
        visible={isRejectModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsRejectModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Reject Task</Text>
            <Text style={styles.modalSub}>
              Please specify reason for declining this assigned task:
            </Text>
            <FICTextInput
              placeholder="e.g., Outside assigned geographic zone..."
              value={rejectionReason}
              onChangeText={setRejectionReason}
            />
            <View style={styles.modalBtnRow}>
              <FICButton
                title="Cancel"
                variant="outline"
                onPress={() => setIsRejectModalVisible(false)}
                style={{ flex: 1 }}
              />
              <FICButton
                title="Confirm"
                variant="primary"
                loading={isUpdating}
                onPress={handleReject}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
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
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.md,
  },
  card: {
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
  },
  taskTitle: {
    ...theme.typography.headingLarge,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.xs,
  },
  highPriorityNotice: {
    backgroundColor: '#FEF2F2',
    borderColor: theme.colors.error,
    borderLeftWidth: 4,
  },
  criticalNotice: {
    backgroundColor: '#FEF2F2',
    borderColor: '#DC2626',
    borderLeftWidth: 5,
  },
  metaList: {
    gap: 8,
    marginTop: 4,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  metaLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  metaValue: {
    fontSize: 13,
    color: '#1E293B',
  },
  metaValueBold: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  highPriorityTitle: {
    ...theme.typography.title,
    color: theme.colors.error,
    fontWeight: '700',
    marginBottom: 4,
  },
  highPriorityDesc: {
    ...theme.typography.caption,
    color: theme.colors.text,
    lineHeight: 18,
  },
  sectionTitle: {
    ...theme.typography.title,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    fontWeight: '700',
  },
  sectionSubtitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  descriptionText: {
    ...theme.typography.body,
    color: theme.colors.text,
    lineHeight: 22,
  },
  resolveBtn: {
    marginTop: theme.spacing.md,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  actionBtnHalf: {
    flex: 1,
  },
  actionsContainer: {
    marginBottom: theme.spacing.xl,
  },
  completeBtn: {
    width: '100%',
  },
  modalSub: {
    ...theme.typography.bodySmall,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
    width: '100%',
    maxHeight: '85%',
    ...theme.elevation.modal,
  },
  modalTitle: {
    ...theme.typography.title,
    color: theme.colors.text,
    fontWeight: '700',
    marginBottom: theme.spacing.xs,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
});
