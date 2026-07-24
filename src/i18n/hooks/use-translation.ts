'use client';

import { useDictionary } from '../dictionary-provider';
import { TranslationKey } from '../types';

export function useTranslation() {
  const dictionary = useDictionary();

  const t = (key: TranslationKey, params?: Record<string, string | number>) => {
    const keys = key.split('.');
    let value: any = dictionary;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; 
      }
    }

    if (typeof value !== 'string') {
      return key; 
    }

    if (params) {
      return Object.entries(params).reduce(
        (acc, [paramKey, paramValue]) => acc.replace(new RegExp(`{${paramKey}}`, 'g'), String(paramValue)),
        value
      );
    }

    return value;
  };

  return { t, dictionary };
}
