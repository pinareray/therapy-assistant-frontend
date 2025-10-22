# 🚀 Vercel Deployment - Hızlı Başlangıç

## 1️⃣ Vercel'e Git

[vercel.com](https://vercel.com) → GitHub ile giriş yap

---

## 2️⃣ Projeyi Import Et

1. "Add New Project" butonuna tıkla
2. `akbank-genai-frontend` repository'sini seç
3. "Import" butonuna tıkla

---

## 3️⃣ Environment Variable Ekle

**ÇOK ÖNEMLİ**: Build Settings'te "Environment Variables" bölümüne:

```
Name:  VITE_API_URL
Value: https://therapy-assistant-backend.onrender.com
```

**Environment seçimi**: Production, Preview, Development (hepsini işaretle)

---

## 4️⃣ Deploy Et

"Deploy" butonuna tıkla → 2 dakika bekle → Hazır! 🎉

---

## 5️⃣ Backend'i Güncelle

Backend ekibine Vercel URL'ini gönder (örn: `https://akbank-genai-frontend.vercel.app`)

Backend'de CORS settings'e eklesinler:

```python
CORS(app, origins=[
    "https://akbank-genai-frontend.vercel.app",
    "https://*.vercel.app"  # Tüm preview URL'leri
])
```

---

## 6️⃣ Test Et

1. Vercel URL'ini aç
2. Anonymous user olarak 5 soru sor ✅
3. Kayıt ol → İsminle selamlanmalı ✅
4. Login yap → Chat çalışmalı ✅

---

## ❓ Sorun mu var?

Detaylı çözümler için: `VERCEL_DEPLOYMENT.md` dosyasına bak

**Hızlı Debug**:
- Browser Console'u aç (F12)
- Network tab'ını kontrol et
- Error mesajlarını oku
- CORS error varsa backend ekibine söyle

---

## 🎯 Özet

1. ✅ Vercel'e import et
2. ✅ `VITE_API_URL` environment variable ekle
3. ✅ Deploy et
4. ✅ Backend CORS güncelle
5. ✅ Test et
6. ✅ Kullanıma hazır!

**Toplam süre**: ~5 dakika
