import React, { useState } from 'react';
import {
  Dialog,
  YStack,
  XStack,
  SizableText,
  Button,
  Unspaced,
  Adapt,
  Sheet,
} from 'tamagui';
import { ScrollView } from 'react-native';
import { X, ChevronLeft, ChevronRight, Check } from '@tamagui/lucide-icons';

import type { BudgetFormData, Budget } from './types';
import { INITIAL_FORM_DATA } from './types';
import { calculateBudgetSummary } from './calculations';
import { Step1GeneralData } from './components/Step1GeneralData';
import { Step2RawMaterials } from './components/Step2RawMaterials';
import { Step3Labor } from './components/Step3Labor';
import { Step4IndirectCosts } from './components/Step4IndirectCosts';
import { Step5Summary } from './components/Step5Summary';

// ─── Tipos y constantes ──────────────────────────────────────────────────────

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (budget: Budget) => void;
}

const STEPS = [
  { number: 1, title: 'Datos Generales', short: 'General' },
  { number: 2, title: 'Materia Prima', short: 'MP' },
  { number: 3, title: 'Mano de Obra', short: 'MO' },
  { number: 4, title: 'Costos Indirectos', short: 'CIF' },
  { number: 5, title: 'Resumen', short: 'Resumen' },
];

function validateStep(step: number, data: BudgetFormData): string | null {
  if (step === 1 && !data.name.trim()) return 'El nombre del presupuesto es obligatorio.';
  if (step === 1 && data.exchangeRate <= 0) return 'La tasa de cambio debe ser mayor a 0.';
  return null;
}

// ─── Stepper indicator ───────────────────────────────────────────────────────

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
            s.number === step
              ? '$blue9'
              : s.number < step
              ? '$blue6'
              : '$borderColor'
          }
        />
      ))}
    </XStack>
  );
}

// ─── Header del stepper con círculos numerados ────────────────────────────────

function StepHeader({ step, onGoToStep }: { step: number; onGoToStep: (n: number) => void }) {
  return (
    <XStack alignItems="center" gap="$0">
      {STEPS.map((s, i) => {
        const isComplete = step > s.number;
        const isCurrent = step === s.number;
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
              <XStack alignItems="center" gap="$1.5">
                {/* Círculo */}
                <YStack
                  width={24}
                  height={24}
                  borderRadius={12}
                  alignItems="center"
                  justifyContent="center"
                  backgroundColor={
                    isCurrent ? '$blue9' : isComplete ? '$blue3' : '$backgroundStrong'
                  }
                >
                  {isComplete ? (
                    <Check size={11} color={isCurrent ? 'white' : '$blue9'} />
                  ) : (
                    <SizableText
                      size="$1"
                      fontWeight="700"
                      color={isCurrent ? 'white' : '$colorSubtitle'}
                    >
                      {s.number}
                    </SizableText>
                  )}
                </YStack>
                {/* Texto (solo en pantallas grandes) */}
                <SizableText
                  size="$2"
                  color={isCurrent ? '$blue9' : isComplete ? '$colorSubtitle' : '$colorPlaceholder'}
                  display="none"
                  $gtSm={{ display: 'flex' }}
                >
                  {s.short}
                </SizableText>
              </XStack>
            </Button>

            {/* Línea separadora */}
            {i < STEPS.length - 1 && (
              <YStack
                flex={1}
                height={2}
                borderRadius={4}
                backgroundColor={step > s.number ? '$blue7' : '$borderColor'}
              />
            )}
          </React.Fragment>
        );
      })}
    </XStack>
  );
}

// ─── Modal principal ──────────────────────────────────────────────────────────

