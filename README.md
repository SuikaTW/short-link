# Short Link - 短網址生成器

一個簡單的短網址生成器，支援網址縮短與檔案上傳功能。

## 功能

- **短網址生成** — 輸入長網址，產生 8 碼短網址，點擊短網址即可重導向至原始網址
- **檔案上傳** — 上傳檔案後取得下載連結

## 技術架構

- **後端**: Express.js
- **資料庫**: SQLite3
- **前端**: HTML + Tailwind CSS
- **短碼生成**: nanoid

## 安裝與執行

```bash
npm install
node server.js
```

伺服器啟動後開啟 http://localhost:3000 即可使用。

## API

### 縮短網址

```
POST /api/shorten
Content-Type: application/json

{ "url": "https://example.com" }
```

回應：`{ "shortUrl": "http://localhost:3000/xxxxxxxx" }`

### 檔案上傳

```
POST /upload
Content-Type: multipart/form-data

file: <檔案>
```

回應：`{ "download_url": "http://localhost:3000/uploads/xxxxxx.ext" }`
