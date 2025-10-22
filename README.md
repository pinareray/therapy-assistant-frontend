# 🌐 ZeniTalk Frontend - React Application

<div align="center">

![React](https://img.shields.io/badge/React-18+-61DAFB.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue.svg)
![Material-UI](https://img.shields.io/badge/MUI-5+-007FFF.svg)
![Axios](https://img.shields.io/badge/Axios-1.6+-5A29E4.svg)

**Akbank GenAI Bootcamp 2025 - Frontend Project**

ZeniTalk psikolojik destek chatbot'u için kullanıcı arayüzü.

</div>

---

## 📋 İçindekiler

1. [Proje Hakkında](#-proje-hakkında)
2. [Özellikler](#-özellikler)
3. [Kurulum](#-kurulum)
4. [Proje Yapısı](#-proje-yapısı)
5. [Kullanılan Teknolojiler](#-kullanılan-teknolojiler)
6. [Sayfa ve Bileşenler](#-sayfa-ve-bileşenler)
7. [API Entegrasyonu](#-api-entegrasyonu)
8. [Deployment](#-deployment)

---

## 🎯 Proje Hakkında

ZeniTalk Frontend, kullanıcılara sezgisel ve kullanıcı dostu bir arayüz sunan React tabanlı single-page application (SPA)'dir. Proje, modern web teknolojileri ve best practices kullanılarak geliştirilmiştir.

### Temel Özellikler

- 🎨 Modern ve responsive tasarım
- 🔐 JWT tabanlı authentication
- 💬 Real-time chat interface
- 📊 Kullanım istatistikleri gösterimi
- 🎭 Misafir ve kayıtlı kullanıcı modları
- 📱 Mobile-first yaklaşım
- ⚡ Fast loading & optimized performance

---

## 🛠 Kurulum

### Ön Gereksinimler

- **Node.js 18+** → [İndir](https://nodejs.org/)
- **npm veya yarn**
- **Backend API** çalışıyor olmalı 

---

### Adım 1: Repository'yi Klonlayın

```bash
git clone https://github.com/pinareray/zenitalk-frontend.git
cd zenitalk-frontend
```

### Adım 2: Bağımlılıkları Yükleyin

```bash
# npm ile
npm install

# veya yarn ile
yarn install
```

### Adım 3: Environment Variables

Proje kök dizininde `.env.local` dosyası oluşturun:

```env
# Backend API URL
REACT_APP_API_URL=http://localhost:5001

# App Config (opsiyonel)
REACT_APP_NAME=ZeniTalk
REACT_APP_ANONYMOUS_LIMIT=5
REACT_APP_REGISTERED_LIMIT=50
```

### Adım 4: Development Server'ı Başlatın

```bash
# npm ile
npm start

# veya yarn ile
yarn start
```

**Frontend şimdi `http://localhost:3000` adresinde çalışıyor!** 🎉

---

## 🧰 Kullanılan Teknolojiler

| Teknoloji | Versiyon | Kullanım Amacı |
|-----------|----------|----------------|
| **React** | 18.2+ | UI library, component-based architecture |
| **React Router** | 6.x | Client-side routing |
| **Axios** | 1.6+ | HTTP client, API requests |
| **Material-UI (MUI)** | 5.x | UI components & styling |
| **React Context API** | Built-in | State management (auth) |
| **LocalStorage API** | Built-in | JWT token persistence |
| **CSS Modules / Styled Components** | - | Component styling |

---

