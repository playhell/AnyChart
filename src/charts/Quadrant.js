goog.provide('anychart.charts.Quadrant');
goog.require('anychart.core.Chart');



/**
 * Quadrant chart class.
 * @constructor
 */
anychart.charts.Quadrant = function() {
  anychart.charts.Quadrant.base(this, 'constructor');
};
goog.inherits(anychart.charts.Quadrant, anychart.core.Chart);


/** @inheritDoc */
anychart.charts.Quadrant.prototype.drawContent = function(bounds) {
  return anychart.charts.Quadrant.base(this, 'drawContent');
};


//region --- serialize/setup/dispose
/** @inheritDoc */
anychart.charts.Quadrant.prototype.serialize = function() {
  var json = anychart.charts.Quadrant.base(this, 'serialize');
  return json;
};


/** @inheritDoc */
anychart.charts.Quadrant.prototype.setupByJSON = function(config) {
  anychart.charts.Quadrant.base(this, 'setupByJSON', config);
};


/** @inheritDoc */
anychart.charts.Quadrant.prototype.disposeInternal = function() {
  anychart.charts.Quadrant.base(this, 'disposeInternal');
};
//endregion
