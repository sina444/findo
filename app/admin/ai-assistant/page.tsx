'use client';

import { useEffect, useState, useRef } from 'react';
import { Bot, Send, Sparkles, Trash2 } from 'lucide-react';
import { apiPost, apiGet, apiDelete, type ChatConversation } from '@/lib/greenhouse-api';
import { PageHeader, SectionCard, EmptyState } from '@/components/admin/GreenhouseUI';

interface Message { role: 'user' | 'assistant'; content: string; timestamp: string }

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    apiGet<ChatConversation[]>('/chat-conversations').then(data => {
      setConversations(data);
      if (data.length > 0) {
        setActiveConvId(data[0].id);
        setMessages(JSON.parse(data[0].messages || '[]'));
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: input.trim(), timestamp: new Date().toISOString() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await apiPost<{ reply: string; error?: string }>('/ai-assistant', { messages: newMessages });
      const assistantMsg: Message = { role: 'assistant', content: res.reply, timestamp: new Date().toISOString() };
      const updated = [...newMessages, assistantMsg];
      setMessages(updated);

      // Save conversation
      if (activeConvId) {
        await apiPost('/chat-conversations', { id: activeConvId, title: newMessages[0]?.content.slice(0, 30) || 'گفتگو', messages: JSON.stringify(updated) });
      } else {
        const conv = await apiPost<ChatConversation>('/chat-conversations', { title: userMsg.content.slice(0, 30), messages: JSON.stringify(updated) });
        setActiveConvId(conv.id);
        setConversations([conv, ...conversations]);
      }
    } catch {
      const errorMsg: Message = { role: 'assistant', content: 'خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید.', timestamp: new Date().toISOString() };
      setMessages([...newMessages, errorMsg]);
    }
    setLoading(false);
  };

  const newConversation = () => {
    setActiveConvId(null);
    setMessages([]);
  };

  const selectConversation = (conv: ChatConversation) => {
    setActiveConvId(conv.id);
    setMessages(JSON.parse(conv.messages || '[]'));
  };

  const deleteConversation = async (id: string) => {
    await apiDelete(`/chat-conversations/${id}`);
    const updated = conversations.filter(c => c.id !== id);
    setConversations(updated);
    if (activeConvId === id) { setActiveConvId(null); setMessages([]); }
  };

  return (
    <div>
      <PageHeader title="دستیار هوشمند گلخانه" subtitle="مشاوره کشاورزی هوشمند با هوش مصنوعی" action={
        <button onClick={newConversation} className="flex items-center gap-2 rounded-lg border border-[#3F6B45] px-4 py-2 text-sm font-medium text-[#3F6B45] hover:bg-[#E8F0E5]">
          <Sparkles className="h-4 w-4" /> گفتگوی جدید
        </button>
      } />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        {/* Conversations list */}
        <div className="lg:col-span-1">
          <SectionCard title="گفتگوها">
            {conversations.length === 0 ? <EmptyState title="گفتگویی وجود ندارد" icon={Bot} /> : (
              <div className="space-y-1">
                {conversations.map(conv => (
                  <div key={conv.id} className={`flex items-center justify-between rounded-lg p-2 text-sm cursor-pointer ${activeConvId === conv.id ? 'bg-[#E8F0E5] text-[#3F6B45]' : 'hover:bg-[#F7F5EC] text-[#687067]'}`}
                    onClick={() => selectConversation(conv)}>
                    <span className="truncate">{conv.title}</span>
                    <button onClick={(e) => { e.stopPropagation(); deleteConversation(conv.id); }} className="text-red-400 hover:text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        {/* Chat area */}
        <div className="lg:col-span-3">
          <SectionCard className="flex h-[600px] flex-col">
            <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-2">
              {messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#E8F0E5]">
                    <Bot className="h-8 w-8 text-[#3F6B45]" />
                  </div>
                  <p className="text-lg font-bold text-[#20251F]">دستیار هوشمند گلخانه</p>
                  <p className="mt-1 text-sm text-[#687067]">سؤالات خود درباره پرورش گیاهان، آبیاری، کوددهی و مدیریت گلخانه بپرسید</p>
                  <div className="mt-6 grid grid-cols-2 gap-2">
                    {['بهترین روش آبیاری گوجه‌فرنگی چیست؟', 'چه زمانی باید کود بدهم؟', 'علت زرد شدن برگ‌ها چیست؟', 'برنامه مراقبت هفتگی پیشنهاد بده'].map(q => (
                      <button key={q} onClick={() => setInput(q)} className="rounded-lg border border-[#E8F0E5] bg-white px-3 py-2 text-xs text-[#687067] hover:border-[#3F6B45] hover:text-[#3F6B45]">{q}</button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === 'user' ? 'bg-[#3F6B45] text-white' : 'bg-[#F7F5EC] text-[#20251F]'}`}>
                      <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                    </div>
                  </div>
                ))
              )}
              {loading && (
                <div className="flex justify-end">
                  <div className="rounded-2xl bg-[#F7F5EC] px-4 py-3">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-[#7FA77D]" style={{ animationDelay: '0ms' }} />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-[#7FA77D]" style={{ animationDelay: '150ms' }} />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-[#7FA77D]" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-[#E8F0E5] p-3">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  placeholder="سؤال خود را بنویسید..."
                  className="flex-1 rounded-lg border border-[#E8F0E5] bg-white px-4 py-2 text-sm outline-none focus:border-[#3F6B45]"
                  disabled={loading}
                />
                <button onClick={handleSend} disabled={loading || !input.trim()} className="flex items-center gap-2 rounded-lg bg-[#3F6B45] px-4 py-2 text-sm font-medium text-white hover:bg-[#4A7D52] disabled:opacity-50">
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-2 text-xs text-[#AFC8A8]">⚠ پاسخ‌های هوش مصنوعی جنبه مشاوره‌ای دارد. برای تصمیمات حساس با متخصص مشورت کنید.</p>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
