import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, StatusBar, StyleSheet } from 'react-native';
import { useWalletStore } from '../store/useWalletStore';
import { ChevronLeft, Filter, Search, ArrowDownLeft, ArrowUpRight, Clock } from 'lucide-react-native';
import clsx from 'clsx';

export const HistoryScreen = ({ navigation }: any) => {
    const { transactions, btcPrice } = useWalletStore();
    const [search, setSearch] = useState('');
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
    const [typeFilter, setTypeFilter] = useState<'all' | 'incoming' | 'outgoing'>('all');

    const getCopValue = (tx: any) => {
        if (tx.fiatAmount) return tx.fiatAmount;
        if (!btcPrice || btcPrice === 0) return 0;
        return (tx.amount / 100000000) * btcPrice;
    };

    const filteredTransactions = useMemo(() => {
        let result = transactions.filter(tx => tx.status !== 'expired');
        
        if (typeFilter !== 'all') {
            result = result.filter(tx => tx.type === typeFilter);
        }

        if (search) {
            result = result.filter(tx => 
                (tx.description || '').toLowerCase().includes(search.toLowerCase()) ||
                (tx.type === 'incoming' ? 'recibido' : 'enviado').includes(search.toLowerCase())
            );
        }

        return result.sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        });
    }, [transactions, search, sortOrder, typeFilter]);

    const FilterChip = ({ label, value, current }: any) => (
        <TouchableOpacity 
            onPress={() => setTypeFilter(value)}
            style={[
                styles.chip, 
                current === value && styles.chipActive
            ]}
        >
            <Text style={[
                styles.chipText,
                current === value && styles.chipTextActive
            ]}>
                {label}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ChevronLeft color="white" size={28} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Actividad</Text>
                <TouchableOpacity 
                    onPress={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                    style={styles.filterButton}
                >
                    <Filter color={sortOrder === 'asc' ? '#EAB308' : 'white'} size={20} />
                </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBox}>
                    <Search color="#666" size={18} style={{ marginRight: 10 }} />
                    <TextInput 
                        placeholder="Buscar por concepto..."
                        placeholderTextColor="#444"
                        style={styles.searchInput}
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>
            </View>

            {/* Quick Filters */}
            <View style={styles.filterRow}>
                <FilterChip label="Todos" value="all" current={typeFilter} />
                <FilterChip label="Ingresos" value="incoming" current={typeFilter} />
                <FilterChip label="Gastos" value="outgoing" current={typeFilter} />
            </View>

            {/* List */}
            <ScrollView 
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            >
                {filteredTransactions.length === 0 ? (
                    <View style={styles.emptyState}>
                        <View style={styles.emptyIconCircle}>
                             <Clock color="#222" size={40} strokeWidth={1} />
                        </View>
                        <Text style={styles.emptyText}>No hay resultados</Text>
                        <Text style={styles.emptySub}>Intenta ajustando los filtros de búsqueda</Text>
                    </View>
                ) : (
                    filteredTransactions.map((tx) => (
                        <TouchableOpacity key={tx.id} style={styles.txItem} activeOpacity={0.7}>
                            <View style={styles.txLeft}>
                                <View style={[
                                    styles.iconBox,
                                    tx.status === 'pending' ? styles.iconPending : 
                                    tx.type === 'incoming' ? styles.iconIncoming : styles.iconOutgoing
                                ]}>
                                    {tx.status === 'pending' ? <Clock color="#666" size={18} /> :
                                     tx.type === 'incoming' ? <ArrowDownLeft color="#10B981" size={18} /> : 
                                     <ArrowUpRight color="#F97316" size={18} />}
                                </View>
                                <View style={{ flex: 1, marginRight: 10 }}>
                                    <View style={styles.typeRow}>
                                        <Text style={styles.txTitle}>
                                            {tx.type === 'incoming' ? 'Recibido' : 'Enviado'}
                                        </Text>
                                        {tx.status === 'pending' && (
                                            <View style={styles.pendingBadge}>
                                                <Text style={styles.pendingBadgeText}>PENDIENTE</Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text style={styles.txMemo} numberOfLines={1}>
                                        {tx.description || 'Sin concepto'}
                                    </Text>
                                    <Text style={styles.txDate}>
                                        {new Date(tx.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} • {new Date(tx.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.txRight}>
                                <Text 
                                    adjustsFontSizeToFit
                                    numberOfLines={1}
                                    style={[
                                        styles.txAmount,
                                        tx.type === 'incoming' && tx.status !== 'pending' ? styles.amountGreen : 
                                        tx.type === 'outgoing' ? styles.amountRed : styles.amountWhite
                                    ]}
                                >
                                    {tx.type === 'incoming' ? '+' : '-'} ${getCopValue(tx).toLocaleString('es-CO', { maximumFractionDigits: 0 })}
                                </Text>
                                <Text style={styles.txSats}>
                                    {tx.amount.toLocaleString()} sats
                                </Text>
                            </View>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
    },
    backButton: {
        width: 44,
        height: 44,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    filterButton: {
        width: 44,
        height: 44,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchContainer: {
        paddingHorizontal: 20,
        marginBottom: 15,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0A0A0A',
        borderRadius: 20,
        paddingHorizontal: 15,
        height: 52,
        borderWidth: 1,
        borderColor: '#111',
    },
    searchInput: {
        flex: 1,
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    filterRow: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 10,
        marginBottom: 20,
    },
    chip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    chipActive: {
        backgroundColor: '#EAB308',
        borderColor: '#EAB308',
    },
    chipText: {
        color: '#666',
        fontSize: 12,
        fontWeight: 'bold',
    },
    chipTextActive: {
        color: 'black',
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
    },
    emptyIconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255,255,255,0.02)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    emptySub: {
        color: '#444',
        fontSize: 14,
        marginTop: 8,
        textAlign: 'center',
    },
    txItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 18,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    txLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    iconPending: {
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    iconIncoming: {
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
    },
    iconOutgoing: {
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
    },
    typeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    txTitle: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    pendingBadge: {
        backgroundColor: 'rgba(234, 179, 8, 0.1)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: 'rgba(234, 179, 8, 0.2)',
    },
    pendingBadgeText: {
        color: '#EAB308',
        fontSize: 8,
        fontWeight: '900',
    },
    txMemo: {
        color: '#666',
        fontSize: 13,
        marginTop: 1,
    },
    txDate: {
        color: '#444',
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginTop: 4,
    },
    txRight: {
        alignItems: 'flex-end',
        width: 100,
    },
    txAmount: {
        fontSize: 16,
        fontWeight: '900',
    },
    amountGreen: {
        color: '#10B981',
    },
    amountRed: {
        color: '#F87171',
    },
    amountWhite: {
        color: 'white',
    },
    txSats: {
        color: '#666',
        fontSize: 12,
    },
});
