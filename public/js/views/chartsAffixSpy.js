var $chartsContainer = $('#charts-container');
var $headerAffixBar = $('#header-affix-bar');

var $chartsContainerSpacer = $('#charts-container-affix-spacer').css({
  display: 'none',
  height: $chartsContainer.height()
});

$chartsContainer
.affix({
  offset: {
    top: $chartsContainer.position().top - $headerAffixBar.height()
  }
})
.on('affixed.bs.affix', function() {
  $chartsContainerSpacer.css('display', '');
})
.on('affixed-top.bs.affix', function() {
  $chartsContainerSpacer.css('display', 'none');
});


$headerAffixBar
.affix({
  offset: {
    top: $headerAffixBar.position().top
  }
});
