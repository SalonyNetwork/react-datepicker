import YearDropdown from "./year_dropdown";
import MonthDropdown from "./month_dropdown";
import MonthYearDropdown from "./month_year_dropdown";
import Month from "./month";
import MonthsList from './months_list';
import Time from "./time";
import React from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
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
    onClickOutside: PropTypes.func.isRequired,
    onMonthChange: PropTypes.func,
    onYearChange: PropTypes.func,
    forceShowMonthNavigation: PropTypes.bool,
    onDropdownFocus: PropTypes.func,
    onSelect: PropTypes.func.isRequired,
    onWeekSelect: PropTypes.func,
    showTimeSelect: PropTypes.bool,
    timeFormat: PropTypes.string,
    timeIntervals: PropTypes.number,
    onTimeChange: PropTypes.func,
    minTime: PropTypes.object,
    maxTime: PropTypes.object,
    excludeTimes: PropTypes.array,
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
    todayButton: PropTypes.string,
    useWeekdaysShort: PropTypes.bool,
    withPortal: PropTypes.bool,
    utcOffset: PropTypes.number,
    weekLabel: PropTypes.string,
    yearDropdownItemNumber: PropTypes.number,
    setOpen: PropTypes.func,
    useShortMonthInDropdown: PropTypes.bool,
    showDisabledMonthNavigation: PropTypes.bool,
  };

  static get defaultProps() {
    return {
      onDropdownFocus: () => {},
      monthsShown: 1,
      forceShowMonthNavigation: false
    };
  }

  constructor(props) {
    super(props);
    this.state = {
      date: this.localizeDate(this.getDateInView()),
      selectingDate: null,
      monthContainer: this.monthContainer
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

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.preSelection &&
      !isSameDay(nextProps.preSelection, this.props.preSelection)
    ) {
      this.setState({
        date: this.localizeDate(nextProps.preSelection)
      });
    } else if (
      nextProps.openToDate &&
      !isSameDay(nextProps.openToDate, this.props.openToDate)
    ) {
      this.setState({
        date: this.localizeDate(nextProps.openToDate)
      });
    }
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
        date: addMonths(cloneDate(this.state.date), 1)
      },
      () => this.handleMonthChange(this.state.date)
    );
  };

  decreaseMonth = () => {
    this.setState(
      {
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
    this.handleYearChange(date)
    this.handleMonthChange(date)
  };

  changeYear = year => {
    this.setState(
      {
        date: setYear(cloneDate(this.state.date), year)
      },
      () => this.handleYearChange(this.state.date)
    );
  };

  changeMonth = month => {
    this.setState(
      {
        date: setMonth(cloneDate(this.state.date), month)
      },
      () => this.handleMonthChange(this.state.date)
    );
  };

  changeMonthYear = monthYear => {
    this.setState(
      {
        date: setYear(setMonth(cloneDate(this.state.date), getMonth(monthYear)), getYear(monthYear))
      },
      () => this.handleMonthYearChange(this.state.date)
    );
  };

  renderPreviousMonthButton = () => {

    const allPrevDaysDisabled = allDaysDisabledBefore(this.state.date, "month", this.props);

    if (
      !this.props.forceShowMonthNavigation &&
      !this.props.showDisabledMonthNavigation &&
      allPrevDaysDisabled
    ) {
      return;
    }

    const classes = [
      "react-datepicker__navigation",
      "react-datepicker__navigation--previous"
    ];

    let clickHandler = this.decreaseMonth;

    if (allPrevDaysDisabled && this.props.showDisabledMonthNavigation) {
      classes.push("react-datepicker__navigation--previous--disabled");
      clickHandler = null;
    }

    return (
      <button
        className={classes.join(" ")}
        onClick={clickHandler}/>
    );
  };

  renderNextMonthButton = () => {

    const allNextDaysDisabled = allDaysDisabledAfter(this.state.date, "month", this.props);

    if (
      !this.props.forceShowMonthNavigation &&
      !this.props.showDisabledMonthNavigation &&
      allNextDaysDisabled
    ) {
      return;
    }

    const classes = [
      "react-datepicker__navigation",
      "react-datepicker__navigation--next"
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

    return <button className={classes.join(" ")} onClick={clickHandler} />;
  };

  renderTodayButton = () => {
    if (!this.props.todayButton) {
      return;
    }
    return (
      <div
        className="react-datepicker__today-button"
        onClick={e =>
          this.props.onSelect(getStartOfDate(now(this.props.utcOffset)), e)
        }>
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
          intervals={this.props.timeIntervals}
          minTime={this.props.minTime}
          maxTime={this.props.maxTime}
          excludeTimes={this.props.excludeTimes}
          todayButton={this.props.todayButton}
          showMonthDropdown={this.props.showMonthDropdown}
          showMonthYearDropdown={this.props.showMonthYearDropdown}
          showYearDropdown={this.props.showYearDropdown}
          withPortal={this.props.withPortal}
          monthRef={this.state.monthContainer}/>
      );
    }
  };

  childFactoryMaker() {
    return (child) => {
      console.log(child)
      return React.cloneElement(child)
    }
  }

  renderMonths() {
    return (
      <TransitionGroup>
        <CSSTransition
          key={this.state.date}
          date={this.state.date}
          timeout={50000}
          classNames="react-datepicker__months-list-container-"
          >
          { (status, {date}) => {
            return (
              <div className="react-datepicker__months-list-container">
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
                  weekLabel={this.props.weekLabel}
                  yearDropdownItemNumber={this.props.yearDropdownItemNumber}
                  setOpen={this.props.setOpen}
                  useShortMonthInDropdown={this.props.useShortMonthInDropdown}
                />
              </div>
            )
          }}
        </CSSTransition>
      </TransitionGroup>
    )
  }

  render() {
    return (
      <div className={classnames("react-datepicker", this.props.className)}>
        <div className="react-datepicker__triangle" />
        {this.renderPreviousMonthButton()}
        {this.renderNextMonthButton()}
        {this.renderMonths()}
        {this.renderTodayButton()}
        {this.renderTimeSection()}
        {this.props.children}
      </div>
    );
  }
}
