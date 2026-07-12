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

## 5. Lokal test qilish (ixtiyoriy)

```bash
npm install -g netlify-cli
npm install
netlify dev
```

Bu brauzeringizda `localhost:8888` manzilida saytni Netlify Functions bilan birga ishga tushiradi.
