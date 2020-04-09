import { templates, select } from '../settings.js';
import AmountWidget from './AmountWidget.js';

class Booking {
  constructor(bookingPage) {
    const thisBooking = this;
    thisBooking.render(bookingPage);
    thisBooking.initWidgets();
  }

  render(bookingPage) {
    //stała this booking
    const thisBooking = this;

    // stała w krórej jest zapisany kod html
    const generatedHTML = templates.bookingWidget();
    //pusty obiekt do którego zapiszę właściwaośc wrapper
    thisBooking.dom = {};
    //zapisuję  do obiektu właściwości wrapper otrzymywany argument
    thisBooking.dom.wrapper = bookingPage;
    console.log('sajdkalshdjkasghhdkasjlshadlkjashdlashdlash', thisBooking.dom.wrapper);
    //zamieniam zawartośc wrappera na kod html wygenerowany z szablonu
    thisBooking.dom.wrapper.innerHTML = generatedHTML;
    //we właściwości thisBooking.dom.peopleAmount zapisywać pojedynczy element znaleziony we wrapperze i pasujący do selektora select.booking.peopleAmount
    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(
      select.booking.peopleAmount
    );
    //analogicznie do poprzedniej linijki tylko że dla hoursAmount
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(
      select.booking.hoursAmount
    );
  }

  initWidgets() {
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);

    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
  }
}

export default Booking;
