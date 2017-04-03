/**
 * @fileoverview anychart.modules.scatter namespace file.
 * @suppress {extraRequire}
 */

goog.provide('anychart.modules.quadrant');

goog.require('anychart.charts.Quadrant');
goog.require('anychart.modules.base');


/**
 * Returns a quadrant chart instance with initial settings.<br/>
 * By default creates marker series if arguments is set.
 * @example
 * anychart.quadrant([20, 7, 10, 14])
 *    .container(stage).draw();
 * @param {...(anychart.data.View|anychart.data.Set|Array)} var_args Marker chart data.
 * @return {anychart.charts.Quadrant} Chart with defaults for scatter series.
 */
anychart.quadrant = function(var_args) {
  var chart = new anychart.charts.Quadrant();
  chart.setupByVal(anychart.getFullTheme('quadrant'), true);

  for (var i = 0, count = arguments.length; i < count; i++) {
    chart['marker'](arguments[i]);
  }

  return chart;
};


anychart.chartTypesMap[anychart.enums.ChartTypes.QUADRANT] = anychart.quadrant;

//exports
goog.exportSymbol('anychart.quadrant', anychart.quadrant);
