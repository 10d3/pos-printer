const fs = require('fs');
const path = require('path');
const escpos = require('escpos');
escpos.USB = require('escpos-usb');
escpos.Network = require('escpos-network');
escpos.SerialPort = require('escpos-serialport');
const printerLib = require('printer');
const SerialPort = require('serialport');

const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf-8'));

async function printOrder(payload) {
  const { content, ...order } = payload;

  switch (config.printerType) {
    case 'usb': {
      const usbDevice = new escpos.USB(config.usb?.idVendor, config.usb?.idProduct);
      return printEscpos(content, order, usbDevice);
    }
    case 'network': {
      if (!config.printerIP) throw new Error('Missing printerIP');
      return printEscpos(content, order, new escpos.Network(config.printerIP));
    }
    case 'serial': {
      if (!config.serialPort) throw new Error('Missing serialPort');
      const serial = new escpos.SerialPort(config.serialPort, { baudRate: 9600 });
      return printEscpos(content, order, serial);
    }
    case 'windows': {
      if (!config.printerName) throw new Error('Missing printerName');
      return printWindows(content, order);
    }
    default:
      throw new Error('Unsupported printerType');
  }
}

function printEscpos(content, order, device) {
  return new Promise((resolve, reject) => {
    const printer = new escpos.Printer(device);
    device.open(error => {
      if (error) return reject(error);

      if (Array.isArray(content) && content.length) {
        content.forEach(item => {
          switch (item.type) {
            case 'text':
              printer.align(item.align || 'lt');
              if (item.style === 'b') printer.style('b');
              if (item.size) printer.size(...item.size);
              printer.text(item.text);
              break;
            case 'line':
              printer.text('---------------------------');
              break;
            case 'cut':
              printer.cut();
              break;
          }
        });
      } else {
        printer
          .align('ct')
          .style('b')
          .text(config.businessName || 'POS')
          .text(`Order #${order.id}`)
          .text('---------------------------');

        order.items?.forEach(i => {
          printer.align('lt').style('normal').text(`${i.qty}x ${i.name}`);
        });

        printer
          .text('---------------------------')
          .align('rt')
          .text(`Total: $${order.total?.toFixed(2) || ''}`)
          .cut();
      }

      printer.close(resolve);
    });
  });
}

function printWindows(content, order) {
  const lines = [];

  if (Array.isArray(content) && content.length) {
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

  printerLib.printDirect({
    data: text,
    printer: config.printerName,
    type: 'RAW',
    success: jobID => console.log(`Windows print job sent: ${jobID}`),
    error: err => console.error('Windows print error:', err)
  });
}

module.exports = { printOrder };
