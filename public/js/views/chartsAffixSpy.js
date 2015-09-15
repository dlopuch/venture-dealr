var $chartsContainer = $('#charts-container');

var $chartsContainerSpacer = $('#charts-container-affix-spacer').css({
  display: 'none',
  height: $chartsContainer.height()
});

$chartsContainer
.affix({
  offset: {
    top: $chartsContainer.position().top
  }
})
.on('affixed.bs.affix', function() {
  $chartsContainerSpacer.css('display', '');
})
.on('affixed-top.bs.affix', function() {
  $chartsContainerSpacer.css('display', 'none');
});




var onScenario = {
  '#scenario-start-a-venture': function() {
    window.actions.chart.selectMeasure('percentages');
    window.actions.round.setScenario(window.scenario.foundingRound);
  },

  '#scenario-seed-dilute': function() {
    window.actions.chart.selectMeasure('percentages');
    window.actions.round.setScenario(window.scenario.seedRound);
  },

  '#scenario-seed-value': function() {
    window.actions.chart.selectMeasure('values');
    window.actions.round.setScenario(window.scenario.seedRound);
  },

  '#scenario-series-a': function() {
    window.actions.round.setScenario(window.scenario.seriesARound);
  },

  '#scenario-series-b': function() {
    window.actions.round.setScenario(window.bRound);
  },

  '#scenario-exit': function() {
    window.actions.exit.changeValuation(window.exit, 95000000);
    window.actions.round.setScenario(window.exit);
  },

  '#scenario-exit-bad': function() {
    window.actions.round.setScenario(window.exit);
    window.actions.exit.changeValuation(window.exit, 31000000);
  },

  '#scenario-exit-bad-options': function() {
    window.actions.round.setScenario(window.exit);
    window.actions.exit.changeValuation(window.exit, 60000000);
  }
};

$('body').scrollspy({
  target: '#scenario-nav',
  offset: $chartsContainer.height() + 200
})
.on('activate.bs.scrollspy', function() {
  var scenario = $(arguments[0].target).find('> a').attr('href');
  console.log('new item activated by scrollspy!', scenario);

  if (onScenario[scenario])
    onScenario[scenario]();

  window.lastScrollSpy = arguments;
});
console.log('scrollspy activated');



