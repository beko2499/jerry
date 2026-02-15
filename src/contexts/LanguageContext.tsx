import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export type Language = 'en' | 'ar' | 'ku';

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
        saveChanges: 'Save Changes',
        contactChannels: 'Contact Channels',
        whatsappNumber: 'WhatsApp Number',
        telegramUsername: 'Telegram Username',
        supportEmail: 'Support Email',
        messagesCliches: 'Messages & Clichés',
        supportIntroMessage: 'Support Intro Message',
        ticketAutoReply: 'Ticket Auto-Reply',
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
        saveChanges: 'حفظ التغييرات',
        contactChannels: 'قنوات التواصل',
        whatsappNumber: 'رقم الواتساب',
        telegramUsername: 'ايميل التليجرام',
        supportEmail: 'البريد الإلكتروني للدعم',
        messagesCliches: 'الرسائل والنصوص الجاهزة',
        supportIntroMessage: 'رسالة ترحيب الدعم',
        ticketAutoReply: 'الرد التلقائي للتذاكر',
    },
    ku: {
        dir: 'rtl',
        // Landing
        brand: 'جێری',
        hero: 'جێری',
        subtitle: 'ئامادەبوونی کۆمەڵایەتیت بەهێز بکە',
        launch: 'دەست پێ بکە',
        // Auth
        authTitle: 'پلاتفۆرمی خزمەتگوزاری دیجیتاڵ',
        loginTab: 'چوونەژوورەوە',
        registerTab: 'دروستکردنی هەژمار',
        username: 'ناوی بەکارهێنەر',
        password: 'وشەی نهێنی',
        confirmPassword: 'دووپاتکردنەوەی وشەی نهێنی',
        firstName: 'ناوی یەکەم',
        lastName: 'ناوی کۆتایی',
        phone: 'ژمارەی مۆبایل',
        email: 'ئیمەیل',
        loginBtn: 'چوونەژوورەوە',
        registerBtn: 'دروستکردنی هەژمارێکی نوێ',
        testAccount: 'هەژماری تاقیکردنەوە',
        fillAllFields: 'تکایە هەموو خانەکان پڕبکەوە',
        wrongCredentials: 'ناوی بەکارهێنەر یان وشەی نهێنی هەڵەیە',
        passwordMismatch: 'وشەی نهێنی یەک ناگرنەوە',
        passwordTooShort: 'وشەی نهێنی دەبێت لانیکەم ٤ پیت بێت',
        usernameExists: 'ناوی بەکارهێنەر پێشتر هەیە',
        accountCreated: 'هەژمار بە سەرکەوتوویی دروستکرا!',
        promoCode: 'کۆدی داشکاندنم هەیە',
        enterPromo: 'کۆدی داشکاندن بنووسە',
        // Dashboard
        searchPlaceholder: 'گەڕان بۆ خزمەتگوزاری یان ژمارەی داواکاری',
        addFunds: 'زیادکردنی پارە',
        logout: 'چوونەدەرەوە',
        backToCategories: '← گەڕانەوە بۆ بەشەکان',
        backToJerry: '← گەڕانەوە بۆ خزمەتگوزارییەکانی جێری',
        backToList: '← گەڕانەوە بۆ لیست',
        jerryServices: 'خزمەتگوزارییەکانی جێری',
        telegramServices: 'خزمەتگوزارییەکانی تێلێگرام | جێری',
        quantity: 'بڕ',
        link: 'بەستەر (بەستەری بانگهێشت)',
        totalCost: 'کۆی گشتی',
        pricePer1000: 'نرخ بۆ ١٠٠٠',
        confirmOrder: 'پشتڕاستکردنەوەی داواکاری',
        buyService: 'کڕینی خزمەتگوزاری',
        serviceDesc: 'وەسفی خزمەتگوزاری',
        serviceSpeed: 'خێرایی خزمەتگوزاری',
        dropRate: 'ڕێژەی کەمبوونەوە',
        guarantee: 'گەرەنتی',
        speed: 'خێرایی',
        // Service names
        instaServices: 'خزمەتگوزارییەکانی ئینستاگرام | جێری',
        tiktokServices: 'خزمەتگوزارییەکانی تیکتۆک | جێری',
        facebookServices: 'خزمەتگوزارییەکانی فەیسبووک | جێری',
        telegramServicesName: 'خزمەتگوزارییەکانی تێلێگرام | جێری',
        merchantServices: 'خزمەتگوزارییەکانی بازرگانان | جێری',
        premiumTelegram: 'خزمەتگوزاری تێلێگرامی تایبەت | جێری',
        telegramStars: 'ئەستێرە و دیارییەکانی تێلێگرام | جێری',
        // Orders
        orders: 'داواکارییەکان',
        orderId: 'ژمارەی داواکاری',
        service: 'خزمەتگوزاری',
        status: 'بارودۆخ',
        date: 'بەروار',
        noOrders: 'هیچ داواکارییەک نییە',
        // Settings
        settings: 'ڕێکخستنەکان',
        // Support
        support: 'پشتگیری',
        // Sidebar
        newOrder: 'داواکارییەکی نوێ',
        // Add Funds
        selectPayment: 'شێوازی پارەدان هەڵبژێرە',
        // Extra Dashboard
        categories: 'بەشەکان',
        createOrder: 'دروستکردنی داواکاری',
        allOrders: 'هەموو داواکارییەکان',
        pending: 'چاوەڕوانە',
        completed: 'تەواوبوو',
        cancelled: 'هەڵوەشێنراوە',
        search: 'گەڕان...',
        price: 'نرخ',
        myOrders: 'داواکارییەکانم',
        // ServicesList
        jerryServicesCard: 'خزمەتگوزارییەکانی جێری',
        cardsSection: 'بەشی کارتەکان',
        gamingSection: 'پڕکردنەوەی یاری',
        subscriptionsSection: 'بەشی بەشداربوون',
        phoneTopUp: 'پڕکردنەوەی باڵانسی مۆبایل',
        miscServices: 'خزمەتگوزاری جۆراوجۆر',
        // Settings
        name: 'ناو',
        currentPassword: 'وشەی نهێنی ئێستا',
        newPassword: 'وشەی نهێنی نوێ',
        saveChanges: 'پاشەکەوتکردنی گۆڕانکارییەکان',
        // Support
        subject: 'بابەت',
        ticketSubject: 'بابەتی تیکێت',
        message: 'نامە',
        writeMessage: 'نامەکەت لێرە بنووسە...',
        sendTicket: 'ناردنی تیکێت',
        // Add Funds extra
        autoPayment: 'پارەدانی ئۆتۆماتیک',
        manualPayment: 'گواستنەوەی دەستی',
        discountCode: 'کۆدی داشکاندن/پڕکردنەوە',
        backToPayments: '← گەڕانەوە بۆ شێوازەکانی پارەدان',
        transferTo: 'تکایە بڕەکە بگوازەوە بۆ ئەم ژمارەیەو و وێنەکەی بنێرە بۆ بەڕێوەبەرایەتی:',
        copy: 'لەبەرگرتنەوە',
        amountTransferred: 'بڕی گوازراوە',
        sendProof: 'ناردنی بەڵگەی گواستنەوە (تێلێگرام)',
        code: 'کۆد',
        redeemCode: 'بەکارهێنانی کۆد',
        amount: 'بڕ ($)',
        continuePayment: 'بەردەوامبوون لە پارەدان',
        // Admin
        adminAccess: 'چوونەژوورەوەی ئەدمین',
        restrictedArea: 'ناوچەی تایبەت',
        enterDashboard: 'چوونە ناو داشبۆرد',
        invalidCredentials: 'زانیاری چوونەژوورەوە هەڵەیە',
        overview: 'تێڕوانینی گشتی',
        gateways: 'دەروازەکانی پارەدان',
        providers: 'دابینکەران',
        adminServices: 'خزمەتگوزارییەکان',
        adminSupport: 'پشتگیری',
        adminPanel: 'تەختەی کۆنترۆڵ',
        searchAdmin: 'گەڕان بۆ ئەدمین/بەکارهێنەر...',
        adminUser: 'بەکارھێنەری ئەدمین',
        superAdmin: 'سەرپەرشتیاری گشتی',
        dashboardOverview: 'تێڕوانینی گشتی',
        totalUsers: 'کۆی بەکارهێنەران',
        totalOrders: 'کۆی داواکارییەکان',
        totalRevenue: 'داهات',
        activeNow: 'چالاک لە ئێستادا',
        recentActivity: 'چالاکی دوایی',
        // Common
        add: 'زیادکردن',
        cancel: 'هەڵوەشاندنەوە',
        save: 'پاشەکەوتکردن',
        edit: 'دەستکاری',
        delete: 'سڕینەوە',
        configure: 'ڕێکخستن',
        // Gateways
        paymentGateways: 'دەروازەکانی پارەدان',
        addNewGateway: 'زیادکردنی دەروازەی نوێ',
        destination: 'مەبەست',
        instructionText: 'دەقی ڕێنمایی',
        apiConnected: 'پەیوەستە بە API',
        // Providers
        serviceProviders: 'دابینکەرانی خزمەتگوزاری',
        addNewProvider: 'زیادکردنی دابینکەری نوێ',
        providerName: 'ناوی دابینکەر',
        apiUrl: 'بەستەری API',
        apiKey: 'کلیل API',
        balance: 'باڵانس',
        // Services
        servicesCategories: 'خزمەتگوزاری و بەشەکان',
        categoryName: 'ناوی بەش',
        serviceName: 'ناوی خزمەتگوزاری',
        minMax: 'کەمترین / زۆرترین',
        providerIntegration: 'پەیوەستکردنی دابینکەر',
        autoFetch: 'هێنانی ئۆتۆماتیکی',
        createService: 'دروستکردنی خزمەتگوزاری',
        noServices: 'هیچ خزمەتگوزارییەک لەم بەشەدا نییە',
        // Support
        supportSettings: 'ڕێکخستنەکانی پشتگیری',
        saveChanges: 'پاشەکەوتکردنی گۆڕانکارییەکان',
        contactChannels: 'کەناڵەکانی پەیوەندی',
        whatsappNumber: 'ژمارەی واتسئەپ',
        telegramUsername: 'ناوی بەکارهێنەری تێلێگرام',
        supportEmail: 'ئیمەیڵی پشتگیری',
        messagesCliches: 'نامە و دەقە ئامادەکان',
        supportIntroMessage: 'پەیامی بەخێرهاتنی پشتگیری',
        ticketAutoReply: 'وەڵامدانەوەی ئۆتۆماتیکی تیکێت',
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
        setLang(prev => {
            if (prev === 'en') return 'ar';
            if (prev === 'ar') return 'ku';
            return 'en';
        });
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
