import YearDropdown from "./year_dropdown";
import MonthDropdown from "./month_dropdown";
import MonthYearDropdown from "./month_year_dropdown";
import Month from "./month";
import MonthsList from './months_list';
import Time from "./time";
import React from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import CalendarContainer from "./calendar_container";
import CSSTransition from 'react-transition-group/CSSTransition';
import TransitionGroup from 'react-transition-group/TransitionGroup';
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
  getFormattedWeekdayInLocale,
  getWeekdayShortInLocale,
  getWeekdayMinInLocale,
  isSameDay,
  allDaysDisabledBefore,
  allDaysDisabledAfter,
  getEffectiveMinDate,
  getEffectiveMaxDate
} from "./date_utils";

const DROPDOWN_FOCUS_CLASSNAMES = [
  "react-datepicker__year-select",
  "react-datepicker__month-select",
  "react-datepicker__month-year-select"
];

const INCREASE = 'increase';
const DECREASE = 'decrease';

const isDropdownSelect = (element = {}) => {
  const classNames = (element.className || "").split(/\s+/);
  return DROPDOWN_FOCUS_CLASSNAMES.some(
    testClassname => classNames.indexOf(testClassname) >= 0
  );
};

export default class Calendar extends React.PureComponent {
  static propTypes = {
    adjustDateOnChange: PropTypes.bool,
    className: PropTypes.string,
    children: PropTypes.node,
    container: PropTypes.func,
    dateFormat: PropTypes.oneOfType([PropTypes.string, PropTypes.array])
      .isRequired,
    dayClassName: PropTypes.func,
    disabledKeyboardNavigation: PropTypes.bool,
    dropdownMode: PropTypes.oneOf(["scroll", "select"]),
    endDate: PropTypes.object,
    excludeDates: PropTypes.array,
    filterDate: PropTypes.func,
    fixedHeight: PropTypes.bool,
    formatWeekNumber: PropTypes.func,
    highlightDates: PropTypes.instanceOf(Map),
    includeDates: PropTypes.array,
    includeTimes: PropTypes.array,
    injectTimes: PropTypes.array,
    inline: PropTypes.bool,
    locale: PropTypes.string,
    maxDate: PropTypes.object,
    minDate: PropTypes.object,
    monthsShown: PropTypes.number,
    onClickOutside: PropTypes.func.isRequired,
    onMonthChange: PropTypes.func,
    onYearChange: PropTypes.func,
    forceShowMonthNavigation: PropTypes.bool,
    onDropdownFocus: PropTypes.func,
    onSelect: PropTypes.func.isRequired,
    onWeekSelect: PropTypes.func,
    showTimeSelect: PropTypes.bool,
    showTimeSelectOnly: PropTypes.bool,
    timeFormat: PropTypes.string,
    timeIntervals: PropTypes.number,
    onTimeChange: PropTypes.func,
    minTime: PropTypes.object,
    maxTime: PropTypes.object,
    excludeTimes: PropTypes.array,
    timeCaption: PropTypes.string,
    openToDate: PropTypes.object,
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
    todayButton: PropTypes.node,
    useWeekdaysShort: PropTypes.bool,
    formatWeekDay: PropTypes.func,
    withPortal: PropTypes.bool,
    utcOffset: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    weekLabel: PropTypes.string,
    yearDropdownItemNumber: PropTypes.number,
    setOpen: PropTypes.func,
    useShortMonthInDropdown: PropTypes.bool,
    showDisabledMonthNavigation: PropTypes.bool,
    previousMonthButtonLabel: PropTypes.node,
    nextMonthButtonLabel: PropTypes.node,
    renderCustomHeader: PropTypes.func,
    renderDayContents: PropTypes.func,
  };

  static get defaultProps() {
    return {
      onDropdownFocus: () => {},
      monthsShown: 1,
      forceShowMonthNavigation: false,
      timeCaption: "Time",
      previousMonthButtonLabel: "Previous Month",
      nextMonthButtonLabel: "Next Month"
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      date: this.localizeDate(this.getDateInView()),
      selectingDate: null,
      monthContainer: null
    };
  }

