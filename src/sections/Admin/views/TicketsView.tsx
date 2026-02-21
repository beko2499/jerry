import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Send, Mail, User, MessageCircle, Clock, CheckCircle } from 'lucide-react';

import { adminFetch } from '@/lib/api';

export default function TicketsView() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [tab, setTab] = useState<'open' | 'closed'>('open');
    const [selectedTicket, setSelectedTicket] = useState<any>(null);
    const [replyText, setReplyText] = useState('');
    const [sending, setSending] = useState(false);

    const fetchTickets = () => {
        adminFetch(`/tickets`).then(r => r.json()).then(data => { if (Array.isArray(data)) setTickets(data); }).catch(console.error);
    };
    useEffect(() => { fetchTickets(); }, []);

    const filtered = tickets.filter(t => t.status === tab);

    const handleReply = async () => {
        if (!replyText.trim() || !selectedTicket) return;
        setSending(true);
        try {
            const res = await adminFetch(`/tickets/${selectedTicket._id}/reply`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reply: replyText }),
            });
            if (res.ok) {
                setReplyText('');
                setSelectedTicket(null);
                fetchTickets();
            }
        } catch (e) { console.error(e); }
        setSending(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('حذف هذه التذكرة؟')) return;
        await adminFetch(`/tickets/${id}`, { method: 'DELETE' });
        if (selectedTicket?._id === id) setSelectedTicket(null);
        fetchTickets();
    };

    const formatDate = (d: string) => new Date(d).toLocaleString('ar-IQ', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    return (
        <div className="p-4 md:p-8 space-y-6">
            <h2 className="font-space text-xl md:text-2xl text-white tracking-wide">🎫 التذاكر</h2>

            {/* Tabs */}
            <div className="flex gap-2">
                <button onClick={() => setTab('open')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === 'open' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10'}`}>
                    التذاكر النشطة ({tickets.filter(t => t.status === 'open').length})
                </button>
                <button onClick={() => setTab('closed')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === 'closed' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-white/5 text-white/50 border border-white/10 hover:bg-white/10'}`}>
                    تذاكر منتهية ({tickets.filter(t => t.status === 'closed').length})
                </button>
            </div>

            {/* Tickets List */}
            <div className="space-y-3">
                {filtered.length === 0 ? (
                    <Card className="p-8 bg-white/5 border-white/10 text-center">
                        <p className="text-white/30 text-sm">{tab === 'open' ? 'لا توجد تذاكر نشطة' : 'لا توجد تذاكر منتهية'}</p>
                    </Card>
                ) : (
                    filtered.map(ticket => (
                        <Card
                            key={ticket._id}
                            onClick={() => { setSelectedTicket(ticket); setReplyText(ticket.adminReply || ''); }}
                            className={`p-4 bg-white/5 border-white/10 hover:border-white/20 transition-all cursor-pointer ${selectedTicket?._id === ticket._id ? 'ring-1 ring-cyan-500/50' : ''}`}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${ticket.status === 'closed' ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'}`}>
                                            {ticket.status === 'closed' ? <span className="flex items-center gap-1"><CheckCircle className="w-2.5 h-2.5" /> منتهية</span> : <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> نشطة</span>}
                                        </span>
                                        <span className="text-white font-medium text-sm">{ticket.topic}</span>
                                    </div>
                                    <p className="text-white/50 text-xs truncate">{ticket.message}</p>
                                    <div className="flex items-center gap-3 mt-2 text-white/30 text-[10px] flex-wrap">
                                        {ticket.userId && (
                                            <>
                                                <span className="flex items-center gap-1"><User className="w-2.5 h-2.5" /> @{ticket.userId.username}</span>
                                                <span className="flex items-center gap-1"><Mail className="w-2.5 h-2.5" /> {ticket.userId.email}</span>
                                            </>
                                        )}
                                        <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> {formatDate(ticket.createdAt)}</span>
                                    </div>
                                </div>
                                <button onClick={(e) => { e.stopPropagation(); handleDelete(ticket._id); }} className="text-white/20 hover:text-red-400 p-1 transition-colors shrink-0">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            {/* Reply Modal */}
            {selectedTicket && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedTicket(null)}>
                    <div className="w-full max-w-lg bg-[#0d0d1a]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl" onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div className="p-4 border-b border-white/10 flex items-center justify-between">
                            <h3 className="text-white font-bold text-sm">تفاصيل التذكرة</h3>
                            <button onClick={() => setSelectedTicket(null)} className="text-white/40 hover:text-white p-1"><X className="w-5 h-5" /></button>
                        </div>

                        <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
                            {/* Topic */}
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-cyan-400 font-bold text-sm">{selectedTicket.topic}</span>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${selectedTicket.status === 'closed' ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'}`}>
                                    {selectedTicket.status === 'closed' ? 'منتهية ✅' : 'نشطة ⏳'}
                                </span>
                            </div>

                            {/* User Info */}
                            {selectedTicket.userId && (
                                <div className="bg-white/5 rounded-xl p-3 border border-white/5 space-y-1">
                                    <div className="flex items-center gap-2 text-white/60 text-xs">
                                        <User className="w-3.5 h-3.5" />
                                        <span>{selectedTicket.userId.firstName} {selectedTicket.userId.lastName}</span>
                                        <span className="text-cyan-400 font-mono">@{selectedTicket.userId.username}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-white/40 text-xs">
                                        <Mail className="w-3.5 h-3.5" />
                                        <span>{selectedTicket.userId.email}</span>
                                    </div>
                                </div>
                            )}

                            {/* Message */}
                            <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                                <p className="text-white/40 text-[10px] mb-1 flex items-center gap-1"><MessageCircle className="w-3 h-3" /> رسالة المستخدم:</p>
                                <p className="text-white text-sm leading-relaxed whitespace-pre-line">{selectedTicket.message}</p>
                                <p className="text-white/20 text-[10px] mt-2">{formatDate(selectedTicket.createdAt)}</p>
                            </div>

                            {/* Reply Box */}
                            <div>
                                <label className="block text-white/60 text-xs mb-2">الرد على التذكرة:</label>
                                <textarea
                                    value={replyText}
                                    onChange={e => setReplyText(e.target.value)}
                                    placeholder="اكتب ردك هنا..."
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm resize-none focus:outline-none focus:border-red-500/50"
                                />
                            </div>

                            {/* Existing Reply */}
                            {selectedTicket.adminReply && selectedTicket.status === 'closed' && (
                                <div className="bg-gradient-to-r from-green-500/10 to-cyan-500/10 rounded-xl p-3 border border-green-500/20">
                                    <p className="text-green-400 text-[10px] mb-1 font-bold">الرد السابق:</p>
                                    <p className="text-white text-sm leading-relaxed">{selectedTicket.adminReply}</p>
                                    {selectedTicket.repliedAt && <p className="text-white/25 text-[10px] mt-2">{formatDate(selectedTicket.repliedAt)}</p>}
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-white/10 flex gap-2">
                            <Button onClick={handleReply} disabled={sending || !replyText.trim()} className="flex-1 bg-gradient-to-r from-red-500 to-purple-600 hover:from-red-600 hover:to-purple-700 text-white h-10 disabled:opacity-50">
                                <Send className="w-4 h-4 mr-2" />
                                {sending ? '...' : 'إرسال الرد وإغلاق التذكرة'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
