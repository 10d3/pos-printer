const { exec } = require('child_process');
const os = require('os');
const fs = require('fs');
const path = require('path');

function printWindows(content, order) {
  const lines = [];

  if (Array.isArray(content)) {
    content.forEach(item => {
      switch (item.type) {
        case 'text':
          lines.push(item.text);
          break;
        case 'line':
          lines.push('---------------------------');
          break;
        case 'cut':
          lines.push('\n\n\n');
          break;
      }
    });
  } else {
    lines.push('');
    lines.push('     ' + (config.businessName || 'POS'));
    lines.push('---------------------------');
    order.items?.forEach(i => lines.push(`${i.qty}x ${i.name}`));
    lines.push('---------------------------');
    lines.push(`Total: $${order.total?.toFixed(2) || ''}`);
    lines.push('');
  }

  const text = lines.join('\n');

  // Write to a temporary file
  const filePath = path.join(os.tmpdir(), `receipt_${Date.now()}.txt`);
  fs.writeFileSync(filePath, text);

  // Send to printer using Notepad (or Powershell alternative)
  exec(`notepad /p "${filePath}"`, err => {
    if (err) console.error('Failed to print:', err);
    else console.log('Print job sent successfully');
  });
}
