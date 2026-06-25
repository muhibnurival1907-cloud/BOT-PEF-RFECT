const { Telegraf } = require('telegraf');
const YTDlpWrap = require('yt-dlp-wrap').default;
const os = require('os');
const path = require('path');

const bot = new Telegraf(process.env.BOT_TOKEN);

// Deteksi apakah di Windows atau Linux/Railway
const isWindows = os.platform() === 'win32';

// Jika di Railway, kita gunakan 'yt-dlp' yang sudah terinstall di sistem
const ytDlpPath = isWindows ? path.join(__dirname, 'yt-dlp.exe') : 'yt-dlp';
const ytDlpWrap = new YTDlpWrap(ytDlpPath);

bot.start((ctx) => ctx.reply('Bot Musik Aktif! Kirim link YouTube untuk mulai.'));

bot.on('text', async (ctx) => {
    const url = ctx.message.text;
    if (!url.includes('youtube.com') && !url.includes('youtu.be')) return;

    ctx.reply('Sedang memproses lagu...');
    
    try {
        // Contoh download ke format mp3
        let readableStream = ytDlpWrap.execStream([url, '-x', '--audio-format', 'mp3']);
        ctx.replyWithAudio({ source: readableStream });
    } catch (error) {
        ctx.reply('Gagal mengambil lagu: ' + error.message);
    }
});

bot.launch();
console.log('Bot sedang berjalan...');