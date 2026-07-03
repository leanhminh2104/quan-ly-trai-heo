import { spawn } from 'child_process';
import localtunnel from 'localtunnel';

const nextProcess = spawn('npm', ['run', 'dev:next'], {
  stdio: 'inherit',
  shell: true
});

(async () => {
  // Chờ Next.js khởi động một chút trước khi bật tunnel
  console.log('⏳ Đang khởi động Next.js và chuẩn bị mở kết nối HTTPS Public...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  try {
    const tunnel = await localtunnel({ port: 3000, subdomain: 'dalymmo' });
    console.log('\n======================================================');
    console.log(`🌍 TRẠI LỢN ONLINE SẴN SÀNG TẠI: ${tunnel.url}`);
    console.log('   (Lưu ý copy tên miền này vào mục Khóa Tên Miền)');
    console.log('======================================================\n');
    
    tunnel.on('close', () => {
      console.log('🔴 Đã đóng kết nối HTTPS Public.');
    });

    tunnel.on('error', (err) => {
      console.error('Lỗi Tunnel:', err);
    });

  } catch (error) {
    console.error('🔴 Lỗi khi mở HTTPS Public:', error.message);
  }
})();
