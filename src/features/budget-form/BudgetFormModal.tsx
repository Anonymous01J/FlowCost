import React, { useState, useEffect } from 'react';
import {
  YStack, XStack, SizableText, Button, Sheet, ScrollView,
} from 'tamagui';
import { X, ChevronLeft, ChevronRight, Check } from '@tamagui/lucide-icons';

import type { BudgetFormData, Budget } from './types';
import { INITIAL_FORM_DATA } from './types';
import { calculateBudgetSummary } from './calculations';
import { Step1GeneralData } from './components/Step1GeneralData';
import { Step2RawMaterials } from './components/Step2RawMaterials';
import { Step3Labor } from './components/Step3Labor';
import { Step4IndirectCosts } from './components/Step4IndirectCosts';
import { Step5Summary } from './components/Step5Summary';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (budget: Budget) => void;
  /** Si se pasa, el modal abre en modo edición con estos datos precargados */
  editBudget?: Budget | null;
}

const STEPS = [
  { number: 1, title: 'Datos Generales', short: 'General' },
  { number: 2, title: 'Materia Prima',   short: 'MP' },
  { number: 3, title: 'Mano de Obra',    short: 'MO' },
  { number: 4, title: 'Costos Indirectos', short: 'CIF' },
  { number: 5, title: 'Resumen',         short: 'Resumen' },
];

function validateStep(step: number, data: BudgetFormData): string | null {
  if (step === 1 && !data.name.trim()) return 'El nombre del presupuesto es obligatorio.';
  if (step === 1 && data.exchangeRate <= 0) return 'La tasa de cambio debe ser mayor a 0.';
  return null;
}

function StepDots({ step }: { step: number }) {
  return (
    <XStack gap="$2" alignItems="center" justifyContent="center">
      {STEPS.map((s) => (
        <YStack
          key={s.number}
          height={6}
          width={s.number === step ? 20 : 6}
          borderRadius={10}
          backgroundColor={
            s.number === step ? '$blue9' : s.number < step ? '$blue6' : '$borderColor'
          }
        />
      ))}
    </XStack>
  );
}

function StepHeader({ step, onGoToStep }: { step: number; onGoToStep: (n: number) => void }) {
  return (
    <XStack alignItems="center">
      {STEPS.map((s, i) => {
        const isComplete  = step > s.number;
        const isCurrent   = step === s.number;
        const canNavigate = s.number < step;
        return (
          <React.Fragment key={s.number}>
            <Button
              onPress={() => canNavigate && onGoToStep(s.number)}
              disabled={!canNavigate}
              chromeless
              paddingHorizontal="$2"
              paddingVertical="$1"
            >
              <YStack
                width={24} height={24} borderRadius={12}
                alignItems="center" justifyContent="center"
                backgroundColor={isCurrent ? '$blue9' : isComplete ? '$blue3' : '$backgroundStrong'}
              >
                {isComplete ? (
                  <Check size={11} color="$blue9" />
                ) : (
                  <SizableText size="$1" fontWeight="700" color={isCurrent ? 'white' : '$colorSubtitle'}>
                    {s.number}
                  </SizableText>
                )}
              </YStack>
            </Button>
            {i < STEPS.length - 1 && (
              <YStack flex={1} height={2} borderRadius={4}
                backgroundColor={step > s.number ? '$blue7' : '$borderColor'} />
            )}
          </React.Fragment>
        );
      })}
    </XStack>
  );
}

