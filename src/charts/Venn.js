goog.provide('anychart.charts.Venn');

goog.require('anychart.core.SeparateChart');
goog.require('anychart.core.settings');
goog.require('anychart.data.Set');
goog.require('anychart.math.venn');
goog.require('goog.string');



/**
 * Venn chart class.
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data - Chart data.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings - If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @constructor
 * @implements {anychart.core.settings.IObjectWithSettings}
 * @extends {anychart.core.SeparateChart}
 */
anychart.charts.Venn = function(opt_data, opt_csvSettings) {
  anychart.charts.Venn.base(this, 'constructor');

  /**
   * Theme settings.
   * @type {Object}
   */
  this.themeSettings = {};

  /**
   * Own settings (Settings set by user with API).
   * @type {Object}
   */
  this.ownSettings = {};

  /**
   * @type {anychart.data.Iterator}
   * @private
   */
  this.iterator_ = null;

  this.data(opt_data, opt_csvSettings);

  /**
   * @type {Array.<anychart.charts.Venn.DataReflection>}
   * @private
   */
  this.dataReflections_ = [];

  this.solution_;
};
goog.inherits(anychart.charts.Venn, anychart.core.SeparateChart);


/**
 * Supported signals.
 * @type {number}
 */
anychart.charts.Venn.prototype.SUPPORTED_SIGNALS = anychart.core.SeparateChart.prototype.SUPPORTED_SIGNALS;


/**
 * Supported consistency states.
 * @type {number}
 */
anychart.charts.Venn.prototype.SUPPORTED_CONSISTENCY_STATES =
    anychart.core.SeparateChart.prototype.SUPPORTED_CONSISTENCY_STATES |
    anychart.ConsistencyState.VENN_DATA |
    anychart.ConsistencyState.VENN_APPEARANCE |
    anychart.ConsistencyState.VENN_LABELS;


/**
 * @typedef {{
 *   sets: Array.<string>,
 *   size: number,
 *   iteratorIndex: number
 * }}
 */
anychart.charts.Venn.DataReflection;


/**
 * @typedef {{
 *   x: number,
 *   y: number,
 *   radius: number
 * }}
 */
anychart.charts.Venn.Circle;


/**
 * Raw data holder.
 * @type {?(anychart.data.View|anychart.data.Set|Array|string)}
 * @private
 */
anychart.charts.Venn.prototype.rawData_;


/**
 * View to dispose on next data set, if any.
 * @type {goog.Disposable}
 * @private
 */
anychart.charts.Venn.prototype.parentViewToDispose_;


/**
 * Chart data.
 * @type {!anychart.data.View}
 * @private
 */
anychart.charts.Venn.prototype.data_;


/** @inheritDoc */
anychart.charts.Venn.prototype.getType = function() {
  return anychart.enums.ChartTypes.VENN;
};


/** @inheritDoc */
anychart.charts.Venn.prototype.getAllSeries = function() {
  return [];
};


/**
 * Simple descriptors.
 * @type {!Object.<string, anychart.core.settings.PropertyDescriptor>}
 */
anychart.charts.Venn.prototype.SIMPLE_PROPS_DESCRIPTORS = (function() {
  /** @type {!Object.<string, anychart.core.settings.PropertyDescriptor>} */
  var map = {};
  map['setsSeparator'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.SINGLE_ARG,
      'setsSeparator',
      anychart.core.settings.stringNormalizer,
      anychart.ConsistencyState.VENN_DATA,
      anychart.Signal.NEEDS_REDRAW);
  return map;
})();
anychart.core.settings.populate(anychart.charts.Venn, anychart.charts.Venn.prototype.SIMPLE_PROPS_DESCRIPTORS);


//region -- IObjectWithSettings implementation
/** @inheritDoc */
anychart.charts.Venn.prototype.getOwnOption = function(name) {
  return this.ownSettings[name];
};


/** @inheritDoc */
anychart.charts.Venn.prototype.hasOwnOption = function(name) {
  return goog.isDef(this.ownSettings[name]);
};


