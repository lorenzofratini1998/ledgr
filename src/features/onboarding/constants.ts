import { CategoryColor, CategoryIcon } from '@/features/categories/constants';

export type DefaultCategoryKey = 
  | 'housing'
  | 'food'
  | 'transport'
  | 'utilities'
  | 'entertainment'
  | 'healthcare'
  | 'shopping'
  | 'salary';

export const DEFAULT_ONBOARDING_CATEGORIES: Record<DefaultCategoryKey, { color: CategoryColor; icon: CategoryIcon }> = {
  housing: { color: 'blue', icon: 'home' },
  food: { color: 'amber', icon: 'coffee' },
  transport: { color: 'slate', icon: 'car' },
  utilities: { color: 'cyan', icon: 'zap' },
  entertainment: { color: 'violet', icon: 'heart' },
  healthcare: { color: 'rose', icon: 'heart' },
  shopping: { color: 'fuchsia', icon: 'shopping-cart' },
  salary: { color: 'emerald', icon: 'gift' }
};
