import React from 'react';
import PropTypes from "prop-types";
import Month from "./month";
import MonthDropdown from './month_dropdown';
import MonthYearDropdown from './month_year_dropdown';
import YearDropdown from './year_dropdown';

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
    adjustDateOnChange: PropTypes.bool,
    dateFormat: PropTypes.oneOfType([PropTypes.string, PropTypes.array])
      .isRequired,
    dayClassName: PropTypes.func,
    dropdownMode: PropTypes.oneOf(["scroll", "select"]).isRequired,
    endDate: PropTypes.object,
    excludeDates: PropTypes.array,
    filterDate: PropTypes.func,
    fixedHeight: PropTypes.bool,
    formatWeekNumber: PropTypes.func,
    highlightDates: PropTypes.instanceOf(Map),
    includeDates: PropTypes.array,
    inline: PropTypes.bool,
    locale: PropTypes.string,
    maxDate: PropTypes.object,
    minDate: PropTypes.object,
    monthsShown: PropTypes.number,
    onDropdownFocus: PropTypes.func,
    onSelect: PropTypes.func.isRequired,
    onWeekSelect: PropTypes.func,
    peekNextMonth: PropTypes.bool,
    scrollableYearDropdown: PropTypes.bool,
    scrollableMonthYearDropdown: PropTypes.bool,
    preSelection: PropTypes.object,
    selected: PropTypes.object,
    selectsEnd: PropTypes.bool,
    selectsStart: PropTypes.bool,
    showMonthDropdown: PropTypes.bool,
    showMonthYearDropdown: PropTypes.bool,
    showWeekNumbers: PropTypes.bool,
    showYearDropdown: PropTypes.bool,
    startDate: PropTypes.object,
    useWeekdaysShort: PropTypes.bool,
    utcOffset: PropTypes.number,
    weekLabel: PropTypes.string,
    yearDropdownItemNumber: PropTypes.number,
    setOpen: PropTypes.func,
    useShortMonthInDropdown: PropTypes.bool,

    onChangeMonth: PropTypes.func.isRequired,
    onChangeMonthYear: PropTypes.func.isRequired,
    onChangeYear: PropTypes.func.isRequired,
    onDropdownFocus: PropTypes.func.isRequired,
    onDayClick: PropTypes.func.isRequired,
    onDayMouseEnter: PropTypes.func.isRequired,
    onMouseLeave: PropTypes.func.isRequired,
    selectingDate: PropTypes.object,
    date: PropTypes.object.isRequired
  }

  renderCurrentMonth = (date = this.props.date) => {
    const classes = ["react-datepicker__current-month"];

    if (this.props.showYearDropdown) {
      classes.push("react-datepicker__current-month--hasYearDropdown");
    }
    if (this.props.showMonthDropdown) {
      classes.push("react-datepicker__current-month--hasMonthDropdown");
    }
    if (this.props.showMonthYearDropdown) {
      classes.push("react-datepicker__current-month--hasMonthYearDropdown");
    }
    return (
      <div className={classes.join(" ")}>
        {formatDate(date, this.props.dateFormat)}
      </div>
    );
  };

  renderMonthDropdown = (overrideHide = false) => {
    if (!this.props.showMonthDropdown) {
      return;
    }
    return (
      <MonthDropdown
        dropdownMode={this.props.dropdownMode}
        locale={this.props.locale}
        dateFormat={this.props.dateFormat}
        onChange={this.props.onChangeMonth}
        month={getMonth(this.props.date)}
        useShortMonthInDropdown={this.props.useShortMonthInDropdown} />
    );
  };

  renderMonthYearDropdown = (overrideHide = false) => {
    if (!this.props.showMonthYearDropdown) {
      return;
    }
    return (
      <MonthYearDropdown
        dropdownMode={this.props.dropdownMode}
        locale={this.props.locale}
        dateFormat={this.props.dateFormat}
        onChange={this.props.onChangeMonthYear}
        minDate={this.props.minDate}
        maxDate={this.props.maxDate}
        date={this.props.date}
        scrollableMonthYearDropdown={this.props.scrollableMonthYearDropdown}
      />
    );
  };

  header = (date = this.props.date) => {
    const startOfWeek = getStartOfWeek(cloneDate(date));
    const dayNames = [];
    if (this.props.showWeekNumbers) {
      dayNames.push(
        <div key="W" className="react-datepicker__day-name">
          {this.props.weekLabel || "#"}
        </div>
      );
    }
    return dayNames.concat(
      [0, 1, 2, 3, 4, 5, 6].map(offset => {
        const day = addDays(cloneDate(startOfWeek), offset);
        const localeData = getLocaleData(day);
        const weekDayName = this.props.useWeekdaysShort
          ? getWeekdayShortInLocale(localeData, day)
          : getWeekdayMinInLocale(localeData, day);
        return (
          <div key={offset} className="react-datepicker__day-name">
            {weekDayName}
          </div>
        );
      })
    );
  };

  renderYearDropdown = (overrideHide = false) => {
    if (!this.props.showYearDropdown || overrideHide) {
      return;
    }
    return (
      <YearDropdown
        adjustDateOnChange={this.props.adjustDateOnChange}
        date={this.props.date}
        onSelect={this.props.onSelect}
        setOpen={this.props.setOpen}
        dropdownMode={this.props.dropdownMode}
        onChange={this.props.onChangeYear}
        minDate={this.props.minDate}
        maxDate={this.props.maxDate}
        year={getYear(this.props.date)}
        scrollableYearDropdown={this.props.scrollableYearDropdown}
        yearDropdownItemNumber={this.props.yearDropdownItemNumber}/>
    );
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
          className="react-datepicker__month-container">
          <div className="react-datepicker__header">
            {this.renderCurrentMonth(monthDate)}
            <div
              className={`react-datepicker__header__dropdown react-datepicker__header__dropdown--${
                this.props.dropdownMode
              }`}
              onFocus={this.props.onDropdownFocus}>
              {this.renderMonthDropdown(i !== 0)}
              {this.renderMonthYearDropdown(i !== 0)}
              {this.renderYearDropdown(i !== 0)}
            </div>
            <div className="react-datepicker__day-names">
              {this.header(monthDate)}
            </div>
          </div>
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
            utcOffset={this.props.utcOffset}/>
        </div>
      );
    }
    return monthList;
  };
}

export default MonthsList
