import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../hooks/useAuth';
import { FICHeader } from '../../components/ui/FICHeader';
import { FICAvatar } from '../../components/ui/FICAvatar';
import { FICDropdownModal } from '../../components/ui/FICDropdownModal';
import { FICImageUploadModal } from '../../components/ui/FICImageUploadModal';
import { FICAudioPlayerRecorder } from '../../components/ui/FICAudioPlayerRecorder';
import { FieldActionButtons } from '../../components/ui/FieldActionButtons';
import { theme } from '../../theme';
import { ASSETS } from '../../assets/logo';
import { services } from '../../services';
import { cameraLocationService } from '../../services/camera/CameraLocationService';
import { reportExportService } from '../../services/reports/ReportExportService';
import { ExportResult } from '../../services/reports/IReportExportService';
import { VisitRecord } from '../../types';

const assets: any = ASSETS;

export interface ReportsScreenProps {
  initialTab?: string;
  onOpenDrawer?: () => void;
  onNavigateRoute?: (routeName: string, params?: Record<string, any>) => void;
}



const INITIAL_VISIT_RECORDS: VisitRecord[] = [
  {
    id: 'visit_1700070001001_today_01',
    shopName: 'Sri Foods & Groceries',
    vendorCode: 'vendorSRIFOODS',
    category: 'Daily Needs',
    managerName: 'Ramesh Kumar',
    managerRole: 'State Manager',
    location: 'Parrys, Chennai',
    pincode: '600001',
    timestamp: 'Today, 10:15 AM',
    isInterested: true,
    photoUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400',
    gpsCoords: '13.0891° N, 80.2872° E',
  },
  {
    id: 'visit_1700070002002_today_02',
    shopName: 'Apex Mobile & Electronics',
    vendorCode: 'vendorAPEXMOB',
    category: 'Product',
    managerName: 'M. Selvi',
    managerRole: 'Pincode Manager',
    location: 'Parrys, Chennai',
    pincode: '600001',
    timestamp: 'Today, 11:30 AM',
    isInterested: false,
    reasonNotInterested: 'Owner currently committed to a separate 1-year POS contract with another payment aggregator.',
    voiceNoteUri: 'file:///data/user/0/com.ficmanagerapp/cache/audio_sample_declined.m4a',
    voiceNoteDuration: 18,
    photoUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
    gpsCoords: '13.0880° N, 80.2860° E',
  },
  {
    id: 'visit_1700069977654_op_jp9j',
    shopName: 'Sri Murugan Departmental Store',
    vendorCode: 'vendorMURUGAN',
    category: 'Product',
    managerName: 'K. Ananth',
    managerRole: 'Division Manager',
    location: 'North Chennai',
    pincode: '600001',
    timestamp: '28 Sep 2026, 08:30 AM',
    isInterested: true,
    photoUrl: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400',
    gpsCoords: '13.0827° N, 80.2707° E',
  },
  {
    id: 'visit_1700069988123_sk_821a',
    shopName: 'Saravana Bhavan Hotel',
    vendorCode: 'vendorSARAVANA',
    category: 'Food',
    managerName: 'Suresh Menon',
    managerRole: 'District Manager',
    location: 'Chennai',
    pincode: '600002',
    timestamp: '29 Sep 2026, 10:15 AM',
    isInterested: true,
    photoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400',
    gpsCoords: '13.0604° N, 80.2496° E',
  },
  {
    id: 'visit_1700069999456_mn_112z',
    shopName: 'Annapoorna Sweets & Bakery',
    vendorCode: 'vendorANNAPOORNA',
    category: 'Food',
    managerName: 'Ramesh Kumar',
    managerRole: 'State Manager',
    location: 'Coimbatore',
    pincode: '641001',
    timestamp: '30 Sep 2026, 02:45 PM',
    isInterested: true,
    photoUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400',
    gpsCoords: '11.0168° N, 76.9558° E',
  },
];

