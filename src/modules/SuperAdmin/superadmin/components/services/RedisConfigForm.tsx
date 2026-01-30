'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Grid,
  Alert,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  Typography,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { TestResultAlert } from './TestResultAlert';
import type { RedisCacheConfig, RedisQueueConfig, TestResult } from '../../../types/service-config.types';

/**
 * Schéma de validation pour Redis Cache
 */
const redisCacheSchema = yup.object({
  host: yup.string().required('Hôte requis'),
  port: yup
    .number()
    .required('Port requis')
    .min(1, 'Port invalide')
    .max(65535, 'Port invalide'),
  password: yup.string().nullable(),
  database: yup.number().min(0, 'Min: 0').max(15, 'Max: 15').nullable(),
  prefix: yup.string().nullable(),
  ssl: yup.boolean().nullable(),
});

/**
 * Schéma de validation pour Redis Queue
 */
const redisQueueSchema = yup.object({
  host: yup.string().required('Hôte requis'),
  port: yup
    .number()
    .required('Port requis')
    .min(1, 'Port invalide')
    .max(65535, 'Port invalide'),
  password: yup.string().nullable(),
  database: yup.number().min(0, 'Min: 0').max(15, 'Max: 15').nullable(),
  queue_name: yup.string().nullable(),
  ssl: yup.boolean().nullable(),
});

type RedisCacheFormData = yup.InferType<typeof redisCacheSchema>;
type RedisQueueFormData = yup.InferType<typeof redisQueueSchema>;

interface RedisConfigFormProps {
  serviceType: 'redis-cache' | 'redis-queue';
  config: RedisCacheConfig | RedisQueueConfig | null;
  onSave: (data: Partial<RedisCacheConfig | RedisQueueConfig>) => Promise<boolean>;
  isSaving?: boolean;
  onTest: (data?: Partial<RedisCacheConfig | RedisQueueConfig>) => Promise<void>;
  isTesting?: boolean;
  testResult: TestResult | null;
  error?: string | null;
}

