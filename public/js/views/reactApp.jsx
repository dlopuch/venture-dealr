var $ = require('jquery');
var React = require('react');

var ChartsContainer = require('views/charts/ChartsContainer.jsx');
var RoundDisplay = require('views/RoundDisplay.jsx');
var ScrollSpy = require('views/scrollSpy/ScrollSpy.jsx');
var ScrollSpyContents = require('views/scrollSpyContents/ScrollSpyContents.jsx');

var roundChartRenderedPromise = $.Deferred();
var PVScatterRenderedPromise = $.Deferred();

React.render(
  <div className="container-fluid">
    <ChartsContainer
      promiseRoundChartRendered={roundChartRenderedPromise}
      promisePVScatterRendered={PVScatterRenderedPromise}
    />
    <ScrollSpy domId="the-scroll-spy-target" />

    <div className="row">
      <div className="col-sm-6">
        <ScrollSpyContents />
      </div>
      <div className="col-sm-6 hidden-xs">
        <RoundDisplay
          promiseRoundChartRendered={roundChartRenderedPromise}
          promisePVScatterRendered={PVScatterRenderedPromise}
        />
      </div>
    </div>
  </div>,
  document.getElementById('react-app')
);