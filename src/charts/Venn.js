goog.provide('anychart.charts.Venn');

goog.require('anychart.core.IShapeManagerUser');
goog.require('anychart.core.SeparateChart');
goog.require('anychart.core.settings');
goog.require('anychart.core.shapeManagers');
goog.require('anychart.data.Set');
goog.require('anychart.format.Context');
goog.require('anychart.math.venn');
goog.require('anychart.palettes.DistinctColors');
goog.require('anychart.palettes.RangeColors');
goog.require('goog.color');
goog.require('goog.string');



/**
 * Venn chart class.
 * @param {(anychart.data.View|anychart.data.Set|Array|string)=} opt_data - Chart data.
 * @param {Object.<string, (string|boolean)>=} opt_csvSettings - If CSV string is passed, you can pass CSV parser settings here as a hash map.
 * @constructor
 * @implements {anychart.core.IShapeManagerUser}
 * @implements {anychart.core.utils.IInteractiveSeries}
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
   * Data wrapper from anychart data sets to venn algorithm format.
   * @type {Array.<anychart.charts.Venn.DataReflection>}
   * @private
   */
  this.dataReflections_ = [];

  /**
   * @type {anychart.core.shapeManagers.PerPoint}
   * @private
   */
  this.shapeManager_ = null;

  /**
   * Chart default palette.
   * @type {anychart.palettes.DistinctColors|anychart.palettes.RangeColors}
   * @private
   */
  this.palette_ = null;

  /**
   * Circles (not intersections) map.
   * @type {Object}
   * @private
   */
  this.circlesMap_ = {};

  this.solution_ = null;

  /**
   * Interactivity state.
   * @type {anychart.core.utils.InteractivityState}
   */
  this.state = new anychart.core.utils.InteractivityState(this);

  this.bindHandlersToComponent(this, this.handleMouseOverAndMove, this.handleMouseOut, null, this.handleMouseOverAndMove, null, this.handleMouseDown);

};
goog.inherits(anychart.charts.Venn, anychart.core.SeparateChart);


//region -- Private fields
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


//endregion
//region -- Signals and Consistency states
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


//endregion
//region -- Type definitions
/**
 * @typedef {{
 *   sets: Array.<string>,
 *   size: number,
 *   iteratorIndex: number
 * }}
 */
anychart.charts.Venn.DataReflection;


//endregion
/** @inheritDoc */
anychart.charts.Venn.prototype.getType = function() {
  return anychart.enums.ChartTypes.VENN;
};


/** @inheritDoc */
anychart.charts.Venn.prototype.getAllSeries = function() {
  return [];
};


//region -- Descriptors
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

  map['fill'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'fill',
      anychart.core.settings.fillOrFunctionNormalizer,
      anychart.ConsistencyState.VENN_APPEARANCE,
      anychart.Signal.NEEDS_REDRAW);

  map['hoverFill'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'hoverFill',
      anychart.core.settings.fillOrFunctionNormalizer,
      anychart.ConsistencyState.VENN_APPEARANCE,
      anychart.Signal.NEEDS_REDRAW);

  map['selectFill'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'selectFill',
      anychart.core.settings.fillOrFunctionNormalizer,
      anychart.ConsistencyState.VENN_APPEARANCE,
      anychart.Signal.NEEDS_REDRAW);

  map['hatchFill'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'hatchFill',
      anychart.core.settings.hatchFillOrFunctionNormalizer,
      anychart.ConsistencyState.VENN_APPEARANCE,
      anychart.Signal.NEEDS_REDRAW);

  map['hoverHatchFill'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'hoverHatchFill',
      anychart.core.settings.hatchFillOrFunctionNormalizer,
      anychart.ConsistencyState.VENN_APPEARANCE,
      anychart.Signal.NEEDS_REDRAW);

  map['selectHatchFill'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'selectHatchFill',
      anychart.core.settings.hatchFillOrFunctionNormalizer,
      anychart.ConsistencyState.VENN_APPEARANCE,
      anychart.Signal.NEEDS_REDRAW);

  map['stroke'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'stroke',
      anychart.core.settings.strokeOrFunctionNormalizer,
      anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.ANNOTATIONS_SHAPES,
      anychart.Signal.NEEDS_REDRAW);

  map['hoverStroke'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'hoverStroke',
      anychart.core.settings.strokeOrFunctionNormalizer,
      anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.ANNOTATIONS_SHAPES,
      anychart.Signal.NEEDS_REDRAW);

  map['selectStroke'] = anychart.core.settings.createDescriptor(
      anychart.enums.PropertyHandlerType.MULTI_ARG,
      'selectStroke',
      anychart.core.settings.strokeOrFunctionNormalizer,
      anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.ANNOTATIONS_SHAPES,
      anychart.Signal.NEEDS_REDRAW);

  return map;
})();
anychart.core.settings.populate(anychart.charts.Venn, anychart.charts.Venn.prototype.SIMPLE_PROPS_DESCRIPTORS);


