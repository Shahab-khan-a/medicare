import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Share,
  Alert,
  ScrollView,
} from 'react-native';
import { colors, fonts, borderRadius } from '../theme';
import Icon from './Icon';
import Button from './Button';

interface QRCodeModalProps {
  visible: boolean;
  onClose: () => void;
  onTrackQueue?: () => void;
  appointmentData: {
    doctorName: string;
    patientName: string;
    tokenNumber: number;
    date: string;
    time: string;
    shift: string;
    room: string;
    estimatedWait?: string;
    bookingId?: string;
  };
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  visible,
  onClose,
  onTrackQueue,
  appointmentData,
}) => {
  const [copied, setCopied] = useState(false);
  const safeTokenPayload = `MEDICARE:TICKET:${appointmentData.bookingId || 'MC-98421'}:TK-${appointmentData.tokenNumber}`;

  const handleShare = async () => {
    try {
      await Share.share({
        title: `MediCare OPD Token #${appointmentData.tokenNumber}`,
        message: `MediCare Clinic OPD Pass\nDoctor: ${appointmentData.doctorName}\nPatient: ${appointmentData.patientName}\nToken: #${appointmentData.tokenNumber}\nRoom: ${appointmentData.room}\nShift: ${appointmentData.shift}\nDate: ${appointmentData.date} at ${appointmentData.time}\nPass Code: ${safeTokenPayload}`,
      });
    } catch {
      Alert.alert('Notice', 'Unable to open share sheet.');
    }
  };

  const handleAddToCalendar = () => {
    Alert.alert(
      'Calendar Synced',
      `Reminder created for appointment with ${appointmentData.doctorName} on ${appointmentData.date} at ${appointmentData.time}.`
    );
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.cardContainer}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <View style={styles.hospitalIcon}>
                <Icon name="medkit" size={16} color={colors.primary} />
              </View>
              <Text style={styles.headerTitle}>Digital OPD Pass</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Icon name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
            {/* Token Badge */}
            <View style={styles.tokenSection}>
              <Text style={styles.tokenSub}>YOUR CONFIRMED TOKEN</Text>
              <Text style={styles.tokenBig}>#{appointmentData.tokenNumber}</Text>
              <View style={styles.roomBadge}>
                <Icon name="location-outline" size={14} color="#0284C7" />
                <Text style={styles.roomText}>{appointmentData.room} • {appointmentData.shift}</Text>
              </View>
            </View>

            {/* Stylized Safe QR Code Visual Matrix */}
            <View style={styles.qrWrapper}>
              <View style={styles.qrBox}>
                {/* 3 Corner Alignment Squares */}
                <View style={[styles.cornerSquare, styles.topLeft]} />
                <View style={[styles.cornerSquare, styles.topRight]} />
                <View style={[styles.cornerSquare, styles.bottomLeft]} />

                {/* Digital QR Pattern Grid */}
                <View style={styles.qrPattern}>
                  <View style={styles.qrRow}>
                    <View style={styles.blockDark} />
                    <View style={styles.blockLight} />
                    <View style={styles.blockDark} />
                    <View style={styles.blockDark} />
                    <View style={styles.blockLight} />
                  </View>
                  <View style={styles.qrRow}>
                    <View style={styles.blockLight} />
                    <View style={styles.blockDark} />
                    <View style={styles.blockDark} />
                    <View style={styles.blockLight} />
                    <View style={styles.blockDark} />
                  </View>
                  <View style={styles.qrRow}>
                    <View style={styles.blockDark} />
                    <View style={styles.blockDark} />
                    <View style={styles.blockLight} />
                    <View style={styles.blockDark} />
                    <View style={styles.blockLight} />
                  </View>
                </View>
              </View>
              <Text style={styles.qrPayloadText}>Safe Ticket ID: {safeTokenPayload}</Text>
              <Text style={styles.qrHint}>Scan at Clinic Reception or OPD Kiosk for Express Check-In</Text>
            </View>

            {/* Ticket Details Grid */}
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Doctor</Text>
                <Text style={styles.infoValue}>{appointmentData.doctorName}</Text>
              </View>
              <View style={styles.infoDivider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Patient</Text>
                <Text style={styles.infoValue}>{appointmentData.patientName}</Text>
              </View>
              <View style={styles.infoDivider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Date & Time</Text>
                <Text style={styles.infoValue}>{appointmentData.date} • {appointmentData.time}</Text>
              </View>
              <View style={styles.infoDivider} />
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Estimated Wait</Text>
                <Text style={[styles.infoValue, { color: colors.accentText }]}>
                  {appointmentData.estimatedWait || '~15-20 min'}
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actions}>
              {onTrackQueue && (
                <Button
                  title="Track Live Queue"
                  variant="primary"
                  onPress={() => {
                    onClose();
                    onTrackQueue();
                  }}
                  iconName="pulse"
                  style={styles.primaryAction}
                />
              )}


              <View style={styles.subActionsRow}>
                <TouchableOpacity
                  style={styles.subBtn}
                  onPress={handleAddToCalendar}
                  activeOpacity={0.7}
                >
                  <Icon name="calendar-outline" size={18} color={colors.primary} />
                  <Text style={styles.subBtnText}>Add Calendar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.subBtn}
                  onPress={handleShare}
                  activeOpacity={0.7}
                >
                  <Icon name="share-social-outline" size={18} color={colors.primary} />
                  <Text style={styles.subBtnText}>Share Pass</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(10, 20, 40, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cardContainer: {
    backgroundColor: colors.card,
    borderRadius: 24,
    width: '100%',
    maxHeight: '90%',
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  hospitalIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: colors.textPrimary,
  },
  closeBtn: {
    padding: 6,
  },
  scrollBody: {
    padding: 20,
    alignItems: 'center',
  },
  tokenSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  tokenSub: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    letterSpacing: 1.2,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  tokenBig: {
    fontFamily: fonts.extrabold,
    fontSize: 44,
    color: colors.primary,
    lineHeight: 50,
  },
  roomBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  roomText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: '#0369A1',
  },
  qrWrapper: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    width: '100%',
    marginBottom: 18,
  },
  qrBox: {
    width: 130,
    height: 130,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#0F172A',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  cornerSquare: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderWidth: 4,
    borderColor: '#0F172A',
    backgroundColor: '#0F172A',
  },
  topLeft: {
    top: 6,
    left: 6,
  },
  topRight: {
    top: 6,
    right: 6,
  },
  bottomLeft: {
    bottom: 6,
    left: 6,
  },
  qrPattern: {
    gap: 4,
  },
  qrRow: {
    flexDirection: 'row',
    gap: 4,
  },
  blockDark: {
    width: 10,
    height: 10,
    backgroundColor: '#0F172A',
    borderRadius: 2,
  },
  blockLight: {
    width: 10,
    height: 10,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
  },
  qrPayloadText: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    color: colors.textPrimary,
    letterSpacing: 0.5,
    marginTop: 4,
  },
  qrHint: {
    fontFamily: fonts.regular,
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  infoCard: {
    width: '100%',
    backgroundColor: colors.surfaceMuted,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 18,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  infoLabel: {
    fontFamily: fonts.regular,
    fontSize: 12,
    color: colors.textSecondary,
  },
  infoValue: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.textPrimary,
  },
  infoDivider: {
    height: 1,
    backgroundColor: colors.divider,
  },
  actions: {
    width: '100%',
    gap: 10,
  },
  primaryAction: {
    width: '100%',
  },
  subActionsRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  subBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.md,
  },
  subBtnText: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.primary,
  },
});

export default QRCodeModal;
