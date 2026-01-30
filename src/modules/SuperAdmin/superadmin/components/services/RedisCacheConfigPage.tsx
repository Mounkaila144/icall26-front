'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { ServiceConfigLayout } from './ServiceConfigLayout';
import { RedisConfigForm } from './RedisConfigForm';
import { useServiceConfig } from '../../hooks/useServiceConfig';
import { SERVICE_LABELS, SERVICE_DESCRIPTIONS } from '../../../types/service-config.types';
import type { RedisCacheConfig } from '../../../types/service-config.types';

/**
 * Page de configuration Redis Cache
 */
export function RedisCacheConfigPage() {
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
  } = useServiceConfig<RedisCacheConfig>('redis-cache');

  return (
    <ServiceConfigLayout
      title={SERVICE_LABELS['redis-cache']}
      description={SERVICE_DESCRIPTIONS['redis-cache']}
      readOnly={!isEditable}
      isLoading={isLoading}
      lang={lang}
    >
      <RedisConfigForm
        serviceType="redis-cache"
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
