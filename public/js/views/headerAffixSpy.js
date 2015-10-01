var $headerAffixBar = $('#header-affix-bar');

$headerAffixBar
.affix({
  offset: {
    top: $headerAffixBar.position().top
  }
});
