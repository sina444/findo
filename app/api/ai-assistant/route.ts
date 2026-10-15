import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: NextRequest) {
  try {
    const { messages, context } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'کلید API هوش مصنوعی تنظیم نشده است. لطفاً GEMINI_API_KEY را در تنظیمات وارد کنید.',
          reply: 'دستیار هوشمند در حال حاضر در دسترس نیست. کلید API تنظیم نشده است.',
        },
        { status: 200 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemPrompt = `تو دستیار هوشمند گلخانه هستی. یک متخصص کشاورزی فارسی‌زبان هستی که در زمینه پرورش گیاهان، آبیاری، کوددهی، تشخیص بیماری‌ها و مدیریت گلخانه تخصص دارد.

قوانین:
- همیشه به زبان فارسی پاسخ بده.
- پاسخ‌هایت علمی، دقیق و کاربردی باشد.
- بین اطلاعات قطعی، تخمین و پیشنهاد تفاوت قائل شو.
- برای توصیه‌های حساس مانند مصرف سموم، تشخیص بیماری یا تنظیمات خطرناک تجهیزات، تأیید متخصص را توصیه کن.
- اگر اطلاعات کافی نداری، صادقانه اعلام کن.
- پاسخ‌ها را با ساختار مناسب و خوانا ارائه بده.

${context ? `اطلاعات گلخانه: ${context}` : ''}`;

    const contents = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents,
      config: {
        systemInstruction: systemPrompt,
      },
    });

    const reply = response.text || 'متاسفانه نتوانستم پاسخی تولید کنم.';

    return NextResponse.json({ reply });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message, reply: 'خطا در پردازش درخواست. لطفاً دوباره تلاش کنید.' },
      { status: 500 }
    );
  }
}
