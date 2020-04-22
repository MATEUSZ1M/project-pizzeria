import { templates, select, settings, classNames } from './../settings.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';
import utils from './../utils.js';

class Booking {
  constructor(bookingPage) {
    const thisBooking = this;
    thisBooking.render(bookingPage);
    thisBooking.initWidgets();
    thisBooking.initBooking();

    thisBooking.getData();
  }

  render(bookingPage) {
    const thisBooking = this;

    const generatedHTML = templates.bookingWidget();

    thisBooking.dom = {};

    thisBooking.dom.wrapper = bookingPage;

    thisBooking.dom.wrapper.innerHTML = generatedHTML;

    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(
      select.booking.peopleAmount
    );
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(
      select.booking.hoursAmount
    );
    //10.3
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(
      select.widgets.datePicker.wrapper
    );
    //10.3 time slider
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(
      select.widgets.hourPicker.wrapper
    );
    //11 tables
    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(
      select.booking.tables
    );
    //hours
    thisBooking.dom.duration = thisBooking.dom.wrapper.querySelector(
      select.widgets.amount.hoursAmount
    );
    //amount of people
    thisBooking.dom.people = thisBooking.dom.wrapper.querySelector(
      select.widgets.amount.peopleAmount
    );
    //starters
    thisBooking.dom.starters = thisBooking.dom.wrapper.querySelectorAll(
      select.booking.starters
    );
    //phone
    thisBooking.dom.phone = thisBooking.dom.wrapper.querySelector(
      select.booking.phone
    );
    //adress
    thisBooking.dom.adress = thisBooking.dom.wrapper.querySelector(
      select.booking.adress
    );
    //submit button
    thisBooking.dom.formSubmit = thisBooking.dom.wrapper.querySelector(
      select.booking.formSubmit
    );
  }

  initWidgets() {
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);

    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    //10.3
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    //10.3 time slider
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.wrapper.addEventListener('updated', function () {
      thisBooking.clearBookedTable();
      thisBooking.updateDOM();
    });
  }

  initBooking() {
    const thisBooking = this;
    const tableList = thisBooking.dom.tables;

    for (let table of tableList) {
      table.addEventListener('click', function () {
        event.preventDefault();

        table.classList.toggle('booked');

        const allSelectedTables = document.querySelectorAll(
          select.all.tableSelected
        );

        for (let selectedTable of allSelectedTables) {
          if (selectedTable !== table || table.classList.contains('booked')) {
            return selectedTable.classList.remove('selected');
          }
        }
      });
    }

    console.log(thisBooking.dom.formSubmit);

    thisBooking.hour = thisBooking.hourPicker.dom.input;
    thisBooking.date = thisBooking.datePicker.dom.input;

    thisBooking.hour.addEventListener('change', function () {
      for (let table of tableList) {
        table.classList.remove('selected');
      }
    });

    thisBooking.date.addEventListener('change', function () {
      for (let table of tableList) {
        table.classList.remove('selected');
      }
    });

    thisBooking.dom.formSubmit.addEventListener('click', function () {
      event.preventDefault();

      thisBooking.bookTable();
      for (let table of tableList) {
        table.classList.remove('selected');
      }
    });
  }

  getData() {
    const thisBooking = this;

    const startDateParam = `${settings.db.dateStartParamKey}=${utils.dateToStr(
      thisBooking.datePicker.minDate
    )}`;

    const endDateParam = `${settings.db.dateEndParamKey}=${utils.dateToStr(
      thisBooking.datePicker.maxDate
    )}`;

    const params = {
      booking: [startDateParam, endDateParam],
      eventsCurrent: [settings.db.notRepeatParam, startDateParam, endDateParam],
      eventsRepeat: [settings.db.repeatParam, endDateParam],
    };

    const urls = {
      booking: `${settings.db.url}/${settings.db.booking}?${params.booking.join(
        '&'
      )}`,

      eventsCurrent: `${settings.db.url}/${
        settings.db.event
      }?${params.eventsCurrent.join('&')}`,

      eventsRepeat: `${settings.db.url}/${
        settings.db.event
      }?${params.eventsRepeat.join('&')}`,
    };
    console.log('getData urls', urls);

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function (allResponses) {
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];

        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })

      .then(function ([bookings, eventsCurrent, eventsRepeat]) {
        console.log('bookings from API', bookings);
        console.log('eventsCurrent from API', eventsCurrent);
        console.log('eventsRepeat from API', eventsRepeat);
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat) {
    const thisBooking = this;

    thisBooking.booked = {};

    for (let item of bookings) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for (let item of eventsCurrent) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for (let item of eventsRepeat) {
      if (item.repeat === 'daily') {
        for (
          let loopDate = minDate;
          loopDate <= maxDate;
          loopDate = utils.addDays(loopDate, 1)
        ) {
          thisBooking.makeBooked(
            utils.dateToStr(loopDate),
            item.hour,
            item.duration,
            item.table
          );
        }
      }
    }
    thisBooking.updateDOM();
  }

  updateDOM() {
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    let allAvailable = false;

    if (
      typeof thisBooking.booked[thisBooking.date] === 'undefined' ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] ===
        'undefined'
    ) {
      allAvailable = true;
    }

    for (let table of thisBooking.dom.tables) {
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if (!isNaN(tableId)) {
        tableId = parseInt(tableId);
      }

      if (
        !allAvailable &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ) {
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
    }
  }

  makeBooked(date, hour, duration, table) {
    const thisBooking = this;

    if (typeof thisBooking.booked[date] == 'undefined') {
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for (
      let hourBlock = startHour;
      hourBlock < startHour + duration;
      hourBlock += 0.5
    ) {
      if (typeof thisBooking.booked[date][hourBlock] == 'undefined') {
        thisBooking.booked[date][hourBlock] = [];
      }
      thisBooking.booked[date][hourBlock].push(table);
    }
  }

  bookTable(event) {
    event.preventDefault();
    

    console.log('dupa');
  }

  clearBookedTable() {
    return;
  }

  submitBooking(event) {
    event.preventDefault();

    const thisBooking = this;
    const url = `${settings.db.url}/${settings.db.booking}`;

    const validation = {};
    console.log(validation);

    if (!thisBooking.data) {
      validation.data = 'no date selected';
    }

    if (!thisBooking.hour) {
      validation.hour = 'no hour selected';
    }

    if (!thisBooking.table) {
      validation.hour = 'no hour selected';
    }

    const isValid = Object.keys(validation).length === 0;
    console.log(isValid);

    const payload = {
      date: thisBooking.datePicker.value,
      hour: thisBooking.hourPicker.value,
      table: thisBooking.bookTable,
      people: parseInt(thisBooking.dom.people.value),
      duration: parseInt(thisBooking.dom.duration.value),
      phone: thisBooking.dom.phone.value,
      address: thisBooking.dom.adress.value,
      // starters: [],
    };

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    if (isValid) {
      fetch(url, options)
        .then(function (response) {
          return response.json();
        })
        .then(function (parsedResponse) {
          console.log('parsedResponse', parsedResponse);
        });
    } else {
      return alert(validation);
    }
  }
}

export default Booking;

//   for (let starter of thisBooking.dom.starters) {
//     if (starter.checked === true) {
//       booking.starters.push(starter.value);
//     }
//   }

//   for (let table of thisBooking.dom.tables) {

//     if (table.classList.contains('selected')) {
//       thisBooking.tableId = table.getAttribute('data-table');
//       if (!isNaN(thisBooking.tableId)) {
//         thisBooking.tableId = parseInt(thisBooking.tableId);
//       }
//       booking.table.push(thisBooking.tableId);
//     }
//   }
