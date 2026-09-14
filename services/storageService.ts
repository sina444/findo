import { INITIAL_BUSINESSES, INITIAL_LEADS } from '@/data/sanandajData';
import { BusinessProfile, Lead, WalletTransaction } from '@/types/findo';

const STORAGE_KEYS = {
  LEADS: 'findo_leads_v1',
  BUSINESSES: 'findo_businesses_v1',
  TRANSACTIONS: 'findo_transactions_v1',
  ACTIVE_ROLE: 'findo_active_role_v1',
  ACTIVE_BUSINESS_ID: 'findo_active_biz_id_v1',
  CREDITS_PREFIX: 'findo_credits_',
};

class StorageService {
  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  public getLeads(): Lead[] {
    if (!this.isBrowser()) return INITIAL_LEADS as unknown as Lead[];
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LEADS) || localStorage.getItem('nexa_leads_v1');
      if (!stored) {
        localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(INITIAL_LEADS));
        return INITIAL_LEADS as unknown as Lead[];
      }
      return JSON.parse(stored);
    } catch {
      return INITIAL_LEADS as unknown as Lead[];
    }
  }

  public saveLeads(leads: Lead[]) {
    if (!this.isBrowser()) return;
    try {
      localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(leads));
      window.dispatchEvent(new Event('findo_leads_updated'));
      window.dispatchEvent(new Event('nexa_leads_updated'));
    } catch (e) {
      console.error('Failed to save leads to storage', e);
    }
  }

  public getBusinesses(): BusinessProfile[] {
    if (!this.isBrowser()) return INITIAL_BUSINESSES;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.BUSINESSES) || localStorage.getItem('nexa_businesses_v1');
      if (!stored) {
        localStorage.setItem(STORAGE_KEYS.BUSINESSES, JSON.stringify(INITIAL_BUSINESSES));
        return INITIAL_BUSINESSES;
      }
      return JSON.parse(stored);
    } catch {
      return INITIAL_BUSINESSES;
    }
  }

  public saveBusinesses(businesses: BusinessProfile[]) {
    if (!this.isBrowser()) return;
    try {
      localStorage.setItem(STORAGE_KEYS.BUSINESSES, JSON.stringify(businesses));
      window.dispatchEvent(new Event('findo_businesses_updated'));
      window.dispatchEvent(new Event('nexa_businesses_updated'));
    } catch (e) {
      console.error('Failed to save businesses to storage', e);
    }
  }

  public getTransactions(): WalletTransaction[] {
    if (!this.isBrowser()) return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || localStorage.getItem('nexa_transactions_v1');
      if (!stored) {
        const initialTxs: WalletTransaction[] = [
          {
            id: 'tx_bonus_01',
            type: 'bonus_award',
            creditsDelta: 5,
            description: 'هدیه ثبت‌نام و فعال‌سازی پنل اصناف فایندو در سنندج',
            date: new Date(Date.now() - 48 * 3600 * 1000).toLocaleDateString('fa-IR'),
          },
          {
            id: 'tx_pack_01',
            type: 'credit_purchase',
            amountToman: 240000,
            creditsDelta: 20,
            description: 'خرید بسته ۲۰ عددی لید طلایی سنندج',
            date: new Date(Date.now() - 24 * 3600 * 1000).toLocaleDateString('fa-IR'),
          },
        ];
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(initialTxs));
        return initialTxs;
      }
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  public saveTransaction(tx: WalletTransaction) {
    if (!this.isBrowser()) return;
    const all = this.getTransactions();
    all.unshift(tx);
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(all));
    window.dispatchEvent(new Event('findo_transactions_updated'));
    window.dispatchEvent(new Event('nexa_transactions_updated'));
  }
}

export const storageService = new StorageService();
