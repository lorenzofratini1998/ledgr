import { z } from 'zod';

export const notificationTypeEnum = z.enum([
  'budget_warning',
  'budget_exceeded',
  'recurring_reminder',
  'system',
]);

export const markNotificationAsReadSchema = z.object({
  id: z.string().uuid('Invalid notification ID'),
});

export type MarkNotificationAsReadPayload = z.infer<typeof markNotificationAsReadSchema>;

export const deleteNotificationSchema = z.object({
  id: z.string().uuid('Invalid notification ID'),
});

export type DeleteNotificationPayload = z.infer<typeof deleteNotificationSchema>;

export const savePushSubscriptionSchema = z.object({
  device_name: z.string().min(1, 'Device name is required').max(100),
  subscription_payload: z.object({
    endpoint: z.string().url('Invalid endpoint URL'),
    expirationTime: z.number().nullable().optional(),
    keys: z.object({
      p256dh: z.string().min(1, 'p256dh key is required'),
      auth: z.string().min(1, 'auth secret is required'),
    }),
  }),
});

export type SavePushSubscriptionPayload = z.infer<typeof savePushSubscriptionSchema>;

export const deletePushSubscriptionSchema = z.object({
  device_name: z.string().min(1, 'Device name is required'),
});

export type DeletePushSubscriptionPayload = z.infer<typeof deletePushSubscriptionSchema>;