//endregion
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
//region -- IShapeManagerUser implementation
/** @inheritDoc */
anychart.charts.Venn.prototype.isDiscreteBased = function() {
  return true;
};


/**
 * @inheritDoc
 */
anychart.charts.Venn.prototype.getIterator = function() {
  return this.iterator_ || (this.iterator_ = this.data_.getIterator());
};


/** @inheritDoc */
anychart.charts.Venn.prototype.resolveOption = function(name, point, normalizer, opt_seriesName) {
  var val = point.get(name) || this.getOption(name);
  if (goog.isDef(val))
    val = normalizer(val);
  return val;
};


/** @inheritDoc */
anychart.charts.Venn.prototype.getAutoHatchFill = function() {
  return /** @type {acgraph.vector.HatchFill} */ (acgraph.vector.normalizeHatchFill(anychart.core.series.Base.DEFAULT_HATCH_FILL_TYPE));
};


/** @inheritDoc */
anychart.charts.Venn.prototype.getHatchFillResolutionContext = function(opt_ignorePointSettings) {
  var source = this.getAutoHatchFill();
  var iterator = this.getIterator();
  return {
    'index': iterator.getIndex(),
    'sourceHatchFill': source,
    'iterator': iterator
  };
};


/** @inheritDoc */
anychart.charts.Venn.prototype.getColorResolutionContext = function(opt_baseColor, opt_ignorePointSettings, opt_ignoreColorScale) {
  var source = opt_baseColor || this.getOption('color') || 'blue';
  var iterator = this.getIterator();
  return {
    'index': iterator.getIndex(),
    'sourceColor': source,
    'iterator': iterator,
    'paletteFill': iterator.meta('paletteFill')
  };
};


//endregion
//region -- Palette
/**
 * Getter/setter for palette.
 * @param {(anychart.palettes.RangeColors|anychart.palettes.DistinctColors|Object|Array.<string>)=} opt_value .
 * @return {!(anychart.palettes.RangeColors|anychart.palettes.DistinctColors|anychart.charts.Venn)} .
 */
anychart.charts.Venn.prototype.palette = function(opt_value) {
  if (opt_value instanceof anychart.palettes.RangeColors) {
    this.setupPalette_(anychart.palettes.RangeColors, opt_value);
    return this;
  } else if (opt_value instanceof anychart.palettes.DistinctColors) {
    this.setupPalette_(anychart.palettes.DistinctColors, opt_value);
    return this;
  } else if (goog.isObject(opt_value) && opt_value['type'] == 'range') {
    this.setupPalette_(anychart.palettes.RangeColors);
  } else if (goog.isObject(opt_value) || this.palette_ == null)
    this.setupPalette_(anychart.palettes.DistinctColors);

  if (goog.isDef(opt_value)) {
    this.palette_.setup(opt_value);
    return this;
  }

  return /** @type {!(anychart.palettes.RangeColors|anychart.palettes.DistinctColors)} */(this.palette_);
};


/**
 * @param {Function} cls Palette constructor.
 * @param {(anychart.palettes.RangeColors|anychart.palettes.DistinctColors)=} opt_cloneFrom Settings to clone from.
 * @private
 */
