'use client';

import React, { useState, useEffect } from 'react';
import { UserRole, ServiceCategoryId, Lead, AIQualificationResult, VehicleInfo, UrgencyLevel } from '@/types/findo';
import { Header } from '@/components/Header';
import { BottomNav, ScreenTab } from '@/components/BottomNav';
import { HomeScreen } from '@/components/screens/HomeScreen';
import { AIServiceRequestScreen } from '@/components/screens/AIServiceRequestScreen';
import { LeadQualificationScreen } from '@/components/screens/LeadQualificationScreen';
import { MatchedBusinessesScreen } from '@/components/screens/MatchedBusinessesScreen';
import { BusinessProfileScreen } from '@/components/screens/BusinessProfileScreen';
import { LeadDetailsScreen } from '@/components/screens/LeadDetailsScreen';
import { BusinessDashboardScreen } from '@/components/screens/BusinessDashboardScreen';
import { LeadHistoryScreen } from '@/components/screens/LeadHistoryScreen';
import { BusinessRegistrationScreen } from '@/components/screens/BusinessRegistrationScreen';
import { PricingScreen } from '@/components/screens/PricingScreen';
import { CategoriesScreen } from '@/components/screens/CategoriesScreen';
import { AdminDashboardScreen } from '@/components/screens/AdminDashboardScreen';
import { leadService } from '@/services/leadService';
import { businessService } from '@/services/businessService';
import { telegramService } from '@/services/telegramService';
import { CheckCircle2, Sparkles } from 'lucide-react';

interface QualificationRequestData {
  query: string;
  vehicle?: VehicleInfo;
  serviceTitle?: string;
  categoryTitleFa?: string;
  mainCategoryId?: string;
  districtId: string;
  districtNameFa: string;
  urgency: UrgencyLevel;
  customerName: string;
  customerPhone: string;
  qualification: AIQualificationResult;
}

