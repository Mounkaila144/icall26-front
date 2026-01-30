'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { ServiceConfigLayout } from './ServiceConfigLayout';
import { RedisConfigForm } from './RedisConfigForm';
import { useServiceConfig } from '../../hooks/useServiceConfig';
import { SERVICE_LABELS, SERVICE_DESCRIPTIONS } from '../../../types/service-config.types';
import type { RedisQueueConfig } from '../../../types/service-config.types';

/**
 * Page de configuration Redis Queue
 */
export function RedisQueueConfigPage() {
  const params = useParams();
  const lang = (params?.lang as string) || 'fr';

  const {
    config,
    isLoading,
    error,
    save,
    isSaving,
    test,
    isTesting,
    testResult,
    isEditable,
  } = useServiceConfig<RedisQueueConfig>('redis-queue');

  return (
    <ServiceConfigLayout
      title={SERVICE_LABELS['redis-queue']}
      description={SERVICE_DESCRIPTIONS['redis-queue']}
      readOnly={!isEditable}
      isLoading={isLoading}
      lang={lang}
    >
      <RedisConfigForm
        serviceType="redis-queue"
        config={config}
        onSave={save}
        isSaving={isSaving}
        onTest={test}
        isTesting={isTesting}
        testResult={testResult}
        error={error}
      />
    </ServiceConfigLayout>
  );
}
