goog.provide('anychart.core.drawers.Mekko');
goog.require('anychart.core.drawers');
goog.require('anychart.core.drawers.Column');
goog.require('anychart.enums');



/**
 * Mekko drawer.
 * @param {anychart.core.series.Base} series
 * @constructor
 * @extends {anychart.core.drawers.Column}
 */
anychart.core.drawers.Mekko = function(series) {
  anychart.core.drawers.Mekko.base(this, 'constructor', series);
};
goog.inherits(anychart.core.drawers.Mekko, anychart.core.drawers.Column);
anychart.core.drawers.AvailableDrawers[anychart.enums.SeriesDrawerTypes.MEKKO] = anychart.core.drawers.Mekko;


/** @inheritDoc */
anychart.core.drawers.Mekko.prototype.type = anychart.enums.SeriesDrawerTypes.MEKKO;


/**
 * Actually draws the point.
 * @param {anychart.data.IRowInfo} point
 * @param {Object.<acgraph.vector.Shape>} shapes
 * @private
 */
anychart.core.drawers.Column.prototype.drawPoint_ = function(point, shapes) {
  if (point.get('value') == 0) return;

  var x = /** @type {number} */(point.meta('x'));
  var zero = /** @type {number} */(point.meta('zero'));
  var y = /** @type {number} */(point.meta('value'));

  var pointsPadding = this.series.chart.pointsPadding && this.series.chart.pointsPadding() || 0;
  this.pointWidth -= pointsPadding * 2;
  var leftX = (x - this.pointWidth / 2);
  var rightX = leftX + this.pointWidth;

  var thickness = acgraph.vector.getThickness(/** @type {acgraph.vector.Stroke} */(shapes['path'].stroke()));
  var halfThickness = thickness / 2;
  leftX += halfThickness;
  rightX -= halfThickness;
  y += this.isVertical ? -halfThickness : halfThickness;
  zero -= this.isVertical ? -halfThickness : halfThickness;

  leftX = anychart.utils.applyPixelShift(leftX, thickness);
  rightX = anychart.utils.applyPixelShift(rightX, thickness);
  y = anychart.utils.applyPixelShift(y, thickness);
  zero = anychart.utils.applyPixelShift(zero, thickness);

  if (pointsPadding) {
    // Adjust vertical padding depend on available space
    var height = Math.abs(zero - y);
    var vPadding = (height > pointsPadding * 2) ? pointsPadding : (height / 2 - 1);
    zero -= this.isVertical ? -vPadding : vPadding;
    y += this.isVertical ? -vPadding : vPadding;
  }

  var path = /** @type {acgraph.vector.Path} */(shapes['path']);
  anychart.core.drawers.move(path, this.isVertical, leftX, y);
  anychart.core.drawers.line(path, this.isVertical, rightX, y, rightX, zero, leftX, zero);
  path.close();
  path = /** @type {acgraph.vector.Path} */(shapes['hatchFill']);
  anychart.core.drawers.move(path, this.isVertical, leftX, y);
  anychart.core.drawers.line(path, this.isVertical, rightX, y, rightX, zero, leftX, zero);
  path.close();
};
