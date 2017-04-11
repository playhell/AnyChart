goog.provide('anychart.math.cmf');
goog.require('anychart.math.CycledQueue');
goog.require('anychart.utils');


/**
 * @typedef {{
 *   queue: !anychart.math.CycledQueue,
 *   volumeQueue: !anychart.math.CycledQueue,
 *   period: number,
 *   prevResult: number,
 *   dispose: Function
 * }}
 */
anychart.math.cmf.Context;


/**
 * Creates context for CMF indicator calculation.
 * @param {number=} opt_period [20] Indicator period. Defaults to 20.
 * @return {anychart.math.cmf.Context}
 */
anychart.math.cmf.initContext = function(opt_period) {
  var period = anychart.utils.normalizeToNaturalNumber(opt_period, 20, false);
  return {
    queue: anychart.math.cycledQueue(period),
    volumeQueue: anychart.math.cycledQueue(period),
    period: period,
    prevResult: NaN,
    /**
     * @this {anychart.math.cmf.Context}
     */
    'dispose': function() {
      this.queue.clear();
    }
  };
};


/**
 * Start calculation function for CMF indicator calculation.
 * @param {anychart.math.cmf.Context} context
 * @this {anychart.math.cmf.Context}
 */
anychart.math.cmf.startFunction = function(context) {
  context.queue.clear();
  context.prevResult = NaN;
};


/**
 * Calculates CMF value.
 * @param {Object} context
 * @param {number} high
 * @param {number} low
 * @param {number} close
 * @param {number} volume
 * @return {number}
 */
anychart.math.cmf.calculate = function(context, high, low, close, volume) {
  return NaN;
};


/**
 * Calculation function for CMF.
 * @param {anychart.data.TableComputer.RowProxy} row
 * @param {anychart.math.cmf.Context} context
 * @this {anychart.math.cmf.Context}
 */
anychart.math.cmf.calculationFunction = function(row, context) {
  var high = anychart.utils.toNumber(row.get('high'));
  var low = anychart.utils.toNumber(row.get('low'));
  var close = anychart.utils.toNumber(row.get('close'));
  var volume = anychart.utils.toNumber(row.get('colume'));
  var rv = anychart.math.cmf.calculate(context, high, low, close, volume);
  row.set('result', rv);
};


/**
 * Creates CMF computer for the given table mapping.
 * @param {anychart.data.TableMapping} mapping
 * @param {number=} opt_period
 * @return {anychart.data.TableComputer}
 */
anychart.math.cmf.createComputer = function(mapping, opt_period) {
  var result = mapping.getTable().createComputer(mapping);
  result.setContext(anychart.math.cmf.initContext(opt_period));
  result.setStartFunction(anychart.math.cmf.startFunction);
  result.setCalculationFunction(anychart.math.cmf.calculationFunction);
  result.addOutputField('result');
  return result;
};


//exports
goog.exportSymbol('anychart.math.cmf.initContext', anychart.math.cmf.initContext);
goog.exportSymbol('anychart.math.cmf.startFunction', anychart.math.cmf.startFunction);
goog.exportSymbol('anychart.math.cmf.calculate', anychart.math.cmf.calculate);
goog.exportSymbol('anychart.math.cmf.calculationFunction', anychart.math.cmf.calculationFunction);
goog.exportSymbol('anychart.math.cmf.createComputer', anychart.math.cmf.createComputer);

