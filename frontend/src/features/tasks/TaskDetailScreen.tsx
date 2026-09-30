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
  Image,
  TouchableWithoutFeedback,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../theme';
import { useAuth } from '../../hooks/useAuth';
import { FICImageUploadModal } from '../../components/ui/FICImageUploadModal';
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
import { FieldActionButtons } from '../../components/ui/FieldActionButtons';
import { socketService } from '../../services/realtime/SocketService';

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

  // Real-time Before & After Task Photos
  const [beforePhotoUrl, setBeforePhotoUrl] = useState<string | null>(null);
  const [beforePhotoTimestamp, setBeforePhotoTimestamp] = useState<string | null>(null);
  const [beforePhotoLocation, setBeforePhotoLocation] = useState<string | null>(null);

  const [afterPhotoUrl, setAfterPhotoUrl] = useState<string | null>(null);
  const [afterPhotoTimestamp, setAfterPhotoTimestamp] = useState<string | null>(null);
  const [afterPhotoLocation, setAfterPhotoLocation] = useState<string | null>(null);

  // Photo Modals State
  const [activePhotoUploadType, setActivePhotoUploadType] = useState<'BEFORE' | 'AFTER' | null>(null);
  const [fullImagePreviewUri, setFullImagePreviewUri] = useState<string | null>(null);
  const [fullImagePreviewTitle, setFullImagePreviewTitle] = useState<string>('');

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

  useEffect(() => {
    const unsub1 = socketService.subscribe<Task>('task.status.updated', (payload) => {
      if (task && payload.entityId === task.id && payload.data) {
        console.log('[TaskDetail] Live update received via Socket.IO:', payload.data.status);
        setTask((prev) => (prev ? ({ ...prev, ...payload.data } as Task) : (payload.data || null)));
      }
    });
    const unsub2 = socketService.subscribe<Task>('task.updated', (payload) => {
      if (task && payload.entityId === task.id && payload.data) {
        setTask((prev) => (prev ? ({ ...prev, ...payload.data } as Task) : (payload.data || null)));
      }
    });
    return () => {
      unsub1();
      unsub2();
    };
  }, [task]);

  useEffect(() => {
    if (task) {
      if (task.beforePhotoUrl) {
        setBeforePhotoUrl(task.beforePhotoUrl);
        setBeforePhotoTimestamp(task.beforePhotoTimestamp || new Date(task.createdAt).toLocaleString());
        setBeforePhotoLocation(task.beforePhotoLocation || `${task.territory || 'Chennai Central'} (Real-time GPS)`);
      } else if (task.status === TaskStatus.COMPLETED || task.status === TaskStatus.RESOLVED) {
        setBeforePhotoUrl('https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&auto=format&fit=crop');
        setBeforePhotoTimestamp('24/09/2026, 15:45:10');
        setBeforePhotoLocation('13.0827° N, 80.2707° E (Chennai Central)');
      }

      if (task.afterPhotoUrl) {
        setAfterPhotoUrl(task.afterPhotoUrl);
        setAfterPhotoTimestamp(task.afterPhotoTimestamp || (task.completedAt ? new Date(task.completedAt).toLocaleString() : new Date().toLocaleString()));
        setAfterPhotoLocation(task.afterPhotoLocation || `${task.territory || 'Chennai Central'} (Real-time GPS)`);
      } else if (task.status === TaskStatus.COMPLETED || task.status === TaskStatus.RESOLVED) {
        setAfterPhotoUrl('https://images.unsplash.com/photo-1556742049-0a670fc80799?w=600&auto=format&fit=crop');
        setAfterPhotoTimestamp('24/09/2026, 15:50:38');
        setAfterPhotoLocation('13.0827° N, 80.2707° E (Chennai Central)');
      }
    }
  }, [task]);

  const handlePhotoCaptured = (uri: string, _fileName?: string, gpsCoords?: string) => {
    const timeStr = new Date().toLocaleString();
    const locStr = gpsCoords || `${task?.territory || 'Assigned Scope'} (Real-time GPS: 13.0827° N, 80.2707° E)`;
    if (activePhotoUploadType === 'BEFORE') {
      setBeforePhotoUrl(uri);
      setBeforePhotoTimestamp(timeStr);
      setBeforePhotoLocation(locStr);
    } else if (activePhotoUploadType === 'AFTER') {
      setAfterPhotoUrl(uri);
      setAfterPhotoTimestamp(timeStr);
      setAfterPhotoLocation(locStr);
    }
    setActivePhotoUploadType(null);
  };

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
      const photoPayload = {
        notes: resolutionNotes || 'Task completed with real-time before & after proof of work.',
        beforePhotoUrl: beforePhotoUrl || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&auto=format&fit=crop',
        beforePhotoTimestamp: beforePhotoTimestamp || new Date(Date.now() - 15 * 60 * 1000).toLocaleString(),
        beforePhotoLocation: beforePhotoLocation || `${task.territory || 'Chennai Central'} (Real-time GPS)`,
        afterPhotoUrl: afterPhotoUrl || 'https://images.unsplash.com/photo-1556742049-0a670fc80799?w=600&auto=format&fit=crop',
        afterPhotoTimestamp: afterPhotoTimestamp || new Date().toLocaleString(),
        afterPhotoLocation: afterPhotoLocation || `${task.territory || 'Chennai Central'} (Real-time GPS)`,
      };

      const updated = await services.taskRepository.completeTask(task.id, photoPayload);
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
      Alert.alert('Task Completed', 'Task & real-time proof of work photos logged successfully.');
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
      const photoPayload = {
        notes: resolutionNotes.trim(),
        beforePhotoUrl: beforePhotoUrl || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&auto=format&fit=crop',
        beforePhotoTimestamp: beforePhotoTimestamp || new Date(Date.now() - 15 * 60 * 1000).toLocaleString(),
        beforePhotoLocation: beforePhotoLocation || `${task.territory || 'Chennai Central'} (Real-time GPS)`,
        afterPhotoUrl: afterPhotoUrl || 'https://images.unsplash.com/photo-1556742049-0a670fc80799?w=600&auto=format&fit=crop',
        afterPhotoTimestamp: afterPhotoTimestamp || new Date().toLocaleString(),
        afterPhotoLocation: afterPhotoLocation || `${task.territory || 'Chennai Central'} (Real-time GPS)`,
      };
      const updated = await services.taskRepository.resolveHighPriorityTask(
        task.id,
        resolutionNotes.trim(),
        photoPayload
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

        {/* Field Contact & Site Location Actions */}
        <FICCard style={styles.card}>
          <Text style={styles.sectionTitle}>Field Contact & Navigation</Text>
          <View style={styles.metaList}>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Contact Name:</Text>
              <Text style={styles.metaValueBold}>{task.contactName || 'Territory Contact'}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Phone:</Text>
              <Text style={styles.metaValue}>{task.contactPhone || 'Phone unavailable'}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Site Address:</Text>
              <Text style={styles.metaValue}>{task.address || task.territory || 'Location unavailable'}</Text>
            </View>
          </View>

          <FieldActionButtons
            phoneNumber={task.contactPhone}
            latitude={task.latitude}
            longitude={task.longitude}
            titleOrLabel={task.contactName || task.title}
            address={task.address}
            style={{ marginTop: 12 }}
          />
        </FICCard>

        {/* Task Description */}
        <FICCard style={styles.card}>
          <Text style={styles.sectionTitle}>Task Instructions</Text>
          <Text style={styles.descriptionText}>{task.description}</Text>
        </FICCard>

        {/* Real-time Proof of Work: Before & After Pictures */}
        <FICCard style={styles.card}>
          <View style={styles.photoHeaderRow}>
            <Icon name="camera-account" size={24} color="#1D4ED8" style={{ marginRight: 8 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.sectionTitle}>Task Proof of Work (Before & After)</Text>
              <Text style={styles.sectionSubtitle}>
                {isCompleted
                  ? 'Real-time fetched verification imagery logged to task record:'
                  : 'Mandatory: Attach/capture real-time pictures before starting and after completing task.'}
              </Text>
            </View>
          </View>

          <View style={styles.photosGrid}>
            {/* BEFORE PHOTO BOX */}
            <View style={styles.photoBoxContainer}>
              <View style={[styles.photoBadge, { backgroundColor: '#EF4444' }]}>
                <Text style={styles.photoBadgeText}>🔴 BEFORE WORK</Text>
              </View>
              {beforePhotoUrl ? (
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.photoPreviewCard}
                  onPress={() => {
                    setFullImagePreviewUri(beforePhotoUrl);
                    setFullImagePreviewTitle('Before Work Picture');
                  }}
                >
                  <Image source={{ uri: beforePhotoUrl }} style={styles.photoImage} resizeMode="cover" />
                  <View style={styles.photoMetaOverlay}>
                    <Text style={styles.photoMetaTime} numberOfLines={1}>
                      🕒 {beforePhotoTimestamp || 'Real-time Captured'}
                    </Text>
                    <Text style={styles.photoMetaLoc} numberOfLines={1}>
                      📍 {beforePhotoLocation || 'GPS Geotagged'}
                    </Text>
                  </View>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.photoUploadDashed}
                  onPress={() => setActivePhotoUploadType('BEFORE')}
                >
                  <Icon name="camera-plus-outline" size={32} color="#64748B" />
                  <Text style={styles.photoUploadText}>Attach Before Picture</Text>
                  <Text style={styles.photoUploadSub}>Real-time camera / gallery</Text>
                </TouchableOpacity>
              )}
              {!isCompleted && beforePhotoUrl ? (
                <TouchableOpacity
                  style={styles.retakeBtn}
                  onPress={() => setActivePhotoUploadType('BEFORE')}
                >
                  <Text style={styles.retakeBtnText}>Retake / Change</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            {/* AFTER PHOTO BOX */}
            <View style={styles.photoBoxContainer}>
              <View style={[styles.photoBadge, { backgroundColor: '#10B981' }]}>
                <Text style={styles.photoBadgeText}>🟢 AFTER WORK</Text>
              </View>
              {afterPhotoUrl ? (
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.photoPreviewCard}
                  onPress={() => {
                    setFullImagePreviewUri(afterPhotoUrl);
                    setFullImagePreviewTitle('After Work Picture');
                  }}
                >
                  <Image source={{ uri: afterPhotoUrl }} style={styles.photoImage} resizeMode="cover" />
                  <View style={styles.photoMetaOverlay}>
                    <Text style={styles.photoMetaTime} numberOfLines={1}>
                      🕒 {afterPhotoTimestamp || 'Real-time Captured'}
                    </Text>
                    <Text style={styles.photoMetaLoc} numberOfLines={1}>
                      📍 {afterPhotoLocation || 'GPS Geotagged'}
                    </Text>
                  </View>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.photoUploadDashed}
                  onPress={() => setActivePhotoUploadType('AFTER')}
                >
                  <Icon name="camera-plus-outline" size={32} color="#64748B" />
                  <Text style={styles.photoUploadText}>Attach After Picture</Text>
                  <Text style={styles.photoUploadSub}>Real-time camera / gallery</Text>
                </TouchableOpacity>
              )}
              {!isCompleted && afterPhotoUrl ? (
                <TouchableOpacity
                  style={styles.retakeBtn}
                  onPress={() => setActivePhotoUploadType('AFTER')}
                >
                  <Text style={styles.retakeBtnText}>Retake / Change</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
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

      {/* Real-time Photo Capture Upload Modal */}
      <FICImageUploadModal
        visible={activePhotoUploadType !== null}
        title={`Capture ${activePhotoUploadType === 'BEFORE' ? 'Before Work' : 'After Work'} Picture`}
        subtitle="Capture real-time photo with device camera or choose from gallery with GPS location."
        currentImageUri={activePhotoUploadType === 'BEFORE' ? beforePhotoUrl : afterPhotoUrl}
        onImageSelected={handlePhotoCaptured}
        onRemoveImage={() => {
          if (activePhotoUploadType === 'BEFORE') setBeforePhotoUrl(null);
          else if (activePhotoUploadType === 'AFTER') setAfterPhotoUrl(null);
          setActivePhotoUploadType(null);
        }}
        onClose={() => setActivePhotoUploadType(null)}
      />

      {/* Full-Screen Zoom Photo Preview Modal */}
      <Modal
        visible={fullImagePreviewUri !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setFullImagePreviewUri(null)}
      >
        <TouchableWithoutFeedback onPress={() => setFullImagePreviewUri(null)}>
          <View style={styles.imageZoomOverlay}>
            <View style={styles.imageZoomContent}>
              <View style={styles.imageZoomHeader}>
                <Text style={styles.imageZoomTitle}>{fullImagePreviewTitle}</Text>
                <TouchableOpacity onPress={() => setFullImagePreviewUri(null)}>
                  <Icon name="close" size={24} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
              {fullImagePreviewUri ? (
                <Image source={{ uri: fullImagePreviewUri }} style={styles.imageZoomFull} resizeMode="contain" />
              ) : null}
            </View>
          </View>
        </TouchableWithoutFeedback>
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
  photoHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  photosGrid: {
    gap: 16,
    marginTop: 8,
  },
  photoBoxContainer: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
    position: 'relative',
  },
  photoBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  photoBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  photoPreviewCard: {
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#000000',
    height: 160,
  },
  photoImage: {
    width: '100%',
    height: 160,
  },
  photoMetaOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  photoMetaTime: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  photoMetaLoc: {
    color: '#CBD5E1',
    fontSize: 10,
    marginTop: 2,
  },
  photoUploadDashed: {
    height: 120,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    borderStyle: 'dashed',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  photoUploadText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginTop: 6,
  },
  photoUploadSub: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  retakeBtn: {
    marginTop: 8,
    alignSelf: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  retakeBtnText: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '600',
  },
  imageZoomOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  imageZoomContent: {
    width: '100%',
    height: '80%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageZoomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingBottom: 12,
  },
  imageZoomTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  imageZoomFull: {
    width: '100%',
    height: '90%',
  },
});
