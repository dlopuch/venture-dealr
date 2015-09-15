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