anychart.charts.Venn.prototype.setupPalette_ = function(cls, opt_cloneFrom) {
  if (this.palette_ instanceof cls) {
    if (opt_cloneFrom)
      this.palette_.setup(opt_cloneFrom);
  } else {
    // we dispatch only if we replace existing palette.
    var doDispatch = !!this.palette_;
    goog.dispose(this.palette_);
    this.palette_ = new cls();

    if (opt_cloneFrom) {
      this.palette_.setup(opt_cloneFrom);
    }

    this.palette_.listenSignals(this.paletteInvalidated_, this);
    this.registerDisposable(/** @type {(anychart.palettes.RangeColors|anychart.palettes.DistinctColors)} */ (this.palette_));
    if (doDispatch) {
      this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.CHART_LEGEND, anychart.Signal.NEEDS_REDRAW);
    }
  }
};


/**
 * Internal palette invalidation handler.
 * @param {anychart.SignalEvent} event Event object.
 * @private
 */
anychart.charts.Venn.prototype.paletteInvalidated_ = function(event) {
  if (event.hasSignal(anychart.Signal.NEEDS_REAPPLICATION)) {
    this.invalidate(anychart.ConsistencyState.APPEARANCE | anychart.ConsistencyState.CHART_LEGEND, anychart.Signal.NEEDS_REDRAW);
  }
};


//endregion
//region -- Data
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
 * Listener for data invalidation.
 * @param {anychart.SignalEvent} event - Invalidation event.
 * @private
 */
anychart.charts.Venn.prototype.dataInvalidated_ = function(event) {
  this.invalidate(anychart.ConsistencyState.VENN_DATA, anychart.Signal.NEEDS_REDRAW);
};


/**
 * Returns new default iterator for the current mapping.
 * @return {!anychart.data.Iterator} New iterator.
 */
anychart.charts.Venn.prototype.getResetIterator = function() {
  return this.iterator_ = this.data_.getIterator();
};


//endregion
//region -- Interactivity
/** @inheritDoc */
anychart.charts.Venn.prototype.makeBrowserEvent = function(e) {
  var res = {
    'type': e['type'],
    'target': this,
    'relatedTarget': this.getOwnerElement(e['relatedTarget']) || e['relatedTarget'],
    'domTarget': e['target'],
    'relatedDomTarget': e['relatedTarget'],
    'offsetX': e['offsetX'],
    'offsetY': e['offsetY'],
    'clientX': e['clientX'],
    'clientY': e['clientY'],
    'screenX': e['screenX'],
    'screenY': e['screenY'],
    'button': e['button'],
    'keyCode': e['keyCode'],
    'charCode': e['charCode'],
    'ctrlKey': e['ctrlKey'],
    'altKey': e['altKey'],
    'shiftKey': e['shiftKey'],
    'metaKey': e['metaKey'],
    'platformModifierKey': e['platformModifierKey'],
    'state': e['state']
  };
  var tag = anychart.utils.extractTag(res['domTarget']);
  res['pointIndex'] = anychart.utils.toNumber(tag.index);
  var index = res['pointIndex'];
  if (!isNaN(index)) {
    this.getIterator().select(index);
    console.log(this.getIterator().get('x'));
  }
  return res;
};


/**
 * This method also has a side effect - it patches the original source event to maintain pointIndex support for
 * browser events.
 * @param {anychart.core.MouseEvent} event
 * @return {Object} An object of event to dispatch. If null - unrecognized type was found.
 */
anychart.charts.Venn.prototype.makePointEvent = function(event) {
  var pointIndex;
  if ('pointIndex' in event) {
    pointIndex = event['pointIndex'];
  } else if ('labelIndex' in event) {
    pointIndex = event['labelIndex'];
  } else if ('markerIndex' in event) {
    pointIndex = event['markerIndex'];
  }

  pointIndex = anychart.utils.toNumber(pointIndex);

  event['pointIndex'] = pointIndex;

  var type = event['type'];
  switch (type) {
    case acgraph.events.EventType.MOUSEOUT:
      type = anychart.enums.EventType.POINT_MOUSE_OUT;
      break;
    case acgraph.events.EventType.MOUSEOVER:
      type = anychart.enums.EventType.POINT_MOUSE_OVER;
      break;
    case acgraph.events.EventType.MOUSEMOVE:
      type = anychart.enums.EventType.POINT_MOUSE_MOVE;
      break;
    case acgraph.events.EventType.MOUSEDOWN:
      type = anychart.enums.EventType.POINT_MOUSE_DOWN;
      break;
    case acgraph.events.EventType.MOUSEUP:
      type = anychart.enums.EventType.POINT_MOUSE_UP;
      break;
    case acgraph.events.EventType.CLICK:
      type = anychart.enums.EventType.POINT_CLICK;
      break;
    case acgraph.events.EventType.DBLCLICK:
      type = anychart.enums.EventType.POINT_DBLCLICK;
      break;
    default:
      return null;
  }

  var iter = this.data().getIterator();
  if (!iter.select(pointIndex))
    iter.reset();

  return {
    'type': type,
    'actualTarget': event['target'],
    'iterator': iter,
    'sliceIndex': pointIndex,
    'pointIndex': pointIndex,
    'target': this,
    'originalEvent': event,
    'point': this.getPoint(pointIndex)
  };
};


