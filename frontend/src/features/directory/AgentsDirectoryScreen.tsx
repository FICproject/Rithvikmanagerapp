import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  StatusBar,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../hooks/useAuth';
import { services } from '../../services';
import { FieldAgent } from '../../types';
import { AgentStatusFilter } from '../../services/repositories/IAgentRepository';
import { FICHeader } from '../../components/ui/FICHeader';
import { FICTextInput } from '../../components/ui/FICTextInput';
import { FICLoadingState } from '../../components/feedback/FICLoadingState';
import { FICErrorState } from '../../components/feedback/FICErrorState';
import { FICEmptyState } from '../../components/feedback/FICEmptyState';

export interface AgentsDirectoryScreenProps {
  onBack?: () => void;
  onOpenDrawer?: () => void;
  onNavigateRoute?: (routeName: string, params?: Record<string, any>) => void;
}

export const AgentsDirectoryScreen: React.FC<AgentsDirectoryScreenProps> = ({
  onBack,
  onOpenDrawer,
  onNavigateRoute,
}) => {
  const { manager } = useAuth();
  const [agents, setAgents] = useState<FieldAgent[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<AgentStatusFilter>('ALL');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAgents = useCallback(
    async (isRefresh = false) => {
      if (!isRefresh) setIsLoading(true);
      setError(null);
      try {
        const managerId = manager?.id || 'mgr-000';
        const list = await services.agentRepository.getAgentsInScope(
          managerId,
          searchQuery.trim(),
          selectedStatus
        );
        setAgents(list);
      } catch {
        setError('Unable to load field agents for your territory');
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [manager, searchQuery, selectedStatus]
  );

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchAgents(true);
  };

  const handleCallAgent = (agent: FieldAgent) => {
    Linking.openURL(`tel:${agent.phone}`).catch(() => {
      Alert.alert('Phone Call', `Dial: ${agent.phone}`);
    });
  };

  const statusChips: { id: AgentStatusFilter; label: string }[] = [
    { id: 'ALL', label: 'All Agents' },
    { id: 'ACTIVE', label: '🟢 Active' },
    { id: 'ON_LEAVE', label: '🟡 On Leave' },
    { id: 'INACTIVE', label: '⚪ Inactive' },
  ];

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <View style={[styles.statusBadge, { backgroundColor: '#DCFCE7' }]}>
            <Text style={[styles.statusBadgeText, { color: '#166534' }]}>Active</Text>
          </View>
        );
      case 'ON_LEAVE':
        return (
          <View style={[styles.statusBadge, { backgroundColor: '#FEF3C7' }]}>
            <Text style={[styles.statusBadgeText, { color: '#92400E' }]}>On Leave</Text>
          </View>
        );
      default:
        return (
          <View style={[styles.statusBadge, { backgroundColor: '#F1F5F9' }]}>
            <Text style={[styles.statusBadgeText, { color: '#475569' }]}>Inactive</Text>
          </View>
        );
    }
  };

  const renderAgentCard = ({ item }: { item: FieldAgent }) => (
    <View style={styles.agentCard}>
      <View style={styles.cardHeader}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarInitials}>
            {item.name
              .split(' ')
              .map(n => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2)}
          </Text>
        </View>

        <View style={styles.agentMainInfo}>
          <Text style={styles.agentName}>{item.name}</Text>
          <Text style={styles.agentRole}>Field Ground Agent</Text>
        </View>

        {renderStatusBadge(item.status)}
      </View>

      <View style={styles.cardDetailsGrid}>
        <View style={styles.detailRow}>
          <Icon name="map-marker-outline" size={16} color="#64748B" style={styles.detailIcon} />
          <Text style={styles.detailLabel}>Assigned Pincode:</Text>
          <Text style={styles.detailValueBold}>{item.assignedPincode}</Text>
        </View>

        <View style={styles.detailRow}>
          <Icon name="account-tie-outline" size={16} color="#64748B" style={styles.detailIcon} />
          <Text style={styles.detailLabel}>Supervisor:</Text>
          <Text style={styles.detailValue} numberOfLines={1}>
            {item.assignedManager}
          </Text>
        </View>
      </View>

      <View style={styles.cardActionsRow}>
        <TouchableOpacity
          style={styles.callButton}
          activeOpacity={0.8}
          onPress={() => handleCallAgent(item)}
        >
          <Icon name="phone" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
          <Text style={styles.callButtonText}>Call {item.phone}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      <FICHeader
        title="Field Agents Directory"
        subtitle={`Territory: ${manager?.territoryName || 'Scoped'}`}
        leftActionIcon={<Text style={styles.headerIcon}>{onBack ? '←' : '☰'}</Text>}
        onLeftAction={onBack || onOpenDrawer}
      />

      <View style={styles.searchContainer}>
        <FICTextInput
          placeholder="Search by agent name, phone, or pincode..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
      </View>

      {/* Filter Chips */}
      <View style={styles.filterChipsRow}>
        {statusChips.map(chip => (
          <TouchableOpacity
            key={chip.id}
            style={[styles.chipButton, selectedStatus === chip.id && styles.activeChipButton]}
            activeOpacity={0.7}
            onPress={() => setSelectedStatus(chip.id)}
          >
            <Text
              style={[
                styles.chipButtonText,
                selectedStatus === chip.id && styles.activeChipButtonText,
              ]}
            >
              {chip.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading && !isRefreshing ? (
        <FICLoadingState message="Loading territory field agents..." />
      ) : error ? (
        <FICErrorState title="Directory Error" message={error} onRetry={() => fetchAgents()} />
      ) : agents.length === 0 ? (
        <FICEmptyState
          title="No Field Agents Found"
          message="No field agents matched your current territory filter or search criteria."
          onActionPress={() => {
            setSearchQuery('');
            setSelectedStatus('ALL');
          }}
          actionTitle="Reset Filters"
        />
      ) : (
        <FlatList
          data={agents}
          keyExtractor={item => item.id}
          renderItem={renderAgentCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={['#1D4ED8']}
              tintColor="#1D4ED8"
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
    backgroundColor: '#F8FAFC',
  },
  headerIcon: {
    fontSize: 22,
    color: '#0F172A',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: '#FFFFFF',
  },
  searchInput: {
    marginBottom: 8,
  },
  filterChipsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 8,
  },
  chipButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
  },
  activeChipButton: {
    backgroundColor: '#1D4ED8',
  },
  chipButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  activeChipButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
    gap: 12,
  },
  agentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarInitials: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  agentMainInfo: {
    flex: 1,
  },
  agentName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  agentRole: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardDetailsGrid: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailIcon: {
    marginRight: 6,
  },
  detailLabel: {
    fontSize: 12,
    color: '#64748B',
    marginRight: 6,
  },
  detailValue: {
    fontSize: 12,
    color: '#1E293B',
    flex: 1,
  },
  detailValueBold: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  cardActionsRow: {
    flexDirection: 'row',
  },
  callButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1D4ED8',
    paddingVertical: 10,
    borderRadius: 10,
  },
  callButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
