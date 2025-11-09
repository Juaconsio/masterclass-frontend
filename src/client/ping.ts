import { httpClient } from './config';

export async function pingServer(): Promise<void> {
  try {
    await httpClient.get('/ping');
  } catch (error) {
    console.error('Failed to ping server:', error);
  }
}
