goog.provide('anychart.core.map.scale.OrdinalColorTicks');

goog.require('anychart.scales.OrdinalTicks');
goog.require('goog.array');



/**
 * Scale ticks settings.
 * @param {!anychart.core.map.scale.OrdinalColor} scale Scale to ask for a setup.
 * @constructor
 * @extends {anychart.scales.OrdinalTicks}
 */
anychart.core.map.scale.OrdinalColorTicks = function(scale) {
  goog.base(this, scale);
};
goog.inherits(anychart.core.map.scale.OrdinalColorTicks, anychart.scales.OrdinalTicks);


/** @inheritDoc */
anychart.core.map.scale.OrdinalColorTicks.prototype.calcAutoTicks = function() {
  var res = [];
  var ranges = this.scale.ranges();
  if (ranges) {
    for (var i = 0, len = ranges.length; i < len; i += this.interval()) {
      res.push(i);
    }
  }
  return res;
};


/** @inheritDoc */
anychart.core.map.scale.OrdinalColorTicks.prototype.makeValues = function(indexes) {
  var len = indexes.length || 0;
  var values = this.scale.getProcessedRanges();
  var valuesLen = values.length;
  if (!len || !valuesLen) return [];
  var result = [], last = false;
  for (var i = 0; i < len && !last; i++) {
    var curr = indexes[i];
    var next = indexes[i + 1];
    if (isNaN(next) || next >= valuesLen) {
      next = valuesLen - 1;
      last = true;
    } else {
      next--;
    }
    var currValue = (values[curr].start + values[curr].end) / 2;
    var nextValue = (values[next].start + values[next].end) / 2;
    result.push(curr == next ? currValue : [currValue, nextValue]);
  }
  return result;
};