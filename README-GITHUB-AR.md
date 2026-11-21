# إصلاح بناء APK عبر GitHub Actions

## سبب الخطأ السابق

كان سير العمل ينفذ `cd android` قبل التأكد من إنشاء مشروع Android. لذلك ظهر:

`android: No such file or directory`

## ما الذي تغير؟

أضيف الملف `.github/workflows/build-android.yml`. يقوم بترتيب الخطوات كما يلي:

1. تثبيت اعتماديات Node.js.
2. إنشاء مشروع Android بواسطة `npx cap add android` إذا لم يكن مجلد `android` موجوداً.
3. مزامنة ملفات الويب بواسطة `npx cap sync android`.
4. بناء APK تجريبي باستخدام Gradle.
5. رفع APK كـ Artifact باسم `noor-academy-debug-apk`.

## طريقة الاستخدام

ارفع محتويات هذا المشروع إلى جذر مستودع GitHub نفسه، مع الحفاظ على المجلد المخفي `.github` ومحتوياته. بعد ذلك افتح تبويب **Actions**، واختر **Build Noor Academy APK**، ثم اضغط **Run workflow**.

بعد نجاح التشغيل، افتح صفحة التشغيل وانزل إلى قسم **Artifacts**، ثم نزّل `noor-academy-debug-apk`. داخل الملف المضغوط ستجد `app-debug.apk`.

## ملاحظة

هذا APK تجريبي Debug وغير موقّع للنشر على Google Play. بناء نسخة Release وتوقيعها يحتاجان إعداد مفتاح توقيع آمن. كما أن هذا الإصلاح يعالج غياب مجلد Android تحديداً؛ ولا يحوّل خدمات الدفع أو اجتماعات Zoom التجريبية إلى خدمات إنتاجية.
