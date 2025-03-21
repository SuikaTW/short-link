const express = require('express');
const multer = require('multer');
const sqlite3 = require('sqlite3').verbose();
const { nanoid } = require('nanoid');
const cors = require('cors');
const path = require('path');

const app = express();
const db = new sqlite3.Database('./database.db');
const PORT = 3000;

// 設定 CORS
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 提供靜態檔案
app.use(express.static(path.join(__dirname)));

// 設定檔案上傳
const storage = multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
        const uniqueName = nanoid(6) + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});
const upload = multer({ storage });

// 創建資料表
db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS urls (id INTEGER PRIMARY KEY, long_url TEXT, short_code TEXT)");
    db.run("CREATE TABLE IF NOT EXISTS files (id INTEGER PRIMARY KEY, file_name TEXT, file_path TEXT, download_url TEXT)");
});

app.post('/api/shorten', (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    const shortCode = nanoid(8); // 使用 nanoid 生成唯一短碼
    const shortUrl = `http://localhost:${PORT}/${shortCode}`;

    // 將長網址與短碼儲存到資料庫
    db.run("INSERT INTO urls (long_url, short_code) VALUES (?, ?)", [url, shortCode], (err) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to save URL' });
        }
        res.json({ shortUrl });
    });
});

app.get('/:short_code', (req, res) => {
    const { short_code } = req.params;
    db.get("SELECT long_url FROM urls WHERE short_code = ?", [short_code], (err, row) => {
        if (row) {
            res.redirect(row.long_url);
        } else {
            res.status(404).send("Not Found");
        }
    });
});

// 檔案上傳 API
app.post('/upload', upload.single('file'), (req, res) => {
    const file_path = req.file.path;
    const file_name = req.file.originalname;
    const download_url = `http://localhost:3000/uploads/${req.file.filename}`;

    db.run("INSERT INTO files (file_name, file_path, download_url) VALUES (?, ?, ?)", [file_name, file_path, download_url], () => {
        res.json({ download_url });
    });
});

// 讓上傳的檔案可以被下載
app.use('/uploads', express.static('uploads'));

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
