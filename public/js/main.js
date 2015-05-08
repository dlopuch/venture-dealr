window.onload = function() {
  var Chart = require('./Chart');

  window.chart = new Chart('svg');

  console.log('heydan success!');


  // flux
  var dispatcher = require('./dispatcher');
  var ACTIONS = require('./actions/actionsEnum');
  var RoundStore = require('./stores/RoundStore');

  RoundStore.on('change', function(param) {
    console.log('RoundStore received the dispatch!', param);
  });

  dispatcher.dispatch({action: ACTIONS.ROUND.ADD_PREFERRED, a: 'payload! :D!'});
};
