import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export type Language = 'en' | 'ar';

// All translations for the entire app
export const translations = {
    en: {
        dir: 'ltr',
        // Landing
        brand: 'JERRY',
        hero: 'JERRY',
        subtitle: 'Supercharge Your Social Presence',
        launch: 'LAUNCH NOW',
        // Auth
        authTitle: 'Digital Services Platform',
        loginTab: 'Login',
        registerTab: 'Create Account',
        username: 'Username',
        password: 'Password',
        confirmPassword: 'Confirm Password',
        firstName: 'First Name',
        lastName: 'Last Name',
        phone: 'Phone Number',
        email: 'Email',
        loginBtn: 'Login',
        registerBtn: 'Create New Account',
        testAccount: 'Test account',
        fillAllFields: 'Please fill in all fields',
        wrongCredentials: 'Incorrect username or password',
        passwordMismatch: 'Passwords do not match',
        passwordTooShort: 'Password must be at least 4 characters',
        usernameExists: 'Username already exists',
        accountCreated: 'Account created successfully!',
        promoCode: 'I have a promo code',
        enterPromo: 'Enter promo code',
        // Dashboard
        searchPlaceholder: 'Search service or order id',
        addFunds: 'Add Funds',
        logout: 'Logout',
        backToCategories: '← Back to categories',
        backToJerry: '← Back to Jerry Services',
        backToList: '← Back to list',
        jerryServices: 'Jerry Services',
        telegramServices: 'Telegram Services | Jerry',
        quantity: 'Quantity',
        link: 'Link (Invite Link)',
        totalCost: 'Total Cost',
        pricePer1000: 'Price per 1000',
        confirmOrder: 'Confirm Order',
        buyService: 'Buy Service',
        serviceDesc: 'Service Description',
        serviceSpeed: 'Service Speed',
        dropRate: 'Drop Rate',
        guarantee: 'Guarantee',
        speed: 'Speed',
        // Service names
        instaServices: 'Instagram Services | Jerry',
        tiktokServices: 'TikTok Services | Jerry',
        facebookServices: 'Facebook Services | Jerry',
        telegramServicesName: 'Telegram Services | Jerry',
        merchantServices: 'Merchant Services | Jerry',
        premiumTelegram: 'Premium Telegram Services | Jerry',
        telegramStars: 'Telegram Stars & Gifts | Jerry',
        // Orders
        orders: 'Orders',
        orderId: 'Order ID',
        service: 'Service',
        status: 'Status',
        date: 'Date',
        noOrders: 'No orders yet',
        // Settings
        settings: 'Settings',
        // Support
        support: 'Support',
        // Sidebar
        newOrder: 'New Order',
        // Add Funds
        selectPayment: 'Select Payment Method',
        // Extra Dashboard
        categories: 'Categories',
        createOrder: 'Create Order',
        allOrders: 'All Orders',
        pending: 'Pending',
        completed: 'Completed',
        cancelled: 'Cancelled',
        search: 'Search...',
        price: 'Price',
        myOrders: 'My Orders',
        // ServicesList
        jerryServicesCard: 'Jerry Services',
        cardsSection: 'Cards Section',
        gamingSection: 'Game Top-Up',
        subscriptionsSection: 'Subscriptions',
        phoneTopUp: 'Phone Balance Top-Up',
        miscServices: 'Miscellaneous Services',
        // Settings
        name: 'Name',
        currentPassword: 'Current Password',
        newPassword: 'New Password',
        saveChanges: 'Save Changes',
        // Support
        subject: 'Subject',
        ticketSubject: 'Ticket Subject',
        message: 'Message',
        writeMessage: 'Write your message here...',
        sendTicket: 'Send Ticket',
        // Add Funds extra
        autoPayment: 'Auto Payment',
        manualPayment: 'Manual Transfer',
        discountCode: 'Discount/Top-Up Code',
        backToPayments: '← Back to payment methods',
        transferTo: 'Please transfer the amount to the following number and send proof to admin:',
        copy: 'Copy',
        amountTransferred: 'Amount Transferred',
        sendProof: 'Send Transfer Proof (Telegram)',
        code: 'Code',
        redeemCode: 'Redeem Code',
        amount: 'Amount ($)',
        continuePayment: 'Continue Payment',
        // Admin
        adminAccess: 'ADMIN ACCESS',
        restrictedArea: 'Restricted Area',
        enterDashboard: 'Enter Dashboard',
        invalidCredentials: 'Invalid admin credentials',
        overview: 'Overview',
        gateways: 'Gateways',
        providers: 'Providers',
        adminServices: 'Services',
        adminSupport: 'Support',
        adminPanel: 'ADMIN PANEL',
        searchAdmin: 'Search admin/users...',
        adminUser: 'Admin User',
        superAdmin: 'Super Admin',
        dashboardOverview: 'Dashboard Overview',
        totalUsers: 'Total Users',
        totalOrders: 'Total Orders',
        totalRevenue: 'Revenue',
        activeNow: 'Active Now',
        recentActivity: 'Recent Activity',
        // Common
        add: 'Add',
        cancel: 'Cancel',
        save: 'Save',
        edit: 'Edit',
        delete: 'Delete',
        configure: 'Configure',
        termsOfService: 'Terms of Use',
        updates: 'Updates',
        confirmDelete: 'Are you sure you want to delete this?',
        // Gateways
        paymentGateways: 'Payment Gateways',
        addNewGateway: 'Add New Gateway',
        destination: 'Destination',
        instructionText: 'Instruction Text',
        apiConnected: 'API Connected',
        // Providers
        serviceProviders: 'Service Providers',
        addNewProvider: 'Add New Provider',
        providerName: 'Provider Name',
        providerImage: 'Provider Image',
        apiUrl: 'API URL',
        apiKey: 'API Key',
        balance: 'Balance',
        // Services
        servicesCategories: 'Services & Categories',
        categoryName: 'Category Name',
        serviceName: 'Service Name',
        minMax: 'Min / Max',
        providerIntegration: 'Provider Integration',
        autoFetch: 'Auto-Fetch',
        createService: 'Create Service',
        noServices: 'No services in this category yet',
        // Support
        supportSettings: 'Support Settings',
        contactChannels: 'Contact Channels',
        whatsappNumber: 'WhatsApp Number',
        telegramUsername: 'Telegram Username',
        supportEmail: 'Support Email',
        messagesCliches: 'Messages & Clichés',
        supportIntroMessage: 'Support Intro Message',
        // Provider Instructions
        howToConnect: 'How to connect:',
        connectInstructions: 'Copy the API URL and API Key from your provider\'s "API" or "Settings" page.',
        panelName: 'Panel Name / Domain',
        // Service Manager
        startTime: 'Start Time',
        serviceImage: 'Service Image',
        folderName: 'Folder Name',
        files: 'Files',
        ticketAutoReply: 'Ticket Auto Reply',
    },
    ar: {
        dir: 'rtl',
        // Landing
        brand: 'جيري',
        hero: 'جيري',
        subtitle: 'شحن تواجدك الاجتماعي بقوة',
        launch: 'ابدأ الآن',
        // Auth
        authTitle: 'منصة الخدمات الرقمية',
        loginTab: 'تسجيل الدخول',
        registerTab: 'إنشاء حساب',
        username: 'اسم المستخدم',
        password: 'كلمة المرور',
        confirmPassword: 'تأكيد كلمة المرور',
        firstName: 'الاسم الأول',
        lastName: 'الاسم الأخير',
        phone: 'رقم الهاتف',
        email: 'البريد الإلكتروني',
        loginBtn: 'تسجيل الدخول',
        registerBtn: 'إنشاء حساب جديد',
        testAccount: 'حساب تجريبي',
        fillAllFields: 'يرجى ملء جميع الحقول',
        wrongCredentials: 'اسم المستخدم أو كلمة المرور غير صحيحة',
        passwordMismatch: 'كلمة المرور غير متطابقة',
        passwordTooShort: 'كلمة المرور يجب أن تكون 4 أحرف على الأقل',
        usernameExists: 'اسم المستخدم موجود بالفعل',
        accountCreated: 'تم إنشاء الحساب بنجاح!',
        promoCode: 'لدي رمز ترويجي',
        enterPromo: 'ادخل الرمز الترويجي',
        // Dashboard
        searchPlaceholder: 'بحث عن خدمة أو رقم طلب',
        addFunds: 'اضافة اموال',
        logout: 'تسجيل الخروج',
        backToCategories: '← رجوع للاقسام',
        backToJerry: '← رجوع لخدمات جيري',
        backToList: '← رجوع للقائمة',
        jerryServices: 'خدمات جيري',
        telegramServices: 'خدمات تليجرام | جيري',
        quantity: 'الكمية',
        link: 'الرابط (رابط الدعوة)',
        totalCost: 'التكلفة الكلية',
        pricePer1000: 'السعر لـ 1000',
        confirmOrder: 'تأكيد الطلب',
        buyService: 'شراء الخدمة',
        serviceDesc: 'وصف الخدمة',
        serviceSpeed: 'سرعة الخدمه',
        dropRate: 'نسبه النزول',
        guarantee: 'ضمان',
        speed: 'السرعة',
        // Service names
        instaServices: 'خدمات انستا | جيري',
        tiktokServices: 'خدمات تيك توك | جيري',
        facebookServices: 'خدمات فيسبوك | جيري',
        telegramServicesName: 'خدمات تليجرام | جيري',
        merchantServices: 'خدمات التجار | جيري',
        premiumTelegram: 'خدمات تلجرام مميز | جيري',
        telegramStars: 'نجوم وهدايه تلجرام | جيري',
        // Orders
        orders: 'الطلبات',
        orderId: 'رقم الطلب',
        service: 'الخدمة',
        status: 'الحالة',
        date: 'التاريخ',
        noOrders: 'لا توجد طلبات بعد',
        // Settings
        settings: 'الاعدادات',
        // Support
        support: 'الدعم',
        // Sidebar
        newOrder: 'طلب جديد',
        // Add Funds
        selectPayment: 'اختر طريقة الدفع',
        // Extra Dashboard
        categories: 'الاقسام',
        createOrder: 'إنشاء الطلب',
        allOrders: 'جميع الطلبات',
        pending: 'قيد الانتظار',
        completed: 'مكتمل',
        cancelled: 'ملغي',
        search: 'بحث...',
        price: 'السعر',
        myOrders: 'طلباتي',
        // ServicesList
        jerryServicesCard: 'خدمات جيري',
        cardsSection: 'قسم البطائق',
        gamingSection: 'قسم شحن الألعاب',
        subscriptionsSection: 'قسم الاشتراكات',
        phoneTopUp: 'شحن رصيد الهاتف',
        miscServices: 'خدمات منوعة',
        // Settings
        name: 'الاسم',
        currentPassword: 'كلمة المرور الحالية',
        newPassword: 'كلمة المرور الجديدة',
        saveChanges: 'حفظ التغييرات',
        // Support
        subject: 'الموضوع',
        ticketSubject: 'موضوع التذكرة',
        message: 'الرسالة',
        writeMessage: 'اكتب رسالتك هنا...',
        sendTicket: 'إرسال تذكرة',
        // Add Funds extra
        autoPayment: 'دفع تلقائي',
        manualPayment: 'تحويل يدوي',
        discountCode: 'كود خصم/شحن',
        backToPayments: '← رجوع لطرق الدفع',
        transferTo: 'يرجى تحويل المبلغ إلى الرقم التالي وارسال صورة التحويل إلى الإدارة:',
        copy: 'نسخ',
        amountTransferred: 'المبلغ المحول',
        sendProof: 'ارسال اثبات التحويل (تلجرام)',
        code: 'الكود',
        redeemCode: 'شحن الكود',
        amount: 'المبلغ ($)',
        continuePayment: 'متابعة الدفع',
        // Admin
        adminAccess: 'دخول المشرف (الأدمن)',
        restrictedArea: 'منطقة محظورة',
        enterDashboard: 'الدخول للوحة التحكم',
        invalidCredentials: 'بيانات الدخول غير صحيحة',
        overview: 'نظرة عامة',
        gateways: 'بوابات الدفع',
        providers: 'المزودين',
        adminServices: 'الخدمات',
        adminSupport: 'الدعم',
        adminPanel: 'لوحة التحكم',
        searchAdmin: 'بحث عن مشرف/مستخدم...',
        adminUser: 'المشرف',
        superAdmin: 'مشرف عام',
        dashboardOverview: 'نظرة عامة',
        totalUsers: 'إجمالي المستخدمين',
        totalOrders: 'إجمالي الطلبات',
        totalRevenue: 'الإيرادات',
        activeNow: 'نشط الآن',
        recentActivity: 'النشاط الأخير',
        // Common
        add: 'إضافة',
        cancel: 'إلغاء',
        save: 'حفظ',
        edit: 'تعديل',
        delete: 'حذف',
        configure: 'تكوين',
        termsOfService: 'شروط الاستخدام',
        updates: 'التحديثات',
        confirmDelete: 'هل أنت متأكد من الحذف؟',
        // Gateways
        paymentGateways: 'بوابات الدفع',
        addNewGateway: 'إضافة بوابة جديدة',
        destination: 'الوجهة',
        instructionText: 'نص التعليمات',
        apiConnected: 'متصل بالـ API',
        // Providers
        serviceProviders: 'مزودي الخدمات',
        addNewProvider: 'إضافة مزود جديد',
        providerName: 'اسم المزود',
        providerImage: 'صورة المزود',
        apiUrl: 'رابط الـ API',
        apiKey: 'مفتاح الـ API',
        balance: 'الرصيد',
        // Services
        servicesCategories: 'الخدمات والأقسام',
        categoryName: 'اسم القسم',
        serviceName: 'اسم الخدمة',
        minMax: 'الحد الأدنى / الأقصى',
        providerIntegration: 'ربط المزود',
        autoFetch: 'جلب تلقائي',
        createService: 'إنشاء خدمة',
        noServices: 'لا توجد خدمات في هذا القسم بعد',
        // Support
        supportSettings: 'إعدادات الدعم',
        contactChannels: 'قنوات التواصل',
        whatsappNumber: 'رقم الواتساب',
        telegramUsername: 'ايميل التليجرام',
        supportEmail: 'البريد الإلكتروني للدعم',
        messagesCliches: 'الرسائل والنصوص الجاهزة',
        supportIntroMessage: 'رسالة ترحيب الدعم',
        ticketAutoReply: 'الرد التلقائي للتذاكر',
        // Provider Instructions
        howToConnect: 'طريقة الربط:',
        connectInstructions: 'انسخ رابط API ومفتاح API من صفحة "API" أو "الإعدادات" الخاصة بالمزود.',
        panelName: 'اسم اللوحة / النطاق',
        // Service Manager
        startTime: 'وقت البدء',
        serviceImage: 'صورة الخدمة',
        folderName: 'اسم المجلد',
        files: 'ملفات',
    },
};

interface LanguageContextType {
    lang: Language;
    setLang: (lang: Language) => void;
    t: typeof translations['en'];
    isRTL: boolean;
    toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [lang, setLang] = useState<Language>(() => {
        return (localStorage.getItem('jerry_lang') as Language) || 'ar';
    });

    const t = translations[lang];
    const isRTL = t.dir === 'rtl';

    useEffect(() => {
        document.dir = t.dir;
        localStorage.setItem('jerry_lang', lang);
    }, [lang, t.dir]);

    const toggleLanguage = () => {
        setLang(prev => prev === 'en' ? 'ar' : 'en');
    };

    return (
        <LanguageContext.Provider value={{ lang, setLang, t, isRTL, toggleLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) throw new Error('useLanguage must be used within LanguageProvider');
    return context;
}
