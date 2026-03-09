# 📘 دليل إدارة مشروع Jerry Store

## 📋 المحتويات
1. [نقل المشروع لريبو جديد](#1--نقل-المشروع-لريبو-جديد)
2. [أوامر Git الأساسية](#2--أوامر-git-الأساسية)
3. [رفع التعديلات للسيرفر](#3--رفع-التعديلات-للسيرفر)
4. [إدارة السيرفر](#4--إدارة-السيرفر)
5. [نشر المشروع على سيرفر جديد](#5--نشر-المشروع-على-سيرفر-جديد)
6. [حل المشاكل الشائعة](#6--حل-المشاكل-الشائعة)
7. [هيكل المشروع](#7--هيكل-المشروع)

---

## 1. 🚀 نقل المشروع لريبو جديد

### الخطوة 1: إنشاء ريبو جديد على GitHub
1. اذهب إلى https://github.com/new
2. اكتب اسم الريبو (مثلاً `jerry-store`)
3. اختر **Private** (خاص)
4. **لا تضف** README أو .gitignore
5. اضغط **Create repository**

### الخطوة 2: نقل الكود للريبو الجديد
```bash
# افتح مجلد المشروع
cd /path/to/project

# اضف الكود للريبو من داخل فجول استديو عن طريق الترمنل 
git remote add origin https://github.com/USERNAME/REPO-NAME.git

# ارفع الكود
git branch -M master
git push -u origin master
```

> ⚠️ **استبدل** `USERNAME` باسم حسابك و `REPO-NAME` باسم الريبو الجديد

### الخطوة 3: تحديث رابط الريبو على السيرفر
```bash
# على السيرفر
cd /var/www/followerjerry.com
git remote set-url origin https://github.com/USERNAME/REPO-NAME.git
```

---

## 2. 📝 أوامر Git الأساسية

### بعد كل تعديل على الكود:
```bash
# 1. عرض الملفات المعدّلة
git status

# 2. إضافة جميع التعديلات
git add -A

# 3. حفظ التعديلات مع وصف
git commit -m "وصف التعديل هنا"

# 4. رفع التعديلات لـ GitHub
git push origin master
```

### أمر مختصر (الكل في سطر واحد):
```bash
git add -A && git commit -m "وصف التعديل" && git push origin master
```

### أوامر إضافية مفيدة:
```bash
# عرض سجل التعديلات
git log --oneline -10

# التراجع عن آخر تعديل (قبل الرفع)
git reset --soft HEAD~1

# تحميل آخر نسخة من GitHub
git pull origin master

# إجبار الرفع (يستبدل كل شيء على GitHub)
git push origin master --force
```

---

## 3. 🔄 رفع التعديلات للسيرفر

### بعد رفع التعديلات لـ GitHub، شغّل هذه الأوامر على السيرفر:

```bash
# الاتصال بالسيرفر عبر SSH
ssh root@173.212.206.92
```

### إذا عدّلت الواجهة الأمامية (Frontend) فقط:
```bash
cd /var/www/followerjerry.com
git fetch origin && git reset --hard origin/master
npm run build
```

### إذا عدّلت السيرفر (Backend) فقط:
```bash
cd /var/www/followerjerry.com
git fetch origin && git reset --hard origin/master
pm2 restart jerry-api
```

### إذا عدّلت الاثنين معاً:
```bash
cd /var/www/followerjerry.com
git fetch origin && git reset --hard origin/master
npm run build
pm2 restart jerry-api
```

### أمر شامل (نسخ ولصق):
```bash
cd /var/www/followerjerry.com && git fetch origin && git reset --hard origin/master && npm run build && pm2 restart jerry-api
```

---

## 4. 🖥️ إدارة السيرفر

### PM2 — إدارة عملية السيرفر:
```bash
# عرض حالة التطبيقات
pm2 status

# إعادة تشغيل
pm2 restart jerry-api

# إيقاف
pm2 stop jerry-api

# تشغيل
pm2 start jerry-api

# عرض السجلات (الأخطاء والرسائل)
pm2 logs jerry-api

# عرض آخر 50 سطر من السجلات
pm2 logs jerry-api --lines 50

# مسح السجلات
pm2 flush
```

### Nginx — إدارة الويب سيرفر:
```bash
# إعادة تحميل الإعدادات
nginx -t && systemctl reload nginx

# إعادة تشغيل Nginx
systemctl restart nginx

# عرض حالة Nginx
systemctl status nginx

# عرض إعدادات الموقع
cat /etc/nginx/sites-available/followerjerry.com
```

### MongoDB — قاعدة البيانات:
```bash
# عرض حالة MongoDB
systemctl status mongod

# الدخول لقاعدة البيانات
mongosh jerry

# عرض عدد المستخدمين
mongosh jerry --eval "db.users.countDocuments()"

# عرض عدد الطلبات
mongosh jerry --eval "db.orders.countDocuments()"

# نسخة احتياطية
mongodump --db jerry --out /root/backup_$(date +%Y%m%d)

# استعادة نسخة احتياطية
mongorestore --db jerry /root/backup_YYYYMMDD/jerry
```

### SSL — شهادة الأمان:
```bash
# تجديد شهادة SSL
certbot renew

# التحقق من تاريخ انتهاء الشهادة
certbot certificates
```

---

## 5. 🆕 نشر المشروع على سيرفر جديد

### المتطلبات:
- سيرفر Ubuntu 20+ (VPS)
- دومين يشير للسيرفر

### الخطوة 1: عدّل السكربتات في الريبو أولاً
افتح ملف `deploy_app.sh` في VS Code وعدّل هذه المتغيرات:
```bash
REPO="https://github.com/USERNAME/REPO-NAME.git"    # رابط الريبو الجديد
APP_DIR="/var/www/yourdomain.com"                     # مسار التطبيق
DOMAIN="yourdomain.com"                               # الدومين
SERVER_IP="YOUR_SERVER_IP"                            # عنوان IP السيرفر
```
ثم ارفع التعديلات لـ GitHub:
```bash
git add -A && git commit -m "update deploy config" && git push origin master
```

### الخطوة 2: اتصل بالسيرفر وشغّل السكربتات مباشرة من GitHub
```bash
# 1. الاتصال بالسيرفر
ssh root@IP_ADDRESS

# 2. تشغيل سكربت إعداد السيرفر (يثبت Node.js, MongoDB, Nginx, PM2)
curl -sL https://raw.githubusercontent.com/USERNAME/REPO-NAME/master/setup_server.sh | bash

# 3. تشغيل سكربت نشر التطبيق (ينسخ المشروع ويبنيه ويشغله)
curl -sL https://raw.githubusercontent.com/USERNAME/REPO-NAME/master/deploy_app.sh | bash
```

> ⚠️ **استبدل** `USERNAME/REPO-NAME` برابط الريبو الخاص بك
>
> ⚠️ إذا الريبو **خاص (Private)**، استخدم token:
> ```bash
> curl -sL -H "Authorization: token YOUR_GITHUB_TOKEN" https://raw.githubusercontent.com/USERNAME/REPO-NAME/master/setup_server.sh | bash
> ```
> للحصول على token: GitHub → Settings → Developer settings → Personal access tokens → Generate new token

### تعديل ملف .env على السيرفر:
```bash
# الملف موجود في: /var/www/yourdomain.com/server/.env
nano /var/www/yourdomain.com/server/.env
```

المتغيرات المهمة:
| المتغير | الوصف |
|---|---|
| `MONGO_URI` | رابط قاعدة البيانات |
| `PORT` | بورت السيرفر (5000) |
| `JWT_SECRET` | مفتاح سري للتشفير (غيّره!) |
| `APP_URL` | رابط الموقع |
| `NOWPAYMENTS_API_KEY` | مفتاح بوابة الدفع |
| `EMAIL_USER` | إيميل الإشعارات |
| `EMAIL_PASS` | كلمة مرور التطبيق للإيميل |

---

## 6. 🔧 حل المشاكل الشائعة

### الموقع لا يفتح:
```bash
# تحقق من PM2
pm2 status
# إذا stopped:
pm2 restart jerry-api

# تحقق من Nginx
systemctl status nginx
# إذا فيه مشكلة:
nginx -t    # يعرض الخطأ
systemctl restart nginx
```

### خطأ 502 Bad Gateway:
```bash
# السيرفر الخلفي متوقف
pm2 restart jerry-api
pm2 logs jerry-api --lines 20
```

### خطأ 504 Gateway Timeout:
```bash
# طلب يأخذ وقت طويل - تحقق من MongoDB
systemctl status mongod
# إذا متوقف:
systemctl start mongod
```

### الصور لا تظهر:
```bash
# تأكد من وجود مجلد uploads
mkdir -p /var/www/followerjerry.com/server/uploads
chmod 755 /var/www/followerjerry.com/server/uploads

# تأكد من proxy في Nginx
grep -A3 "uploads" /etc/nginx/sites-available/followerjerry.com
# يجب أن يحتوي على:
#   location /uploads/ {
#       proxy_pass http://127.0.0.1:5000/uploads/;
#   }
```

### نسيت كلمة مرور الأدمن:
```bash
# على السيرفر
cd /var/www/followerjerry.com/server
node seed.js
# يعيد تعيين: admin / admin123
```

### المساحة ممتلئة على السيرفر:
```bash
# عرض المساحة
df -h

# مسح سجلات PM2
pm2 flush

# مسح سجلات النظام
journalctl --vacuum-size=50M
```

---

## 7. 📁 هيكل المشروع

```
jerry/
│
├── 📁 server/                          # ⚙️ السيرفر الخلفي (Node.js + Express)
│   │
│   ├── index.js                        # � نقطة البداية — يشغل السيرفر ويوصل بقاعدة البيانات
│   ├── seed.js                         # 🌱 يزرع بيانات أولية (حساب أدمن + إعدادات)
│   ├── migrate-services.js             # 🔄 سكربت هجرة — يعطي serviceNumber للخدمات القديمة
│   ├── .env                            # 🔐 متغيرات البيئة (كلمات سر، مفاتيح API) — سري!
│   ├── package.json                    # 📦 تبعيات السيرفر
│   │
│   ├── �📁 models/                      # 🗃️ نماذج قاعدة البيانات (MongoDB/Mongoose)
│   │   ├── User.js                     #   👤 المستخدمين (اسم، إيميل، رصيد، كلمة سر)
│   │   ├── Order.js                    #   🛒 الطلبات (خدمة، كمية، سعر، حالة)
│   │   ├── Service.js                  #   � الخدمات (اسم، سعر، معرف المزود، رقم تسلسلي)
│   │   ├── Category.js                 #   �📁 الأقسام (اسم، صورة، قسم أب)
│   │   ├── Provider.js                 #   🏭 المزودين (اسم، رابط API، مفتاح API)
│   │   ├── Gateway.js                  #   � بوابات الدفع (نوع، إعدادات، حالة)
│   │   ├── Coupon.js                   #   🎟️ كوبونات الخصم (كود، قيمة، صلاحية)
│   │   ├── Notification.js             #   🔔 الإشعارات (عنوان، محتوى، مجدولة/فورية)
│   │   ├── Ticket.js                   #   🎫 تذاكر الدعم (مستخدم، رسائل، حالة)
│   │   ├── Transaction.js              #   💰 المعاملات المالية (إيداع، سحب، مبلغ)
│   │   └── Settings.js                 #   ⚙️ إعدادات الموقع (اسم، وصف، شعار)
│   │
│   ├── 📁 routes/                      # 🛤️ مسارات API (نقاط الوصول)
│   │   ├── auth.js                     #   🔑 تسجيل دخول، تسجيل، نسيت كلمة المرور
│   │   ├── orders.js                   #   🛒 إنشاء طلب، عرض طلبات، إلغاء
│   │   ├── services.js                 #   📄 عرض/إضافة/تعديل/حذف خدمات
│   │   ├── categories.js               #   📁 عرض/إضافة/تعديل/حذف أقسام
│   │   ├── providers.js                #   🏭 إدارة المزودين + استيراد خدمات
│   │   ├── gateways.js                 #   💳 إدارة بوابات الدفع
│   │   ├── coupons.js                  #   🎟️ إدارة كوبونات الخصم
│   │   ├── stats.js                    #   📊 إحصائيات (مستخدمين، طلبات، أرباح)
│   │   ├── settings.js                 #   ⚙️ إعدادات الموقع العامة
│   │   ├── tickets.js                  #   🎫 تذاكر الدعم الفني
│   │   ├── notifications.js            #   🔔 إدارة الإشعارات
│   │   ├── referrals.js                #   🤝 نظام الإحالات والعمولات
│   │   ├── upload.js                   #   📤 رفع الصور
│   │   ├── backup.js                   #   💾 نسخ احتياطي واستعادة
│   │   ├── apiv2.js                    #   🔌 API خارجي (للعملاء يتصلون من برامجهم)
│   │   ├── nowpayments.js              #   ₿ بوابة دفع العملات الرقمية
│   │   └── asiacell.js                 #   📱 بوابة دفع آسيا سيل
│   │
│   ├── 📁 utils/                       # 🔧 أدوات مساعدة
│   │   ├── smmApi.js                   #   🌐 الاتصال بـ API المزود (طلبات، أرصدة)
│   │   ├── email.js                    #   📧 إرسال إيميلات (تأكيد، استعادة كلمة مرور)
│   │   └── referral.js                 #   🤝 حساب عمولات الإحالة
│   │
│   ├── 📁 middleware/                  # 🛡️ وسطاء
│   │   └── authMiddleware.js           #   🔒 التحقق من صلاحيات المستخدم/الأدمن
│   │
│   └── 📁 uploads/                     # 🖼️ الصور المرفوعة (صور الأقسام)
│
├── 📁 src/                             # 🎨 الواجهة الأمامية (React + TypeScript)
│   │
│   ├── 📁 sections/                    # 📱 الصفحات الرئيسية
│   │   ├── LandingPage.tsx             #   🏠 الصفحة الرئيسية (الترحيب)
│   │   ├── AuthPage.tsx                #   🔐 تسجيل الدخول والتسجيل
│   │   ├── Dashboard.tsx               #   📊 لوحة تحكم المستخدم + المتجر + الطلبات
│   │   │
│   │   └── 📁 Admin/                   #   👑 لوحة الأدمن
│   │       ├── AdminLogin.tsx          #     🔑 تسجيل دخول الأدمن
│   │       ├── AdminDashboard.tsx      #     📋 الصفحة الرئيسية للأدمن
│   │       │
│   │       └── 📁 views/              #     📄 صفحات الأدمن الفرعية
│   │           ├── StatsView.tsx       #       📊 الإحصائيات والتقارير
│   │           ├── ServicesView.tsx    #       📄 إدارة الخدمات والأقسام
│   │           ├── ProvidersView.tsx   #       🏭 إدارة المزودين واستيراد خدمات
│   │           ├── GatewaysView.tsx    #       💳 إدارة بوابات الدفع
│   │           ├── CouponsView.tsx     #       🎟️ إدارة الكوبونات
│   │           ├── ContentView.tsx     #       📝 إدارة المحتوى (شروط، عنا)
│   │           ├── NotificationsView.tsx #     🔔 إدارة الإشعارات
│   │           ├── SupportView.tsx     #       💬 إدارة عامة للدعم
│   │           ├── TicketsView.tsx     #       🎫 إدارة تذاكر الدعم
│   │           └── AdminSettingsView.tsx #     ⚙️ إعدادات الموقع والإحالات
│   │
│   ├── 📁 components/                  # 🧩 مكونات قابلة لإعادة الاستخدام
│   │   ├── 📁 custom/                 #   🎨 مكونات مخصصة
│   │   │   ├── Header.tsx             #     📱 الشريط العلوي + القائمة الجانبية (هاتف)
│   │   │   ├── Sidebar.tsx            #     🖥️ الشريط الجانبي (كمبيوتر)
│   │   │   ├── CategoryBrowser.tsx    #     📁 متصفح الأقسام في المتجر
│   │   │   └── ServicesList.tsx       #     📄 قائمة الخدمات
│   │   │
│   │   └── 📁 ui/                     #   🎯 مكونات UI أساسية (أزرار، حقول، بطاقات)
│   │
│   ├── 📁 contexts/                    # 🌍 سياقات React (بيانات مشتركة)
│   │   ├── LanguageContext.tsx         #   🌐 نظام اللغات (عربي/إنجليزي) + جميع الترجمات
│   │   └── AuthContext.tsx            #   🔑 حالة تسجيل الدخول ومعلومات المستخدم
│   │
│   └── 📁 lib/                        # 📚 دوال مساعدة
│       ├── api.ts                     #   🌐 دوال الاتصال بالسيرفر (apiFetch, adminFetch)
│       ├── formatPrice.ts             #   💲 تنسيق الأسعار بدقة كاملة
│       └── utils.ts                   #   🔧 دوال متنوعة
│
├── 📁 dist/                            # 📦 ملفات البناء (تتولد تلقائياً بـ npm run build)
│
├── deploy_app.sh                       # 🚀 سكربت نشر التطبيق على السيرفر
├── setup_server.sh                     # 🖥️ سكربت إعداد السيرفر (Node, MongoDB, Nginx)
├── PROJECT_GUIDE.md                    # 📘 هذا الملف — دليل الإدارة
├── package.json                        # 📦 تبعيات الواجهة الأمامية
├── vite.config.ts                      # ⚡ إعدادات Vite (أداة البناء)
├── tsconfig.json                       # 📝 إعدادات TypeScript
├── index.html                          # 🌐 صفحة HTML الرئيسية
└── .gitignore                          # 🚫 ملفات يتجاهلها Git
```

---

## 📌 ملخص سريع

| المهمة | الأمر |
|---|---|
| رفع تعديل | `git add -A && git commit -m "msg" && git push origin master` |
| تحديث السيرفر | `cd /var/www/followerjerry.com && git fetch origin && git reset --hard origin/master && npm run build && pm2 restart jerry-api` |
| عرض السجلات | `pm2 logs jerry-api` |
| إعادة التشغيل | `pm2 restart jerry-api` |
| نسخة احتياطية | `mongodump --db jerry --out /root/backup_$(date +%Y%m%d)` |