export function BudgetFormModal({ isOpen, onClose, onSave, editBudget }: Props) {
  const isEditing = !!editBudget;

  const [step, setStep]   = useState(1);
  const [data, setData]   = useState<BudgetFormData>(INITIAL_FORM_DATA);
  const [error, setError] = useState<string | null>(null);

  // Cuando se abre en modo edición, precarga los datos
  useEffect(() => {
    if (isOpen && editBudget) {
      setData(editBudget.data);
      setStep(1);
      setError(null);
    }
  }, [isOpen, editBudget]);

  const updateData = (updates: Partial<BudgetFormData>) => {
    setData(prev => ({ ...prev, ...updates }));
    setError(null);
  };

  const goNext = () => {
    const err = validateStep(step, data);
    if (err) { setError(err); return; }
    setError(null);
    setStep(s => Math.min(s + 1, 5));
  };

  const goPrev = () => {
    setError(null);
    setStep(s => Math.max(s - 1, 1));
  };

  const goToStep = (n: number) => {
    if (n < step) { setError(null); setStep(n); }
  };

  const handleSaveAndExport = () => {
    const summary = calculateBudgetSummary(data);
    const budget: Budget = {
      // En edición conserva el id y fecha original; en nuevo genera uno nuevo
      id:       editBudget?.id   ?? Math.random().toString(36).slice(2),
      date:     editBudget?.date ?? new Date().toISOString().split('T')[0],
      name:     data.name,
      totalUSD: summary.totalCostUSD,
      totalBS:  summary.totalCostBS,
      status:   editBudget?.status ?? 'listo',
      data,
    };
    onSave(budget);
    handleClose();
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep(1);
      setData(INITIAL_FORM_DATA);
      setError(null);
    }, 300);
  };

  const currentStepContent = () => {
    switch (step) {
      case 1: return <Step1GeneralData data={data} onChange={updateData} />;
      case 2: return <Step2RawMaterials data={data} onChange={updateData} />;
      case 3: return <Step3Labor data={data} onChange={updateData} />;
      case 4: return <Step4IndirectCosts data={data} onChange={updateData} />;
      case 5: return <Step5Summary data={data} onSaveAndExport={handleSaveAndExport} />;
      default: return null;
    }
  };

  return (
    <Sheet
      open={isOpen}
      onOpenChange={open => { if (!open) handleClose(); }}
      snapPoints={[100]}
      dismissOnSnapToBottom={false}
      modal
      zIndex={200000}
    >
      <Sheet.Overlay
        backgroundColor="rgba(0,0,0,0.5)"
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
      />
      <Sheet.Frame backgroundColor="$background" flex={1}>

        {/* Header */}
        <YStack
          paddingHorizontal="$5" paddingTop="$10" paddingBottom="$3"
          gap="$3" borderBottomWidth={1} borderBottomColor="$borderColor"
        >
          <XStack justifyContent="space-between" alignItems="flex-start">
            <YStack gap="$1">
              <XStack alignItems="center" gap="$2">
                <YStack
                  width={20} height={20} borderRadius="$2"
                  backgroundColor={isEditing ? '$orange9' : '$blue9'}
                  alignItems="center" justifyContent="center"
                >
                  <SizableText size="$1" fontWeight="700" color="white">FC</SizableText>
                </YStack>
                <SizableText size="$5" fontWeight="700" color="$color">
                  {isEditing ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}
                </SizableText>
              </XStack>
              <SizableText size="$2" color="$colorSubtitle">
                Paso {step} de {STEPS.length} — {STEPS[step - 1].title}
              </SizableText>
            </YStack>
            <Button size="$3" circular chromeless onPress={handleClose} icon={<X size={18} />} />
          </XStack>
          <StepHeader step={step} onGoToStep={goToStep} />
        </YStack>

        {/* Error */}
        {error && (
          <YStack
            marginHorizontal="$5" marginTop="$3"
            paddingHorizontal="$4" paddingVertical="$3"
            backgroundColor="$red3" borderColor="$red6" borderWidth={1} borderRadius="$4"
          >
            <SizableText size="$3" color="$red9">{error}</SizableText>
          </YStack>
        )}

        {/* Contenido */}
        <Sheet.ScrollView
          flex={1}
          contentContainerStyle={{ padding: 20, paddingBottom: 16 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {currentStepContent()}
        </Sheet.ScrollView>

        {/* Footer */}
        <XStack
          paddingHorizontal="$5" paddingVertical="$4" paddingBottom="$6"
          borderTopWidth={1} borderTopColor="$borderColor"
          justifyContent="space-between" alignItems="center"
          backgroundColor="$background"
        >
          <Button
            onPress={goPrev}
            disabled={step === 1}
            chromeless
            icon={<ChevronLeft size={16} color={step === 1 ? '$colorPlaceholder' : '$colorSubtitle'} />}
            opacity={step === 1 ? 0.4 : 1}
          >
            <SizableText color={step === 1 ? '$colorPlaceholder' : '$colorSubtitle'}>Anterior</SizableText>
          </Button>

          <StepDots step={step} />

          {step < 5 ? (
            <Button
              onPress={goNext}
              backgroundColor="$blue9" borderRadius="$4" paddingHorizontal="$5"
              iconAfter={<ChevronRight size={16} color="white" />}
              pressStyle={{ opacity: 0.85, scale: 0.97 }}
            >
              <SizableText color="white" fontWeight="600">Siguiente</SizableText>
            </Button>
          ) : (
            <Button
              onPress={handleSaveAndExport}
              backgroundColor={isEditing ? '$orange9' : '$green9'}
              borderRadius="$4" paddingHorizontal="$5"
              icon={<Check size={16} color="white" />}
              pressStyle={{ opacity: 0.85, scale: 0.97 }}
            >
              <SizableText color="white" fontWeight="600">
                {isEditing ? 'Guardar Cambios' : 'Finalizar'}
              </SizableText>
            </Button>
          )}
        </XStack>

      </Sheet.Frame>
    </Sheet>
  );
}