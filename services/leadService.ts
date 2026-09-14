import { Lead, LeadStatus, ServiceQuote } from '@/types/findo';
import { businessService } from './businessService';
import { storageService } from './storageService';

class LeadService {
  public getAll(): Lead[] {
    return storageService.getLeads();
  }

  public getById(id: string): Lead | undefined {
    return this.getAll().find((l) => l.id === id);
  }

  public getLeadById(id: string): Lead | undefined {
    return this.getById(id);
  }

  public createLead(params: Omit<Lead, 'id' | 'createdAt' | 'status' | 'quotes' | 'unlockedByBusinessIds'>): Lead {
    const all = this.getAll();
    const newLead: Lead = {
      ...params,
      id: `lead_${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'dispatched',
      quotes: [],
      unlockedByBusinessIds: [],
    };

    all.unshift(newLead);
    storageService.saveLeads(all);
    return newLead;
  }

  public unlockContact(leadId: string, businessId: string): { success: boolean; message: string; lead?: Lead } {
    const all = this.getAll();
    const lead = all.find((l) => l.id === leadId);
    if (!lead) return { success: false, message: 'درخواست مورد نظر یافت نشد.' };

    if (lead.unlockedByBusinessIds?.includes(businessId)) {
      return { success: true, message: 'قبلاً شماره تماس بازگشایی شده است.', lead };
    }

    const business = businessService.getById(businessId);
    if (!business || business.credits < 1) {
      return {
        success: false,
        message: 'اعتبار حساب شما برای بازگشایی لید کافی نیست. لطفاً بسته اعتباری خود را شارژ کنید.',
      };
    }

    const updated = businessService.updateCredits(businessId, -1);
    if (!updated) {
      return { success: false, message: 'خطا در کسر اعتبار.' };
    }

    if (!lead.unlockedByBusinessIds) {
      lead.unlockedByBusinessIds = [];
    }
    lead.unlockedByBusinessIds.push(businessId);
    storageService.saveLeads(all);

    const titleDescriptor = lead.vehicle?.model
      ? `${lead.vehicle.brand} ${lead.vehicle.model}`
      : lead.serviceTitle || lead.categoryTitleFa || 'خدمت درخواستی';

    storageService.saveTransaction({
      id: `tx_${Date.now()}`,
      type: 'lead_unlock',
      creditsDelta: -1,
      leadId,
      description: `بازگشایی تماس مشتری: ${lead.customerName} (${titleDescriptor})`,
      date: new Date().toLocaleDateString('fa-IR'),
    });

    return { success: true, message: 'اطلاعات تماس با موفقیت بازگشایی شد.', lead };
  }

  public submitQuote(
    leadId: string,
    quote: {
      businessId: string;
      businessNameFa: string;
      specialistName?: string;
      mechanicName?: string;
      phone: string;
      estimatedCost: number;
      message: string;
      canVisitLocation: boolean;
    }
  ): { success: boolean; quote?: ServiceQuote } {
    const all = this.getAll();
    const lead = all.find((l) => l.id === leadId);
    if (!lead) return { success: false };

    const newQuote: ServiceQuote = {
      id: `quote_${Date.now()}`,
      businessId: quote.businessId,
      businessNameFa: quote.businessNameFa,
      specialistName: quote.specialistName || quote.mechanicName || 'متخصص فایندو',
      mechanicName: quote.mechanicName || quote.specialistName,
      phone: quote.phone,
      estimatedCost: quote.estimatedCost,
      message: quote.message,
      canVisitLocation: quote.canVisitLocation,
      createdAt: new Date().toISOString(),
    };

    if (!lead.quotes) {
      lead.quotes = [];
    }
    lead.quotes.push(newQuote);
    if (lead.status === 'created' || lead.status === 'dispatched') {
      lead.status = 'dispatched';
    }

    storageService.saveLeads(all);
    return { success: true, quote: newQuote };
  }

  public updateStatus(leadId: string, status: LeadStatus, businessId?: string): boolean {
    const all = this.getAll();
    const lead = all.find((l) => l.id === leadId);
    if (!lead) return false;

    lead.status = status;
    if (businessId && status === 'accepted') {
      lead.assignedBusinessId = businessId;
      const biz = businessService.getById(businessId);
      if (biz) {
        biz.completedLeadsCount += 1;
        storageService.saveBusinesses(businessService.getAll());
      }
    }

    storageService.saveLeads(all);
    return true;
  }

  public getLeadsForBusiness(businessId: string): Lead[] {
    const business = businessService.getById(businessId);
    if (!business) return [];

    const all = this.getAll();
    return all.filter((l) => {
      if (l.matchedBusinessIds?.includes(businessId)) return true;
      if (l.assignedBusinessId === businessId) return true;
      if (l.unlockedByBusinessIds?.includes(businessId)) return true;

      // Category match
      if (l.category && (business.mainCategory === l.category || business.categories.includes(l.category))) {
        return true;
      }
      if (l.qualification?.mainCategory && (business.mainCategory === l.qualification.mainCategory || business.categories.includes(l.qualification.mainCategory))) {
        return true;
      }
      if (l.qualification?.categoryId && business.categories.includes(l.qualification.categoryId)) {
        return true;
      }
      return false;
    });
  }
}

export const leadService = new LeadService();
