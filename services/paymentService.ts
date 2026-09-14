import { CREDIT_PACKAGES } from '@/data/sanandajData';
import { CreditPackage, WalletTransaction } from '@/types/findo';
import { businessService } from './businessService';
import { storageService } from './storageService';

class PaymentService {
  public getPackages(): CreditPackage[] {
    return CREDIT_PACKAGES;
  }

  public getPackageById(packageId: string): CreditPackage | undefined {
    return this.getPackages().find((p) => p.id === packageId);
  }

  public getTransactions(): WalletTransaction[] {
    return storageService.getTransactions();
  }

  public processPurchase(
    packageId: string,
    businessId: string
  ): { success: boolean; message: string; transaction?: WalletTransaction } {
    const pkg = this.getPackageById(packageId);
    if (!pkg) {
      return { success: false, message: 'بسته انتخابی نامعتبر است.' };
    }

    const biz = businessService.getById(businessId);
    if (!biz) {
      return { success: false, message: 'پروفایل کسب‌وکار یافت نشد.' };
    }

    // Add credits to business
    businessService.updateCredits(businessId, pkg.leadsCount);

    const tx: WalletTransaction = {
      id: `tx_pay_${Date.now()}`,
      type: 'credit_purchase',
      amountToman: pkg.priceToman,
      creditsDelta: pkg.leadsCount,
      description: `خرید ${pkg.titleFa} (${pkg.leadsCount} لید)`,
      date: new Date().toLocaleDateString('fa-IR'),
    };

    storageService.saveTransaction(tx);

    return {
      success: true,
      message: `تراکنش موفق! ${pkg.leadsCount} اعتبار به کیف پول شما در سنندج اضافه شد.`,
      transaction: tx,
    };
  }

  public purchaseCredits(
    businessId: string,
    packageId: string
  ): { success: boolean; message: string; transaction?: WalletTransaction } {
    return this.processPurchase(packageId, businessId);
  }
}

export const paymentService = new PaymentService();
