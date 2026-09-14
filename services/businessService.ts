import { BusinessProfile, MainCategoryId, ServiceCategoryId } from '@/types/findo';
import { storageService } from './storageService';

class BusinessService {
  public getAll(): BusinessProfile[] {
    return storageService.getBusinesses();
  }

  public getById(id: string): BusinessProfile | undefined {
    return this.getAll().find((b) => b.id === id);
  }

  public getByMainCategory(mainCategory: MainCategoryId): BusinessProfile[] {
    return this.getAll().filter(
      (b) => b.mainCategory === mainCategory || b.categories.includes(mainCategory as ServiceCategoryId)
    );
  }

  public matchBusinesses(
    categoryId: string,
    mainCategory?: MainCategoryId,
    districtId?: string,
    requiresTowTruck = false,
    hasOnsite = false
  ): Array<{ business: BusinessProfile; matchScore: number; score: number; reasonFa: string; reasons: string[] }> {
    const all = this.getAll();

    return all
      .map((biz) => {
        let score = 40;
        const reasons: string[] = [];

        // Direct subcategory match
        if (biz.categories.includes(categoryId as ServiceCategoryId)) {
          score += 40;
          reasons.push('تخصص مستقیم در خدمت درخواستی');
        } else if (mainCategory && (biz.mainCategory === mainCategory || biz.categories.includes(mainCategory as ServiceCategoryId))) {
          score += 30;
          reasons.push('فعال در این رسته خدمات');
        }

        // District match
        if (districtId && biz.districtId === districtId) {
          score += 18;
          reasons.push('نزدیک‌ترین فاصله و حضور در همین محله');
        } else if (biz.districtId === 'azadi_square' || biz.districtId === 'pasdaran') {
          score += 8;
          reasons.push('دسترسی مرکزی در سنندج');
        }

        // Towing requirement (automotive)
        if (requiresTowTruck) {
          if (biz.hasTowingFleet) {
            score += 25;
            reasons.push('دارای ناوگان یدک‌کش فعال');
          } else {
            score -= 40;
          }
        }

        // Onsite visit requirement
        if (hasOnsite && biz.hasOnsiteService) {
          score += 10;
          reasons.push('ارائه خدمات حضوری در محل مشتری');
        }

        // Quality rating boost
        score += Math.round(biz.rating * 2.5);

        // Cap score at 99%
        const finalScore = Math.min(99, Math.max(20, score));

        return {
          business: biz,
          matchScore: finalScore,
          score: finalScore,
          reasonFa: reasons.length > 0 ? reasons.join(' • ') : 'ارائه‌دهنده خدمات تخصصی در سنندج',
          reasons: reasons.length > 0 ? reasons : ['تخصص و صلاحیت فنی'],
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore);
  }

  public register(data: {
    businessNameFa: string;
    ownerName: string;
    phone: string;
    whatsapp?: string;
    licenseNumber?: string;
    mainCategory?: MainCategoryId;
    categories: ServiceCategoryId[];
    districtId: string;
    districtNameFa: string;
    addressFa: string;
    hasOnsiteService: boolean;
    hasTowingFleet?: boolean;
    yearsInBusiness: number;
    workingHours?: string;
    bioFa: string;
  }): BusinessProfile {
    const all = this.getAll();
    const newBiz: BusinessProfile = {
      id: `biz_${Date.now()}`,
      businessNameFa: data.businessNameFa,
      ownerName: data.ownerName,
      phone: data.phone,
      whatsapp: data.whatsapp,
      licenseNumber: data.licenseNumber || `SN-${Math.floor(1000 + Math.random() * 9000)}`,
      mainCategory: data.mainCategory || 'other_services',
      categories: data.categories,
      districtId: data.districtId,
      districtNameFa: data.districtNameFa,
      addressFa: data.addressFa,
      hasOnsiteService: data.hasOnsiteService,
      hasTowingFleet: Boolean(data.hasTowingFleet),
      yearsInBusiness: data.yearsInBusiness,
      workingHours: data.workingHours || 'همه روزه ۸ الی ۲۱',
      bioFa: data.bioFa,
      rating: 5.0,
      reviewsCount: 1,
      isVerified: true,
      credits: 5, // 5 bonus trial credits
      completedLeadsCount: 0,
      responseSpeedMinutes: 4,
      badges: ['عضو جدید فایندو سنندج', 'دارای اعتبار هدیه'],
      recentReviews: [],
    };

    all.unshift(newBiz);
    storageService.saveBusinesses(all);

    // Also record welcome bonus transaction
    storageService.saveTransaction({
      id: `tx_${Date.now()}`,
      type: 'bonus_award',
      creditsDelta: 5,
      description: `اعتبار هدیه ثبت‌نام برای ${newBiz.businessNameFa}`,
      date: new Date().toLocaleDateString('fa-IR'),
    });

    return newBiz;
  }

  public verify(businessId: string): boolean {
    const all = this.getAll();
    const biz = all.find((b) => b.id === businessId);
    if (!biz) return false;
    biz.isVerified = true;
    if (!biz.badges.includes('تایید صنف سنندج')) {
      biz.badges.push('تایید صنف سنندج');
    }
    storageService.saveBusinesses(all);
    return true;
  }

  public updateCredits(businessId: string, delta: number): boolean {
    const all = this.getAll();
    const biz = all.find((b) => b.id === businessId);
    if (!biz) return false;
    if (biz.credits + delta < 0) return false;

    biz.credits += delta;
    storageService.saveBusinesses(all);
    return true;
  }
}

export const businessService = new BusinessService();