export function BudgetFormModal({ isOpen, onClose, onSave }: Props) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<BudgetFormData>(INITIAL_FORM_DATA);
  const [error, setError] = useState<string | null>(null);

  const updateData = (updates: Partial<BudgetFormData>) => {
    setData((prev) => ({ ...prev, ...updates }));
    setError(null);
  };

  const goNext = () => {
    const err = validateStep(step, data);
    if (err) { setError(err); return; }
    setError(null);
    setStep((s) => Math.min(s + 1, 5));
  };

  const goPrev = () => {
    setError(null);
    setStep((s) => Math.max(s - 1, 1));
  };

  const goToStep = (n: number) => {
    if (n < step) {
      setError(null);
      setStep(n);
    }
  };

  const handleSaveAndExport = () => {
    const summary = calculateBudgetSummary(data);
    const budget: Budget = {
      id: Math.random().toString(36).slice(2),
      name: data.name,
      date: new Date().toISOString().split('T')[0],
      totalUSD: summary.totalCostUSD,
      totalBS: summary.totalCostBS,
      status: 'listo',
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
    <Dialog modal open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      {/*
       * Adapt hace que en móvil el Dialog use un Sheet (bottom sheet)
       * y en desktop ($gtSm) use el Dialog centrado clásico.
       */}
      <Adapt when="touch" platform="touch">
        <Sheet
          zIndex={200000}
          modal
          dismissOnSnapToBottom={false}
          snapPoints={[92]}
        >
          <Sheet.Frame>
            <Sheet.Handle />
            <Adapt.Contents />
          </Sheet.Frame>
          <Sheet.Overlay
            enterStyle={{ opacity: 0 }}
            exitStyle={{ opacity: 0 }}
          />
        </Sheet>
      </Adapt>

      <Dialog.Portal>
        <Dialog.Overlay
          key="overlay"
          opacity={0.6}
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
          backgroundColor="black"
        />

        <Dialog.Content
          bordered
          elevate
          key="content"
          enterStyle={{ x: 0, y: 10, opacity: 0, scale: 0.97 }}
          exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.97 }}
          // Mobile: fullscreen. Desktop ($gtSm): dialog centrado.
          width="100%"
          maxWidth={900}
          maxHeight="95%"
          $gtSm={{ width: '90%', maxWidth: 900, borderRadius: '$6' }}
          borderRadius="$5"
          padding={0}
          overflow="hidden"
        >
          {/* ── Header ── */}
          <YStack
            paddingHorizontal="$5"
            paddingTop="$4"
            paddingBottom="$3"
            gap="$3"
            borderBottomWidth={1}
            borderBottomColor="$borderColor"
          >
            {/* Título + botón cierre */}
            <XStack justifyContent="space-between" alignItems="flex-start">
              <YStack gap="$1">
                <XStack alignItems="center" gap="$2">
                  {/* Ícono FC */}
                  <YStack
                    width={20}
                    height={20}
                    borderRadius="$2"
                    backgroundColor="$blue9"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <SizableText size="$1" fontWeight="700" color="white">FC</SizableText>
                  </YStack>
                  <SizableText size="$5" fontWeight="700" color="$color">
                    Nuevo Presupuesto
                  </SizableText>
                </XStack>
                <SizableText size="$2" color="$colorSubtitle">
                  Paso {step} de {STEPS.length} — {STEPS[step - 1].title}
                </SizableText>
              </YStack>

              <Unspaced>
                <Dialog.Close asChild>
                  <Button
                    size="$3"
                    circular
                    chromeless
                    onPress={handleClose}
                    icon={<X size={18} />}
                  />
                </Dialog.Close>
              </Unspaced>
            </XStack>

            {/* Stepper */}
            <StepHeader step={step} onGoToStep={goToStep} />
          </YStack>

          {/* ── Error ── */}
          {error && (
            <YStack
              marginHorizontal="$5"
              marginTop="$3"
              paddingHorizontal="$4"
              paddingVertical="$3"
              backgroundColor="$red3"
              borderColor="$red6"
              borderWidth={1}
              borderRadius="$4"
            >
              <SizableText size="$3" color="$red9">{error}</SizableText>
            </YStack>
          )}

          {/* ── Contenido del paso ── */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 20, paddingBottom: 8 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {currentStepContent()}
          </ScrollView>

          {/* ── Footer de navegación ── */}
          <XStack
            paddingHorizontal="$5"
            paddingVertical="$4"
            borderTopWidth={1}
            borderTopColor="$borderColor"
            justifyContent="space-between"
            alignItems="center"
            backgroundColor="$background"
          >
            {/* Anterior */}
            <Button
              onPress={goPrev}
              disabled={step === 1}
              chromeless
              icon={<ChevronLeft size={16} color={step === 1 ? '$colorPlaceholder' : '$colorSubtitle'} />}
              opacity={step === 1 ? 0.4 : 1}
            >
              <SizableText color={step === 1 ? '$colorPlaceholder' : '$colorSubtitle'}>
                Anterior
              </SizableText>
            </Button>

            {/* Puntos de progreso */}
            <StepDots step={step} />

            {/* Siguiente / Finalizar */}
            {step < 5 ? (
              <Button
                onPress={goNext}
                backgroundColor="$blue9"
                borderRadius="$4"
                paddingHorizontal="$5"
                iconAfter={<ChevronRight size={16} color="white" />}
                pressStyle={{ opacity: 0.85, scale: 0.97 }}
              >
                <SizableText color="white" fontWeight="600">Siguiente</SizableText>
              </Button>
            ) : (
              <Button
                onPress={handleSaveAndExport}
                backgroundColor="$green9"
                borderRadius="$4"
                paddingHorizontal="$5"
                icon={<Check size={16} color="white" />}
                pressStyle={{ opacity: 0.85, scale: 0.97 }}
              >
                <SizableText color="white" fontWeight="600">Finalizar</SizableText>
              </Button>
            )}
          </XStack>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}