  componentDidMount() {
    // monthContainer height is needed in time component
    // to determine the height for the ul in the time component
    // setState here so height is given after final component
    // layout is rendered
    if (this.props.showTimeSelect) {
      this.assignMonthContainer = (() => {
        this.setState({ monthContainer: this.monthContainer });
      })();
    }
  }

  componentDidUpdate(prevProps) {
    if (
      this.props.preSelection &&
      !isSameDay(this.props.preSelection, prevProps.preSelection)
    ) {
      this.changeStateDate(this.localizeDate(this.props.preSelection));
    } else if (
      this.props.openToDate &&
      !isSameDay(this.props.openToDate, prevProps.openToDate)
    ) {
      this.changeStateDate(this.localizeDate(this.props.openToDate));
    }
  }

  changeStateDate(newDate, callback) {
    this.setState(({ date }) => ({
      date: newDate,
      dateChange: newDate.isAfter(date) ? INCREASE : DECREASE,
    }), callback);
  }

  handleClickOutside = event => {
    this.props.onClickOutside(event);
  };

  handleDropdownFocus = event => {
    if (isDropdownSelect(event.target)) {
      this.props.onDropdownFocus();
    }
  };

  getDateInView = () => {
    const { preSelection, selected, openToDate, utcOffset } = this.props;
    const minDate = getEffectiveMinDate(this.props);
    const maxDate = getEffectiveMaxDate(this.props);
    const current = now(utcOffset);
    const initialDate = openToDate || selected || preSelection;
    if (initialDate) {
      return initialDate;
    } else {
      if (minDate && isBefore(current, minDate)) {
        return minDate;
      } else if (maxDate && isAfter(current, maxDate)) {
        return maxDate;
      }
    }
    return current;
  };

  localizeDate = date => localizeDate(date, this.props.locale);

  increaseMonth = () => {
    this.setState(
      {
        dateChange: INCREASE,
        date: addMonths(cloneDate(this.state.date), 1)
      },
      () => this.handleMonthChange(this.state.date)
    );
  };

  decreaseMonth = () => {
    this.setState(
      {
        dateChange: DECREASE,
        date: subtractMonths(cloneDate(this.state.date), 1)
      },
      () => this.handleMonthChange(this.state.date)
    );
  };

  handleDayClick = (day, event) => this.props.onSelect(day, event);

  handleDayMouseEnter = day => this.setState({ selectingDate: day });

  handleMonthMouseLeave = () => this.setState({ selectingDate: null });

  handleYearChange = date => {
    if (this.props.onYearChange) {
      this.props.onYearChange(date);
    }
  };

  handleMonthChange = date => {
    if (this.props.onMonthChange) {
      this.props.onMonthChange(date);
    }
    if (this.props.adjustDateOnChange) {
      if (this.props.onSelect) {
        this.props.onSelect(date);
      }
      if (this.props.setOpen) {
        this.props.setOpen(true);
      }
    }
  };

  handleMonthYearChange = date => {
    this.handleYearChange(date);
    this.handleMonthChange(date);
  };

  changeYear = year => {
    this.changeStateDate(
      setYear(cloneDate(this.state.date), year),
      () => this.handleYearChange(this.state.date)
    );
  };

  changeMonth = month => {
    this.changeStateDate(
      setMonth(cloneDate(this.state.date), month),
      () => this.handleMonthChange(this.state.date)
    );
  };

  changeMonthYear = monthYear => {
    this.changeStateDate(
      setYear(
        setMonth(cloneDate(this.state.date), getMonth(monthYear)),
        getYear(monthYear)
      ),
      () => this.handleMonthYearChange(this.state.date)
    );
  };

