import { spawn } from 'child_process';

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
    const tunnelDomain = 'dalymmo.nport.link';
    
    // Khởi động NPort
    const nportProcess = spawn('npx', ['nport', '3000', '-s', 'dalymmo'], {
      stdio: 'inherit',
      shell: true
    });
    
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
    const cleanup = () => {
      console.log('\n⏳ Đang đóng kết nối NPort...');
      if (nportProcess) nportProcess.kill('SIGINT');
      if (nextProcess) nextProcess.kill('SIGINT');
      process.exit(0);
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);

  } catch (error) {
    console.error('🔴 Lỗi khi mở kết nối NPort:', error.message);
  }
})();
