// Telegram WebApp API Bridge for NEXA Mini App

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

class TelegramService {
  private isAvailable(): boolean {
    return (
      typeof window !== 'undefined' &&
      Boolean((window as unknown as { Telegram?: { WebApp?: Record<string, unknown> } }).Telegram?.WebApp)
    );
  }

  private get WebApp(): any {
    if (typeof window === 'undefined') return null;
    return (window as unknown as { Telegram?: { WebApp?: any } }).Telegram?.WebApp || null;
  }

  public init() {
    try {
      const wa = this.WebApp;
      if (wa) {
        wa.ready();
        wa.expand();
        // Set header color to match NEXA dark/cyan branding
        if (wa.setHeaderColor) {
          wa.setHeaderColor('#0b1329');
        }
        if (wa.setBackgroundColor) {
          wa.setBackgroundColor('#080d1a');
        }
      }
    } catch (e) {
      console.warn('Telegram WebApp init ignored in non-TMA browser environment', e);
    }
  }

  public isTelegramMiniApp(): boolean {
    return Boolean(this.WebApp?.initData);
  }

  public getUser(): TelegramUser | null {
    try {
      return this.WebApp?.initDataUnsafe?.user || null;
    } catch {
      return null;
    }
  }

  public triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'medium') {
    try {
      const wa = this.WebApp;
      if (!wa?.HapticFeedback) return;

      if (type === 'success' || type === 'warning' || type === 'error') {
        wa.HapticFeedback.notificationOccurred(type);
      } else {
        wa.HapticFeedback.impactOccurred(type);
      }
    } catch {
      // Ignore if not supported
    }
  }

  public showAlert(message: string, callback?: () => void) {
    if (this.WebApp?.showAlert) {
      this.WebApp.showAlert(message, callback);
    } else if (typeof window !== 'undefined') {
      alert(message);
      callback?.();
    }
  }

  public openTelegramChat(username: string) {
    const cleanUser = username.replace('@', '');
    const url = `https://t.me/${cleanUser}`;
    if (this.WebApp?.openTelegramLink) {
      this.WebApp.openTelegramLink(url);
    } else if (typeof window !== 'undefined') {
      window.open(url, '_blank');
    }
  }
}

export const telegramService = new TelegramService();
