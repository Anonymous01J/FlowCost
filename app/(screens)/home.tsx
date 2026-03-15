import React, { useState, useMemo } from 'react';
import { FlatList, TextInput } from 'react-native';
import { YStack, XStack, SizableText, Button, Card, Spinner } from 'tamagui';
import {
  Plus, Moon, Sun, Search, SlidersHorizontal,
  DollarSign, TrendingUp, CheckSquare, FileText,
} from '@tamagui/lucide-icons';

import { useThemeContext } from '../../src/state/themeContext';
import { useOnboarding } from '../../src/store/OnboardingContext';
import { useBudgets } from '../../src/store/BudgetsContext';
import { BudgetCard } from '../../src/components/ui/BudgetCard';
import { BudgetFormModal } from '../../src/features/budget-form';
import { formatVE } from '../../src/components/ui/InputCustom';
import type { Budget } from '../../src/features/budget-form/types';

type FilterStatus = 'all' | 'listo' | 'en-desarrollo';

function StatCard({ icon, label, value, bg, borderColor }: {
  icon: React.ReactNode; label: string; value: string; bg: string; borderColor: string;
}) {
  return (
    <Card flex={1} padding="$3" gap="$2"
      backgroundColor={bg as any} borderColor={borderColor as any} borderWidth={1} borderRadius="$4">
      <XStack alignItems="center" gap="$2">
        {icon}
        <SizableText size="$1" color="$colorSubtitle" textTransform="uppercase">{label}</SizableText>
      </XStack>
      <SizableText size="$4" fontWeight="700" color="$color" numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </SizableText>
    </Card>
  );
}

function FilterPill({ label, active, onPress }: {
  label: string; active: boolean; onPress: () => void;
}) {
  return (
    <Button
      onPress={onPress} size="$3" borderRadius="$3"
      backgroundColor={active ? '$blue9' : '$backgroundStrong'}
      borderColor={active ? '$blue9' : '$borderColor'}
      borderWidth={1} pressStyle={{ opacity: 0.85 }}
    >
      <SizableText size="$2" fontWeight={active ? '700' : '400'}
        color={active ? 'white' : '$colorSubtitle'}>
        {label}
      </SizableText>
    </Button>
  );
}

