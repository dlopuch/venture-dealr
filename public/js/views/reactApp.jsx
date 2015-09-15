var React = require('react');

var RoundDisplay = require('views/RoundDisplay.jsx');
var ScrollSpy = require('views/scrollSpy/ScrollSpy.jsx');
var ScrollSpyContents = require('views/scrollSpyContents/ScrollSpyContents.jsx');

React.render(
  <div className="container-fluid">
    <ScrollSpy domId="the-scroll-spy-target" />

    <div className="row">
      <div className="col-md-6">
        <ScrollSpyContents />
      </div>
      <div className="col-md-6">
        <RoundDisplay />
      </div>
    </div>
  </div>,
  document.getElementById('react-app')
);