export function RedisConfigForm({
  serviceType,
  config,
  onSave,
  isSaving = false,
  onTest,
  isTesting = false,
  testResult,
  error,
}: RedisConfigFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isCache = serviceType === 'redis-cache';

  const schema = isCache ? redisCacheSchema : redisQueueSchema;

  const {
    control,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isDirty },
  } = useForm<RedisCacheFormData | RedisQueueFormData>({
    resolver: yupResolver(schema),
    defaultValues: isCache
      ? { host: '', port: 6379, password: '', database: 0, prefix: '', ssl: false }
      : { host: '', port: 6379, password: '', database: 1, queue_name: 'default', ssl: false },
    mode: 'onChange',
  });

  useEffect(() => {
    if (config) {
      if (isCache) {
        const cacheConfig = config as RedisCacheConfig;
        reset({
          host: cacheConfig.host || '',
          port: cacheConfig.port || 6379,
          password: cacheConfig.password || '',
          database: cacheConfig.database ?? 0,
          prefix: cacheConfig.prefix || '',
          ssl: cacheConfig.ssl ?? false,
        });
      } else {
        const queueConfig = config as RedisQueueConfig;
        reset({
          host: queueConfig.host || '',
          port: queueConfig.port || 6379,
          password: queueConfig.password || '',
          database: queueConfig.database ?? 1,
          queue_name: queueConfig.queue_name || 'default',
          ssl: queueConfig.ssl ?? false,
        });
      }
    }
  }, [config, reset, isCache]);

  const onSubmit = async (data: RedisCacheFormData | RedisQueueFormData) => {
    const submitData: any = {
      host: data.host,
      port: data.port,
      database: data.database,
      ssl: data.ssl || false,
    };

    // N'envoyer le mot de passe que s'il a été modifié (ne contient pas de masquage)
    if (data.password && !data.password.includes('●') && !data.password.includes('*')) {
      submitData.password = data.password;
    }

    if (isCache && 'prefix' in data) {
      submitData.prefix = data.prefix || undefined;
    } else if (!isCache && 'queue_name' in data) {
      submitData.queue_name = data.queue_name || undefined;
    }

    await onSave(submitData);
  };

  const handleTest = async () => {
    const data = getValues();
    const testData: any = {
      host: data.host,
      port: data.port,
      database: data.database,
      ssl: data.ssl || false,
    };

    // N'envoyer le mot de passe que s'il a été modifié (ne contient pas de masquage)
    if (data.password && !data.password.includes('●') && !data.password.includes('*')) {
      testData.password = data.password;
    }

    await onTest(testData);
  };

  const handleCancel = () => {
    if (config) {
      if (isCache) {
        const cacheConfig = config as RedisCacheConfig;
        reset({
          host: cacheConfig.host || '',
          port: cacheConfig.port || 6379,
          password: cacheConfig.password || '',
          database: cacheConfig.database ?? 0,
          prefix: cacheConfig.prefix || '',
          ssl: cacheConfig.ssl ?? false,
        });
      } else {
        const queueConfig = config as RedisQueueConfig;
        reset({
          host: queueConfig.host || '',
          port: queueConfig.port || 6379,
          password: queueConfig.password || '',
          database: queueConfig.database ?? 1,
          queue_name: queueConfig.queue_name || 'default',
          ssl: queueConfig.ssl ?? false,
        });
      }
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Controller
            name="host"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Hôte"
                placeholder="redis.example.com"
                error={!!errors.host}
                helperText={errors.host?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <i className="tabler-server" style={{ fontSize: 18, color: '#666' }} />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="port"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Port"
                type="number"
                error={!!errors.port}
                helperText={errors.port?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <i className="tabler-plug" style={{ fontSize: 18, color: '#666' }} />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Mot de passe (optionnel)"
                type={showPassword ? 'text' : 'password'}
                placeholder="●●●●●●●●"
                error={!!errors.password}
                helperText={errors.password?.message || 'Laisser vide si pas de mot de passe'}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <i className="tabler-lock" style={{ fontSize: 18, color: '#666' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                      >
                        <i
                          className={showPassword ? 'tabler-eye-off' : 'tabler-eye'}
                          style={{ fontSize: 18 }}
                        />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Controller
            name="database"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Base de données Redis"
                type="number"
                error={!!errors.database}
                helperText={errors.database?.message || 'Numéro de base Redis (0-15)'}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <i className="tabler-database" style={{ fontSize: 18, color: '#666' }} />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />
        </Grid>

        {/* Champ spécifique au type de service */}
        <Grid item xs={12} md={6}>
          {isCache ? (
            <Controller
              name="prefix"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Préfixe des clés"
                  placeholder="app_cache:"
                  error={!!(errors as any).prefix}
                  helperText={(errors as any).prefix?.message || 'Préfixe ajouté à toutes les clés de cache'}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <i className="tabler-tag" style={{ fontSize: 18, color: '#666' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          ) : (
            <Controller
              name="queue_name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Nom de la queue"
                  placeholder="default"
                  error={!!(errors as any).queue_name}
                  helperText={(errors as any).queue_name?.message || 'Nom de la queue pour les jobs'}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <i className="tabler-list-check" style={{ fontSize: 18, color: '#666' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          )}
        </Grid>

        {/* SSL/TLS */}
        <Grid item xs={12}>
          <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
            <Controller
              name="ssl"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Checkbox
                      {...field}
                      checked={field.value || false}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body1" fontWeight="medium">
                        Activer SSL/TLS
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Requis pour les services cloud comme Upstash, Redis Cloud, AWS ElastiCache, etc.
                      </Typography>
                    </Box>
                  }
                />
              )}
            />
          </Box>
        </Grid>
      </Grid>

      <TestResultAlert result={testResult} isLoading={isTesting} />

      <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button
          variant="outlined"
          color="info"
          onClick={handleTest}
          disabled={isTesting || isSaving}
          startIcon={
            isTesting ? (
              <CircularProgress size={16} />
            ) : (
              <i className="tabler-plug-connected" style={{ fontSize: 18 }} />
            )
          }
        >
          {isTesting ? 'Test en cours...' : 'Tester la connexion'}
        </Button>

        <Button
          variant="outlined"
          color="inherit"
          onClick={handleCancel}
          disabled={isSaving || !isDirty}
        >
          Annuler
        </Button>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={isSaving || !isDirty}
          startIcon={
            isSaving ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <i className="tabler-device-floppy" style={{ fontSize: 18 }} />
            )
          }
        >
          {isSaving ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
      </Box>
    </Box>
  );
}
