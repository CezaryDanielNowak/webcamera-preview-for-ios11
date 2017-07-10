const static = require('node-static');
const os = require('os');
const selfsigned = require('selfsigned');

const SERVER_ADDR = '0.0.0.0';
const SERVER_PORT = 8080;

function getLocalIpAddresses() {
  const netInterfaces = os.networkInterfaces();
  const addresses = [];
  Object.keys(netInterfaces).forEach((netInterface) => {
    // omit virtual interfaces.
    if (netInterface.includes('VMware') || netInterface.includes('vboxnet')) return;

    netInterfaces[netInterface].forEach((netAddrObj) => {
      if (netAddrObj.family === 'IPv4') {
        addresses.push(netAddrObj.address);
      }
    });
  });
  return addresses;
}

const serverStartedCallback = () => {
  const printAddr = (addr) => {
    return `https://${addr}:${SERVER_PORT}`;
  };

  let serverStartedMsg = `-------------------
SERVER STARTED`;

  serverStartedMsg += '\nDetected network address:';
  getLocalIpAddresses().forEach((addr) => {
    serverStartedMsg += `\n${printAddr(addr)}`;
  });
  serverStartedMsg += `\n${printAddr(SERVER_ADDR)}`;
  serverStartedMsg += '\n-------------------';

  console.log(serverStartedMsg);
};

var file = new static.Server('./',  { cache: false });
console.log('starting...');

selfsigned.generate(null, { days: 1 }, function (err, pems) {
  console.log(pems);
  require('https').createServer({
      key: pems.private,
      cert: pems.cert
    }, function (request, response) {
      request.addListener('end', function () {
          //
          // Serve files!
          //
          file.serve(request, response);
      }).resume();
  }).listen(SERVER_PORT, serverStartedCallback);
});
