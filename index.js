require('dotenv').config();
const { Telegraf } = require('telegraf');
const YTDlpWrap = require('yt-dlp-wrap').default;
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const bot = new Telegraf(process.env.BOT_TOKEN);

const isWindows = os.platform() === 'win32';
const ytDlpPath = isWindows ? path.join(__dirname, 'yt-dlp.exe') : 'yt-dlp';
const ffmpegPath = isWindows ? path.join(__dirname, 'ffmpeg.exe') : 'ffmpeg';

const folderDownloads = path.join(__dirname, 'downloads');
if (!fs.existsSync(folderDownloads)) {
    fs.mkdirSync(folderDownloads);
}

const ytDlpWrap = new YTDlpWrap(ytDlpPath);

// Debug di startup
console.log('🚀 Starting MarbequeMusic Bot...');
console.log('Platform:', os.platform());
console.log('yt-dlp path:', ytDlpPath);
console.log('ffmpeg path:', ffmpegPath);

try {
    console.log('yt-dlp version:', execSync('yt-dlp --version').toString().trim());
    console.log('ffmpeg version:', execSync('ffmpeg -version').toString().split('\n')[0]);
} catch (e) {
    console.error('❌ yt-dlp/ffmpeg tidak terdeteksi:', e.message);
}

async function persiapkanBot() {
    if (isWindows && !fs.existsSync(ytDlpPath)) {
        console.log('Downloading yt-dlp binary...');
        await YTDlpWrap.downloadFromGithub(ytDlpPath);
    }
    bot.launch().then(() => console.log('✅ Bot MarbequeMusic AKTIF!'));
}

// ==================== START COMMAND ====================
bot.start((ctx) => {
    const pesanMultibahasa = {
        id: "🎶\nMarbequeAssistant ↯ spotify ° auditorium ✾\n\n🇮🇩 [ID]\n( 👀 ) Halo ↯ Gunakan fitur bot ini dengan bijak. Pembuat bot tidak bertanggung jawab atas apa yang kamu lakukan dengan bot ini, selamat menikmati..\n\n",
        en: "🇬🇧 [EN]\n( 👀 ) Hello ↯ Use the bot feature wisely, the creator is not responsible for what you do with this bot, enjoy..\n\n",
        kr: "🇰🇷 [KR]\n( 👀 ) 안녕 ↯ 봇 기능을 현명하게 사용하세요. 제작자는 이 봇으로 일어나는 행동에 대해 책임을 지지 않습니다. 즐거웠던 시간 되세요..\n\n",
        jp: "🇯🇵 [JP]\n( 👀 ) こんにちは ↯ ボットの機能を賢く使ってください。作成者は、このボットであなたが何をするかについて責任を負いません。楽しんでください..\n\n",
        es: "🇪🇸 [ES]\n( 👀 ) ¡Hola ↯ Usa la función del bot sabiamente, el creador no es responsable de lo que hagas con este bot, disfrútalo..\n\n"
    };

    const footer = 
        "⬡ Author: @OribeAzusa31\n" +
        "⬡ Version: 1.0 Spotify integration\n" +
        "⬡ Framework: Telegraf\n" +
        "⬡ Prefix: /\n" +
        "⬡ premium : ✅\n\n" +
        "©ValValey31";

    const teksLengkap = pesanMultibahasa.id + pesanMultibahasa.en + pesanMultibahasa.kr + pesanMultibahasa.jp + pesanMultibahasa.es + footer;

    const JALUR_FOTO = path.join(__dirname, 'avatar');

    ctx.replyWithPhoto({ source: JALUR_FOTO }, { caption: teksLengkap })
        .catch((err) => {
            console.error("Gagal mengirim foto:", err);
            ctx.reply(teksLengkap);
        });
});

// ==================== DOWNLOAD AUDIO ====================
bot.on('text', async (ctx) => {
    if (ctx.message.text.startsWith('/')) return;

    const pesanTunggu = await ctx.reply('⏳ Sedang memproses audio...');
    const namaFile = `audio_${Date.now()}.mp3`;
    const outputPath = path.join(folderDownloads, namaFile);

    try {
        const argumenYtdlp = [
            `ytsearch1:${ctx.message.text}`,
            '-x',
            '--audio-format', 'mp3',
            '--audio-quality', '192K',
            '--add-metadata',
            '--embed-thumbnail',
            '--no-check-certificates',
            '-o', outputPath
        ];

        // Hanya tambahkan ffmpeg location di Windows
        if (isWindows) {
            argumenYtdlp.push('--ffmpeg-location', ffmpegPath);
        }

        await ytDlpWrap.execPromise(argumenYtdlp);

        if (fs.existsSync(outputPath)) {
            await ctx.replyWithAudio({ source: outputPath }, { 
                title: ctx.message.text 
            });
            fs.unlinkSync(outputPath);
            ctx.deleteMessage(pesanTunggu.message_id).catch(() => {});
        }
    } catch (e) {
        console.error('Download Error:', e);
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
        ctx.deleteMessage(pesanTunggu.message_id).catch(() => {});
        ctx.reply('❌ Gagal mendapatkan lagu. Coba judul yang lebih jelas atau coba lagi nanti.');
    }
});

persiapkanBot();