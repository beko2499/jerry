import { useState } from 'react';
import { MessageCircle, Send, Save, Phone } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';

export default function SupportView() {
    const { t } = useLanguage();

    const [supportConfig, setSupportConfig] = useState({
        whatsapp: '07800000000',
        telegram: '@jerry_support',
        email: 'support@jerry.com',
        supportMessage: 'Our support team is available 24/7 to assist you. Please reach out via:',
        ticketAutoReply: 'Thank you for your message. We will get back to you shortly.'
    });

    const handleChange = (key: string, value: string) => {
        setSupportConfig(prev => ({ ...prev, [key]: value }));
    };

    const handleSave = () => {
        // Save logic
        alert('Support settings saved!');
    };

    return (
        <div className="p-4 md:p-8 space-y-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="font-space text-2xl md:text-3xl text-white tracking-wide">{t.supportSettings}</h2>
                <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white gap-2">
                    <Save className="w-4 h-4" /> {t.saveChanges}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                {/* Contact Methods */}
                <Card className="p-6 bg-white/5 border border-white/10 backdrop-blur-md space-y-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Phone className="w-5 h-5 text-cyan-400" /> {t.contactChannels}
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm text-white/60 mb-1.5 block">{t.whatsappNumber}</label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                                    <MessageCircle className="w-4 h-4 text-green-400" />
                                </div>
                                <Input
                                    value={supportConfig.whatsapp}
                                    onChange={e => handleChange('whatsapp', e.target.value)}
                                    className="pl-14 bg-black/30 border-white/10 text-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm text-white/60 mb-1.5 block">{t.telegramUsername}</label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                                    <Send className="w-4 h-4 text-blue-400" />
                                </div>
                                <Input
                                    value={supportConfig.telegram}
                                    onChange={e => handleChange('telegram', e.target.value)}
                                    className="pl-14 bg-black/30 border-white/10 text-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm text-white/60 mb-1.5 block">{t.supportEmail}</label>
                            <Input
                                value={supportConfig.email}
                                onChange={e => handleChange('email', e.target.value)}
                                className="bg-black/30 border-white/10 text-white"
                            />
                        </div>
                    </div>
                </Card>

                {/* Text Configuration */}
                <Card className="p-6 bg-white/5 border border-white/10 backdrop-blur-md space-y-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <MessageCircle className="w-5 h-5 text-cyan-400" /> {t.messagesCliches}
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm text-white/60 mb-1.5 block">{t.supportIntroMessage}</label>
                            <textarea
                                value={supportConfig.supportMessage}
                                onChange={e => handleChange('supportMessage', e.target.value)}
                                className="w-full h-24 p-4 bg-black/30 border border-white/10 rounded-xl text-white outline-none focus:border-cyan-500/50 resize-none font-body"
                            />
                            <p className="text-xs text-white/30 mt-1">Displayed on the user support page.</p>
                        </div>

                        <div>
                            <label className="text-sm text-white/60 mb-1.5 block">{t.ticketAutoReply}</label>
                            <textarea
                                value={supportConfig.ticketAutoReply}
                                onChange={e => handleChange('ticketAutoReply', e.target.value)}
                                className="w-full h-24 p-4 bg-black/30 border border-white/10 rounded-xl text-white outline-none focus:border-cyan-500/50 resize-none font-body"
                            />
                            <p className="text-xs text-white/30 mt-1">Sent automatically when a user opens a new ticket.</p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
