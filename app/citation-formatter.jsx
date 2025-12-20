import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import Toast from '../components/Toast';

export default function CitationFormatterScreen() {
    const [caseName, setCaseName] = useState('Kesavananda Bharati v. State of Kerala');
    const [year, setYear] = useState('1973');
    const [court, setCourt] = useState('SC');
    const [reporter, setReporter] = useState('AIR');
    const [volume, setVolume] = useState('4');
    const [page, setPage] = useState('1461');
    const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

    const showToast = (message, type = 'success') => {
        setToast({ visible: true, message, type });
        setTimeout(() => setToast({ visible: false, message: '', type: 'success' }), 2000);
    };

    const formatBluebook = () => {
        if (!caseName || !year || !reporter || !page) return '';
        return `${caseName}, ${reporter} ${year} ${court || 'SC'} ${page}`;
    };

    const formatOSCOLA = () => {
        if (!caseName || !year || !reporter || !page) return '';
        return `${caseName} [${year}] ${reporter} ${page} (${court || 'SC'})`;
    };

    const formatIndian = () => {
        if (!caseName || !year || !volume || !reporter || !page) return '';
        return `${caseName}, (${year}) ${volume} ${reporter} ${page}`;
    };

    const copyToClipboard = async (format, text) => {
        await Clipboard.setStringAsync(text);
        showToast(`${format} format copied!`, 'success');
    };

    const clearForm = () => {
        setCaseName('');
        setYear('');
        setCourt('');
        setReporter('');
        setVolume('');
        setPage('');
    };

    const hasInput = caseName || year || court || reporter || volume || page;

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Citation Formatter</Text>
                    <Text style={styles.subtitle}>Format legal citations instantly</Text>
                </View>

                {/* Input Form */}
                <View style={styles.formCard}>
                    <Text style={styles.sectionTitle}>Case Details</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Case Name *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g., Kesavananda Bharati v. State..."
                            placeholderTextColor={colors.textSecondary}
                            value={caseName}
                            onChangeText={setCaseName}
                        />
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.inputGroup, styles.halfWidth]}>
                            <Text style={styles.label}>Year *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="1973"
                                placeholderTextColor={colors.textSecondary}
                                value={year}
                                onChangeText={setYear}
                                keyboardType="numeric"
                                maxLength={4}
                            />
                        </View>

                        <View style={[styles.inputGroup, styles.halfWidth]}>
                            <Text style={styles.label}>Court</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="SC / HC"
                                placeholderTextColor={colors.textSecondary}
                                value={court}
                                onChangeText={setCourt}
                            />
                        </View>
                    </View>

                    <View style={styles.row}>
                        <View style={[styles.inputGroup, styles.halfWidth]}>
                            <Text style={styles.label}>Reporter *</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="AIR / SCC"
                                placeholderTextColor={colors.textSecondary}
                                value={reporter}
                                onChangeText={setReporter}
                            />
                        </View>

                        <View style={[styles.inputGroup, styles.halfWidth]}>
                            <Text style={styles.label}>Volume</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="4"
                                placeholderTextColor={colors.textSecondary}
                                value={volume}
                                onChangeText={setVolume}
                                keyboardType="numeric"
                            />
                        </View>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Page Number *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="1461"
                            placeholderTextColor={colors.textSecondary}
                            value={page}
                            onChangeText={setPage}
                            keyboardType="numeric"
                        />
                    </View>

                    {hasInput && (
                        <TouchableOpacity style={styles.clearButton} onPress={clearForm}>
                            <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
                            <Text style={styles.clearText}>Clear All</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Output Formats */}
                {hasInput && (
                    <View style={styles.outputSection}>
                        <Text style={styles.sectionTitle}>Formatted Citations</Text>

                        {/* Bluebook */}
                        {formatBluebook() && (
                            <View style={styles.outputCard}>
                                <View style={styles.outputHeader}>
                                    <Text style={styles.formatLabel}>Bluebook</Text>
                                    <TouchableOpacity onPress={() => copyToClipboard('Bluebook', formatBluebook())}>
                                        <Ionicons name="copy-outline" size={20} color={colors.gold} />
                                    </TouchableOpacity>
                                </View>
                                <Text style={styles.outputText}>{formatBluebook()}</Text>
                            </View>
                        )}

                        {/* OSCOLA */}
                        {formatOSCOLA() && (
                            <View style={styles.outputCard}>
                                <View style={styles.outputHeader}>
                                    <Text style={styles.formatLabel}>OSCOLA</Text>
                                    <TouchableOpacity onPress={() => copyToClipboard('OSCOLA', formatOSCOLA())}>
                                        <Ionicons name="copy-outline" size={20} color={colors.gold} />
                                    </TouchableOpacity>
                                </View>
                                <Text style={styles.outputText}>{formatOSCOLA()}</Text>
                            </View>
                        )}

                        {/* Indian Standard */}
                        {formatIndian() && (
                            <View style={styles.outputCard}>
                                <View style={styles.outputHeader}>
                                    <Text style={styles.formatLabel}>Indian Standard</Text>
                                    <TouchableOpacity onPress={() => copyToClipboard('Indian', formatIndian())}>
                                        <Ionicons name="copy-outline" size={20} color={colors.gold} />
                                    </TouchableOpacity>
                                </View>
                                <Text style={styles.outputText}>{formatIndian()}</Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Help Text */}
                <View style={styles.helpCard}>
                    <Text style={styles.helpTitle}>Quick Guide</Text>
                    <Text style={styles.helpText}>• Fields marked with * are required</Text>
                    <Text style={styles.helpText}>• Reporter: AIR, SCC, etc.</Text>
                    <Text style={styles.helpText}>• Court: SC (Supreme Court), HC (High Court)</Text>
                    <Text style={styles.helpText}>• Tap copy icon to copy formatted citation</Text>
                </View>
            </ScrollView>

            <Toast
                visible={toast.visible}
                message={toast.message}
                type={toast.type}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        padding: 20,
    },
    header: {
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    formCard: {
        backgroundColor: colors.cardBackground,
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: colors.border,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.gold,
        marginBottom: 16,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: colors.text,
        marginBottom: 8,
    },
    input: {
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: colors.text,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    halfWidth: {
        flex: 1,
    },
    clearButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginTop: 8,
        padding: 8,
    },
    clearText: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    outputSection: {
        marginBottom: 20,
    },
    outputCard: {
        backgroundColor: colors.cardBackground,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.border,
    },
    outputHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    formatLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.gold,
    },
    outputText: {
        fontSize: 15,
        color: colors.text,
        lineHeight: 22,
    },
    helpCard: {
        backgroundColor: colors.cardBackground,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.border,
    },
    helpTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
        marginBottom: 12,
    },
    helpText: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: 6,
        lineHeight: 20,
    },
});
