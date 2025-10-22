# Backend Değişiklikleri - İsim ve Soyisim Ekleme

Frontend'de kayıt formuna **isim** ve **soyisim** alanları eklendi. Kullanıcıya email yerine ismi ile hitap edilmesi için backend'de aşağıdaki değişiklikler yapılmalıdır.

---

## 1. Veritabanı Modeli Güncelleme

`User` modelinde `name` ve `surname` kolonları eklenmelidir.

### Örnek SQLAlchemy Modeli:

```python
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)

    # YENİ ALANLAR
    name = db.Column(db.String(100), nullable=False)
    surname = db.Column(db.String(100), nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,           # YENİ
            'surname': self.surname,     # YENİ
            'created_at': self.created_at.isoformat()
        }
```

---

## 2. Database Migration

Mevcut veritabanına yeni kolonları eklemek için migration gereklidir.

### Flask-Migrate ile Migration:

```bash
# Migration oluştur
flask db migrate -m "Add name and surname to User model"

# Migration'ı uygula
flask db upgrade
```

### Manuel SQL (Eğer migration kullanmıyorsanız):

```sql
-- PostgreSQL / MySQL için
ALTER TABLE users ADD COLUMN name VARCHAR(100) NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN surname VARCHAR(100) NOT NULL DEFAULT '';

-- Mevcut kullanıcılar için default değer kaldır (opsiyonel)
ALTER TABLE users ALTER COLUMN name DROP DEFAULT;
ALTER TABLE users ALTER COLUMN surname DROP DEFAULT;
```

**NOT**: Mevcut kullanıcılar için name ve surname alanları boş olacak. İsterseniz default değer olarak email'in bir kısmını veya "User" gibi bir değer atayabilirsiniz.

---

## 3. `/auth/register` Endpoint Güncelleme

Frontend artık `name` ve `surname` gönderiyor, backend'in bunları alması gerekiyor.

### Güncellenmiş Endpoint:

```python
from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash
from flask_jwt_extended import create_access_token

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()

    # Validation
    name = data.get('name', '').strip()
    surname = data.get('surname', '').strip()
    email = data.get('email', '').strip()
    password = data.get('password', '')

    # Zorunlu alan kontrolü
    if not name:
        return jsonify({'error': 'İsim gerekli'}), 400

    if not surname:
        return jsonify({'error': 'Soyisim gerekli'}), 400

    if not email:
        return jsonify({'error': 'Email gerekli'}), 400

    if not password:
        return jsonify({'error': 'Şifre gerekli'}), 400

    if len(password) < 6:
        return jsonify({'error': 'Şifre en az 6 karakter olmalı'}), 400

    # Email zaten kayıtlı mı kontrol et
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({'error': 'Bu email zaten kayıtlı'}), 409

    # Yeni kullanıcı oluştur
    password_hash = generate_password_hash(password)
    new_user = User(
        email=email,
        password_hash=password_hash,
        name=name,          # YENİ
        surname=surname     # YENİ
    )

    db.session.add(new_user)
    db.session.commit()

    # JWT token oluştur (7 gün)
    access_token = create_access_token(
        identity=new_user.id,
        expires_delta=timedelta(days=7)
    )

    # Response - name ve surname dahil et
    return jsonify({
        'message': 'Kayıt başarılı',
        'access_token': access_token,
        'user': {
            'id': new_user.id,
            'email': new_user.email,
            'name': new_user.name,          # YENİ
            'surname': new_user.surname     # YENİ
        }
    }), 201
```

---

## 4. `/auth/login` Endpoint Güncelleme

Login response'una da name ve surname eklenmeli.

### Güncellenmiş Endpoint:

```python
from werkzeug.security import check_password_hash

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    email = data.get('email', '').strip()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'error': 'Email ve şifre gerekli'}), 400

    # Kullanıcıyı bul
    user = User.query.filter_by(email=email).first()

    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({'error': 'Email veya şifre hatalı'}), 401

    # JWT token oluştur
    access_token = create_access_token(
        identity=user.id,
        expires_delta=timedelta(days=7)
    )

    # Response - name ve surname dahil et
    return jsonify({
        'message': 'Giriş başarılı',
        'access_token': access_token,
        'user': {
            'id': user.id,
            'email': user.email,
            'name': user.name,          # YENİ
            'surname': user.surname     # YENİ
        }
    }), 200
```