/** @inheritDoc */
anychart.charts.Venn.prototype.getPoint = function(index) {
  var point = new anychart.core.Point(this, index);
  // var iter = this.getIterator();
  // var value;
  // if (iter.select(index) &&
  //     point.exists() && !this.isMissing_(value = /** @type {number} */(point.get('value')))) {
  //
  //   var val = value / /** @type {number} */(this.getStat(anychart.enums.Statistics.SUM)) * 100;
  //   point.statistics(anychart.enums.Statistics.PERCENT_VALUE, val);
  //   point.statistics(anychart.enums.Statistics.Y_PERCENT_OF_TOTAL, val);
  // }

  return point;
};


/**
 * Hovers a point of the series by its index.
 * @param {number|Array<number>} index Index of the point to hover.
 * @param {anychart.core.MouseEvent=} opt_event Event that initiate point hovering.<br/>
 *    <b>Note:</b> Used only to display float tooltip.
 * @return {!anychart.charts.Venn} - Self for method chaining.
 */
anychart.charts.Venn.prototype.hoverPoint = function(index, opt_event) {
  if (!this.enabled())
    return this;

  if (goog.isArray(index)) {
    var hoveredPoints = this.state.getIndexByPointState(anychart.PointState.HOVER);
    for (var i = 0; i < hoveredPoints.length; i++) {
      if (!goog.array.contains(index, hoveredPoints[i])) {
        this.state.removePointState(anychart.PointState.HOVER, hoveredPoints[i]);
      }
    }
    this.state.addPointState(anychart.PointState.HOVER, index);
    if (goog.isDef(opt_event))
      this.showTooltip(opt_event);

  } else if (goog.isNumber(index)) {
    this.unhover();
    this.state.addPointState(anychart.PointState.HOVER, index);
    if (goog.isDef(opt_event))
      this.showTooltip(opt_event);
  }
  return this;
};


/** @inheritDoc */
anychart.charts.Venn.prototype.unhover = function(opt_indexOrIndexes) {
  if (!(this.state.hasPointState(anychart.PointState.HOVER) ||
      this.state.isStateContains(this.state.getSeriesState(), anychart.PointState.HOVER)) || !this.enabled())
    return;

  var index;
  if (goog.isDef(opt_indexOrIndexes))
    index = opt_indexOrIndexes;
  else
    index = (this.state.seriesState == anychart.PointState.NORMAL ? NaN : undefined);
  this.state.removePointState(anychart.PointState.HOVER, index);

  this.hideTooltip();
};


/**
 * Apply appearance to point.
 * @param {anychart.PointState|number} pointState
 */
anychart.charts.Venn.prototype.applyAppearanceToPoint = function(pointState) {
  var iterator = this.getIterator();
  this.shapeManager_.updateColors(pointState, /** @type {Object.<string, acgraph.vector.Shape>} */(iterator.meta('shapes')));
  // if (this.supportsOutliers()) {
  //   this.drawPointOutliers(iterator, pointState);
  // }
  // this.drawer.updatePoint(iterator, pointState);
  // this.drawMarker(iterator, pointState);
  // this.drawLabel(iterator, pointState);
};


/**
 * Finalization point appearance. For drawing labels and markers.
 */
anychart.charts.Venn.prototype.finalizePointAppearance = goog.nullFunction;


//endregion
//region -- Tooltip
/**
 * Create format provider.
 * @param {boolean=} opt_force - create context provider forcibly.
 * @return {Object} - Object with info for labels formatting.
 * @protected
 */
