import{select, classNames, templates} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';

class Product {
  //[DONE] Add Declare arguments id && data
  constructor(id, data) {
    const thisProduct = this;
    //[DONE] Add Declare arguments id && data
    thisProduct.id = id;
    //[DONE] Add Declare arguments id && data
    thisProduct.data = data;
    // [DONE] Add metod rendering products in menu
    thisProduct.renderInMenu();
    //[DONE] Add metod getElements
    thisProduct.getElements();
    //console.log('new Product: ', thisProduct);
    thisProduct.initAccordion();
    thisProduct.initOrderForm();
    thisProduct.initAmountWidget();
    thisProduct.processOrder();
  }

  // [DONE] Add metod rendering products in menu
  renderInMenu() {
    const thisProduct = this;
    // [DONE]generate HTML based on template
    const generatedHTML = templates.menuProduct(thisProduct.data);
    // [DONE] create element using utils.createElementFromHTML
    thisProduct.element = utils.createDOMFromHTML(generatedHTML);
    // [DONE] find menu container
    const menuContainer = document.querySelector(select.containerOf.menu);
    //[DONE] add element to menu
    menuContainer.appendChild(thisProduct.element);
  }

  //[DONE]Add getElements method
  getElements() {
    const thisProduct = this;
    thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
    thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
    thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
    thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
    thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
  }

  //[DONE]  metod
  initAccordion() {
    const thisProduct = this;
    /* find the clickable trigger (the element that should react to clicking) */
    const accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
    /* START: click event listener to trigger */
    accordionTrigger.addEventListener('click', function () {
      /* prevent default action for event */
      event.preventDefault();
      //console.log('clicked');
      /* toggle active class on element of thisProduct */
      thisProduct.element.classList.toggle('active');
      /* find all active products */
      const allActiveProducts = document.querySelectorAll(select.all.menuProductsActive);
      //console.log('all active products: ', allActiveProducts);
      /* START LOOP: for each active product */
      for (let activeProduct of allActiveProducts) {
        /* START: if the active product isn't the element of thisProduct */
        if (activeProduct !== thisProduct.element) {
          /* remove class active for the active product */
          activeProduct.classList.remove('active');
          /* END: if the active product isn't the element of thisProduct */
        }
        /* END LOOP: for each active product */
      }
      /* END: click event listener to trigger */
    });
  }
  //[DONE] Add initOrderForm method
  initOrderForm() {
    const thisProduct = this;

    thisProduct.form.addEventListener('submit', function (event) {
      event.preventDefault();
      thisProduct.processOrder();
    });

    for (let input of thisProduct.formInputs) {
      input.addEventListener('change', function () {
        thisProduct.processOrder();
      });
    }

    thisProduct.cartButton.addEventListener('click', function (event) {
      event.preventDefault();
      thisProduct.processOrder();
      thisProduct.addToCart();
    });
  }
  //[IN PROGRESS] Add processOrder method
  processOrder() {
    const thisProduct = this;
    /*[DONE] read all data from the form (using utils.serializeFormToObject) and save it to const formData */
    const formData = utils.serializeFormToObject(thisProduct.form);

    thisProduct.params = {};
    /* set variable price to equal thisProduct.data.price */
    let price = thisProduct.data.price;
    const images = thisProduct.imageWrapper;
    console.log('List of images : ', images);
    /* START LOOP: for each paramId in thisProduct.data.params */
    for (let paramId in thisProduct.data.params) {
      //console.log('Param id :', paramId);
      /* save the element in thisProduct.data.params with key paramId as const param */
      const param = thisProduct.data.params[paramId];
      //console.log('Parameters :', param);
      /* START LOOP: for each optionId in param.options */
      for (let optionId in param.options) {
        /* save the element in param.options with key optionId as const option */
        const option = param.options[optionId];
        //console.log('option :', option);
        /* START IF: if option is selected and option is not default */
        const optionSelected = formData.hasOwnProperty(paramId) && formData[paramId].indexOf(optionId) > -1;
        //console.log('optionSelected', optionSelected);
        if (optionSelected && !option.default) {
          price = price + option.price;
          /* END IF: if option is selected and option is not default */
        }
        /* START ELSE IF: if option is not selected and option is default */
        else if (!optionSelected && option.default) {
          /* deduct price of option from price */
          price = price - option.price;
        }
        const selectedImg = thisProduct.imageWrapper.querySelectorAll(`.${paramId}-${optionId}`);
        if (optionSelected) {
          if (!thisProduct.params[paramId]) {
            thisProduct.params[paramId] = {
              label: param.label,
              options: {},
            };
          }
          for (let img of selectedImg) {
            img.classList.add(classNames.menuProduct.imageVisible);
          }
        } else {
          for (let img of selectedImg) {
            img.classList.remove(classNames.menuProduct.imageVisible);
          }
        }
      }
      /* END LOOP: for each optionId in param.options */
    }
    /* END LOOP: for each paramId in thisProduct.data.params */
    //new
    thisProduct.priceSingle = price;
    thisProduct.price = thisProduct.priceSingle * thisProduct.amountWidget.value;

    /* set the contents of thisProduct.priceElem to be the value of variable price */
    thisProduct.priceElem.innerHTML = thisProduct.price;

    console.log(thisProduct.params);
  }

  initAmountWidget() {
    const thisProduct = this;
    thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);

    thisProduct.amountWidgetElem.addEventListener('updated', function () {
      thisProduct.processOrder();
    });
  }

  addToCart() {
    const thisProduct = this;

    thisProduct.name = thisProduct.data.name;
    thisProduct.amount = thisProduct.amountWidget.value;
    // app.cart.add(thisProduct);

    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: thisProduct,
      },
    });
    thisProduct.element.dispatchEvent(event);
  }
}

export default Product;
