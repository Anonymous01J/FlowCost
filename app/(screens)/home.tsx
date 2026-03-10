import React, { useState, useMemo } from 'react';
import { FlatList, TextInput } from 'react-native';
import {
  YStack, XStack, SizableText, Button, Card, Spinner,
} from 'tamagui';
import {
  Plus, Moon, Sun, Search, SlidersHorizontal,
  DollarSign, TrendingUp, CheckSquare, FileText,
} from '@tamagui/lucide-icons';

import { useThemeContext } from '../../src/state/themeContext';
import { useBudgets } from '../../src/store/Budgetscontext ';
import { BudgetCard } from '../../src/components/ui/Budgetcard';
import { BudgetFormModal } from '../../src/features/budget-form';
import { fmt } from '../../src/features/budget-form/calculations';
import type { Budget } from '../../src/features/budget-form/types';

type FilterStatus = 'all' | 'listo' | 'en-desarrollo';

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  icon, label, value, bg, borderColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  bg: string;
  borderColor: string;
}) {
  return (
    <Card
      flex={1}
      padding="$3"
      gap="$2"
      backgroundColor={bg as any}
      borderColor={borderColor as any}
      borderWidth={1}
      borderRadius="$4"
    >
      <XStack alignItems="center" gap="$2">
        {icon}
        <SizableText size="$1" color="$colorSubtitle" textTransform="uppercase">
          {label}
        </SizableText>
      </XStack>
      <SizableText size="$4" fontWeight="700" color="$color" numberOfLines={1}>
        {value}
      </SizableText>
    </Card>
  );
}

// ─── Filter Pill ─────────────────────────────────────────────────────────────
function FilterPill({
  label, active, onPress,
}: {
  label: string; active: boolean; onPress: () => void;
}) {
  return (
    <Button
      onPress={onPress}
      size="$3"
      borderRadius="$3"
      backgroundColor={active ? '$blue9' : '$backgroundStrong'}
      borderColor={active ? '$blue9' : '$borderColor'}
      borderWidth={1}
      pressStyle={{ opacity: 0.85 }}
    >
      <SizableText size="$2" fontWeight={active ? '700' : '400'} color={active ? 'white' : '$colorSubtitle'}>
        {label}
      </SizableText>
    </Button>
  );
}