anychart.charts.Venn.prototype.createFormatProvider = function(opt_force) {
  var iterator = this.getIterator();

  if (!this.pointProvider_ || opt_force)
    this.pointProvider_ = new anychart.format.Context();

  this.pointProvider_
      .dataSource(iterator)
      .statisticsSources([this.getPoint(iterator.getIndex()), this]);

  var values = {
    'x': {value: iterator.get('x'), type: anychart.enums.TokenType.STRING},
    'value': {value: iterator.get('value'), type: anychart.enums.TokenType.NUMBER},
    'index': {value: iterator.getIndex(), type: anychart.enums.TokenType.NUMBER},
    'chart': {value: this, type: anychart.enums.TokenType.UNKNOWN}
  };

  return this.pointProvider_.propagate(values);
};


/**
 * @param {anychart.core.MouseEvent=} opt_event initiates tooltip show.
 * @protected
 */
anychart.charts.Venn.prototype.showTooltip = function(opt_event) {
  console.log('show tooltip');
  var tooltip = /** @type {anychart.core.ui.Tooltip} */(this.tooltip());
  var formatProvider = this.createFormatProvider();
  if (opt_event) {
    tooltip.showFloat(opt_event['clientX'], opt_event['clientY'], formatProvider);
  }
};


anychart.charts.Venn.prototype.hideTooltip = function() {
  console.log('hide tooltip');
};
//endregion


/**
 * Data reflection comparator.
 * @param {anychart.charts.Venn.DataReflection} val1 - First value.
 * @param {anychart.charts.Venn.DataReflection} val2 - Second value.
 * @return {number}
 * @private
 */
anychart.charts.Venn.prototype.dataReflectionSort_ = function(val1, val2) {
  return val1.sets.length - val2.sets.length;
};


/** @inheritDoc */
anychart.charts.Venn.prototype.calculate = function() {
  if (this.hasInvalidationState(anychart.ConsistencyState.VENN_DATA) && this.data_) {
    this.dataReflections_.length = 0;
    this.solution_ = null;
    var iterator = this.getResetIterator();

    while (iterator.advance()) {
      var x = String(iterator.get('x'));
      var value = /** @type {number} */ (iterator.get('value'));
      var index = iterator.getIndex();
      var separator = this.getOption('setsSeparator');
      var splittedData = x.split(separator);
      var reflection = {sets: splittedData, size: value, iteratorIndex: index};
      this.dataReflections_.push(reflection);
      if (splittedData.length == 1) {
        this.circlesMap_[x] = reflection;
      }
    }

    //This sort allows to get raw data order independence.
    goog.array.sort(this.dataReflections_, this.dataReflectionSort_);

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

    this.shapeManager_ = new anychart.core.shapeManagers.PerPoint(this, [
      anychart.core.shapeManagers.pathFillConfig,
      anychart.core.shapeManagers.pathHatchConfig
    ], true);

    this.shapeManager_.setContainer(this.baseLayer_);

    // this.circlesLayer_ = new anychart.core.utils.TypedLayer(function() {
    //   var path = acgraph.path();
    //   path.stroke('none');
    //   return path;
    // }, function(child) {
    //   (/** @type {acgraph.vector.Path} */ (child)).clear();
    //   (/** @type {acgraph.vector.Path} */ (child)).tag = void 0;
    // });
    // this.circlesLayer_.zIndex(1);
    // this.circlesLayer_.parent(this.baseLayer_);
  }

  if (this.hasInvalidationState(anychart.ConsistencyState.BOUNDS)) {
    // this.circlesLayer_.clear();

    this.shapeManager_.clearShapes();


    // var group = this.shapeManager_.getShapesGroup(anychart.PointState.NORMAL);
    // var fillPath = group['fill'];
    // fillPath
    //     .moveTo(0, 0)
    //     .lineTo(100, 100)
    //     .lineTo(10, 100)
    //     .close()
    //     .stroke('blue');
    //
    // group = this.shapeManager_.getShapesGroup(anychart.PointState.NORMAL);
    // fillPath = group['fill'];
    // fillPath
    //     .moveTo(0, 0)
    //     .lineTo(100, 90)
    //     .lineTo(90, 10)
    //     .close()
    //     .stroke('green');


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



    for (var i = 0; i < this.dataReflections_.length; i++) {
      var refl = this.dataReflections_[i];
      var iteratorIndex = refl.iteratorIndex;
      var iterator = this.getIterator();
      var sets = refl.sets;

      var setData = [];
      var set;
      if (sets.length == 1) { //Main circle, not an intersection.
        var color = this.palette().itemAt(i);
        iterator.select(iteratorIndex);
        iterator.meta('paletteFill', color);
        set = sets[0];
        setData.push(circles[set]);
        this.circlesMap_[set].paletteFill = color;
      } else {
        var parentColors = [];
        for (var j = 0; j < sets.length; j++) {
          set = sets[j];
          var parent = this.circlesMap_[set];
          parentColors.push(parent.paletteFill);
          setData.push(circles[set]);
        }
        var paletteFill = this.blendColors_(parentColors);
        iterator.select(iteratorIndex);
        iterator.meta('paletteFill', paletteFill);
      }


      var stats = /** @type {anychart.math.venn.Stats} */ ({});
      anychart.math.venn.intersectionArea(setData, stats);

      var group = this.shapeManager_.getShapesGroup(anychart.PointState.NORMAL);
      var fillPath = group['fill'];
      this.doArc_(fillPath, stats, bounds);
    }


    // for (var key in textCenters) {
    //   var textCirc = textCenters[key];
    //   path = this.circlesLayer_.genNextChild();
    //   path.stroke('black');
    //   path.moveTo(textCirc.x + pixelShift + 5 + bounds.left, textCirc.y + pixelShift + bounds.top)
    //       .arcTo(5, 5, 0, 360);
    // }

  }

};


