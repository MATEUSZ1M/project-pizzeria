/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  };
  /* [DONE] Add class Product to script.js*/
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
      console.log('new Product: ', thisProduct);
      thisProduct.initAccordion();
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
        console.log('clicked');
        /* toggle active class on element of thisProduct */
        thisProduct.element.classList.toggle('active');
        /* find all active products */
        const allActiveProducts = document.querySelectorAll('article.product.active');
        console.log('all active products: ', allActiveProducts);
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
  }

  // [DONE] Add declaration of metod app.initMenu

  const app = {
    initMenu: function () {
      const thisApp = this;
      console.log('thisApp.data: ', thisApp.data);
      //[DONE] Add loop productData in thisApp.data.products
      for (let productData in thisApp.data.products) {
        new Product(productData, thisApp.data.products[productData]);
      }

      const testProduct = new Product();
      console.log('testProduct: ', testProduct);

    },
    // [DONE Add metod app.initData
    initData: function () {
      const thisApp = this;
      thisApp.data = dataSource;
    },

    init: function () {
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);
      thisApp.initData();// [DONE] Add metod app.initData
      thisApp.initMenu();
    },
  };



  app.init();
}
