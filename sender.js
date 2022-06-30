var AMQPClient  = require('amqp10/lib').Client,
    Policy = require('amqp10/lib').Policy;
const config = require('./config');
var settings = {
    serviceBusHost: config.ServiceBusNamespace,
    queueName: config.ServiceBusQueueName,
    SASKeyName: config.ServiceBusQueueKeyName,
    SASKey: config.ServiceBusQueueKey
  };

if (!settings.serviceBusHost || !settings.queueName || !settings.SASKeyName || !settings.SASKey) {
  console.warn('Must provide either settings json file or appropriate environment variables.');
  process.exit(1);
}

var protocol = settings.protocol || 'amqps';
var serviceBusHost = settings.serviceBusHost + '.servicebus.windows.net';
if (settings.serviceBusHost.indexOf(".") !== -1) {
  serviceBusHost = settings.serviceBusHost;
}
var sasName = settings.SASKeyName;
var sasKey = settings.SASKey;
var queueName = settings.queueName;

var msgVal = Math.floor(Math.random() * 1000000);

var uri = protocol + '://' + encodeURIComponent(sasName) + ':' + encodeURIComponent(sasKey) + '@' + serviceBusHost;

var client = new AMQPClient(Policy.ServiceBusQueue);
client.connect(uri)
  .then(function () {
    return Promise.all([
      client.createSender(queueName)
    ]);
  })
  .spread(function(sender) {
    sender.on('errorReceived', function(tx_err) { console.warn('===> TX ERROR: ', tx_err); });
    return sender.send({ DataString: 'From Node', DataValue: msgVal }).then(function (state) {
      console.log('state: ', state);
    });
  })
  .error(function (e) {
    console.warn('connection error: ', e);
  });