/** @inheritDoc */
anychart.charts.Venn.prototype.getThemeOption = function(name) {
  return this.themeSettings[name];
};


/** @inheritDoc */
anychart.charts.Venn.prototype.getOption = function(name) {
  return goog.isDefAndNotNull(this.ownSettings[name]) ? this.ownSettings[name] : this.themeSettings[name];
};


/** @inheritDoc */
anychart.charts.Venn.prototype.setOption = function(name, value) {
  this.ownSettings[name] = value;
};


/** @inheritDoc */
anychart.charts.Venn.prototype.check = function(flags) {
  return true;
};


//endregion
/**
 * Getter/setter for chart data.
 * @param {?(anychart.data.View|anychart.data.Set|Array|string)=} opt_value Value to set.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @return {(!anychart.charts.Venn|!anychart.data.View)} Returns itself if used as a setter or the mapping if used as a getter.
 */
anychart.charts.Venn.prototype.data = function(opt_value, opt_csvSettings) {
  if (goog.isDef(opt_value)) {
    if (this.rawData_ !== opt_value) {
      this.rawData_ = opt_value;
      goog.dispose(this.parentViewToDispose_); // disposing a view created by the series if any;
      if (opt_value instanceof anychart.data.View)
        this.data_ = this.parentViewToDispose_ = opt_value.derive(); // deriving a view to avoid interference with other view users
      else if (opt_value instanceof anychart.data.Set)
        this.data_ = this.parentViewToDispose_ = opt_value.mapAs();
      else
        this.data_ = (this.parentViewToDispose_ = new anychart.data.Set(
            (goog.isArray(opt_value) || goog.isString(opt_value)) ? opt_value : null, opt_csvSettings)).mapAs();
      this.data_.listenSignals(this.dataInvalidated_, this);
      this.invalidate(anychart.ConsistencyState.VENN_DATA, anychart.Signal.NEEDS_REDRAW);
    }
    return this;
  }
  return this.data_;
};


/**
 * Returns current view iterator.
 * @param {boolean=} opt_reset - Whether to reset iterator
 * @return {!anychart.data.Iterator} - Current iterator.
 */
anychart.charts.Venn.prototype.getIterator = function(opt_reset) {
  return this.iterator_ || (this.iterator_ = this.data_.getIterator());
};


/**
 * Returns new default iterator for the current mapping.
 * @return {!anychart.data.Iterator} New iterator.
 */
anychart.charts.Venn.prototype.getResetIterator = function() {
  return this.iterator_ = this.data_.getIterator();
};


/** @inheritDoc */
anychart.charts.Venn.prototype.handleMouseOverAndMove = function(event) {
  var domTarget = event['domTarget'];
};


/** @inheritDoc */
anychart.charts.Venn.prototype.calculate = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.VENN_DATA) && this.data_) {
    this.dataReflections_.length = 0;
    this.solution_ = null;
    var iterator = this.getResetIterator();


    while (iterator.advance()) {
      var x = String(iterator.get('x'));
      var value = iterator.get('value');
      var index = iterator.getIndex();
      var separator = this.getOption('setsSeparator');
      this.dataReflections_.push({sets: x.split(separator), size: value, iteratorIndex: index});
    }

    var solution = anychart.math.venn.venn(this.dataReflections_);
    this.solution_ = anychart.math.venn.normalizeSolution(solution, Math.PI / 2, null);

    this.markConsistent(anychart.ConsistencyState.VENN_DATA);
  }
};


