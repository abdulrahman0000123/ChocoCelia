# دليل رفع المشروع - CHOCO-CELIA 🍫

## 📋 ملخص سريع

المشروع جاهز للرفع! اتبع الخطوات التالية:

---

## ✅ الخطوة 1: إنشاء قاعدة البيانات على Supabase

1. **اذهب إلى:** https://supabase.com
2. **اضغط "Start your project"**
3. **سجل دخول بحساب GitHub**
4. **اضغط "New Project"**
5. **املأ البيانات:**
   - اسم المشروع: `choco-celia`
   - كلمة مرور قاعدة البيانات: (اختار كلمة قوية واحفظها!)
   - المنطقة: `Central EU`
   - الباقة: **Free** (مجاني)
6. **انتظر 2-3 دقائق**

### احصل على رابط الاتصال:
1. اذهب إلى **Settings** → **Database**
2. انسخ الـ **Connection string (URI)**
3. غيّر `[YOUR-PASSWORD]` بكلمة المرور
4. **احفظ هذا الرابط!**

---

## 🚀 الخطوة 2: الرفع على Vercel

### الطريقة السهلة (موصى بها):

#### 1. إنشاء Repository على GitHub:
1. **حمّل GitHub Desktop من:** https://desktop.github.com/
2. **ثبت البرنامج وسجل دخول**
3. **اضغط File → Add Local Repository**
4. **اختار مجلد المشروع:**
   ```
   C:\Users\Abdo\OneDrive - Notley Green Primary School\Desktop\ChocoCelia
   ```
5. **اضغط "Create Repository"**
6. **اضغط "Publish repository"**
7. **خلّي "Keep this code private" محدد**
8. **اضغط "Publish repository"**

#### 2. الرفع على Vercel:
1. **اذهب إلى:** https://vercel.com
2. **اضغط "Sign Up" → "Continue with GitHub"**
3. **اضغط "Import Project"**
4. **اختار مشروع `choco-celia`**
5. **اضغط "Import"**

#### 3. إضافة المتغيرات البيئية:
قبل الـ Deploy، أضف هذه المتغيرات:

| الاسم | القيمة |
|------|-------|
| `DATABASE_URL` | (الصق رابط Supabase) |
| `JWT_SECRET` | `any-random-secret-key-at-least-32-characters` |

#### 4. Deploy!
**اضغط "Deploy" وانتظر 2-3 دقائق**

🎉 **موقعك شغال دلوقتي!**

---

## 🔧 الخطوة 3: تشغيل Database

بعد ما الموقع يرفع، روح على Vercel Settings وحدّث `NEXT_PUBLIC_APP_URL` برابط الموقع.

بعدين شغّل الأوامر دي محلياً:

```powershell
# حدّث ملف .env برابط Supabase
# بعدين شغّل:

npx prisma migrate deploy
npx prisma db seed
```

---

## 🎯 روابط الموقع

- **الموقع الرئيسي:** `https://choco-celia.vercel.app`
- **لوحة التحكم:** `https://choco-celia.vercel.app/admin/login`

### بيانات الدخول الافتراضية:
- **اسم المستخدم:** `admin`
- **كلمة المرور:** `admin123`

**⚠️ مهم جداً:** غيّر كلمة المرور فوراً بعد أول دخول!

---

## 📝 تخصيص الموقع

1. اذهب إلى `/admin/dashboard/settings`
2. ارفع اللوجو
3. أضف بيانات التواصل
4. ضع صور الـ Hero (استخدم روابط من Unsplash)
5. أضف المنتجات في `/admin/dashboard/products`

---

## 💰 الباقات المجانية

### Vercel (مجاني):
- ✅ 100 جيجا باندويث شهرياً
- ✅ مواقع غير محدودة
- ✅ HTTPS تلقائي
- ✅ دومين مخصص

### Supabase (مجاني):
- ✅ 500 ميجا قاعدة بيانات
- ✅ 2 جيجا باندويث شهرياً
- ✅ 50,000 مستخدم نشط شهرياً

---

## 🔄 تحديث الموقع بعد التعديلات

### باستخدام GitHub Desktop:
1. افتح GitHub Desktop
2. اكتب رسالة التحديث
3. اضغط "Commit to main"
4. اضغط "Push origin"
5. **Vercel هيحدّث الموقع تلقائياً!** 🚀

---

## 📞 لو محتاج مساعدة

- اقرأ ملف `DEPLOYMENT.md` للتفاصيل الكاملة
- شوف الـ Troubleshooting section
- أو اسألني! 😊

**صنع بـ ❤️ وشوكولاتة كتير** 🍫