/**
 *
 * @param {Array.<acgraph.vector.Fill>} colors - Colors to blend.
 * @private
 * @return {acgraph.vector.Fill} - .
 */
anychart.charts.Venn.prototype.blendColors_ = function(colors) {
  if (colors.length) {
    var blended;
    for (var i = 0; i < colors.length; i++) {
      var color = colors[i];
      var norm = acgraph.vector.normalizeFill(color);
      var arrColor = goog.color.hexToRgb(goog.isString(norm) ? norm : norm.color);
      blended = blended ? goog.color.blend(blended, arrColor, .5) : arrColor;
    }
    return blended ? goog.color.rgbArrayToHex(blended) : 'black';
  } else {
    return 'black';
  }
};


anychart.charts.Venn.prototype.doArc_ = function(path, stats, bounds) {
  console.log(stats);
  var arcs = stats.arcs;
  if (!arcs.length)
    return;

  // path.stroke('blue');
  var pixelShift = .5;

  // function getRandomColor() {
  //   var letters = '0123456789ABCDEF';
  //   var color = '#';
  //   for (var i = 0; i < 6; i++) {
  //     color += letters[Math.floor(Math.random() * 16)];
  //   }
  //   return color;
  // }


  if (arcs.length == 1) {
    var circle = arcs[0].circle;
    path.moveTo(circle.x + pixelShift + circle.radius + bounds.left, circle.y + pixelShift + bounds.top)
        .arcTo(circle.radius, circle.radius, 0, 360);
    // path.fill(getRandomColor());
  } else if (arcs.length > 1) {
    // path.fill(getRandomColor());

    path.moveTo(arcs[0].p2.x + bounds.left, arcs[0].p2.y + bounds.top);
    for (var i = 0; i < arcs.length; ++i) {
      var arc = arcs[i];
      path.arcToByEndPoint(arc.p1.x + bounds.left, arc.p1.y + bounds.top, arc.circle.radius, arc.circle.radius, arc.width > arc.circle.radius, true);
    }

    path.close();

    // path.stroke({thickness: thi, color: '#000', opacity: 0.5});
  }
};


//region -- Serialization/Deserialization
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
  if (opt_default)
    this.themeSettings = config;
  anychart.core.settings.deserialize(this, this.SIMPLE_PROPS_DESCRIPTORS, config);
};


//endregion

//exports
(function() {
  var proto = anychart.charts.Venn.prototype;
  proto['data'] = proto.data;
  proto['getType'] = proto.getType;
})();