---

## 5. `/auth/me` Endpoint Güncelleme

Kullanıcı bilgilerini dönerken name ve surname ekle.

### Güncellenmiş Endpoint:

```python
from flask_jwt_extended import jwt_required, get_jwt_identity

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    current_user_id = get_jwt_identity()

    user = User.query.get(current_user_id)

    if not user:
        return jsonify({'error': 'Kullanıcı bulunamadı'}), 404

    return jsonify({
        'user': {
            'id': user.id,
            'email': user.email,
            'name': user.name,          # YENİ
            'surname': user.surname     # YENİ
        }
    }), 200
```

---

## 6. Frontend Request Formatı

Frontend şu formatta request gönderecek:

### `/auth/register` Request:

```javascript
POST http://localhost:5001/auth/register
Content-Type: application/json

{
  "name": "Ahmet",
  "surname": "Yılmaz",
  "email": "ahmet@example.com",
  "password": "123456"
}
```

### Beklenen Response:

```json
{
  "message": "Kayıt başarılı",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "ahmet@example.com",
    "name": "Ahmet",
    "surname": "Yılmaz"
  }
}
```

---

## 7. Frontend Kullanımı

Frontend artık şu şekilde çalışıyor:

1. **Navbar**: `user.name` gösteriyor (örn: "Ahmet")
2. **Dropdown**: `user.name + user.surname` gösteriyor (örn: "Ahmet Yılmaz")
3. **ChatPage**: "Hoş geldin, Ahmet" şeklinde selamlıyor

### Frontend'de User Objesi:

```javascript
{
  id: 1,
  email: "ahmet@example.com",
  name: "Ahmet",
  surname: "Yılmaz"
}
```

---

## 8. Test Checklist

Backend güncellemelerinden sonra test edilmesi gerekenler:

- [ ] Yeni kullanıcı kayıt olabilir (name + surname ile)
- [ ] Login response'unda name ve surname dönüyor
- [ ] `/auth/me` endpoint'i name ve surname dönüyor
- [ ] Frontend navbar'da isim görünüyor
- [ ] Frontend dropdown'da tam isim görünüyor
- [ ] ChatPage'de isimle selamlama yapılıyor
- [ ] Mevcut kullanıcılar için migration çalışıyor
- [ ] Validasyon hataları doğru şekilde dönüyor

---

## 9. Hata Durumları

Backend şu validasyon hatalarını dönmeli:

```python
# İsim boş
{'error': 'İsim gerekli'}, 400

# Soyisim boş
{'error': 'Soyisim gerekli'}, 400

# Email boş
{'error': 'Email gerekli'}, 400

# Şifre kısa
{'error': 'Şifre en az 6 karakter olmalı'}, 400

# Email zaten kayıtlı
{'error': 'Bu email zaten kayıtlı'}, 409
```

---

## 10. Opsiyonel İyileştirmeler

### İsim Validasyonu:

```python
import re

def validate_name(name):
    # Sadece harf ve boşluk
    if not re.match(r'^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$', name):
        return False

    # Minimum 2 karakter
    if len(name) < 2:
        return False

    # Maximum 100 karakter
    if len(name) > 100:
        return False

    return True

# Kullanımı
if not validate_name(name):
    return jsonify({'error': 'İsim geçersiz'}), 400
```

### İsimleri Title Case Yap:

```python
name = name.strip().title()      # "ahmet" -> "Ahmet"
surname = surname.strip().title()  # "yılmaz" -> "Yılmaz"
```

---

## Özet

**Yapılması Gerekenler**:

1. ✅ `User` modeline `name` ve `surname` kolonları ekle
2. ✅ Database migration yap
3. ✅ `/auth/register` endpoint'ini güncelle (name, surname kabul et)
4. ✅ `/auth/login` response'una name, surname ekle
5. ✅ `/auth/me` response'una name, surname ekle
6. ✅ Validasyon ekle (name ve surname zorunlu)
7. ✅ Test et (kayıt, login, profil görüntüleme)

**Frontend Tarafı**: Hazır! ✅
**Backend Tarafı**: Bu değişiklikleri yapmanız gerekiyor.
