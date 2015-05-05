window.onload = function() {
  document.getElementById('content_div').innerHTML = 'yo dan! ' + require('./content.js');

  console.log('not so fast, FIXME: linting violation no semicolon')
};
