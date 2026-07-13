# IT Turnir — Reyting va Ballash tizimi

Ikkita sahifadan iborat:

- **`/` (index.html)** — o'quvchilar uchun ochiq, real vaqtda yangilanadigan reyting. Parolsiz, hamma ko'ra oladi.
- **`/admin`** — faqat siz uchun, parol bilan himoyalangan ball kiritish paneli.

Ma'lumotlar **Netlify Blobs** deb ataladigan Netlify'ning o'zidagi bepul bulutli bazasida saqlanadi — Google Sheets yoki boshqa tashqi xizmat ulash shart emas, hech qanday API kalit sozlash kerak emas.

## 1. Netlify'ga joylashtirish

Eng ishonchli yo'l — GitHub orqali ulash (funksiyalar to'g'ri build bo'lishi uchun):

1. Bu papkani GitHub'ga yangi repo sifatida yuklang.
2. [app.netlify.com](https://app.netlify.com) → **Add new site → Import an existing project** → GitHub repo'ni tanlang.
3. Netlify sozlamalarini avtomatik aniqlaydi (`netlify.toml` fayli bor):
   - Publish directory: `public`
   - Functions directory: `netlify/functions`
4. **Deploy site** tugmasini bosing.

> Agar GitHub ishlatmoqchi bo'lmasangiz, [Netlify CLI](https://docs.netlify.com/cli/get-started/) orqali `netlify deploy --prod` buyrug'i bilan ham to'g'ridan-to'g'ri shu papkadan joylashtirish mumkin.

## 2. Admin parolini o'rnatish (MUHIM)

Sayt ishlashi uchun parol environment variable sifatida qo'shilishi kerak:

1. Netlify saytingizda: **Site configuration → Environment variables → Add a variable**
2. Key: `ADMIN_PASSWORD`
3. Value: o'zingiz xohlagan parol (masalan `Turnir2026!`)
4. Saqlang, so'ng **Deploys → Trigger deploy → Deploy site** orqali qayta deploy qiling (env o'zgaruvchi kuchga kirishi uchun).

Parolni istalgan vaqt shu yerdan o'zgartirishingiz mumkin — kodga tegish shart emas.

## 3. Foydalanish

- Reyting sahifasi: `https://sizning-saytingiz.netlify.app/`
- Admin sahifasi: `https://sizning-saytingiz.netlify.app/admin`
  - Bu linkni faqat o'zingiz saqlang, o'quvchilarga bermang.

Admin sahifasida:
- **"Ball qo'yish"** — jamoani tanlab, har bir komponent bo'yicha ball kiritasiz.
- **"Jamoalar"** — 50 ta standart nomni ("1-guruh" va h.k.) haqiqiy sinf nomlariga o'zgartirasiz.

Saqlagan har bir ball darhol reyting sahifasida ko'rinadi (u 5 soniyada bir avtomatik yangilanib turadi).

## 4. Xavfsizlik haqida eslatma

Bu — sinf/markaz ichidagi foydalanish uchun yengil himoya darajasi: bitta umumiy parol orqali kirish. Bank yoki to'lov tizimi darajasidagi himoya emas, lekin o'quvchilar tasodifan yoki ataylab ballarni o'zgartirib qo'yishining oldini oladi. Parolni faqat o'zingiz va ishonchli hamkasblaringiz bilan baham ko'ring.

## 5. Agar "500 Internal Server Error" chiqsa (Blobs bazasiga ulanish xatosi)

Ba'zan Netlify yangi saytlarda Blobs bazasiga avtomatik ulanishda muammo bo'ladi. Buni **doimiy va ishonchli** hal qilish uchun qo'lda token bilan ulash kerak:

1. Netlify'da yuqori o'ng burchakdagi profil rasmingizga bosing → **User settings**.
2. Chap menyudan **Applications** → **Personal access tokens** → **New access token**.
3. Nom bering (masalan `turnir-blobs`), yarating va chiqqan tokenni nusxalab oling (bu faqat bir marta ko'rsatiladi!).
4. Saytingizga qayting → **Site configuration → Environment variables → Add a variable**:
   - Key: `NETLIFY_BLOBS_TOKEN`
   - Value: nusxalagan token
5. **Deploys → Trigger deploy → Deploy site** orqali qayta deploy qiling.

Kod avtomatik ravishda shu tokenni topsa, aynan shu orqali (ishonchli usulda) ulanadi; token bo'lmasa, Netlify'ning avtomatik usuliga qaytadi.

**Xatoning aniq sababini ko'rish uchun:** Netlify saytida **Logs → Functions** bo'limiga kiring, `get-data` funksiyasini tanlang va so'nggi so'rov jurnalini o'qing — u yerda xato matni to'liq ko'rinadi. Shuningdek brauzerda **F12 → Network** bo'limidan `get-data` so'rovini bosib, "Response" qismidan xato tafsilotini ko'rishingiz mumkin (saytning yangi versiyasi bu tafsilotni endi ekranda ham ko'rsatadi).

## 7. Qura tashlash (setka) — Futbol, Counter-Strike, PUBG, Shashka

Admin panelning **"Qura tashlash"** bo'limida:

- Har bir sport turi uchun alohida sahifa: standart holatda Dasturlash bosqichida 35+ ball to'plagan (saralangan) jamoalar avtomatik belgilangan bo'ladi — xohlasangiz o'zgartirishingiz mumkin.
- **"Qura tashlash"** tugmasi bosilganda jamoalar tasodifiy tartibda juftlanadi va jahon chempionati uslubidagi (yagona eliminatsiya) setka yaratiladi. Jamoalar soni 2 ning darajasiga to'g'ri kelmasa (masalan 37 ta), ba'zi jamoalarga birinchi bosqichda avtomatik "bye" (raqibsiz o'tish) beriladi.
- Har bir o'yin natijasidan so'ng g'olibni bosib tanlang — u avtomatik ravishda keyingi bosqichga o'tadi. Final g'olibi aniqlanganda "🏆 Chempion" kartochkasi chiqadi.
- **"Qayta tashlash"** tugmasi — agar xato ketsa yoki qaytadan boshlash kerak bo'lsa, shu sport uchun setkani butunlay o'chirib, yangidan qura tashlash imkonini beradi (tasdiqlash so'raladi).

O'quvchilar `sizningsayt.netlify.app/setka` sahifasida barcha 4 sport bo'yicha setkani (kim kimga qarshi, kim g'olib chiqqani) jonli kuzatib borishlari mumkin — bu ham parolsiz, ochiq sahifa.

## 8. Lokal test qilish (ixtiyoriy)

```bash
npm install -g netlify-cli
npm install
netlify dev
```

Bu brauzeringizda `localhost:8888` manzilida saytni Netlify Functions bilan birga ishga tushiradi.
