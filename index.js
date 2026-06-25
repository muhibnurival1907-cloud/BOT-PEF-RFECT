require('dotenv').config();
const { Telegraf } = require('telegraf');
const YTDlpWrap = require('yt-dlp-wrap').default;
const fs = require('fs');
const path = require('path');
const os = require('os');

const bot = new Telegraf(process.env.BOT_TOKEN);

const isWindows = os.platform() === 'win32';
const ytDlpPath = isWindows ? path.join(__dirname, 'yt-dlp.exe') : '/usr/local/bin/yt-dlp';
const ffmpegPath = isWindows ? path.join(__dirname, 'ffmpeg.exe') : 'ffmpeg';
const folderDownloads = path.join(__dirname, 'downloads');

// Pastikan folder download ada
if (!fs.existsSync(folderDownloads)) {
    fs.mkdirSync(folderDownloads);
}

const ytDlpWrap = new YTDlpWrap(ytDlpPath);

async function persiapkanBot() {
    // Jika di Windows dan file tidak ada, download otomatis
    if (isWindows && !fs.existsSync(ytDlpPath)) {
        console.log('Downloading yt-dlp binary...');
        await YTDlpWrap.downloadFromGithub(ytDlpPath);
    }
    bot.launch().then(() => console.log('🚀 Bot MarbequeMusic Sempurna AKTIF!'));
}

const JALUR_FOTO = path.join(__dirname, 'avatar');

// ... (Bagian atas kode Anda seperti require dan inisialisasi bot) ...

// DI SINI TEMPATNYA:
bot.start((ctx) => {
    // 1. Definisikan pesan multibahasa di sini
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

    // 2. Gabungkan menjadi satu teks
    const teksLengkap = pesanMultibahasa.id + pesanMultibahasa.en + pesanMultibahasa.kr + pesanMultibahasa.jp + pesanMultibahasa.es + footer;

  ctx.replyWithPhoto({ source: JALUR_FOTO }, { caption: teksLengkap })
        .catch((err) => {
            console.error("Gagal mengirim foto lokal:", err);
            ctx.reply(teksLengkap);
        });
});

// ... (Sisa kode bot.on('text', ...) Anda tetap di bawah sini) ...
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

        // Tambahkan path ffmpeg jika bukan Linux (karena di Linux ffmpeg sudah global)
        if (isWindows) {
            argumenYtdlp.push('--ffmpeg-location', ffmpegPath);
        }

        await ytDlpWrap.execPromise(argumenYtdlp);

        if (fs.existsSync(outputPath)) {
            await ctx.replyWithAudio({ source: outputPath });
            fs.unlinkSync(outputPath);
            ctx.deleteMessage(pesanTunggu.message_id).catch(() => {});
        }
    } catch (e) {
        console.error(e);
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
        ctx.deleteMessage(pesanTunggu.message_id).catch(() => {});
        ctx.reply('❌ Gagal mendapatkan lagu tersebut. Coba judul lain.');
    }
});

persiapkanBot();