/** @inheritDoc */
anychart.charts.Venn.prototype.drawContent = function(bounds) {
  this.calculate();

  if (!this.baseLayer_) { //Dom init.
    this.baseLayer_ = this.rootElement.layer();
    this.registerDisposable(this.baseLayer_);

    this.circlesLayer_ = new anychart.core.utils.TypedLayer(function() {
      var path = acgraph.path();
      path.stroke('none');
      return path;
    }, function(child) {
      (/** @type {acgraph.vector.Path} */ (child)).clear();
      (/** @type {acgraph.vector.Path} */ (child)).tag = void 0;
    });
    this.circlesLayer_.zIndex(1);
    this.circlesLayer_.parent(this.baseLayer_);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    this.circlesLayer_.clear();

    var circles = anychart.math.venn.scaleSolution(this.solution_, bounds.width, bounds.height, 0);
    var textCenters = anychart.math.venn.computeTextCentres(circles, this.dataReflections_);

    var pixelShift = .5;

    var path;

    // for (var key in circles) {
    //   var circ = circles[key];
    //   path = this.circlesLayer_.genNextChild();
    //   path.stroke('10 yellow');
    //
    //   path.moveTo(circ.x + pixelShift + circ.radius + bounds.left, circ.y + pixelShift + bounds.top)
    //       .arcTo(circ.radius, circ.radius, 0, 360);
    //
    //   circlesArr.push(circ);
    // }



    for (var a = 0; a < this.dataReflections_.length; a++) {
      var sets = this.dataReflections_[a].sets;
      var setData = [];
      for (var b = 0; b < sets.length; b++) {
        var s = sets[b];
        setData.push(circles[s]);
      }
      var stats = {};
      anychart.math.venn.intersectionArea(setData, stats);
      this.doArc_(stats, bounds);
    }


    for (var key in textCenters) {
      var textCirc = textCenters[key];
      path = this.circlesLayer_.genNextChild();
      path.stroke('black');
      path.moveTo(textCirc.x + pixelShift + 5 + bounds.left, textCirc.y + pixelShift + bounds.top)
          .arcTo(5, 5, 0, 360);
    }

  }

};

var thi = 1;


anychart.charts.Venn.prototype.doArc_ = function(stats, bounds) {
  console.log(stats);
  var arcs = stats.arcs;
  if (!arcs.length)
    return;

  var path = this.circlesLayer_.genNextChild();
  path.stroke('blue');
  var pixelShift = .5;

  function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }


  if (arcs.length == 1) {
    var circle = arcs[0].circle;
    path = this.circlesLayer_.genNextChild();
    path.moveTo(circle.x + pixelShift + circle.radius + bounds.left, circle.y + pixelShift + bounds.top)
        .arcTo(circle.radius, circle.radius, 0, 360);
    path.fill(getRandomColor());
  } else if (arcs.length > 1) {
    path = this.circlesLayer_.genNextChild();
    path.fill(getRandomColor());

    thi += 5;
    path.moveTo(arcs[0].p2.x + bounds.left, arcs[0].p2.y + bounds.top);
    for (var i = 0; i < arcs.length; ++i) {
      var arc = arcs[i];
      path.arcToByEndPoint(arc.p1.x + bounds.left, arc.p1.y + bounds.top, arc.circle.radius, arc.circle.radius, arc.width > arc.circle.radius, true);
    }

    path.close();

    path.stroke({thickness: thi, color: '#000', opacity: 0.5});
  }
};


/**
 * Sets default settings.
 * @param {!Object} config
 */
anychart.charts.Venn.prototype.setThemeSettings = function(config) {
  for (var name in this.SIMPLE_PROPS_DESCRIPTORS) {
    var val = config[name];
    if (goog.isDef(val))
      this.themeSettings[name] = val;
  }
  // if ('enabled' in config) this.themeSettings['enabled'] = config['enabled'];
  // if ('zIndex' in config) this.themeSettings['zIndex'] = config['zIndex'];
};


/** @inheritDoc */
anychart.charts.Venn.prototype.serialize = function() {
  var json = anychart.charts.Venn.base(this, 'serialize');

  anychart.core.settings.serialize(this, this.SIMPLE_PROPS_DESCRIPTORS, json, 'Venn');

  return json;
};


/** @inheritDoc */
anychart.charts.Venn.prototype.setupByJSON = function(config, opt_default) {
  anychart.charts.Venn.base(this, 'setupByJSON', config, opt_default);
  anychart.core.settings.deserialize(this, this.SIMPLE_PROPS_DESCRIPTORS, config);
};



//exports
(function() {
  var proto = anychart.charts.Venn.prototype;
  proto['data'] = proto.data;
  proto['getType'] = proto.getType;
})();

