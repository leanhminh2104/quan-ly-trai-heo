import { spawn } from 'child_process';
import ngrok from '@ngrok/ngrok';
import fs from 'fs';

let NGROK_AUTHTOKEN = '';
try {
  const envContent = fs.readFileSync('.env', 'utf8');
  const tokenMatch = envContent.match(/NGROK_AUTHTOKEN="?([^"\n]+)"?/);
  if (tokenMatch) NGROK_AUTHTOKEN = tokenMatch[1];
} catch (e) {}

let nextProcess = null;

function startNextJs() {
  if (nextProcess) {
    nextProcess.kill();
    console.log('🔄 Đang khởi động lại Next.js...');
  }
  nextProcess = spawn('npm', ['run', 'dev:next'], {
    stdio: 'inherit',
    shell: true
  });
}

// Khởi động lần đầu
startNextJs();

// Lắng nghe lệnh từ bàn phím
process.stdin.on('data', (data) => {
  const input = data.toString().trim().toLowerCase();
  if (input === 'rs') {
    startNextJs();
  }
});

(async () => {
  // Chờ Next.js khởi động một chút trước khi bật tunnel
  console.log('⏳ Đang khởi động Next.js và chuẩn bị mở kết nối HTTPS Public...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  try {
    if (!NGROK_AUTHTOKEN) {
      console.log('⚠️ Không tìm thấy NGROK_AUTHTOKEN trong .env. Bỏ qua khởi động đường hầm.');
      return;
    }
    
    // Khởi động Ngrok (Tự động lấy tên miền ngẫu nhiên)
    const listener = await ngrok.forward({
      addr: 3000,
      authtoken: NGROK_AUTHTOKEN,
    });
    
    const tunnelUrl = listener.url();
    const tunnelDomain = new URL(tunnelUrl).hostname;
    
    console.log('\n======================================================');
    console.log(`🌍 TRẠI LỢN ONLINE SẴN SÀNG TẠI: https://${tunnelDomain}`);
    console.log('======================================================\n');
    
    // Tự động nhét tên miền này vào danh sách Whitelist
    try {
      const res = await fetch('http://localhost:3000/api/internal/register-domain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: tunnelDomain })
      });
      const data = await res.json();
      if (data.success) {
        console.log(`✅ Đã tự động cấp phép cho tên miền: ${tunnelDomain}`);
      }
    } catch(e) {
      console.log('⚠️ Không thể tự động cấp phép tên miền. Vui lòng tự thêm bằng tay trong Cài đặt.');
    }
    
    // Graceful shutdown
    const cleanup = async () => {
      console.log('\n⏳ Đang đóng kết nối Ngrok...');
      try { await ngrok.disconnect(); } catch(e) {}
      if (nextProcess) nextProcess.kill('SIGINT');
      process.exit(0);
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);

  } catch (error) {
    console.error('🔴 Lỗi khi mở HTTPS Public:', error.message);
  }
})();