export default function Home() {
  const { theme, toggleTheme } = useThemeContext();
  const { showOnboarding } = useOnboarding();
  const {
    budgets, loading,
    addBudget, updateBudget, updateBudgetStatus, deleteBudget,
    uniqueName,
  } = useBudgets();

  const [modalOpen,     setModalOpen]     = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [isCopyMode,    setIsCopyMode]    = useState(false);
  const [search,        setSearch]        = useState('');
  const [filterStatus,  setFilterStatus]  = useState<FilterStatus>('all');

  const totalUSD          = useMemo(() => budgets.reduce((s, b) => s + b.totalUSD, 0), [budgets]);
  const totalBS           = useMemo(() => budgets.reduce((s, b) => s + b.totalBS,  0), [budgets]);
  const listoCount        = useMemo(() => budgets.filter(b => b.status === 'listo').length, [budgets]);
  const enDesarrolloCount = useMemo(() => budgets.filter(b => b.status === 'en-desarrollo').length, [budgets]);

  const filtered = useMemo(() => budgets.filter(b => {
    const matchSearch = b.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || b.status === filterStatus;
    return matchSearch && matchStatus;
  }), [budgets, search, filterStatus]);

  // Abrir en modo edición (id existente)
  const handleOpenEdit = (budget: Budget) => {
    setIsCopyMode(false);
    setEditingBudget(budget);
    setModalOpen(true);
  };

  // Abrir en modo copia: datos precargados, nombre único, id vacío para que sea "nuevo"
  const handleCopy = (budget: Budget) => {
    const newName = uniqueName(budget.name);
    const copy: Budget = {
      ...budget,
      id:     '',   // vacío → se genera al guardar
      name:   newName,
      date:   new Date().toISOString().split('T')[0],
      status: 'en-desarrollo',
      data:   { ...budget.data, name: newName },
    };
    setIsCopyMode(true);
    setEditingBudget(copy);
    setModalOpen(true);
  };

  // Guardar: distingue edición real vs nuevo/copia por si el id existe en el listado
  const handleSave = async (budget: Budget) => {
    const isExistingBudget = !!budget.id && budgets.some(b => b.id === budget.id);
    if (isExistingBudget) {
      await updateBudget(budget);
    } else {
      // Nuevo o copia: asegura que tenga id
      const toSave: Budget = {
        ...budget,
        id: budget.id || Math.random().toString(36).slice(2),
      };
      await addBudget(toSave);
    }
    setEditingBudget(null);
    setIsCopyMode(false);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingBudget(null);
    setIsCopyMode(false);
  };

  const inputTextColor   = theme === 'dark' ? '#f1f5f9' : '#0f172a';
  const placeholderColor = theme === 'dark' ? '#64748b' : '#94a3b8';

  const ListHeader = (
    <YStack gap="$4" paddingBottom="$2">
      <XStack justifyContent="space-between" alignItems="center" marginTop="$6">
        <XStack alignItems="center" gap="$2">
          <YStack width={32} height={32} borderRadius="$3" backgroundColor="$blue9"
            alignItems="center" justifyContent="center">
            <SizableText size="$2" fontWeight="700" color="white">FC</SizableText>
          </YStack>
          <SizableText size="$5" fontWeight="700" color="$color">FlowCost</SizableText>
        </XStack>
        <XStack gap="$2" alignItems="center">
          <Button
            size="$3" borderRadius="$3" chromeless
            onPress={showOnboarding}
            borderWidth={1} borderColor="$borderColor"
            backgroundColor="$backgroundStrong"
            pressStyle={{ opacity: 0.7 }}
            width={36} height={36} alignItems="center" justifyContent="center"
          >
            <SizableText size="$4" fontWeight="700" color="$colorSubtitle">?</SizableText>
          </Button>
          <Button circular size="$4" onPress={toggleTheme}
            pressStyle={{ scale: 0.9, opacity: 0.8 }}
            backgroundColor={theme === 'light' ? '$blue5' : '$purple5'}
            icon={theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          />
        </XStack>
      </XStack>

      <YStack gap="$1">
        <SizableText size="$7" fontWeight="800" color="$color">Presupuestos</SizableText>
        <SizableText size="$2" color="$colorSubtitle">
          {budgets.length} presupuesto{budgets.length !== 1 ? 's' : ''} registrado{budgets.length !== 1 ? 's' : ''}
        </SizableText>
      </YStack>

      <XStack gap="$3">
        <StatCard icon={<DollarSign size={14} color="$blue9" />}  label="Total USD"
          value={`$${formatVE(totalUSD, 0)}`}   bg="$blue3"  borderColor="$blue6" />
        <StatCard icon={<TrendingUp size={14} color="$green9" />} label="Total Bs."
          value={`Bs. ${formatVE(totalBS, 0)}`} bg="$green3" borderColor="$green6" />
      </XStack>
      <XStack gap="$3">
        <StatCard icon={<CheckSquare size={14} color="$purple9" />} label="Listos"
          value={String(listoCount)}        bg="$purple3" borderColor="$purple6" />
        <StatCard icon={<FileText size={14} color="$orange9" />}   label="En Desarrollo"
          value={String(enDesarrolloCount)} bg="$orange3" borderColor="$orange6" />
      </XStack>

      <XStack backgroundColor="$backgroundStrong" borderColor="$borderColor"
        borderWidth={1} borderRadius="$4" alignItems="center"
        paddingHorizontal="$3" gap="$2" height="$5">
        <Search size={16} color="$colorSubtitle" />
        <TextInput
          style={{ flex: 1, fontSize: 15, color: inputTextColor }}
          placeholder="Buscar presupuesto..."
          placeholderTextColor={placeholderColor}
          value={search}
          onChangeText={setSearch}
        />
      </XStack>

      <XStack alignItems="center" gap="$2">
        <SlidersHorizontal size={15} color="$colorSubtitle" />
        <XStack gap="$2" flexWrap="wrap">
          <FilterPill label="Todos"         active={filterStatus === 'all'}
            onPress={() => setFilterStatus('all')} />
          <FilterPill label="Listos"        active={filterStatus === 'listo'}
            onPress={() => setFilterStatus('listo')} />
          <FilterPill label="En Desarrollo" active={filterStatus === 'en-desarrollo'}
            onPress={() => setFilterStatus('en-desarrollo')} />
        </XStack>
      </XStack>
    </YStack>
  );

  const EmptyState = (
    <YStack alignItems="center" justifyContent="center" paddingVertical="$12" gap="$4">
      <YStack width={64} height={64} borderRadius="$5" backgroundColor="$backgroundStrong"
        alignItems="center" justifyContent="center">
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
        keyExtractor={item => item.id || item.name}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={EmptyState}
        ItemSeparatorComponent={() => <YStack height={12} />}
        renderItem={({ item }) => (
          <BudgetCard
            budget={item}
            onDelete={deleteBudget}
            onEdit={handleOpenEdit}
            onCopy={handleCopy}
            onToggleStatus={id =>
              updateBudgetStatus(
                id,
                budgets.find(b => b.id === id)?.status === 'listo' ? 'en-desarrollo' : 'listo',
              )
            }
          />
        )}
      />

      <Button
        position="absolute" bottom="$6" right="$5"
        circular size="$6" backgroundColor="$blue9"
        onPress={() => {
          setEditingBudget(null);
          setIsCopyMode(false);
          setModalOpen(true);
        }}
        pressStyle={{ scale: 0.95, opacity: 0.9 }}
        elevation={4}
        icon={<Plus size={24} color="white" />}
      />

      <BudgetFormModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        editBudget={editingBudget}
        isCopyMode={isCopyMode}
      />
    </YStack>
  );
}