// ─── Pantalla principal ───────────────────────────────────────────────────────
export default function Home() {
  const { theme, toggleTheme } = useThemeContext();
  const { budgets, loading, addBudget, updateBudgetStatus, deleteBudget } = useBudgets();

  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  // Estadísticas
  const totalUSD = useMemo(() => budgets.reduce((s, b) => s + b.totalUSD, 0), [budgets]);
  const totalBS = useMemo(() => budgets.reduce((s, b) => s + b.totalBS, 0), [budgets]);
  const listoCount = useMemo(() => budgets.filter(b => b.status === 'listo').length, [budgets]);
  const enDesarrolloCount = useMemo(() => budgets.filter(b => b.status === 'en-desarrollo').length, [budgets]);

  // Lista filtrada
  const filtered = useMemo(() => budgets.filter(b => {
    const matchSearch = b.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || b.status === filterStatus;
    return matchSearch && matchStatus;
  }), [budgets, search, filterStatus]);

  const handleSave = async (budget: Budget) => {
    await addBudget(budget);
  };

  // ── Header del FlatList (todo lo que va sobre la lista) ──────────────────
  const ListHeader = (
    <YStack gap="$4" paddingBottom="$2">
      {/* Top bar */}
      <XStack justifyContent="space-between" alignItems="center" marginTop="$6">
        <XStack alignItems="center" gap="$2">
          <YStack
            width={32} height={32} borderRadius="$3"
            backgroundColor="$blue9"
            alignItems="center" justifyContent="center"
          >
            <SizableText size="$2" fontWeight="700" color="white">FC</SizableText>
          </YStack>
          <YStack>
            <SizableText size="$5" fontWeight="700" color="$color">FlowCost</SizableText>
          </YStack>
        </XStack>

        <Button
          circular size="$4"
          onPress={toggleTheme}
          pressStyle={{ scale: 0.9, opacity: 0.8 }}
          backgroundColor={theme === 'light' ? '$blue5' : '$purple5'}
          icon={theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        />
      </XStack>

      {/* Título de sección */}
      <XStack justifyContent="space-between" alignItems="center">
        <YStack gap="$1">
          <SizableText size="$7" fontWeight="800" color="$color">Presupuestos</SizableText>
          <SizableText size="$2" color="$colorSubtitle">
            {budgets.length} presupuesto{budgets.length !== 1 ? 's' : ''} registrado{budgets.length !== 1 ? 's' : ''}
          </SizableText>
        </YStack>
      </XStack>

      {/* Stats 2x2 */}
      <XStack gap="$3">
        <StatCard
          icon={<DollarSign size={14} color="$blue9" />}
          label="Total USD"
          value={`$${fmt(totalUSD, 0)}`}
          bg="$blue3"
          borderColor="$blue6"
        />
        <StatCard
          icon={<TrendingUp size={14} color="$green9" />}
          label="Total Bs."
          value={`Bs. ${fmt(totalBS, 0)}`}
          bg="$green3"
          borderColor="$green6"
        />
      </XStack>
      <XStack gap="$3">
        <StatCard
          icon={<CheckSquare size={14} color="$purple9" />}
          label="Listos"
          value={String(listoCount)}
          bg="$purple3"
          borderColor="$purple6"
        />
        <StatCard
          icon={<FileText size={14} color="$orange9" />}
          label="En Desarrollo"
          value={String(enDesarrolloCount)}
          bg="$orange3"
          borderColor="$orange6"
        />
      </XStack>

      {/* Buscador */}
      <XStack
        backgroundColor="$backgroundStrong"
        borderColor="$borderColor"
        borderWidth={1}
        borderRadius="$4"
        alignItems="center"
        paddingHorizontal="$3"
        gap="$2"
        height="$5"
      >
        <Search size={16} color="$colorSubtitle" />
        <TextInput
          style={{ flex: 1, fontSize: 14, color: 'inherit' }}
          placeholder="Buscar presupuesto..."
          placeholderTextColor="#9ca3af"
          value={search}
          onChangeText={setSearch}
        />
      </XStack>

      {/* Filtros */}
      <XStack alignItems="center" gap="$2">
        <SlidersHorizontal size={15} color="$colorSubtitle" />
        <XStack gap="$2">
          <FilterPill
            label="Todos"
            active={filterStatus === 'all'}
            onPress={() => setFilterStatus('all')}
          />
          <FilterPill
            label="Listos"
            active={filterStatus === 'listo'}
            onPress={() => setFilterStatus('listo')}
          />
          <FilterPill
            label="En Desarrollo"
            active={filterStatus === 'en-desarrollo'}
            onPress={() => setFilterStatus('en-desarrollo')}
          />
        </XStack>
      </XStack>
    </YStack>
  );

  // ── Empty state ──────────────────────────────────────────────────────────
  const EmptyState = (
    <YStack alignItems="center" justifyContent="center" paddingVertical="$12" gap="$4">
      <YStack
        width={64} height={64} borderRadius="$5"
        backgroundColor="$backgroundStrong"
        alignItems="center" justifyContent="center"
      >
        <FileText size={28} color="$colorSubtitle" opacity={0.5} />
      </YStack>
      <YStack alignItems="center" gap="$2">
        <SizableText size="$5" fontWeight="700" color="$color">
          {search || filterStatus !== 'all' ? 'Sin resultados' : 'Sin presupuestos'}
        </SizableText>
        <SizableText size="$3" color="$colorSubtitle" textAlign="center" maxWidth={260}>
          {search || filterStatus !== 'all'
            ? 'Intenta cambiar los filtros o el término de búsqueda.'
            : 'Crea tu primer presupuesto usando el botón + en la esquina inferior derecha.'}
        </SizableText>
      </YStack>
    </YStack>
  );

  // ── Loading state ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" backgroundColor="$background">
        <Spinner size="large" color="$blue9" />
        <SizableText size="$3" color="$colorSubtitle" marginTop="$3">
          Cargando presupuestos...
        </SizableText>
      </YStack>
    );
  }

  return (
    <YStack flex={1} backgroundColor="$background">
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={EmptyState}
        ItemSeparatorComponent={() => <YStack height={12} />}
        renderItem={({ item }) => (
          <BudgetCard
            budget={item}
            onDelete={deleteBudget}
            onToggleStatus={(id) =>
              updateBudgetStatus(
                id,
                budgets.find(b => b.id === id)?.status === 'listo' ? 'en-desarrollo' : 'listo',
              )
            }
          />
        )}
      />

      {/* FAB */}
      <Button
        position="absolute"
        bottom="$6"
        right="$5"
        circular
        size="$6"
        backgroundColor="$blue9"
        onPress={() => setModalOpen(true)}
        pressStyle={{ scale: 0.95, opacity: 0.9 }}
        elevation={4}
        icon={<Plus size={24} color="white" />}
      />

      {/* Modal */}
      <BudgetFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
      />
    </YStack>
  );
}