export const ReportsScreen: React.FC<ReportsScreenProps> = ({
  onOpenDrawer,
  onNavigateRoute,
}) => {
  const { manager } = useAuth();

  // Primary Visit Records List
  const [records, setRecords] = useState<VisitRecord[]>(INITIAL_VISIT_RECORDS);
  const [filteredRecords, setFilteredRecords] = useState<VisitRecord[]>(INITIAL_VISIT_RECORDS);

  const loadVisitRecords = useCallback(async () => {
    try {
      const list = await services.fieldVisitService.getVisitRecords();
      setRecords(list);
    } catch {
      // Keep existing
    }
  }, []);

  useEffect(() => {
    loadVisitRecords();
  }, [loadVisitRecords]);

  // Tab & Filters
  const [activeScopeTab, setActiveScopeTab] = useState<'ALL' | 'MY' | 'DIVISION' | 'PINCODE'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [selectedInterestFilter, setSelectedInterestFilter] = useState<string>('ALL');

  // UI Loaders
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Modals
  const [isFieldVisitModalOpen, setIsFieldVisitModalOpen] = useState<boolean>(false);
  const [isGenerateReportModalOpen, setIsGenerateReportModalOpen] = useState<boolean>(false);
  const [showCategoryFilterModal, setShowCategoryFilterModal] = useState<boolean>(false);
  const [showStatusFilterModal, setShowStatusFilterModal] = useState<boolean>(false);
  const [showFormCategoryModal, setShowFormCategoryModal] = useState<boolean>(false);
  const [showFormReasonModal, setShowFormReasonModal] = useState<boolean>(false);

  // Form State for + Field Shop Visit
  const [formShopName, setFormShopName] = useState<string>('');
  const [formCategory, setFormCategory] = useState<string>('Service');
  const [formPhotoCaptured, setFormPhotoCaptured] = useState<boolean>(false);
  const [formPhotoUri, setFormPhotoUri] = useState<string | null>(null);
  const [formPhotoName, setFormPhotoName] = useState<string | null>(null);
  const [formGpsCoords, setFormGpsCoords] = useState<string | null>(null);
  const [showStorefrontUploadModal, setShowStorefrontUploadModal] = useState<boolean>(false);
  const [formInterestStatus, setFormInterestStatus] = useState<'NONE' | 'YES' | 'NO'>('NONE');
  const [formNotInterestedReason, setFormNotInterestedReason] = useState<string>('Not interested in digital onboarding');

  // Voice Recording state for Not Interested flow
  const [isRecordingVoice, setIsRecordingVoice] = useState<boolean>(false);
  const [recordedAudioUri, setRecordedAudioUri] = useState<string | null>(null);
  const [voiceDuration, setVoiceDuration] = useState<number>(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Generate Report Modal Form State
  const [reportDateRange, setReportDateRange] = useState<string>('THIS_MONTH');
  const [startDateStr, setStartDateStr] = useState<string>('2026-09-01');
  const [endDateStr, setEndDateStr] = useState<string>('2026-09-28');
  const [reportFormat, setReportFormat] = useState<string>('CSV');
  const [exportResultModal, setExportResultModal] = useState<ExportResult | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgressStage, setExportProgressStage] = useState<string>('');

  // Filter Logic
  const applyFilters = useCallback(() => {
    let list = [...records];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        r =>
          r.shopName.toLowerCase().includes(q) ||
          r.vendorCode.toLowerCase().includes(q) ||
          r.managerName.toLowerCase().includes(q) ||
          r.category.toLowerCase().includes(q) ||
          r.location.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q)
      );
    }

    if (selectedCategoryFilter !== 'ALL') {
      list = list.filter(r => r.category.toLowerCase() === selectedCategoryFilter.toLowerCase());
    }

    if (selectedInterestFilter === 'INTERESTED') {
      list = list.filter(r => r.isInterested);
    } else if (selectedInterestFilter === 'NOT_INTERESTED') {
      list = list.filter(r => !r.isInterested);
    }

    if (activeScopeTab === 'MY') {
      const currentName = manager?.name || 'Manager';
      list = list.filter(r => r.managerName.toLowerCase().includes(currentName.toLowerCase()));
    } else if (activeScopeTab === 'DIVISION') {
      list = list.filter(r => r.managerRole.includes('Division'));
    } else if (activeScopeTab === 'PINCODE') {
      list = list.filter(r => r.managerRole.includes('Pincode'));
    }

    setFilteredRecords(list);
  }, [records, searchQuery, selectedCategoryFilter, selectedInterestFilter, activeScopeTab, manager]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadVisitRecords();
    setIsRefreshing(false);
  };

  // Counters
  const totalVisitsCount = records.length;
  const interestedCount = records.filter(r => r.isInterested).length;
  const notInterestedCount = records.filter(r => !r.isInterested).length;

  // Real Camera & Manual Gallery Photo Capture (No GPS required)
  const handleCapturePhoto = async (mode: 'camera' | 'gallery' = 'camera') => {
    try {
      const result = await cameraLocationService.capturePhotoWithGps(mode);
      if (result && result.uri) {
        setFormPhotoUri(result.uri);
        setFormPhotoName(result.fileName || (mode === 'camera' ? 'Camera_Storefront.jpg' : 'Gallery_Storefront.jpg'));
        setFormPhotoCaptured(true);
      }
    } catch (err: any) {
      if (err.message && !err.message.includes('No photo')) {
        console.warn('Storefront photo capture error:', err.message);
      }
    }
  };

  // Voice Note Timer
  useEffect(() => {
    if (isRecordingVoice) {
      setVoiceDuration(0);
      timerRef.current = setInterval(() => {
        setVoiceDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecordingVoice]);

  const handleToggleVoiceRecording = () => {
    if (!isRecordingVoice) {
      setIsRecordingVoice(true);
      setRecordedAudioUri(null);
    } else {
      setIsRecordingVoice(false);
      setRecordedAudioUri('mock_audio_note.m4a');
    }
  };

  // Submit "+ Field Shop Visit" -> YES (Interested)
  const handleProceedToOnboarding = () => {
    const shopName = formShopName.trim() || 'New Store';
    const category = formCategory || 'Service';
    const photoUri = formPhotoUri;
    const gpsCoords = formGpsCoords || undefined;

    // Immediately close modal & reset form
    setIsFieldVisitModalOpen(false);
    resetVisitForm();

    // Immediately navigate to 5-step Vendor Registration / Onboarding form
    if (onNavigateRoute) {
      onNavigateRoute('AddVendor', {
        initialBusinessName: shopName,
        initialCategory: category,
        initialPhotoUri: photoUri || undefined,
      });
    }

    // Save field visit record in background
    const newRecord: VisitRecord = {
      id: `visit_${Date.now()}_op_${Math.random().toString(36).substring(2, 6)}`,
      shopName,
      vendorCode: `vendor${shopName.replaceAll(/\s+/g, '').toUpperCase().slice(0, 8)}`,
      category,
      managerName: manager?.name || 'Manager',
      managerRole: manager?.role ? manager.role.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Manager',
      location: 'Salem',
      pincode: '636102',
      timestamp: 'Just now',
      isInterested: true,
      photoUrl: photoUri || undefined,
      gpsCoords,
    };

    setRecords(prev => [newRecord, ...prev]);
    services.fieldVisitService.addVisitRecord(newRecord).catch(() => {});
  };

  // Submit "+ Field Shop Visit" -> NO (Not Interested)
  const handleSubmitNotInterestedRecord = async () => {
    if (!formShopName.trim()) {
      Alert.alert('Shop Name Required', 'Please enter the Shop Name / Business Title.');
      return;
    }
    if (!formPhotoCaptured || !formPhotoUri) {
      Alert.alert('Storefront Photo Required', 'Please attach or upload a storefront photo before submitting a visit record.');
      return;
    }
    if (!recordedAudioUri && voiceDuration === 0) {
      Alert.alert(
        'Voice Note Required',
        'Operational policy requires attaching a mandatory voice note explaining why the merchant declined interest.'
      );
      return;
    }

    let uploadedPhotoUrl = formPhotoUri;
    try {
      uploadedPhotoUrl = await services.mediaUploadService.uploadShopPhoto(formPhotoUri);
    } catch (e) {
      console.warn('Photo upload warning:', e);
    }

    let uploadedAudioUrl: string | null = null;
    if (recordedAudioUri) {
      try {
        uploadedAudioUrl = await services.mediaUploadService.uploadAudioReport(recordedAudioUri);
      } catch (e) {
        console.warn('Audio upload warning:', e);
      }
    }

    const newRecord: VisitRecord = {
      id: `visit_${Date.now()}_op_${Math.random().toString(36).substring(2, 6)}`,
      shopName: formShopName.trim(),
      vendorCode: `vendor${formShopName.replaceAll(/\s+/g, '').toUpperCase().slice(0, 8)}`,
      category: formCategory,
      managerName: manager?.name || 'Manager',
      managerRole: manager?.role ? manager.role.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Manager',
      location: 'Salem',
      pincode: '636102',
      timestamp: 'Just now',
      isInterested: false,
      photoUrl: uploadedPhotoUrl,
      reasonNotInterested: formNotInterestedReason,
      voiceNoteDuration: voiceDuration || 12,
      gpsCoords: formGpsCoords || undefined,
    };

    await services.fieldVisitService.addVisitRecord(newRecord);
    setRecords(prev => [newRecord, ...prev]);
    setIsFieldVisitModalOpen(false);
    resetVisitForm();
    Alert.alert('Visit Record Submitted', 'Exception visit record logged with audio note and storefront photo. Supervisor notified.');
  };

  const resetVisitForm = () => {
    setFormShopName('');
    setFormCategory('Service');
    setFormPhotoCaptured(false);
    setFormPhotoUri(null);
    setFormPhotoName(null);
    setFormGpsCoords(null);
    setFormInterestStatus('NONE');
    setFormNotInterestedReason('Not interested in digital onboarding');
    setIsRecordingVoice(false);
    setRecordedAudioUri(null);
    setVoiceDuration(0);
  };

  const handleGenerateReportSubmit = async () => {
    if (isExporting) return;

    if (reportDateRange === 'CUSTOM') {
      if (!startDateStr || !endDateStr) {
        Alert.alert('Validation Error', 'Please specify both Start Date and End Date for custom date range.');
        return;
      }
      if (new Date(endDateStr).getTime() < new Date(startDateStr).getTime()) {
        Alert.alert('Validation Error', 'End Date must be on or after Start Date.');
        return;
      }
    }

    setIsExporting(true);
    setExportProgressStage('Generating report...');

    try {
      const result = await reportExportService.generateReportFile(
        records,
        {
          period: reportDateRange as any,
          format: reportFormat as any,
          startDateStr,
          endDateStr,
          manager,
        },
        (stage: string) => {
          setExportProgressStage(stage);
        }
      );

      setIsExporting(false);
      setExportProgressStage('');
      setIsGenerateReportModalOpen(false);
      setExportResultModal(result);
    } catch (err: any) {
      console.error('[ReportsScreen] handleGenerateReportSubmit error:', err);
      setIsExporting(false);
      setExportProgressStage('');
      const message = err?.message || 'Unable to download report. Please try again.';
      Alert.alert('Unable to Download Report', message, [{ text: 'OK' }]);
    }
  };

  const managerDisplayName = manager?.name || 'Manager';
  const managerDisplayRole = manager?.role
    ? manager.role.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).replace(/\bManager\b/i, 'Manager')
    : 'Manager';

  const renderVisitCard = ({ item }: { item: VisitRecord }) => {
    return (
      <View style={styles.cardContainer}>
        <View style={styles.cardHeaderRow}>
          <Image
            source={{
              uri:
                item.photoUrl ||
                'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400',
            }}
            style={styles.cardShopImage}
          />

          <View style={styles.cardMainCol}>
            <View style={styles.cardTitleRow}>
              <Text style={styles.cardShopTitle} numberOfLines={1}>
                {item.shopName}
              </Text>
              <View
                style={[
                  styles.categoryBadge,
                  item.category === 'Food' ? styles.foodBadgeBg : styles.productsBadgeBg,
                ]}
              >
                <Text
                  style={[
                    styles.categoryBadgeText,
                    item.category === 'Food' ? styles.foodBadgeText : styles.productsBadgeText,
                  ]}
                >
                  {item.category}
                </Text>
              </View>
            </View>

            <Text style={styles.vendorCodeText}>{item.vendorCode}</Text>

            <View style={styles.cardMetaRow}>
              <Icon name="account-outline" size={14} color="#64748B" style={{ marginRight: 3 }} />
              <Text style={styles.cardMetaText}>
                {item.managerName} • {item.managerRole}
              </Text>
            </View>

            <View style={styles.cardMetaRow}>
              <Icon name="map-marker-outline" size={14} color="#64748B" style={{ marginRight: 3 }} />
              <Text style={styles.cardMetaText}>
                {item.location} ({item.pincode}) • 🕒 {item.timestamp}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.cardFooterRow}>
          <Text style={styles.visitIdText}>ID: {item.id}</Text>
          <TouchableOpacity
            style={styles.reportDetailsBtn}
            activeOpacity={0.8}
            onPress={() => {
              if (onNavigateRoute) {
                onNavigateRoute('ReportDetail', { reportId: item.id });
              } else {
                Alert.alert(
                  'Visit Record Details',
                  `Shop: ${item.shopName}\nID: ${item.id}\nStatus: ${
                    item.isInterested ? 'Interested' : 'Not Interested'
                  }`
                );
              }
            }}
          >
            <Text style={styles.reportDetailsBtnText}>Report Details →</Text>
          </TouchableOpacity>
        </View>

        <FieldActionButtons
          phoneNumber={(item as any).phone || (item as any).contactPhone}
          latitude={item.gpsCoords ? parseFloat(item.gpsCoords.split(',')[0]) || null : null}
          longitude={item.gpsCoords ? parseFloat(item.gpsCoords.split(',')[1]) || null : null}
          titleOrLabel={item.shopName}
          address={item.location}
          style={{ marginTop: 8 }}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={theme.colors.primaryDark} barStyle="light-content" />
      <FICHeader
        title="Reports"
        leftActionIcon={<Text style={styles.headerIcon}>☰</Text>}
        onLeftAction={onOpenDrawer}
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#1D4ED8']}
            tintColor="#1D4ED8"
          />
        }
      >
        {/* PAGE TITLE & ACTION BUTTONS */}
        <View style={styles.titleRow}>
          <View style={styles.titleTextCol}>
            <Text style={styles.pageTitle}>Field Visit Reports</Text>
            <Text style={styles.pageSubtitle}>
              Territory audit logs, vendor interest & photo verifications
            </Text>
          </View>

          <View style={styles.titleActionGroup}>
            <TouchableOpacity
              style={styles.primaryActionButton}
              activeOpacity={0.8}
              onPress={() => {
                resetVisitForm();
                setIsFieldVisitModalOpen(true);
              }}
            >
              <Icon name="plus" size={18} color="#FFFFFF" style={{ marginRight: 4 }} />
              <Text style={styles.primaryActionButtonText}>Field Visit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryActionButton}
              activeOpacity={0.8}
              onPress={() => setIsGenerateReportModalOpen(true)}
            >
              <Icon name="tray-arrow-down" size={16} color="#1D4ED8" style={{ marginRight: 4 }} />
              <Text style={styles.secondaryActionButtonText}>Export</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* STATS 3 KPI CARDS */}
        <View style={styles.statsGridRow}>
          <View style={styles.statCard}>
            <Text style={styles.statCardLabel}>TOTAL VISITS</Text>
            <Text style={styles.statCardNumber}>{totalVisitsCount}</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={[styles.statCardLabel, { color: '#059669' }]}>INTERESTED</Text>
            <Text style={[styles.statCardNumber, { color: '#059669' }]}>{interestedCount}</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={[styles.statCardLabel, { color: '#EF4444' }]}>NOT INTERESTED</Text>
            <Text style={[styles.statCardNumber, { color: '#EF4444' }]}>{notInterestedCount}</Text>
          </View>
        </View>

        {/* SEARCH & FILTERS ROW */}
        <View style={styles.searchFilterRow}>
          <View style={styles.searchInputContainer}>
            <Icon name="magnify" size={20} color="#94A3B8" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search shop, category, manager..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Icon name="close-circle" size={18} color="#94A3B8" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* FILTER CHIPS ROLL */}
        <View style={styles.chipsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsScrollContent}
          >
            {/* Scope Tabs */}
            <TouchableOpacity
              style={[styles.chip, activeScopeTab === 'ALL' ? styles.chipSelected : styles.chipUnselected]}
              onPress={() => setActiveScopeTab('ALL')}
            >
              <Text style={[styles.chipText, activeScopeTab === 'ALL' ? styles.chipTextSelected : styles.chipTextUnselected]}>
                All Reports
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.chip, activeScopeTab === 'MY' ? styles.chipSelected : styles.chipUnselected]}
              onPress={() => setActiveScopeTab('MY')}
            >
              <Text style={[styles.chipText, activeScopeTab === 'MY' ? styles.chipTextSelected : styles.chipTextUnselected]}>
                My Reports
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.chip, activeScopeTab === 'DIVISION' ? styles.chipSelected : styles.chipUnselected]}
              onPress={() => setActiveScopeTab('DIVISION')}
            >
              <Text style={[styles.chipText, activeScopeTab === 'DIVISION' ? styles.chipTextSelected : styles.chipTextUnselected]}>
                Division Managers
              </Text>
            </TouchableOpacity>

            {/* Category Dropdown */}
            <TouchableOpacity
              style={[styles.chip, styles.chipUnselected]}
              onPress={() => setShowCategoryFilterModal(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.chipTextUnselected}>
                {selectedCategoryFilter === 'ALL' ? 'All Categories' : selectedCategoryFilter}
              </Text>
              <Icon name="chevron-down" size={14} color="#64748B" style={{ marginLeft: 4 }} />
            </TouchableOpacity>

            {/* Status Dropdown */}
            <TouchableOpacity
              style={[styles.chip, styles.chipUnselected]}
              onPress={() => setShowStatusFilterModal(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.chipTextUnselected}>
                {selectedInterestFilter === 'ALL'
                  ? 'All Statuses'
                  : selectedInterestFilter === 'INTERESTED'
                  ? 'Interested'
                  : 'Not Interested'}
              </Text>
              <Icon name="chevron-down" size={14} color="#64748B" style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* VISIT CARDS FLATLIST */}
        <FlatList
          data={filteredRecords}
          keyExtractor={item => item.id}
          renderItem={renderVisitCard}
          scrollEnabled={false}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Icon name="store-search-outline" size={48} color="#94A3B8" />
              <Text style={styles.emptyTitle}>No Visit Records Found</Text>
              <Text style={styles.emptySub}>No shop visit audit logs match your selected filter criteria.</Text>
            </View>
          }
        />
      </ScrollView>

      {/* MODAL 1: + FIELD SHOP VISIT */}
      <Modal
        visible={isFieldVisitModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsFieldVisitModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.fieldVisitModalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeaderRow}>
              <View style={styles.modalHeaderTitleGroup}>
                <View style={styles.modalIconBadge}>
                  <Icon name="storefront-outline" size={22} color="#1D4ED8" />
                </View>
                <View>
                  <Text style={styles.modalTitle}>Field Shop Visit</Text>
                  <Text style={styles.modalSubtitle}>
                    Shop Details, Storefront Photo & Interest Decision
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setIsFieldVisitModalOpen(false)}
              >
                <Icon name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalScrollBody}
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* STEP 1: Shop Details & Category */}
              <View style={styles.stepBox}>
                <View style={styles.stepHeaderRow}>
                  <View style={styles.stepBadge}>
                    <Text style={styles.stepBadgeText}>1</Text>
                  </View>
                  <Text style={styles.stepTitle}>Shop Details & Business Category *</Text>
                </View>

                <View style={styles.stepInputsRow}>
                  <View style={[styles.inputGroupCol, { flex: 1.25 }]}>
                    <Text style={styles.fieldLabel}>Shop Name / Title</Text>
                    <TextInput
                      style={styles.textInputStyle}
                      placeholder="e.g. Sri Lakshmi Store"
                      placeholderTextColor="#94A3B8"
                      value={formShopName}
                      onChangeText={setFormShopName}
                    />
                  </View>

                  <View style={[styles.inputGroupCol, { flex: 1 }]}>
                    <Text style={styles.fieldLabel}>Category</Text>
                    <TouchableOpacity
                      style={styles.selectCategoryBtn}
                      onPress={() => setShowFormCategoryModal(true)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.selectCategoryText} numberOfLines={1}>
                        {formCategory}
                      </Text>
                      <Icon name="chevron-down" size={16} color="#64748B" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* STEP 2: Shop Storefront Photo (Manual Upload & Real Working Photo) */}
              <View style={styles.stepBox}>
                <View style={styles.stepHeaderRow}>
                  <View style={styles.stepBadge}>
                    <Text style={styles.stepBadgeText}>2</Text>
                  </View>
                  <Text style={styles.stepTitle}>Shop Storefront Photo *</Text>
                </View>

                {formPhotoUri ? (
                  <View style={styles.storefrontPreviewContainer}>
                    <Image source={{ uri: formPhotoUri }} style={styles.storefrontPreviewImage} resizeMode="cover" />
                    <View style={styles.storefrontMetaRow}>
                      <View style={{ flex: 1, marginRight: 8 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Icon name="check-circle" size={16} color="#16A34A" style={{ marginRight: 5 }} />
                          <Text style={styles.storefrontAttachedTitle}>
                            Storefront Photo Attached
                          </Text>
                        </View>
                        <Text style={styles.storefrontAttachedSubtitle} numberOfLines={1}>
                          {formPhotoName || 'Real Storefront Photo'} • Manual Upload Verified
                        </Text>
                      </View>
                      <View style={styles.storefrontBtnGroup}>
                        <TouchableOpacity
                          style={styles.storefrontChangeBtn}
                          onPress={() => setShowStorefrontUploadModal(true)}
                          activeOpacity={0.8}
                        >
                          <Icon name="folder-image" size={14} color="#1D4ED8" style={{ marginRight: 4 }} />
                          <Text style={styles.storefrontChangeBtnText}>Change</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.storefrontRemoveBtn}
                          onPress={() => {
                            setFormPhotoUri(null);
                            setFormPhotoName(null);
                            setFormPhotoCaptured(false);
                          }}
                          activeOpacity={0.8}
                        >
                          <Icon name="trash-can-outline" size={16} color="#DC2626" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ) : (
                  <View style={styles.storefrontUploadBox}>
                    <TouchableOpacity
                      style={styles.storefrontUploadCard}
                      onPress={() => setShowStorefrontUploadModal(true)}
                      activeOpacity={0.8}
                    >
                      <View style={styles.storefrontUploadIconWrap}>
                        <Icon name="cloud-upload" size={26} color="#2563EB" />
                      </View>
                      <Text style={styles.storefrontUploadMainText}>Click to upload storefront photo</Text>
                      <Text style={styles.storefrontUploadSubText}>
                        Manual upload from Device Gallery or snap with Camera
                      </Text>
                    </TouchableOpacity>

                    <View style={styles.quickUploadActionsRow}>
                      <TouchableOpacity
                        style={styles.quickActionBtn}
                        onPress={() => handleCapturePhoto('camera')}
                        activeOpacity={0.8}
                      >
                        <Icon name="camera" size={15} color="#1D4ED8" style={{ marginRight: 4 }} />
                        <Text style={styles.quickActionBtnText} numberOfLines={1}>Real Camera</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.quickActionBtn, styles.quickActionBtnGallery]}
                        onPress={() => handleCapturePhoto('gallery')}
                        activeOpacity={0.8}
                      >
                        <Icon name="image-multiple" size={15} color="#16A34A" style={{ marginRight: 4 }} />
                        <Text style={[styles.quickActionBtnText, { color: '#15803D' }]} numberOfLines={1}>Device Gallery</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>

              {/* STEP 3: Merchant Interest Status */}
              <View style={styles.stepBox}>
                <View style={styles.stepHeaderRow}>
                  <View style={styles.stepBadge}>
                    <Text style={styles.stepBadgeText}>3</Text>
                  </View>
                  <Text style={styles.stepTitle}>Merchant Interest Status *</Text>
                </View>

                <View style={styles.interestDecisionRow}>
                  <TouchableOpacity
                    style={[
                      styles.interestBtn,
                      formInterestStatus === 'YES' && styles.interestBtnYesActive,
                    ]}
                    onPress={() => setFormInterestStatus('YES')}
                    activeOpacity={0.8}
                  >
                    <Icon
                      name="thumb-up-outline"
                      size={18}
                      color={formInterestStatus === 'YES' ? '#059669' : '#475569'}
                      style={styles.interestBtnIcon}
                    />
                    <View style={styles.interestBtnTextGroup}>
                      <Text
                        style={[
                          styles.interestBtnMainText,
                          formInterestStatus === 'YES' && styles.interestBtnTextYes,
                        ]}
                      >
                        YES
                      </Text>
                      <Text
                        style={[
                          styles.interestBtnSubText,
                          formInterestStatus === 'YES' && styles.interestBtnTextYes,
                        ]}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        minimumFontScale={0.75}
                      >
                        Interested
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.interestBtn,
                      formInterestStatus === 'NO' && styles.interestBtnNoActive,
                    ]}
                    onPress={() => setFormInterestStatus('NO')}
                    activeOpacity={0.8}
                  >
                    <Icon
                      name="thumb-down-outline"
                      size={18}
                      color={formInterestStatus === 'NO' ? '#DC2626' : '#475569'}
                      style={styles.interestBtnIcon}
                    />
                    <View style={styles.interestBtnTextGroup}>
                      <Text
                        style={[
                          styles.interestBtnMainText,
                          formInterestStatus === 'NO' && styles.interestBtnTextNo,
                        ]}
                      >
                        NO
                      </Text>
                      <Text
                        style={[
                          styles.interestBtnSubText,
                          formInterestStatus === 'NO' && styles.interestBtnTextNo,
                        ]}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        minimumFontScale={0.75}
                      >
                        Not Interested
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>

                {/* YES (INTERESTED) WORKFLOW */}
                {formInterestStatus === 'YES' && (
                  <View style={styles.yesWorkflowContainer}>
                    <Text style={styles.yesWorkflowHeading}>Ready to Onboard Merchant.</Text>
                    <Text style={styles.yesWorkflowSub}>
                      Proceed to the 5-step Vendor Registration form.
                    </Text>

                    <TouchableOpacity
                      style={styles.proceedOnboardingBtn}
                      activeOpacity={0.85}
                      onPress={handleProceedToOnboarding}
                    >
                      <Text style={styles.proceedOnboardingBtnText}>
                        Proceed to Onboarding Form →
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* NO (NOT INTERESTED) WORKFLOW */}
                {formInterestStatus === 'NO' && (
                  <View style={styles.noWorkflowContainer}>
                    <Text style={styles.noWorkflowLabel}>Select Reason for Refusal *</Text>
                    <TouchableOpacity
                      style={styles.reasonDropdownBtn}
                      onPress={() => setShowFormReasonModal(true)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.reasonDropdownText}>{formNotInterestedReason}</Text>
                      <Icon name="chevron-down" size={18} color="#64748B" />
                    </TouchableOpacity>

                    <Text style={[styles.noWorkflowLabel, { marginTop: 14 }]}>
                      Mandatory Voice Note *
                    </Text>

                    {/* Talk & Hear Voice Recorder / Player Component */}
                    <FICAudioPlayerRecorder
                      title="🎙️ Voice Note / Field Audit Audio"
                      subtitle="Record audio explanation of merchant refusal. Talk into mic and press play to listen back."
                      recordedAudioUri={recordedAudioUri}
                      audioDurationSeconds={voiceDuration}
                      onStartRecording={() => setIsRecordingVoice(true)}
                      onStopRecording={(uri: string, durationSecs: number) => {
                        setRecordedAudioUri(uri);
                        setVoiceDuration(durationSecs);
                        setIsRecordingVoice(false);
                      }}
                      onDeleteRecording={() => {
                        setRecordedAudioUri(null);
                        setVoiceDuration(0);
                        setIsRecordingVoice(false);
                      }}
                    />

                    <TouchableOpacity
                      style={styles.submitNotInterestedBtn}
                      onPress={handleSubmitNotInterestedRecord}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.submitNotInterestedBtnText}>Submit Visit Record</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL 2: GENERATE REPORT */}
      <Modal
        visible={isGenerateReportModalOpen}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsGenerateReportModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.generateReportModalContent}>
            <View style={styles.modalHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Icon name="file-chart-outline" size={24} color="#1D4ED8" style={{ marginRight: 8 }} />
                <Text style={styles.modalTitle}>Generate Report</Text>
              </View>
              <TouchableOpacity onPress={() => setIsGenerateReportModalOpen(false)}>
                <Icon name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <Text style={styles.generateReportSub}>
              Compile field visit audit logs, storefront verification photos, and merchant interest breakdown.
            </Text>

            <Text style={styles.fieldLabel}>Select Date Period</Text>
            <View style={styles.rangeBtnRow}>
              {['TODAY', 'THIS_WEEK', 'THIS_MONTH', 'CUSTOM'].map(range => (
                <TouchableOpacity
                  key={range}
                  style={[styles.rangeBtn, reportDateRange === range && styles.rangeBtnActive]}
                  onPress={() => setReportDateRange(range)}
                >
                  <Text style={[styles.rangeBtnText, reportDateRange === range && styles.rangeBtnTextActive]}>
                    {range === 'CUSTOM' ? '📅 Custom Dates' : range.replaceAll('_', ' ')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* CUSTOM DATE RANGE INPUT PICKER */}
            {reportDateRange === 'CUSTOM' && (
              <View style={styles.customDateBox}>
                <Text style={styles.customDateTitle}>📅 Specify Custom Date Range</Text>
                <View style={{ flexDirection: 'row' }}>
                  <View style={{ flex: 1, marginRight: 6 }}>
                    <Text style={styles.fieldLabelSmall}>Start Date (YYYY-MM-DD)</Text>
                    <TextInput
                      style={styles.customDateInput}
                      value={startDateStr}
                      onChangeText={setStartDateStr}
                      placeholder="2026-09-01"
                      placeholderTextColor="#94A3B8"
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 6 }}>
                    <Text style={styles.fieldLabelSmall}>End Date (YYYY-MM-DD)</Text>
                    <TextInput
                      style={styles.customDateInput}
                      value={endDateStr}
                      onChangeText={setEndDateStr}
                      placeholder="2026-09-26"
                      placeholderTextColor="#94A3B8"
                    />
                  </View>
                </View>
              </View>
            )}

            <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Report Format</Text>
            <View style={styles.rangeBtnRow}>
              {['PDF', 'CSV', 'EXCEL'].map(fmt => (
                <TouchableOpacity
                  key={fmt}
                  style={[styles.rangeBtn, reportFormat === fmt && styles.rangeBtnActive]}
                  onPress={() => setReportFormat(fmt)}
                >
                  <Text style={[styles.rangeBtnText, reportFormat === fmt && styles.rangeBtnTextActive]}>
                    {fmt} Document
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[
                styles.generateSubmitBtn,
                isExporting && { opacity: 0.6, backgroundColor: '#64748B' },
              ]}
              activeOpacity={0.85}
              disabled={isExporting}
              onPress={handleGenerateReportSubmit}
            >
              {isExporting ? (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.generateSubmitBtnText}>
                    {exportProgressStage || 'Generating report...'}
                  </Text>
                </View>
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Icon name="download" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.generateSubmitBtnText}>Generate & Download Report</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL 3: REAL EXPORT SUCCESS - DOWNLOADED TO ANDROID DEVICE */}
      {exportResultModal && (
        <Modal
          visible={!!exportResultModal}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setExportResultModal(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.generateReportModalContent, { maxHeight: '85%' }]}>
              <View style={{ alignItems: 'center', marginBottom: 12 }}>
                <View
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 24,
                    backgroundColor: '#DCFCE7',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 8,
                  }}
                >
                  <Icon name="check-circle" size={32} color="#16A34A" />
                </View>
                <Text style={styles.modalTitle}>Report downloaded successfully</Text>
                <Text style={styles.generateReportSub}>
                  {exportResultModal.recordCount} field visit records verified & saved to device Downloads.
                </Text>
              </View>

              {/* File Info Box */}
              <View
                style={{
                  backgroundColor: '#F8FAFC',
                  borderRadius: 12,
                  padding: 14,
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: '#E2E8F0',
                }}
              >
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#64748B', marginBottom: 4 }}>
                  File:
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                  <Icon
                    name={
                      reportFormat === 'PDF'
                        ? 'file-pdf-box'
                        : reportFormat === 'EXCEL'
                        ? 'file-excel-box'
                        : 'file-delimited'
                    }
                    size={22}
                    color={reportFormat === 'PDF' ? '#DC2626' : reportFormat === 'EXCEL' ? '#16A34A' : '#2563EB'}
                    style={{ marginRight: 8 }}
                  />
                  <Text
                    style={{ fontSize: 14, fontWeight: '700', color: '#0F172A', flex: 1 }}
                    numberOfLines={1}
                  >
                    {exportResultModal.fileName}
                  </Text>
                </View>

                {exportResultModal.displayPath || exportResultModal.filePath ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                    <Icon name="folder-check-outline" size={14} color="#059669" style={{ marginRight: 4 }} />
                    <Text style={{ fontSize: 11, color: '#059669', flex: 1 }} numberOfLines={1}>
                      Saved: {exportResultModal.displayPath || exportResultModal.filePath}
                    </Text>
                  </View>
                ) : null}
              </View>

              {/* Action Buttons: [ Open ] and [ Share ] */}
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
                <TouchableOpacity
                  style={[
                    styles.generateSubmitBtn,
                    { flex: 1, backgroundColor: '#1D4ED8', marginTop: 0, height: 46 },
                  ]}
                  onPress={async () => {
                    const openResult = await reportExportService.openFile(exportResultModal);
                    if (!openResult.success) {
                      Alert.alert(
                        'Unable to Open File',
                        openResult.message || 'No compatible app found to open this file.'
                      );
                    }
                  }}
                  activeOpacity={0.8}
                >
                  <Icon name="open-in-new" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.generateSubmitBtnText}>Open</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.generateSubmitBtn,
                    { flex: 1, backgroundColor: '#059669', marginTop: 0, height: 46 },
                  ]}
                  onPress={async () => {
                    try {
                      await reportExportService.shareFile(exportResultModal);
                    } catch (err: any) {
                      Alert.alert('Share Error', err.message || 'Unable to share report file.');
                    }
                  }}
                  activeOpacity={0.8}
                >
                  <Icon name="share-variant" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.generateSubmitBtnText}>Share</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={{ paddingVertical: 8, alignItems: 'center' }}
                onPress={() => setExportResultModal(null)}
              >
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#64748B' }}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Category Filter Dropdown Modal */}
      <FICDropdownModal
        visible={showCategoryFilterModal}
        title="Select Category Filter"
        options={[
          { label: 'All Categories', value: 'ALL' },
          { label: 'Service', value: 'Service' },
          { label: 'Product', value: 'Product' },
          { label: 'Food', value: 'Food' },
          { label: 'Daily Needs', value: 'Daily Needs' },
          { label: 'Travel', value: 'Travel' },
          { label: 'Stay', value: 'Stay' },
          { label: 'Jobs', value: 'Jobs' },
        ]}
        selectedValue={selectedCategoryFilter}
        onSelect={(val: string) => setSelectedCategoryFilter(val)}
        onClose={() => setShowCategoryFilterModal(false)}
      />

      {/* Status Filter Dropdown Modal */}
      <FICDropdownModal
        visible={showStatusFilterModal}
        title="Select Interest Status Filter"
        options={[
          { label: 'All Statuses', value: 'ALL' },
          { label: 'Interested', value: 'INTERESTED' },
          { label: 'Not Interested', value: 'NOT_INTERESTED' },
        ]}
        selectedValue={selectedInterestFilter}
        onSelect={(val: string) => setSelectedInterestFilter(val)}
        onClose={() => setShowStatusFilterModal(false)}
      />

      {/* Form Category Dropdown Modal */}
      <FICDropdownModal
        visible={showFormCategoryModal}
        title="Select Business Category"
        options={['Service', 'Product', 'Food', 'Daily Needs', 'Travel', 'Stay', 'Jobs']}
        selectedValue={formCategory}
        onSelect={(val: string) => setFormCategory(val)}
        onClose={() => setShowFormCategoryModal(false)}
      />

      {/* Form Not Interested Reason Dropdown Modal */}
      <FICDropdownModal
        visible={showFormReasonModal}
        title="Select Reason Not Interested"
        options={[
          'Not interested in digital onboarding',
          'High commission rates',
          'Owner unavailable',
          'Competitor exclusive',
          'Other business reasons',
        ]}
        selectedValue={formNotInterestedReason}
        onSelect={(val: string) => setFormNotInterestedReason(val)}
        onClose={() => setShowFormReasonModal(false)}
      />
      {/* Storefront Photo Manual Upload Modal */}
      <FICImageUploadModal
        visible={showStorefrontUploadModal}
        title="Upload Shop Storefront Photo"
        subtitle="Capture real-time photo with camera or choose image from your device gallery."
        currentImageUri={formPhotoUri}
        onImageSelected={(uri: string, fileName?: string) => {
          setFormPhotoUri(uri);
          setFormPhotoName(fileName || 'Storefront_Photo.jpg');
          setFormPhotoCaptured(true);
          setShowStorefrontUploadModal(false);
        }}
        onRemoveImage={() => {
          setFormPhotoUri(null);
          setFormPhotoName(null);
          setFormPhotoCaptured(false);
        }}
        onClose={() => setShowStorefrontUploadModal(false)}
      />
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
    color: '#FFFFFF',
    fontWeight: '700',
  },
  topHeader: {
    height: 64,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  hamburgerButton: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  headerLogoContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  headerLogo: {
    width: 40,
    height: 40,
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bellButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 6,
    right: 7,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  profileCircleButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#DBEAFE',
    overflow: 'hidden',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  /* Title & Actions Row */
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  titleTextCol: {
    flex: 1,
    marginRight: 12,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  pageSubtitle: {
    fontSize: 12,
    color: '#64748B',
  },
  titleActionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  primaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1D4ED8',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    shadowColor: '#1D4ED8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryActionButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  secondaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 10,
  },
  secondaryActionButtonText: {
    color: '#1D4ED8',
    fontSize: 13,
    fontWeight: '700',
  },
  /* KPI Stat Cards */
  statsGridRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statCardLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
    marginBottom: 4,
  },
  statCardNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  /* Search Row */
  searchFilterRow: {
    marginBottom: 12,
  },
  searchInputContainer: {
    height: 44,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#0F172A',
    paddingVertical: 0,
  },
  /* Chips */
  chipsContainer: {
    marginBottom: 14,
  },
  chipsScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  chipSelected: {
    backgroundColor: '#1D4ED8',
  },
  chipUnselected: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  chipText: {
    fontSize: 12,
  },
  chipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  chipTextUnselected: {
    color: '#475569',
    fontWeight: '500',
  },
  /* Visit Card */
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
  },
  cardShopImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: '#F1F5F9',
  },
  cardMainCol: {
    flex: 1,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  cardShopTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
    marginRight: 6,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  productsBadgeBg: {
    backgroundColor: '#EEF2FF',
  },
  productsBadgeText: {
    color: '#4F46E5',
  },
  foodBadgeBg: {
    backgroundColor: '#FEF3C7',
  },
  foodBadgeText: {
    color: '#D97706',
  },
  vendorCodeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4,
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  cardMetaText: {
    fontSize: 12,
    color: '#475569',
  },
  cardFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  visitIdText: {
    fontSize: 11,
    color: '#94A3B8',
    fontFamily: 'monospace',
  },
  reportDetailsBtn: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  reportDetailsBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#475569',
    marginTop: 8,
  },
  emptySub: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 4,
    textAlign: 'center',
  },
  /* MODAL */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  fieldVisitModalContent: {
    width: '100%',
    maxHeight: '94%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    flexDirection: 'column',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 12,
  },
  modalHeaderTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  modalIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  modalCloseBtn: {
    padding: 6,
  },
  modalScrollBody: {
    flexShrink: 1,
  },
  modalScrollContent: {
    paddingBottom: 20,
  },
  stepBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  stepHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  stepBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#1D4ED8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  stepBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  stepInputsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  inputGroupCol: {
    gap: 4,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  textInputStyle: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
    fontSize: 13,
    color: '#0F172A',
  },
  selectCategoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 40,
  },
  selectCategoryText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  storefrontPreviewContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
    padding: 10,
  },
  storefrontPreviewImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  storefrontMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  storefrontAttachedTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
  },
  storefrontAttachedSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  storefrontBtnGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  storefrontChangeBtn: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    flexDirection: 'row',
    alignItems: 'center',
  },
  storefrontChangeBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  storefrontRemoveBtn: {
    backgroundColor: '#FEE2E2',
    padding: 6,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storefrontUploadBox: {
    gap: 8,
  },
  storefrontUploadCard: {
    borderWidth: 1.5,
    borderColor: '#93C5FD',
    borderStyle: 'dashed',
    borderRadius: 12,
    backgroundColor: '#EFF6FF',
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storefrontUploadIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  storefrontUploadMainText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  storefrontUploadSubText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    textAlign: 'center',
  },
  quickUploadActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  quickActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 8,
    paddingVertical: 8,
  },
  quickActionBtnGallery: {
    borderColor: '#BBF7D0',
    backgroundColor: '#F0FDF4',
  },
  quickActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  interestDecisionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  interestBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 6,
    minHeight: 48,
  },
  interestBtnIcon: {
    marginRight: 6,
  },
  interestBtnTextGroup: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    flexShrink: 1,
  },
  interestBtnMainText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#334155',
    lineHeight: 16,
  },
  interestBtnSubText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#64748B',
    lineHeight: 13,
  },
  interestBtnYesActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  interestBtnNoActive: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
  },
  interestBtnTextYes: {
    color: '#047857',
  },
  interestBtnTextNo: {
    color: '#B91C1C',
  },
  yesWorkflowContainer: {
    marginTop: 14,
    backgroundColor: '#ECFDF5',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  yesWorkflowHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: '#047857',
    marginBottom: 2,
  },
  yesWorkflowSub: {
    fontSize: 11,
    color: '#065F46',
    marginBottom: 10,
  },
  proceedOnboardingBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  proceedOnboardingBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  noWorkflowContainer: {
    marginTop: 14,
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  noWorkflowLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#B91C1C',
    marginBottom: 6,
  },
  reasonDropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 38,
  },
  reasonDropdownText: {
    fontSize: 12,
    color: '#0F172A',
    fontWeight: '600',
  },
  audioRecordBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    alignItems: 'center',
  },
  recordVoiceBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC2626',
    paddingVertical: 10,
    borderRadius: 8,
  },
  recordVoiceBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  audioOrText: {
    fontSize: 10,
    color: '#94A3B8',
    marginVertical: 6,
  },
  uploadAudioBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    width: '100%',
  },
  uploadAudioBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  submitNotInterestedBtn: {
    backgroundColor: '#DC2626',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 14,
  },
  submitNotInterestedBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  generateReportModalContent: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
  },
  generateReportSub: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 16,
  },
  rangeBtnRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
    marginBottom: 10,
  },
  rangeBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  rangeBtnActive: {
    backgroundColor: '#1D4ED8',
    borderColor: '#1D4ED8',
  },
  rangeBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  rangeBtnTextActive: {
    color: '#FFFFFF',
  },
  customDateBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 4,
    marginBottom: 8,
  },
  customDateTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1D4ED8',
    marginBottom: 8,
  },
  fieldLabelSmall: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 4,
  },
  customDateInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 13,
    color: '#0F172A',
  },
  generateSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1D4ED8',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 16,
  },
  generateSubmitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
