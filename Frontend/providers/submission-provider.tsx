"use client";

import React from 'react';

import { Submission } from '@/types';
import { SubmissionProvider as ClientSubmissionProvider, useSubmissionBootstrap } from '@/contexts/SubmissionContext';

interface SubmissionProviderProps {
  children: React.ReactNode;
}

type SubmissionBootstrapState = {
  submissions: Submission[];
};

const SubmissionBootstrapContext = React.createContext<SubmissionBootstrapState | undefined>(undefined);

export function SubmissionBootstrapProvider({ children }: SubmissionProviderProps) {
  const state = useSubmissionBootstrap();

  return (
    <SubmissionBootstrapContext.Provider value={state}>
      <ClientSubmissionProvider>{children}</ClientSubmissionProvider>
    </SubmissionBootstrapContext.Provider>
  );
}

export function useSubmissionBootstrapState() {
  const context = React.useContext(SubmissionBootstrapContext);
  if (!context) {
    throw new Error('useSubmissionBootstrapState must be used inside SubmissionBootstrapProvider');
  }
  return context;
}


