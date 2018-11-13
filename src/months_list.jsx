import React from "react";
import PropTypes from "prop-types";
import Month from "./month";
import MonthDropdown from "./month_dropdown";
import MonthYearDropdown from "./month_year_dropdown";
import YearDropdown from "./year_dropdown";

import {
  now,
  setMonth,
  getMonth,
  addMonths,
  subtractMonths,
  getStartOfWeek,
  getStartOfDate,
  addDays,
  cloneDate,
  formatDate,
  localizeDate,
  setYear,
  getYear,
  isBefore,
  isAfter,
  getLocaleData,
  getWeekdayShortInLocale,
  getWeekdayMinInLocale,
  isSameDay,
  allDaysDisabledBefore,
  allDaysDisabledAfter,
  getEffectiveMinDate,
  getEffectiveMaxDate
} from "./date_utils";

class MonthsList extends React.PureComponent {
  static propTypes = {
    dayClassName: PropTypes.func,
    endDate: PropTypes.object,
    excludeDates: PropTypes.array,
    filterDate: PropTypes.func,
    fixedHeight: PropTypes.bool,
    formatWeekNumber: PropTypes.func,
    highlightDates: PropTypes.instanceOf(Map),
    includeDates: PropTypes.array,
    inline: PropTypes.bool,
    maxDate: PropTypes.object,
    minDate: PropTypes.object,
    monthsShown: PropTypes.number,
    onWeekSelect: PropTypes.func,
    peekNextMonth: PropTypes.bool,
    preSelection: PropTypes.object,
    selected: PropTypes.object,
    selectsEnd: PropTypes.bool,
    selectsStart: PropTypes.bool,
    showWeekNumbers: PropTypes.bool,
    startDate: PropTypes.object,
    utcOffset: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    renderHeader: PropTypes.func,
    renderDayContents: PropTypes.func,

    onDayClick: PropTypes.func.isRequired,
    onDayMouseEnter: PropTypes.func.isRequired,
    onMouseLeave: PropTypes.func.isRequired,
    selectingDate: PropTypes.object,
    date: PropTypes.object.isRequired
  };

  render() {
    var monthList = [];
    for (var i = 0; i < this.props.monthsShown; ++i) {
      var monthDate = addMonths(cloneDate(this.props.date), i);
      var monthKey = `month-${i}`;
      monthList.push(
        <div
          key={monthKey}
          ref={div => {
            this.monthContainer = div;
          }}
          className="react-datepicker__month-container"
        >
          {this.props.renderHeader({ monthDate, i })}
          <Month
            day={monthDate}
            dayClassName={this.props.dayClassName}
            onDayClick={this.props.onDayClick}
            onDayMouseEnter={this.props.onDayMouseEnter}
            onMouseLeave={this.props.onMouseLeave}
            onWeekSelect={this.props.onWeekSelect}
            formatWeekNumber={this.props.formatWeekNumber}
            minDate={this.props.minDate}
            maxDate={this.props.maxDate}
            excludeDates={this.props.excludeDates}
            highlightDates={this.props.highlightDates}
            selectingDate={this.props.selectingDate}
            includeDates={this.props.includeDates}
            inline={this.props.inline}
            fixedHeight={this.props.fixedHeight}
            filterDate={this.props.filterDate}
            preSelection={this.props.preSelection}
            selected={this.props.selected}
            selectsStart={this.props.selectsStart}
            selectsEnd={this.props.selectsEnd}
            showWeekNumbers={this.props.showWeekNumbers}
            startDate={this.props.startDate}
            endDate={this.props.endDate}
            peekNextMonth={this.props.peekNextMonth}
            utcOffset={this.props.utcOffset}
            renderDayContents={this.props.renderDayContents}
          />
        </div>
      );
    }
    return monthList;
  }
}

export default MonthsList;
