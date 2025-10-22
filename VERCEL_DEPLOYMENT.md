# Vercel Deployment Guide - ZeniTalk Frontend

Bu döküman, ZeniTalk frontend uygulamasını Vercel'e deploy etmek için gerekli adımları içerir.

---

## 🎯 Ön Hazırlık

### 1. Backend Kontrol

Backend Render'da çalışıyor olmalı:
- **Backend URL**: `https://therapy-assistant-backend.onrender.com`
- **Test Endpoint**: `https://therapy-assistant-backend.onrender.com/auth/me`

### 2. CORS Ayarları (Backend)

Backend'de CORS ayarlarının Vercel domain'ini kabul ettiğinden emin olun:

```python
from flask_cors import CORS

# Development + Production origins
CORS(app, origins=[
    "http://localhost:5173",
    "http://localhost:5174",
    "https://your-app.vercel.app",  # Vercel domain buraya eklenecek
    "https://*.vercel.app"  # Tüm Vercel preview URL'leri
])
```

---

## 📦 Deployment Adımları

### Adım 1: Vercel Hesabı Oluştur

1. [vercel.com](https://vercel.com) adresine git
2. GitHub hesabınla giriş yap
3. "Add New Project" butonuna tıkla

### Adım 2: GitHub Repository'yi Bağla

1. GitHub repository'nizi seçin: `akbank-genai-frontend`
2. "Import" butonuna tıklayın

### Adım 3: Proje Ayarları

Vercel otomatik olarak Vite projesini algılayacak:

- **Framework Preset**: Vite ✅ (otomatik algılanır)
- **Root Directory**: `./` (varsayılan)
- **Build Command**: `npm run build` ✅ (otomatik)
- **Output Directory**: `dist` ✅ (otomatik)
- **Install Command**: `npm install` ✅ (otomatik)

### Adım 4: Environment Variables Ekle

**ÇOK ÖNEMLİ**: Production backend URL'ini Vercel'e ekleyin:

1. "Environment Variables" bölümüne gidin
2. Şu değişkeni ekleyin:

```
Name: VITE_API_URL
Value: https://therapy-assistant-backend.onrender.com
Environment: Production, Preview, Development (hepsini seç)
```

**NOT**: Vite environment variable'ları `VITE_` prefix'i ile başlamalıdır!

### Adım 5: Deploy Et

1. "Deploy" butonuna tıklayın
2. Build işlemi 1-2 dakika sürecek
3. Build başarılı olursa, Vercel size bir URL verecek:
   - **Production**: `https://akbank-genai-frontend.vercel.app`
   - **Preview**: Her commit için otomatik preview URL'i

---

## 🔧 Vercel Dashboard Ayarları

### Domain Ayarları (Opsiyonel)

Kendi domain'inizi eklemek için:

1. Project Settings → Domains
2. "Add Domain" butonuna tıklayın
3. Domain'inizi ekleyin (örn: `zenitalk.com`)
4. DNS kayıtlarını yapılandırın (Vercel size adımları gösterecek)

### Automatic Deployments

✅ **GitHub Integration Aktif**
- Her `master` branch'e push otomatik deploy olur
- Her PR için preview URL oluşturulur
- Commit mesajları deployment loglarında görünür

---

## 🧪 Test

### 1. Local Test

Deployment öncesi local'de test edin:

```bash
# Environment variable'ı .env dosyasında güncelleyin
echo "VITE_API_URL=https://therapy-assistant-backend.onrender.com" > .env

# Build'i test edin
npm run build

# Build'i preview edin
npm run preview
```

Preview URL'i açın (genelde `http://localhost:4173`) ve test edin:
- ✅ Login çalışıyor mu?
- ✅ Register çalışıyor mu?
- ✅ Chat çalışıyor mu?
- ✅ Anonymous user soru sorabiliyor mu?

### 2. Production Test

Vercel'de deploy sonrası:

1. Vercel URL'ini açın (örn: `https://akbank-genai-frontend.vercel.app`)
2. Browser console'u açın (F12)
3. Test senaryoları:

#### Anonymous User Testi
- Chat sayfasına git
- 5 soru sor
- 5. sorudan sonra kayıt modal'ı açılmalı ✅

#### Registered User Testi
- "Kayıt Ol" butonuna tıkla
- İsim, soyisim, email, şifre gir
- Kayıt ol
- Navbar'da ismin görünmeli ✅
- Chat'te "Hoş geldin, [ismin]" yazmalı ✅
- 50 soru hakkın olmalı ✅

#### Network Kontrol
- Browser Developer Tools → Network
- `/chat` request'ine bak
- `Authorization: Bearer ...` header'ı olmalı ✅
- Backend URL: `https://therapy-assistant-backend.onrender.com/chat` ✅

---

## 🐛 Hata Çözümleri

### 1. "Failed to fetch" Hatası

**Sebep**: CORS hatası veya backend çalışmıyor

**Çözüm**:
- Backend'in çalıştığını kontrol et: `curl https://therapy-assistant-backend.onrender.com/auth/me`
- Backend CORS ayarlarını kontrol et
- Vercel URL'ini backend'de allowed origins'a ekle

### 2. Environment Variable Çalışmıyor

**Sebep**: `VITE_` prefix'i eksik veya rebuild gerekli

**Çözüm**:
- Environment variable isminin `VITE_API_URL` olduğundan emin ol
- Vercel'de "Redeploy" butonuna tıkla
- Console'da `console.log(import.meta.env.VITE_API_URL)` ile kontrol et

### 3. 404 Error on Refresh

**Sebep**: SPA routing sorunu

**Çözüm**: ✅ `vercel.json` dosyası zaten eklenmiş, tüm route'lar `/index.html`'e yönlendiriliyor.

### 4. Build Hatası

**Sebep**: Dependencies veya syntax hatası

**Çözüm**:
```bash
# Local'de build test et
npm run build

# Hataları düzelt
# Tekrar deploy et
git add .
git commit -m "Fix build errors"
git push origin master
```

### 5. Backend Slow Response

**Sebep**: Render free tier cold start (15-30 saniye)

**Çözüm**:
- İlk request uzun sürebilir, normal
- Production'da paid plan kullanmak çözüm
- Loading state'leri eklendi ✅

---

## 📊 Monitoring

### Vercel Analytics (Ücretsiz)

1. Project Settings → Analytics
2. "Enable Analytics" butonuna tıkla
3. Metrikleri görüntüle:
   - Page views
   - Visitors
   - Performance
   - Web Vitals

### Error Tracking

Vercel otomatik olarak runtime error'ları yakalar:
1. Project → Runtime Logs
2. Error'ları filtrele
3. Stack trace'leri incele

---

## 🚀 CI/CD Pipeline

### Otomatik Deployment

✅ **Aktif**: Her `master` push'u otomatik deploy edilir

```bash
# Yeni feature geliştir
git checkout -b feature/new-feature

# Commit yap
git add .
git commit -m "Add new feature"

# Master'a merge et
git checkout master
git merge feature/new-feature

# Push yap → Otomatik deploy başlar
git push origin master
```

### Preview Deployments

✅ **Aktif**: Her PR için otomatik preview URL

```bash
# PR oluştur
git checkout -b fix/bug-fix
git add .
git commit -m "Fix bug"
git push origin fix/bug-fix

# GitHub'da PR aç
# Vercel otomatik olarak preview URL oluşturur
# PR comment'inde link görünür
```

---

## 🔒 Güvenlik

### Headers

✅ `vercel.json` dosyasında güvenlik header'ları eklendi:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`

### Environment Variables

✅ `.env` dosyası `.gitignore`'da - GitHub'a push edilmez
✅ Production secrets Vercel Dashboard'da saklanır

### HTTPS

✅ Vercel otomatik HTTPS sağlar
✅ SSL sertifikaları otomatik yenilenir

---

## 📝 Checklist

Deploy öncesi kontrol listesi:

- [x] Backend Render'da çalışıyor
- [x] Backend CORS ayarları yapılandı
- [x] `VITE_API_URL` environment variable tanımlandı
- [x] `.env` dosyası `.gitignore`'da
- [x] `vercel.json` oluşturuldu (SPA routing)
- [x] Local build test edildi (`npm run build`)
- [x] Local preview test edildi (`npm run preview`)
- [ ] Vercel hesabı oluşturuldu
- [ ] GitHub repo Vercel'e bağlandı
- [ ] Environment variable Vercel'de tanımlandı
- [ ] İlk deployment başarılı
- [ ] Production test edildi (login, register, chat)
- [ ] Backend CORS'a Vercel URL eklendi

---

## 📞 Deployment Sonrası

### Production URL'leri

- **Frontend**: `https://akbank-genai-frontend.vercel.app` (deploy sonrası değişebilir)
- **Backend**: `https://therapy-assistant-backend.onrender.com`

### Backend'e Bildir

Backend ekibine Vercel URL'ini gönderin, CORS settings'e eklesinler:

```python
CORS(app, origins=[
    "https://akbank-genai-frontend.vercel.app",
    "https://*.vercel.app"
])
```

---

## 🎉 Deploy Tamamlandı!

Frontend başarıyla Vercel'de yayında! 🚀

**Sonraki Adımlar**:
1. ✅ Production'da test et
2. ✅ Backend CORS güncelle
3. ✅ Custom domain ekle (opsiyonel)
4. ✅ Analytics enable et
5. ✅ Kullanıcılara duyur!

**Sorular için**: [Vercel Documentation](https://vercel.com/docs)
