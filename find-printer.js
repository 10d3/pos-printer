const escpos = require('escpos');
escpos.USB = require('escpos-usb');

const devices = escpos.USB.findPrinter();

if (!devices.length) {
  console.log('No USB printers found.');
} else {
  devices.forEach(device => {
    const desc = device.deviceDescriptor;
    console.log(`🖨️ Found USB printer - idVendor: ${desc.idVendor}, idProduct: ${desc.idProduct}`);
  });
}
