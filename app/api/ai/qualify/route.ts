import { GoogleGenAI, Type } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';
import { MainCategoryId, UrgencyLevel, AIQualificationResult } from '@/types/findo';

export async function POST(req: NextRequest) {
  let query = '';
  let itemDetails: any = undefined;
  let vehicle: any = undefined;
  let district = '';

  try {
    const body = await req.json();
    query = body.query || '';
    itemDetails = body.itemDetails;
    vehicle = body.vehicle;
    district = body.district || '';

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'متن درخواست الزامی است' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Graceful fallback to heuristic engine if API key is not configured
      const fallbackResult = generateUniversalHeuristicQualification(query, itemDetails || vehicle, district);
      return NextResponse.json({ qualification: fallbackResult, source: 'heuristic_fallback' });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const prompt = `شما مغز هوش مصنوعی پلتفرم فایندو (FINDO) در شهر سنندج هستید.
شعار فایندو: «نیازت رو بگو؛ متخصصش رو پیدا میکنیم» (Tell us what you need. We find who can do it.)
فایندو یک پلتفرم جامع خدمات محلی هوشمند است که هر نوع نیازی را به زبان طبیعی از کاربر دریافت کرده، ماهیت خدمت را تشخیص داده، درخواست را غربالگری کیفی (Qualification & Triage) نموده و با متخصصین و کسب‌وکارهای متناسب در سنندج تطبیق می‌دهد.
(خدمات خودرویی تنها یکی از ۱۲ دسته تخصصی فایندو است و نباید کل پلتفرم را صرفاً خودرویی فرض کنید.)

متن درخواست کاربر: "${query}"
اطلاعات تکمیلی در صورت وجود: ${itemDetails || vehicle ? JSON.stringify(itemDetails || vehicle) : 'ذکر نشده'}
محله یا منطقه کاربر در سنندج: ${district || 'نامشخص'}

۱۲ دسته خدمات اصلی در فایندو عبارتند از:
1. "automotive": خودرو و حمل‌ونقل (مکانیکی، برق، باتری، یدک‌کش، صافکاری، گیربکس، تنظیم موتور، تعویض روغن)
2. "home_construction": ساختمان و تاسیسات منزل (لوله‌کشی، برق‌کاری، نشت‌یابی، نقاشی، کاشی‌کاری، بنایی)
3. "repair_technical": تعمیرات لوازم خانگی و فنی (پکیج، یخچال، ساید، لباسشویی، کولر، لوازم برقی)
4. "tech_digital": فناوری، موبایل و دیجیتال (تعمیر موبایل، لپ‌تاپ، دوربین مداربسته، شبکه، بازیابی اطلاعات)
5. "medical_dental": پزشکی، دندانپزشکی و سلامت (دندانپزشکی، ویزیت در منزل، پرستاری، سرم، فیزیوتراپی)
6. "legal_consulting": حقوقی، مالی و مشاوره (وکیل ملکی، خانواده، قراردادها، داوری، حسابداری و مالیات)
7. "education": آموزش و تدریس خصوصی (کنکور، تقویتی، زبان انگلیسی، موسیقی، برنامه‌نویسی)
8. "delivery_moving": اسباب‌کشی، باربری و پیک (حمل اثاثیه، خاور مسقف، کارگر باربری، وانت نیسان)
9. "real_estate": املاک و مستغلات (کارشناسی ملک، رهن، اجاره، خرید و فروش، مشارکت)
10. "beauty_wellness": زیبایی و مراقبت فردی (پاکسازی پوست، کراتین، آرایشگاه، ماساژ)
11. "events_dining": پذیرایی، تشریفات و مراسم (کترینگ، فینگرفود، تشریفات، بادکنک‌آرایی، صوت)
12. "other_services": سایر خدمات تخصصی (سمپاشی، خشکشویی، باغبانی، خیاطی، ترجمه رسمی)

وظیفه شما:
متن کاربر را دقیق تحلیل کنید، دسته اصلی را تعیین کنید، نام مشخص خدمت را استخراج نمایید، فوریت و بودجه تخمینی منصفانه بر حسب تومان در سنندج را تخمین بزنید و نکات توصیه‌ای بنویسید.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mainCategory: {
              type: Type.STRING,
              description: 'یکی از ۱۲ دسته اصلی مجاز: automotive, home_construction, repair_technical, tech_digital, medical_dental, legal_consulting, education, delivery_moving, real_estate, beauty_wellness, events_dining, other_services',
            },
            mainCategoryTitleFa: {
              type: Type.STRING,
              description: 'عنوان فارسی دسته اصلی',
            },
            subCategory: {
              type: Type.STRING,
              description: 'شناسه زیردسته در صورت ارتباط (مثلا mechanic, plumbing, refrigerator, mobile_repair)',
            },
            serviceNameFa: {
              type: Type.STRING,
              description: 'عنوان مشخص و دقیق خدمت مورد نیاز کاربر (مثلا: تعمیر گیربکس اتوماتیک پژو ۲۰۶، رفع نشتی لوله آب زیر سینک، تعمیر برد پکیج دیواری بوتان)',
            },
            confidenceScore: {
              type: Type.NUMBER,
              description: 'ضریب اطمینان تطبیق بین ۰ تا ۱',
            },
            detectedSymptoms: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'علائم، نیازمندی‌ها و فاکتورهای کلیدی استخراج‌شده از متن کاربر',
            },
            probableFaultOrScope: {
              type: Type.STRING,
              description: 'شرح عیب‌یابی اولیه یا حوزه کاری مورد نیاز به زبان فارسی دقیق و محترمانه',
            },
            severity: {
              type: Type.STRING,
              description: 'سطح بحرانی/حساسیت کار: low, medium, high, critical',
            },
            urgencyRecommended: {
              type: Type.STRING,
              description: 'سطح فوریت پیشنهادی: emergency (اورژانسی)، today (امروز)، flexible (منعطف)',
            },
            requiresOnSiteVisit: {
              type: Type.BOOLEAN,
              description: 'آیا نیاز به حضور فیزیکی متخصص در محل مشتری است؟',
            },
            estimatedPriceMin: {
              type: Type.NUMBER,
              description: 'حداقل برآورد منطقی اجرت/هزینه خدمت به تومان (عدد خالص)',
            },
            estimatedPriceMax: {
              type: Type.NUMBER,
              description: 'حداکثر برآورد منطقی اجرت/هزینه خدمت به تومان (عدد خالص)',
            },
            estimatedDuration: {
              type: Type.STRING,
              description: 'تخمین زمان انجام کار (مثلا: ۳۰ الی ۴۵ دقیقه، ۲ الی ۴ ساعت)',
            },
            recommendedActionsFa: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'اقدامات مهم، ایمنی یا پیش‌نیازهایی که کاربر باید قبل از رسیدن متخصص انجام دهد',
            },
            questionsToClarify: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'سوالات اختیاری تکمیلی برای شفاف‌سازی بهتر جزئیات با متخصص',
            },
            // Automotive specific fields:
            requiresTowTruck: {
              type: Type.BOOLEAN,
              description: 'در صورت خودرویی بودن: آیا نیاز به یدک‌کش یا حمل خودرو است؟',
            },
            canDriveSafely: {
              type: Type.BOOLEAN,
              description: 'در صورت خودرویی بودن: آیا حرکت خودرو تا تعمیرگاه ایمن است؟',
            },
          },
          required: [
            'mainCategory',
            'mainCategoryTitleFa',
            'serviceNameFa',
            'confidenceScore',
            'detectedSymptoms',
            'probableFaultOrScope',
            'severity',
            'urgencyRecommended',
            'requiresOnSiteVisit',
            'estimatedPriceMin',
            'estimatedPriceMax',
            'estimatedDuration',
            'recommendedActionsFa',
          ],
        },
      },
    });

    const text = response.text?.trim();
    if (!text) {
      throw new Error('پاسخ خالی از هوش مصنوعی دریافت شد');
    }

    const raw = JSON.parse(text);

    // Normalize result with all compatibility flags
    const qualification: AIQualificationResult = {
      mainCategory: (raw.mainCategory as MainCategoryId) || 'other_services',
      mainCategoryTitleFa: raw.mainCategoryTitleFa || 'خدمات تخصصی',
      subCategory: raw.subCategory || undefined,
      serviceNameFa: raw.serviceNameFa || raw.mainCategoryTitleFa || 'خدمات عمومی',
      confidenceScore: typeof raw.confidenceScore === 'number' ? raw.confidenceScore : 0.92,
      detectedSymptoms: Array.isArray(raw.detectedSymptoms) ? raw.detectedSymptoms : [],
      probableFaultOrScope: raw.probableFaultOrScope || raw.serviceNameFa,
      probableFault: raw.probableFaultOrScope || raw.serviceNameFa, // backward compatibility
      severity: (raw.severity as 'low' | 'medium' | 'high' | 'critical') || 'medium',
      urgencyRecommended: (raw.urgencyRecommended as UrgencyLevel) || 'today',
      targetBudgetEstimate: {
        minToman: raw.estimatedPriceMin || 200000,
        maxToman: raw.estimatedPriceMax || 1000000,
        description: `بین ${(raw.estimatedPriceMin || 200000).toLocaleString('fa-IR')} تا ${(raw.estimatedPriceMax || 1000000).toLocaleString('fa-IR')} تومان`,
      },
      requiresOnSiteVisit: Boolean(raw.requiresOnSiteVisit),
      estimatedPriceMin: raw.estimatedPriceMin || 200000,
      estimatedPriceMax: raw.estimatedPriceMax || 1000000,
      estimatedDuration: raw.estimatedDuration || '۱ تا ۲ ساعت',
      recommendedActionsFa: Array.isArray(raw.recommendedActionsFa) ? raw.recommendedActionsFa : [],
      questionsToClarify: Array.isArray(raw.questionsToClarify) ? raw.questionsToClarify : [],
      requiresTowTruck: Boolean(raw.requiresTowTruck),
      canDriveSafely: raw.canDriveSafely !== undefined ? Boolean(raw.canDriveSafely) : true,
      categoryId: raw.subCategory || raw.mainCategory,
      categoryTitleFa: raw.serviceNameFa || raw.mainCategoryTitleFa,
      titleFa: raw.serviceNameFa || raw.mainCategoryTitleFa,
      probableCause: raw.probableFaultOrScope || raw.serviceNameFa,
      estimatedCostTomanMin: raw.estimatedPriceMin || 200000,
      estimatedCostTomanMax: raw.estimatedPriceMax || 1000000,
    };

    return NextResponse.json({ qualification, source: 'gemini' });
  } catch (error) {
    console.error('FINDO AI qualification error:', error);
    const fallback = generateUniversalHeuristicQualification(query || 'درخواست خدمات محلی', itemDetails || vehicle, district);
    return NextResponse.json({ qualification: fallback, source: 'fallback_on_error' });
  }
}

function normalizeQualification(raw: Partial<AIQualificationResult>): AIQualificationResult {
  const minCost = raw.estimatedCostTomanMin ?? raw.estimatedPriceMin ?? 200000;
  const maxCost = raw.estimatedCostTomanMax ?? raw.estimatedPriceMax ?? 1000000;
  const name = raw.serviceNameFa || raw.titleFa || raw.mainCategoryTitleFa || 'خدمات تخصصی';

  return {
    ...raw,
    mainCategory: raw.mainCategory || 'other_services',
    mainCategoryTitleFa: raw.mainCategoryTitleFa || 'سایر خدمات تخصصی',
    subCategory: raw.subCategory,
    serviceNameFa: name,
    titleFa: name,
    confidenceScore: raw.confidenceScore ?? 0.92,
    detectedSymptoms: raw.detectedSymptoms || [],
    probableFaultOrScope: raw.probableFaultOrScope || raw.probableFault || name,
    probableFault: raw.probableFault || raw.probableFaultOrScope || name,
    probableCause: raw.probableCause || raw.probableFaultOrScope || raw.probableFault || name,
    severity: raw.severity || 'medium',
    urgencyRecommended: raw.urgencyRecommended || 'today',
    requiresOnSiteVisit: raw.requiresOnSiteVisit !== undefined ? raw.requiresOnSiteVisit : true,
    estimatedPriceMin: minCost,
    estimatedPriceMax: maxCost,
    estimatedCostTomanMin: minCost,
    estimatedCostTomanMax: maxCost,
    targetBudgetEstimate: raw.targetBudgetEstimate || {
      minToman: minCost,
      maxToman: maxCost,
      description: `بین ${minCost.toLocaleString('fa-IR')} تا ${maxCost.toLocaleString('fa-IR')} تومان`,
    },
    estimatedDuration: raw.estimatedDuration || '۱ الی ۲ ساعت',
    recommendedActionsFa: raw.recommendedActionsFa || [],
    immediateActionTips: raw.immediateActionTips || raw.recommendedActionsFa || [],
    questionsToClarify: raw.questionsToClarify || [],
    requiresTowTruck: Boolean(raw.requiresTowTruck),
    canDriveSafely: raw.canDriveSafely !== undefined ? raw.canDriveSafely : true,
    categoryId: raw.categoryId || raw.subCategory || raw.mainCategory,
    categoryTitleFa: raw.categoryTitleFa || name,
  };
}

// Resilient heuristic engine supporting all 12 FINDO categories with Persian keyword parsing
function generateUniversalHeuristicQualification(
  query: string,
  extraDetails?: Record<string, unknown>,
  district?: string
): AIQualificationResult {
  return normalizeQualification(internalHeuristicQualification(query, extraDetails, district));
}

function internalHeuristicQualification(
  query: string,
  extraDetails?: Record<string, unknown>,
  district?: string
): Partial<AIQualificationResult> {
  const q = query.toLowerCase();

  // 1. Home & Construction
  if (
    q.includes('لوله') ||
    q.includes('چکه') ||
    q.includes('نشت') ||
    q.includes('سینک') ||
    q.includes('فاضلاب') ||
    q.includes('شیرآلات') ||
    q.includes('گچکاری') ||
    q.includes('کاشی') ||
    q.includes('نقاشی ساختمان') ||
    q.includes('برقکاری ساختمان') ||
    q.includes('فیوز ساختمان')
  ) {
    const isLeak = q.includes('نشت') || q.includes('چکه') || q.includes('لوله');
    return {
      mainCategory: 'home_construction',
      mainCategoryTitleFa: 'ساختمان و تاسیسات منزل',
      subCategory: isLeak ? 'plumbing' : 'home_electrical',
      serviceNameFa: isLeak ? 'رفع نشتی و تعمیر لوله‌کشی ساختمان' : 'خدمات فنی و تاسیسات ساختمانی',
      confidenceScore: 0.94,
      detectedSymptoms: ['نقص در شبکه لوله‌کشی یا اتصالات ساختمانی', 'نیاز به حضور تکنسین تاسیسات'],
      probableFaultOrScope: 'خرابی اتصالات، نشت آب یا ایراد در شیرآلات که نیازمند بررسی حضوری و آب‌بندی استاندارد است.',
      probableFault: 'خرابی اتصالات یا نشت آب در تاسیسات ساختمان',
      severity: isLeak ? 'high' : 'medium',
      urgencyRecommended: isLeak ? 'emergency' : 'today',
      requiresOnSiteVisit: true,
      estimatedPriceMin: 250000,
      estimatedPriceMax: 850000,
      estimatedDuration: '۴۵ دقیقه الی ۲ ساعت',
      recommendedActionsFa: [
        'فلکه اصلی ورودی آب ساختمان را تا رسیدن متخصص ببندید',
        'محیط خیس شده را جهت جلوگیری از سر خوردن خشک کنید',
      ],
      questionsToClarify: ['آیا محل نشتی مشخص است یا نیاز به دستگاه نشت‌یاب دارد؟'],
      categoryId: 'home_construction',
      categoryTitleFa: 'ساختمان و تاسیسات منزل',
    };
  }

  // 2. Repair & Technical (Appliances, Package, etc.)
  if (
    q.includes('پکیج') ||
    q.includes('آبگرمکن') ||
    q.includes('رادیاتور') ||
    q.includes('یخچال') ||
    q.includes('ساید') ||
    q.includes('لباسشویی') ||
    q.includes('ظرفشویی') ||
    q.includes('کولر') ||
    q.includes('اسپلیت')
  ) {
    const isPackage = q.includes('پکیج') || q.includes('آبگرمکن');
    const isFridge = q.includes('یخچال') || q.includes('ساید');
    const name = isPackage
      ? 'سرویس و عیب‌یابی پکیج دیواری و رادیاتور'
      : isFridge
        ? 'تعمیر و عیب‌یابی تخصصی یخچال و فریزر'
        : 'تعمیر و سرویس لوازم خانگی در محل';
    return {
      mainCategory: 'repair_technical',
      mainCategoryTitleFa: 'تعمیرات لوازم خانگی و فنی',
      subCategory: isPackage ? 'heating_package' : isFridge ? 'refrigerator' : 'washing_machine',
      serviceNameFa: name,
      confidenceScore: 0.95,
      detectedSymptoms: ['عدم کارکرد صحیح دستگاه', 'نیاز به بررسی قطعات مصرفی یا برد الکترونیکی'],
      probableFaultOrScope: isPackage
        ? 'افت فشار منبع، رسوب‌گرفتگی مبدل یا اشکال در سنسور دمای NTC پکیج'
        : 'نقص در ترموستات، کمپرسور یا نشت گاز مبرد دستگاه',
      probableFault: 'نقص فنی قطعات الکترومکانیکی یا رسوب‌گرفتگی سیستم',
      severity: 'medium',
      urgencyRecommended: isPackage ? 'emergency' : 'today',
      requiresOnSiteVisit: true,
      estimatedPriceMin: 350000,
      estimatedPriceMax: 1200000,
      estimatedDuration: '۱ الی ۲ ساعت',
      recommendedActionsFa: [
        'در صورت بوی سوختگی یا مشاهده اتصالی، دوشاخه برق را بکشید',
        'مدل دقیق دستگاه را جهت آماده‌سازی قطعات یدکی به متخصص اعلام فرمایید',
      ],
      categoryId: 'repair_technical',
      categoryTitleFa: 'تعمیرات لوازم خانگی و فنی',
    };
  }

  // 3. Tech & Digital
  if (
    q.includes('موبایل') ||
    q.includes('گوشی') ||
    q.includes('آیفون') ||
    q.includes('سامسونگ') ||
    q.includes('لپتاپ') ||
    q.includes('لپ‌تاپ') ||
    q.includes('کامپیوتر') ||
    q.includes('ویندوز') ||
    q.includes('دوربین مداربسته') ||
    q.includes('هارد') ||
    q.includes('اطلاعات')
  ) {
    return {
      mainCategory: 'tech_digital',
      mainCategoryTitleFa: 'فناوری، موبایل و دیجیتال',
      subCategory: q.includes('لپ') ? 'laptop_pc' : 'mobile_repair',
      serviceNameFa: q.includes('لپ') ? 'تعمیرات تخصصی سخت‌افزار لپ‌تاپ' : 'تعمیر و تعویض قطعات موبایل و تبلت',
      confidenceScore: 0.93,
      detectedSymptoms: ['نقص در عملکرد سخت‌افزاری یا نمایشگر دستگاه دیجیتال'],
      probableFaultOrScope: 'آسیب به ال‌سی‌دی، فلت تصویر، باتری یا چیپ تغذیه دستگاه الکترونیکی',
      probableFault: 'خرابی قطعات سخت‌افزاری دیجیتال یا اختلال سیستم‌عامل',
      severity: 'medium',
      urgencyRecommended: 'today',
      requiresOnSiteVisit: false,
      estimatedPriceMin: 200000,
      estimatedPriceMax: 1800000,
      estimatedDuration: '۱ الی ۳ ساعت',
      recommendedActionsFa: [
        'دستگاه ضربه‌خورده را به شارژر متصل نکنید',
        'اگر دستگاه در آب افتاده، سریعاً آن را خاموش کنید',
      ],
      categoryId: 'tech_digital',
      categoryTitleFa: 'فناوری، موبایل و دیجیتال',
    };
  }

  // 4. Legal & Consulting
  if (
    q.includes('وکیل') ||
    q.includes('وکالت') ||
    q.includes('حقوقی') ||
    q.includes('دادگاه') ||
    q.includes('قرارداد') ||
    q.includes('ملکی') ||
    q.includes('چک') ||
    q.includes('مهریه') ||
    q.includes('وراثت') ||
    q.includes('مالیات')
  ) {
    return {
      mainCategory: 'legal_consulting',
      mainCategoryTitleFa: 'حقوقی، مالی و مشاوره',
      subCategory: 'legal_counsel',
      serviceNameFa: 'مشاوره حقوقی تخصصی و تنظیم لوایح',
      confidenceScore: 0.96,
      detectedSymptoms: ['پرونده حقوقی یا نیاز به تنظیم و بازبینی قرارداد قانونی'],
      probableFaultOrScope: 'بررسی مدارک اثباتی، تدوین استراتژی دفاع در محاکم یا تنظیم قرارداد محکم حقوقی',
      probableFault: 'نیاز به ارزیابی ادله و تنظیم متن حقوقی تخصصی',
      severity: 'medium',
      urgencyRecommended: 'flexible',
      requiresOnSiteVisit: false,
      estimatedPriceMin: 400000,
      estimatedPriceMax: 2000000,
      estimatedDuration: '۱ ساعت جلسه کارشناسی',
      recommendedActionsFa: [
        'کلیه اسناد و مدارک مرتبط با موضوع را جهت بررسی همراه داشته باشید',
        'پیش از هرگونه امضا، متن قرارداد را با وکیل متخصص بررسی نمایید',
      ],
      categoryId: 'legal_consulting',
      categoryTitleFa: 'حقوقی، مالی و مشاوره',
    };
  }

  // 5. Medical & Dental
  if (
    q.includes('دندان') ||
    q.includes('ایمپلنت') ||
    q.includes('پزشک') ||
    q.includes('دکتر') ||
    q.includes('پرستار') ||
    q.includes('سرم') ||
    q.includes('تزریق') ||
    q.includes('فیزیوتراپی') ||
    q.includes('بیمار')
  ) {
    return {
      mainCategory: 'medical_dental',
      mainCategoryTitleFa: 'پزشکی، دندانپزشکی و سلامت',
      subCategory: q.includes('دندان') ? 'dental' : 'home_nursing',
      serviceNameFa: q.includes('دندان') ? 'خدمات دندانپزشکی و ترمیم دندان' : 'خدمات پرستاری و درمانی در منزل',
      confidenceScore: 0.95,
      detectedSymptoms: ['نیاز به خدمات مراقبتی، بهداشتی یا دندانپزشکی تخصصی'],
      probableFaultOrScope: 'درمان علائم بالینی، معاینه بالینی یا انجام امور درمانی با رعایت پروتکل‌های بهداشتی',
      probableFault: 'نیاز به مداخلات درمانی و بالینی بهداشتی',
      severity: 'high',
      urgencyRecommended: q.includes('سرم') || q.includes('تزریق') ? 'emergency' : 'today',
      requiresOnSiteVisit: !q.includes('دندان'),
      estimatedPriceMin: 200000,
      estimatedPriceMax: 2500000,
      estimatedDuration: '۳۰ الی ۶۰ دقیقه',
      recommendedActionsFa: [
        'سوابق بیماری و داروهای مصرفی را به کادر درمان اطلاع دهید',
        'در موارد تنگی نفس یا درد قفسه سینه مستقیماً با اورژانس ۱۱۵ تماس بگیرید',
      ],
      categoryId: 'medical_dental',
      categoryTitleFa: 'پزشکی، دندانپزشکی و سلامت',
    };
  }

  // 6. Delivery & Moving
  if (
    q.includes('اسباب') ||
    q.includes('اثاث') ||
    q.includes('باربری') ||
    q.includes('خاور') ||
    q.includes('وانت') ||
    q.includes('نیسان') ||
    q.includes('پیک') ||
    q.includes('حمل بار')
  ) {
    return {
      mainCategory: 'delivery_moving',
      mainCategoryTitleFa: 'اسباب‌کشی، باربری و پیک',
      subCategory: 'freight_moving',
      serviceNameFa: 'اسباب‌کشی و جابجایی اثاثیه منزل با خاور مسقف',
      confidenceScore: 0.97,
      detectedSymptoms: ['جابجایی وسایل و اثاثیه حجیم و حساس منزل یا شرکت'],
      probableFaultOrScope: 'بسته‌بندی، چیدمان درون خودروی موکت‌پوش، حمل ایمن طبقاتی و تخلیه در مقصد',
      probableFault: 'نیاز به خودروی باربری مجهز و کارگر متخصص جابجایی',
      severity: 'medium',
      urgencyRecommended: 'today',
      requiresOnSiteVisit: true,
      estimatedPriceMin: 800000,
      estimatedPriceMax: 3500000,
      estimatedDuration: '۳ الی ۵ ساعت',
      recommendedActionsFa: [
        'اشیاء قیمتی و مدارک شخصی را جداگانه حمل نمایید',
        'مسیر تردد آسانسور و راه پله را قبل از حضور تیم باربری خالی نگه دارید',
      ],
      categoryId: 'delivery_moving',
      categoryTitleFa: 'اسباب‌کشی، باربری و پیک',
    };
  }

  // 7. Education
  if (
    q.includes('تدریس') ||
    q.includes('معلم') ||
    q.includes('کنکور') ||
    q.includes('کلاس') ||
    q.includes('آموزش') ||
    q.includes('ریاضی') ||
    q.includes('فیزیک') ||
    q.includes('زیست') ||
    q.includes('زبان') ||
    q.includes('انگلیسی')
  ) {
    return {
      mainCategory: 'education',
      mainCategoryTitleFa: 'آموزش و تدریس خصوصی',
      subCategory: 'school_tutoring',
      serviceNameFa: 'تدریس خصوصی و رفع اشکال دروس کنکور و مدرسه',
      confidenceScore: 0.94,
      detectedSymptoms: ['تقویت بنیه علمی دانش‌آموز یا دانشجو در مباحث درسی'],
      probableFaultOrScope: 'آموزش مفهومی سرفصل‌ها، حل تست‌های استاندارد و ارائه برنامه مطالعاتی منسجم',
      probableFault: 'نیاز به آموزش تخصصی و برنامه یادگیری فردی',
      severity: 'low',
      urgencyRecommended: 'flexible',
      requiresOnSiteVisit: true,
      estimatedPriceMin: 200000,
      estimatedPriceMax: 500000,
      estimatedDuration: '۹۰ دقیقه هر جلسه',
      recommendedActionsFa: [
        'مباحث مبهم و اشکالات کتاب درسی را از قبل علامت‌گذاری نمایید',
        'محیطی آرام برای برگزاری جلسه آموزشی فراهم فرمایید',
      ],
      categoryId: 'education',
      categoryTitleFa: 'آموزش و تدریس خصوصی',
    };
  }

  // 8. Automotive (Fallback or detected)
  const isAuto =
    q.includes('ماشین') ||
    q.includes('خودرو') ||
    q.includes('موتور') ||
    q.includes('پژو') ||
    q.includes('پراید') ||
    q.includes('سمند') ||
    q.includes('دنا') ||
    q.includes('تارا') ||
    q.includes('۲۰۶') ||
    q.includes('۲۰۷') ||
    q.includes('۴۰۵') ||
    q.includes('باتری') ||
    q.includes('باطری') ||
    q.includes('یدک') ||
    q.includes('پنچری') ||
    q.includes('گیربکس') ||
    q.includes('صافکاری') ||
    q.includes('جلوبندی') ||
    q.includes('دیاگ') ||
    q.includes('روغن') ||
    q.includes('تعمیرکار');

  let subCategory = 'mechanic';
  let serviceNameFa = 'مکانیکی و عیب‌یابی فنی خودرو';
  let requiresTowTruck = false;
  let canDriveSafely = true;
  let minPrice = 300000;
  let maxPrice = 1400000;
  let urgency: UrgencyLevel = 'today';

  if (q.includes('باتری') || q.includes('باطری') || q.includes('استارت نم')) {
    subCategory = 'battery';
    serviceNameFa = 'امداد باتری و عیب‌یابی برق در محل';
    urgency = 'emergency';
    minPrice = 1800000;
    maxPrice = 2500000;
  } else if (q.includes('یدک') || q.includes('بکسل') || q.includes('خاموش شده') || q.includes('تصادف')) {
    subCategory = 'towing';
    serviceNameFa = 'یدک‌کش و خودروبر کفی شبانه‌روزی';
    urgency = 'emergency';
    requiresTowTruck = true;
    canDriveSafely = false;
    minPrice = 250000;
    maxPrice = 600000;
  } else if (q.includes('صافکاری') || q.includes('pdr')) {
    subCategory = 'body_paint';
    serviceNameFa = 'صافکاری PDR بدون رنگ و نقاشی';
    urgency = 'flexible';
    minPrice = 600000;
    maxPrice = 2800000;
  } else if (q.includes('گیربکس') || q.includes('دنده') || q.includes('کلاچ')) {
    subCategory = 'gearbox';
    serviceNameFa = 'تعمیر تخصصی گیربکس و کلاچ خودرو';
    minPrice = 500000;
    maxPrice = 4000000;
  }

  return {
    mainCategory: isAuto ? 'automotive' : 'other_services',
    mainCategoryTitleFa: isAuto ? 'خودرو و حمل‌ونقل' : 'سایر خدمات تخصصی',
    subCategory,
    serviceNameFa: isAuto ? serviceNameFa : 'خدمات تخصصی درخواستی',
    confidenceScore: 0.91,
    detectedSymptoms: [query],
    probableFaultOrScope: isAuto
      ? 'بررسی فنی و عیب‌یابی بخش‌های مکانیکی یا الکترونیکی خودرو'
      : 'بررسی دقیق نیاز اعلامی مشتری و ارجاع به نزدیک‌ترین متخصص سنندج',
    probableFault: isAuto ? 'نقص عملکرد سیستم فنی خودرو' : 'بررسی نیاز اعلامی مشتری',
    severity: requiresTowTruck ? 'critical' : 'medium',
    urgencyRecommended: urgency,
    requiresOnSiteVisit: true,
    estimatedPriceMin: minPrice,
    estimatedPriceMax: maxPrice,
    estimatedDuration: '۱ الی ۲ ساعت',
    recommendedActionsFa: [
      'اطلاعات و جزییات آدرس در سنندج را آماده داشته باشید',
      'قبل از شروع کار هزینه نهایی را با متخصص نهایی کنید',
    ],
    requiresTowTruck,
    canDriveSafely,
    categoryId: subCategory,
    categoryTitleFa: serviceNameFa,
  };
}
