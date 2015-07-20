var React = require('react');

var RoundDisplay = require('views/RoundDisplay.jsx');

React.render(
  <div className="row">
    <div className="col-md-12">
      <RoundDisplay />
    </div>
  </div>,
  document.getElementById('react-app')
);