export default function FindoPage() {
  const [currentRole, setCurrentRole] = useState<UserRole>('customer');
  const [currentScreen, setCurrentScreen] = useState<ScreenTab>('home');
  const [activeBusinessId, setActiveBusinessId] = useState<string>('biz_kordestan_mechanic');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [selectedBusinessProfileId, setSelectedBusinessProfileId] = useState<string | null>(null);

  // AI Service flow state
  const [aiInitialPrompt, setAiInitialPrompt] = useState<string>('');
  const [aiInitialCategoryId, setAiInitialCategoryId] = useState<string | undefined>(undefined);
  const [qualificationData, setQualificationData] = useState<QualificationRequestData | null>(null);

  // Global Toast / Notice state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // TMA initialization
  useEffect(() => {
    telegramService.init();
  }, []);

  // Unread leads count for business bottom nav
  const [unreadLeadsCount, setUnreadLeadsCount] = useState<number>(0);

  useEffect(() => {
    const updateUnread = () => {
      const businessLeads = leadService.getLeadsForBusiness(activeBusinessId);
      setUnreadLeadsCount(
        businessLeads.filter((l) => l.status === 'created' || l.status === 'dispatched').length
      );
    };
    updateUnread();
    window.addEventListener('findo_leads_updated', updateUnread);
    window.addEventListener('nexa_leads_updated', updateUnread);
    return () => {
      window.removeEventListener('findo_leads_updated', updateUnread);
      window.removeEventListener('nexa_leads_updated', updateUnread);
    };
  }, [activeBusinessId]);

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    if (role === 'customer') {
      setCurrentScreen('home');
    } else if (role === 'business') {
      setCurrentScreen('business_dashboard');
    } else if (role === 'admin') {
      setCurrentScreen('admin_dashboard');
    }
  };

  // Customer navigation handlers
  const handleStartAIRequest = (prompt?: string, categoryId?: string) => {
    setAiInitialPrompt(prompt || '');
    setAiInitialCategoryId(categoryId);
    setQualificationData(null);
    setCurrentScreen('ai_request');
  };

  const handleQualificationComplete = (params: QualificationRequestData) => {
    setQualificationData(params);
  };

  const handleLeadCreated = (createdLead: Lead) => {
    setSelectedLeadId(createdLead.id);
    showToast(`درخواست شما با شناسه #${createdLead.id} با موفقیت در فایندو ثبت شد.`);
    setCurrentScreen('my_leads');
  };

  const handleViewBusinessProfile = (businessId: string) => {
    setSelectedBusinessProfileId(businessId);
  };

  const handleViewLeadDetails = (leadId: string) => {
    setSelectedLeadId(leadId);
  };

  return (
    <div className="min-h-screen bg-[#060a12] text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Header */}
      <Header currentRole={currentRole} onRoleChange={handleRoleChange} />

      {/* Global Toast Alert */}
      {toastMessage && (
        <div className="fixed top-18 right-4 left-4 sm:left-auto sm:right-8 z-50 max-w-md animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-3 rounded-2xl border border-cyan-500/50 bg-slate-900/95 p-4 text-xs font-semibold text-white shadow-2xl backdrop-blur-md">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
        {/* If viewing a single Business Profile Modal/View */}
        {selectedBusinessProfileId ? (
          <BusinessProfileScreen
            businessId={selectedBusinessProfileId}
            onBack={() => setSelectedBusinessProfileId(null)}
            onRequestDirectService={(bizId) => {
              setSelectedBusinessProfileId(null);
              const biz = businessService.getById(bizId);
              handleStartAIRequest(
                `نیاز به خدمات مستقیم در ${biz?.businessNameFa || ''} در سنندج دارم`
              );
            }}
          />
        ) : selectedLeadId ? (
          /* If viewing a single Lead Details Screen */
          <LeadDetailsScreen
            leadId={selectedLeadId}
            currentRole={currentRole}
            activeBusinessId={activeBusinessId}
            onBack={() => setSelectedLeadId(null)}
            onRefresh={() => {
              // trigger rerender
            }}
          />
        ) : (
          /* Route to currently active tab/screen */
          <>
            {/* Customer Screens */}
            {currentScreen === 'home' && (
              <HomeScreen
                onStartAIRequest={(p, c) => handleStartAIRequest(p, c)}
                onSelectCategory={(catId) => handleStartAIRequest(undefined, catId)}
                onViewBusinessRegister={() => {
                  setCurrentRole('business');
                  setCurrentScreen('business_register');
                }}
                onViewMatchedBusinesses={() => setCurrentScreen('matched_businesses')}
              />
            )}

            {currentScreen === 'ai_request' && !qualificationData && (
              <AIServiceRequestScreen
                initialPrompt={aiInitialPrompt}
                initialCategoryId={aiInitialCategoryId}
                onQualificationComplete={handleQualificationComplete}
                onCancel={() => setCurrentScreen('home')}
              />
            )}

            {currentScreen === 'ai_request' && qualificationData && (
              <LeadQualificationScreen
                requestData={qualificationData}
                onLeadCreated={handleLeadCreated}
                onViewBusinessProfile={handleViewBusinessProfile}
                onBack={() => setQualificationData(null)}
              />
            )}

            {currentScreen === 'categories' && (
              <CategoriesScreen
                onSelectCategory={(catId) => handleStartAIRequest(undefined, catId)}
                onRequestWithCategory={(catId) => handleStartAIRequest(undefined, catId)}
              />
            )}

            {currentScreen === 'matched_businesses' && (
              <MatchedBusinessesScreen
                onSelectBusiness={handleViewBusinessProfile}
                onRequestService={(bizId) => {
                  if (bizId) {
                    const b = businessService.getById(bizId);
                    handleStartAIRequest(`درخواست خدمات مستقیم از ${b?.businessNameFa || ''}`);
                  } else {
                    handleStartAIRequest();
                  }
                }}
              />
            )}

            {currentScreen === 'my_leads' && (
              <LeadHistoryScreen
                currentRole={currentRole}
                activeBusinessId={activeBusinessId}
                onViewLeadDetails={handleViewLeadDetails}
                onBack={() => setCurrentScreen(currentRole === 'business' ? 'business_dashboard' : 'home')}
              />
            )}

            {/* Business Screens */}
            {currentScreen === 'business_dashboard' && (
              <BusinessDashboardScreen
                activeBusinessId={activeBusinessId}
                onSelectBusinessId={(id) => setActiveBusinessId(id)}
                onViewLeadDetails={handleViewLeadDetails}
                onOpenPricing={() => setCurrentScreen('business_pricing')}
                onOpenRegisterNew={() => setCurrentScreen('business_register')}
                onViewHistory={() => setCurrentScreen('business_history')}
              />
            )}

            {currentScreen === 'business_history' && (
              <LeadHistoryScreen
                currentRole="business"
                activeBusinessId={activeBusinessId}
                onViewLeadDetails={handleViewLeadDetails}
                onBack={() => setCurrentScreen('business_dashboard')}
              />
            )}

            {currentScreen === 'business_pricing' && (
              <PricingScreen
                activeBusinessId={activeBusinessId}
                onPaymentSuccess={(credits) => {
                  showToast(`${credits} لید اعتباری با موفقیت به حساب شما اضافه شد.`);
                }}
                onBack={() => setCurrentScreen('business_dashboard')}
              />
            )}

            {currentScreen === 'business_register' && (
              <BusinessRegistrationScreen
                onSuccess={(newId) => {
                  setActiveBusinessId(newId);
                  showToast('واحد صنفی شما با ۵ لید هدیه در فایندو فعال شد!');
                  setCurrentRole('business');
                  setCurrentScreen('business_dashboard');
                }}
                onCancel={() => setCurrentScreen(currentRole === 'business' ? 'business_dashboard' : 'home')}
              />
            )}

            {/* Admin Screen */}
            {currentScreen === 'admin_dashboard' && (
              <AdminDashboardScreen onViewLeadDetails={handleViewLeadDetails} />
            )}
          </>
        )}
      </main>

      {/* Bottom Navigation for Mobile & Telegram Mini App */}
      <BottomNav
        currentRole={currentRole}
        currentScreen={currentScreen}
        onSelectScreen={(screen) => {
          setSelectedLeadId(null);
          setSelectedBusinessProfileId(null);
          if (screen === 'ai_request') {
            setQualificationData(null);
          }
          setCurrentScreen(screen);
        }}
        unreadLeadsCount={unreadLeadsCount}
      />
    </div>
  );
}