  header = (date = this.state.date) => {
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
        const weekDayName = this.formatWeekday(localeData, day);

        return (
          <div key={offset} className="react-datepicker__day-name">
            {weekDayName}
          </div>
        );
      })
    );
  };

  formatWeekday = (localeData, day) => {
    if (this.props.formatWeekDay) {
      return getFormattedWeekdayInLocale(
        localeData,
        day,
        this.props.formatWeekDay
      );
    }
    return this.props.useWeekdaysShort
      ? getWeekdayShortInLocale(localeData, day)
      : getWeekdayMinInLocale(localeData, day);
  };

  renderPreviousMonthButton = () => {
    if (this.props.renderCustomHeader) {
      return;
    }

    const allPrevDaysDisabled = allDaysDisabledBefore(
      this.state.date,
      "month",
      this.props
    );

    if (
      (!this.props.forceShowMonthNavigation &&
        !this.props.showDisabledMonthNavigation &&
        allPrevDaysDisabled) ||
      this.props.showTimeSelectOnly
    ) {
      return;
    }

    const classes = [
      "react-datepicker__navigation",
      "react-datepicker__navigation--previous",
    ];

    let clickHandler = this.decreaseMonth;

    if (allPrevDaysDisabled && this.props.showDisabledMonthNavigation) {
      classes.push("react-datepicker__navigation--previous--disabled");
      clickHandler = null;
    }

    return (
      <button
        type="button"
        className={classes.join(" ")}
        onClick={clickHandler}
      >
        {this.props.previousMonthButtonLabel}
      </button>
    );
  };

  renderNextMonthButton = () => {
    if (this.props.renderCustomHeader) {
      return;
    }

    const allNextDaysDisabled = allDaysDisabledAfter(
      this.state.date,
      "month",
      this.props
    );

    if (
      (!this.props.forceShowMonthNavigation &&
        !this.props.showDisabledMonthNavigation &&
        allNextDaysDisabled) ||
      this.props.showTimeSelectOnly
    ) {
      return;
    }

    const classes = [
      "react-datepicker__navigation",
      "react-datepicker__navigation--next",
    ];
    if (this.props.showTimeSelect) {
      classes.push("react-datepicker__navigation--next--with-time");
    }
    if (this.props.todayButton) {
      classes.push("react-datepicker__navigation--next--with-today-button");
    }

    let clickHandler = this.increaseMonth;

    if (allNextDaysDisabled && this.props.showDisabledMonthNavigation) {
      classes.push("react-datepicker__navigation--next--disabled");
      clickHandler = null;
    }

    return (
      <button
        type="button"
        className={classes.join(" ")}
        onClick={clickHandler}
      >
        {this.props.nextMonthButtonLabel}
      </button>
    );
  };

  renderTodayButton = () => {
    if (!this.props.todayButton || this.props.showTimeSelectOnly) {
      return;
    }
    return (
      <div
        className="react-datepicker__today-button"
        onClick={e =>
          this.props.onSelect(getStartOfDate(now(this.props.utcOffset)), e)
        }
      >
        {this.props.todayButton}
      </div>
    );
  };

  renderTimeSection = () => {
    if (this.props.showTimeSelect) {
      return (
        <Time
          selected={this.props.selected}
          onChange={this.props.onTimeChange}
          format={this.props.timeFormat}
          includeTimes={this.props.includeTimes}
          intervals={this.props.timeIntervals}
          minTime={this.props.minTime}
          maxTime={this.props.maxTime}
          excludeTimes={this.props.excludeTimes}
          timeCaption={this.props.timeCaption}
          todayButton={this.props.todayButton}
          showMonthDropdown={this.props.showMonthDropdown}
          showMonthYearDropdown={this.props.showMonthYearDropdown}
          showYearDropdown={this.props.showYearDropdown}
          withPortal={this.props.withPortal}
          monthRef={this.state.monthContainer}
          injectTimes={this.props.injectTimes}
        />
      );
    }
  };

  childFactory = (child) => {
    const currentMonth = this.state.date.clone().startOf('month')
    const childMonth = child.props.startOfMonth
    const isCurrent = currentMonth.isSame(childMonth)
    let className = null
    if(currentMonth.isSame(childMonth)) {
      className = 'react-datepicker__months-list-container--current'
    } else if(currentMonth.isAfter(childMonth)) {
      className = 'react-datepicker__months-list-container--prev'
    } else {
      className = 'react-datepicker__months-list-container--next'
    }
    return React.cloneElement(child, { className, isCurrent })
  }

  renderMonths() {
    if (this.props.showTimeSelectOnly) {
      return;
    }

    const { dateChange, date } = this.state;
    const startOfMonth = date.clone().startOf('month');

    return (
      <TransitionGroup
        className={classnames(
          'react-datepicker__months-lists-wrapper',
          dateChange && `react-datepicker__months-lists-wrapper--${dateChange}`
        )}
        childFactory={this.childFactory}
      >
        <CSSTransition
          key={startOfMonth}
          date={date}
          startOfMonth={startOfMonth}
          timeout={500}
          classNames="react-datepicker__months-list-container-"
        >
          { (status, { date, className }) => (
            <div
              className={classnames("react-datepicker__months-list-container", className)}
            >
              <MonthsList
                ref={el => { if(el) { this.monthContainer = el.monthContainer; } } }
                onDropdownFocus={this.handleDropdownFocus}
                onChangeMonth={this.handleMonthChange}
                onChangeMonthYear={this.handleMonthYearChange}
                onChangeYear={this.handleYearChange}
                date={date}
                selectingDate={this.state.selectingDate}
                onDayClick={this.handleDayClick}
                onDayMouseEnter={this.handleDayMouseEnter}
                onMouseLeave={this.handleMonthMouseLeave}
                adjustDateOnChange={this.props.adjustDateOnChange}
                dateFormat={this.props.dateFormat}
                dayClassName={this.props.dayClassName}
                dropdownMode={this.props.dropdownMode}
                endDate={this.props.endDate}
                excludeDates={this.props.excludeDates}
                filterDate={this.props.filterDate}
                fixedHeight={this.props.fixedHeight}
                formatWeekNumber={this.props.formatWeekNumber}
                highlightDates={this.props.highlightDates}
                includeDates={this.props.includeDates}
                inline={this.props.inline}
                locale={this.props.locale}
                maxDate={this.props.maxDate}
                minDate={this.props.minDate}
                monthsShown={this.props.monthsShown}
                onSelect={this.props.onSelect}
                onWeekSelect={this.props.onWeekSelect}
                peekNextMonth={this.props.peekNextMonth}
                scrollableYearDropdown={this.props.scrollableYearDropdown}
                scrollableMonthYearDropdown={this.props.scrollableMonthYearDropdown}
                preSelection={this.props.preSelection}
                selected={this.props.selected}
                selectsEnd={this.props.selectsEnd}
                selectsStart={this.props.selectsStart}
                showMonthDropdown={this.props.showMonthDropdown}
                showMonthYearDropdown={this.props.showMonthYearDropdown}
                showWeekNumbers={this.props.showWeekNumbers}
                showYearDropdown={this.props.showYearDropdown}
                startDate={this.props.startDate}
                useWeekdaysShort={this.props.useWeekdaysShort}
                utcOffset={this.props.utcOffset}
                disabledKeyboardNavigation={this.props.disabledKeyboardNavigation}
                weekLabel={this.props.weekLabel}
                yearDropdownItemNumber={this.props.yearDropdownItemNumber}
                setOpen={this.props.setOpen}
                useShortMonthInDropdown={this.props.useShortMonthInDropdown}
                renderDayContents={this.props.renderDayContents}
                renderCustomHeader={this.props.renderCustomHeader}
              />
            </div>
          )}
        </CSSTransition>
      </TransitionGroup>
    );
  }

  render() {
    const Container = this.props.container || CalendarContainer;

    return (
      <Container
        className={classnames("react-datepicker", this.props.className, {
          "react-datepicker--time-only": this.props.showTimeSelectOnly
        })}
      >
        {this.renderPreviousMonthButton()}
        {this.renderNextMonthButton()}
        {this.renderMonths()}
        {this.renderTodayButton()}
        {this.renderTimeSection()}
        {this.props.children}
      </Container>
    );
  }
}
