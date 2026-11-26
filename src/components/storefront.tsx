"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChefHat,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Leaf,
  Mail,
  Menu,
  Minus,
  Phone,
  Plus,
  Quote,
  ShieldCheck,
  ShoppingBag,
  Snowflake,
  Sparkles,
  Star,
  Truck,
  X,
} from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import {
  advanceOrderHours,
  formatPrice,
  minimumOrderGrams,
  products,
  type Product,
  whatsappNumber,
} from "@/lib/catalog";

type Bag = Record<string, number>;
type Promotion = { title: string; code: string | null; message: string };
type BulkOrderForm = {
  name: string;
  phone: string;
  deliveryDate: string;
  area: string;
  address: string;
  note: string;
};
export type StorefrontPage =
  | "home"
  | "products"
  | "about"
  | "whatsNew"
  | "whyUs"
  | "cuisines";

const cuisineFilters = ["Avadhi"] as const;

const translations = {
  en: {
    navProduct: "Our Product",
    navCuisines: "Cuisines",
    navStory: "About Us",
    navNew: "What's New",
    navWhy: "Why Us",
    navOrderNow: "Order Now",
    account: "My account",
    switchLanguage: "Switch language to Hindi",
    documentTitle: "Mood Food — Quick food for easy life",
    documentDescription: "Small-batch marinades, kebabs and curries for the moments you want really good food, without all the prep.",
    aria: {
      home: "Mood Food home",
      fssaiLicense: "FSSAI State License",
      carousel: "Mood Food highlights",
      carouselRole: "carousel",
      slideRole: "slide",
      slideCount: "{current} of {total}",
      previousBanner: "Previous banner",
      nextBanner: "Next banner",
      chooseBanner: "Choose banner",
      showBanner: "Show banner",
      call: "Call Mood Food on",
      chatWhatsApp: "Chat with Mood Food on WhatsApp",
      instagram: "Mood Food on Instagram",
      facebook: "Mood Food on Facebook",
      openBag: "Open bag",
      closeMenu: "Close menu",
      openMenu: "Open menu",
      featuredDishes: "Featured dishes",
      stars: "5 out of 5 stars",
      closeShoppingBag: "Close shopping bag",
      shoppingBag: "Shopping bag",
      closeBag: "Close bag",
      closeProduct: "Close product details",
      closeSignIn: "Close sign in",
      whatsapp: "WhatsApp",
    },
    promo: {
      defaultLead: "A little more delicious, delivered around Gurugram & Noida",
      orderAtLeast: "Order at least",
      hoursAhead: "hours ahead",
    },
    heroSlides: [
      {
        tag: "Good food. A little less fuss.",
        lineOne: "Your kind of",
        lineTwo: "good food.",
        body: "Small-batch marinades, kebabs and curries for the nights you want something lovely — without starting from scratch.",
        cta: "Find your new favourite",
        href: "#menu",
        image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1400&q=90",
        badge: "Good things, made fresh",
        contain: false,
      },
      {
        tag: "Kebabs",
        lineOne: "Smoky, tender,",
        lineTwo: "kebab nights.",
        body: "Haryali, tikka, shammi and seekh — grill or pan-cook in minutes and bring the tandoor home.",
        cta: "Explore kebabs",
        href: "#menu",
        image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=1400&q=90",
        badge: "Hot, fresh & ready",
        contain: false,
      },
      {
        tag: "Curries",
        lineOne: "Rich curries,",
        lineTwo: "zero stress.",
        body: "Slow-simmered gravies like Mughlai chicken curry — heat, add a naan and dinner is done.",
        cta: "Explore curries",
        href: "#menu",
        image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=1400&q=90",
        badge: "Comfort in a bowl",
        contain: false,
      },
      {
        tag: "Marinades",
        lineOne: "Marinated and",
        lineTwo: "ready to cook.",
        body: "Andhra-style and classic marinades, ready for your pan, oven or grill — all the flavour, none of the prep.",
        cta: "Explore marinades",
        href: "#menu",
        image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1400&q=90",
        badge: "Flavour, locked in",
        contain: false,
      },
      {
        tag: "Order now",
        lineOne: "Hot, fresh &",
        lineTwo: "ready for your mood.",
        body: "Order on the site or message us on WhatsApp at 95998 44475 — at least 1 kg, 48 hours ahead.",
        cta: "Chat on WhatsApp",
        href: "whatsapp",
        image: "/brand/banner-poster.jpeg",
        badge: "@mood.foodworld",
        contain: true,
      },
    ],
    hero: {
      seeHow: "See how it works",
      planning: "A little planning",
      orderAhead: "Order 48 hours ahead",
    },
    featureItems: [
      { number: "01", title: "Small-batch", caption: "Made with intention" },
      { number: "02", title: "Real ingredients", caption: "Flavour comes first" },
      { number: "03", title: "Fresh or frozen", caption: "Good food, your way" },
      { number: "04", title: "Easy ordering", caption: "Right here or WhatsApp" },
    ],
    menu: {
      eyebrow: "Cuisines",
      browse: "Made for a very good meal.",
      description: "Real flavour, proper ingredients, and the sort of dinner that makes everyone ask for seconds.",
      veg: "Veg",
      frozen: "Frozen",
      preview: "Showing the starter menu preview. The live catalogue will appear once the store database is connected.",
      empty: "No dishes in this combination just yet.",
      clearFilters: "Clear filters",
      frozenTag: "Frozen",
      vegetarian: "Vegetarian",
      nonVegetarian: "Non-vegetarian",
      moreAbout: "More about",
      removeOne: "Remove one",
      addOne: "Add one",
      addToBag: "Add to bag:",
      headsUp: "A heads-up before you add to the bag:",
      minimum: "minimum order",
      orderAhead: "please order at least",
      pricesInInr: "Prices shown in INR",
    },
    bulk: {
      eyebrow: "Bulk ordering",
      title: "Let’s plan your bulk order.",
      description: "Share your delivery details and we’ll help arrange your bulk order on WhatsApp.",
      deliveryDetails: "Delivery details",
      name: "Name",
      mobile: "Mobile number",
      deliveryDate: "Delivery date (48 hours ahead)",
      area: "Area",
      gurugram: "Gurugram",
      noida: "Noida",
      address: "Address",
      note: "Additional note (optional)",
      payment: "Payment is by UPI. We’ll share payment details on WhatsApp after confirming your order.",
      imageAlt: "Mood Food kebabs and curries",
      sendRequest: "Send bulk request on WhatsApp",
      followUp: "WhatsApp opens with your delivery details. Share product names and quantities there; we’ll confirm your order with you.",
      dateError: "Please choose a delivery date at least {hours} hours ahead.",
    },
    whatsNew: {
      eyebrow: "Fresh off the kitchen",
      title: "What's new at Mood Food",
      takeALook: "Take a look",
      items: [
        { tag: "Coming soon", title: "Our frozen-ready menu", text: "Cook straight from the freezer. Frozen kebabs and snacks are on their way.", href: "#frozen-menu" },
        { tag: "New", title: "Order right on the site", text: "Build your bag, pick a delivery slot and confirm on WhatsApp in a minute.", href: "#menu" },
        { tag: "Fresh batch", title: "Awadhi shammi & rustic seekh", text: "Soft Lucknowi shammi and juicy chicken seekh, now on the menu.", href: "#menu" },
      ],
    },
    whyUs: {
      eyebrow: "Why Mood Food",
      title: "Good food, without the fuss.",
      description: "Everything we make is built around one idea: a really good dinner should be easy.",
      reasons: [
        { title: "Small-batch cooking", text: "Made in careful batches, so every pack tastes like it was made for you." },
        { title: "Real ingredients", text: "Proper spices, fresh herbs and honest marinades. Flavour comes first." },
        { title: "Delivered to you", text: "We deliver around Gurugram & Noida, right on the day you choose." },
        { title: "Easy and reliable", text: "Order on the site or WhatsApp, pay by UPI and get your invoice." },
      ],
    },
    testimonials: {
      eyebrow: "Kind words",
      title: "Loved at tables around town",
      items: [
        { name: "Priya S.", area: "Gurugram", text: "The Haryali kebab was a hit at our dinner party. Ten minutes on the pan and everyone asked for the recipe!" },
        { name: "Rahul M.", area: "Noida", text: "Ordering on WhatsApp was so easy. The Andhra chicken marinade had real flavour, and nothing tasted like a shortcut." },
        { name: "Ananya K.", area: "Gurugram", text: "Mughlai chicken curry on a busy weeknight is a lifesaver. Heat, add naan, done." },
      ],
    },
    faq: {
      eyebrow: "Questions",
      title: "Frequently asked questions",
      items: [
        ["What is the minimum order?", "Please add at least 1 kg in total. You can mix marinades, kebabs and curries."],
        ["How early should I order?", "Choose a delivery day at least 48 hours ahead so we can prepare your order fresh."],
        ["Where do you deliver?", "We deliver around Gurugram & Noida. Message us on WhatsApp if you're unsure about your area."],
        ["How do I pay?", "No payment is taken on the site. We confirm your order on WhatsApp, you pay by UPI and get your invoice."],
        ["Do you have vegetarian options?", "Yes! Use the Veg filter in the menu to see all vegetarian kebabs, snacks and more."],
        ["How do I cook the food?", "Grill, pan-cook or heat. Each pack is made to be quick and easy."],
      ],
    },
    how: {
      eyebrow: "How it works",
      title: "Three steps to an easy dinner.",
      steps: [
        ["1", "Choose", "Pick marinades, kebabs or curries. Add at least 1 kg in total."],
        ["2", "Schedule", "Choose a delivery day at least 48 hours ahead and send the order on the site or WhatsApp."],
        ["3", "Cook and enjoy", "Grill, pan-cook or heat. Pay by UPI and get your invoice."],
      ],
      cta: "Plan an order with us",
    },
    cuisines: {
      eyebrow: "A little something for every mood",
      title: "Explore our cuisines",
      description: "Discover the regional flavours behind our small-batch menu.",
      exploreProducts: "Explore products",
      items: [
        ["Andhra", "Fiery, tangy and bold.", "#e0793a"],
        ["Lucknowi", "Soft, aromatic Awadhi flavours.", "#d9a62f"],
        ["Mughlai", "Rich, creamy and slow-cooked.", "#c0405a"],
        ["Made with care", "Small batches, real ingredients.", "#712a82"],
      ],
    },
    story: {
      imageAlt: "A home-cooked dinner being prepared",
      logoAlt: "Mood Food brand logo",
      stamp: "Good food\ngood mood",
      eyebrow: "A bit about us",
      title: "We make the good part of dinner",
      emphasized: "easy.",
      paragraphOne: "A familiar craving. A long day. Friends turning up. Mood Food brings thoughtfully prepared marinades, kebabs and curries to the moments that deserve a little extra.",
      paragraphTwo: "Real flavours, handy portions and a menu with both vegetarian and non-vegetarian favourites — ready for your table, on your time.",
    },
    frozen: {
      eyebrow: "Your freezer called",
      title: "Save a little room for a very good plan B.",
      description: "Our frozen-ready menu is getting ready for its moment. Until then, have a peek at what’s on the way.",
      button: "See what’s coming",
      imageAlt: "Mood Food frozen food menu, coming soon",
      comingSoon: "Coming soon",
    },
    cta: {
      eyebrow: "A good dinner is closer than you think",
      title: "Make room for a better dinner.",
      description: "Tell us what you’re in the mood for. We’ll take it from there.",
      button: "Chat with us",
    },
    footer: {
      description: "Quick food for easy life. Made with care, to bring a little more joy to the table.",
      chips: ["Pay by UPI", "Min. 1 kg", "48 hrs ahead"],
      explore: "Explore",
      menu: "Our menu",
      sayHello: "Say hello",
      frozenMenu: "Frozen menu (soon)",
      whatsappUs: "WhatsApp us",
      deliveryArea: "Delivering around Gurugram & Noida",
      copyright: "© Mood Food. Made for good moods and good meals.",
    },
    bag: {
      title: "Your bag",
      item: "item",
      items: "items",
      emptyTitle: "A little space for something lovely.",
      emptyDescription: "Your bag is empty for now.",
      exploreMenu: "Explore the menu",
      subtotal: "Subtotal",
      minimumReached: "Minimum order reached",
      moreToMinimum: "{kg} kg more to reach the 1 kg minimum",
      close: "Close",
    },
    checkout: {
      deliveryPrompt: "Where should we bring it?",
      name: "Your name",
      namePlaceholder: "Name for the order",
      mobile: "Mobile number",
      mobilePlaceholder: "10-digit mobile number",
      address: "Delivery address",
      addressPlaceholder: "House, street, area, city and postcode",
      deliveryTime: "Preferred delivery time",
      anythingElse: "Anything else?",
      optional: "(optional)",
      notePlaceholder: "A delivery note or request",
      saving: "Saving your order…",
      placeOrder: "Place order & continue on WhatsApp",
      confirmation: "We’ll confirm availability and UPI payment details in WhatsApp. No payment is taken here.",
      addDeliveryDetails: "Add delivery details",
      advanceNotice: "Orders need at least {hours} hours’ notice. We’ll confirm your delivery slot in chat.",
      error: "We couldn't save your order. Please try WhatsApp or contact Mood Food.",
      errorTryAgain: "We couldn't save your order. Please try again or contact Mood Food on WhatsApp.",
    },
    productDetails: {
      foodType: "Food type:",
      vegetarian: "Vegetarian",
      nonVegetarian: "Non-vegetarian",
      storage: "Storage:",
      keepFrozen: "Keep frozen",
      fresh: "Fresh",
      pack: "Pack:",
      ingredients: "Ingredients:",
      nutrition: "Nutrition per pack:",
      calories: "kcal",
      protein: "g protein",
      carbohydrates: "g carbohydrates",
      fat: "g fat",
      nutritionNote: "Nutrition values are being confirmed for product packaging. Please ask us about dietary requirements before ordering.",
      addToBag: "Add to bag",
    },
    accountDialog: {
      signedIn: "You’re signed in.",
      signedInAs: "Signed in as",
      continue: "Continue",
      welcome: "Welcome back.",
      enterCode: "Enter the 4-digit code for +91 {phone}.",
      signInDescription: "Enter your mobile number and we’ll send you a one-time sign-in code.",
      mobile: "Mobile number",
      mobilePlaceholder: "10-digit mobile number",
      sending: "Sending…",
      sendCode: "Send sign-in code",
      codeAgreement: "By continuing, you agree to receive a one-time verification code.",
      codeLabel: "4-digit code",
      verifying: "Verifying…",
      verify: "Verify & sign in",
      changeNumber: "Change number",
      resendCode: "Resend code",
      checkPhone: "Check your phone for the sign-in code.",
      sendError: "We couldn't send a code. Please try WhatsApp instead.",
      connectionError: "We couldn't reach the sign-in service. Please try WhatsApp instead.",
      signedInMessage: "You're signed in.",
      invalidCode: "That code isn't correct. Please try again.",
      verifyError: "We couldn't verify the code. Please try again.",
    },
    whatsapp: {
      hello: "Hello Mood Food!",
      placeOrder: "Hi Mood Food, I would like to place an order.",
      heroOrder: "Hello Mood Food! I'd like to place an order.",
      planOrder: "Hi Mood Food! I'd like some help planning an order.",
      footerOrder: "Hello Mood Food! I'd love to know what's on the menu.",
      bulkIntro: "Hi Mood Food, I’d like to enquire about a bulk order.",
      requestedDate: "Requested delivery date",
      deliveryTime: "Delivery time",
      confirmTime: "Please confirm with Mood Food",
      area: "Area",
      name: "Name",
      phone: "Phone",
      address: "Address",
      note: "Note",
      bulkFollowUp: "I’ll share the products and quantities in this chat. Please confirm availability and share UPI payment details.",
      orderIntro: "Hello Mood Food! I just placed order",
      total: "Total",
      requestedDelivery: "Requested delivery",
      confirmOrder: "Please confirm the order and share UPI payment details.",
    },
    apiMessages: {
      "Invalid request.": "Invalid request.",
      "Mobile OTP delivery is not configured yet. Please contact us on WhatsApp to place an order.": "Mobile OTP delivery is not configured yet. Please contact us on WhatsApp to place an order.",
      "Please enter a valid 10-digit mobile number.": "Please enter a valid 10-digit mobile number.",
      "Enter your mobile number and the 4-digit code.": "Enter your mobile number and the 4-digit code.",
      "This code has expired. Please request a new one.": "This code has expired. Please request a new one.",
      "Sign-in is not configured yet. Please use WhatsApp.": "Sign-in is not configured yet. Please use WhatsApp.",
      "That code isn't correct or has expired.": "That code isn't correct or has expired.",
      "We couldn't complete sign-in. Please try again.": "We couldn't complete sign-in. Please try again.",
      "Check your name, mobile number, address, delivery time, and items.": "Check your name, mobile number, address, delivery time, and items.",
      "Please choose a delivery time at least 48 hours from now.": "Please choose a delivery time at least 48 hours from now.",
      "One or more selected products are no longer available. Please refresh the menu.": "One or more selected products are no longer available. Please refresh the menu.",
      "The minimum order is 1 kg. Please add more to your bag.": "The minimum order is 1 kg. Please add more to your bag.",
      "We couldn't save your order. Please try WhatsApp or contact Mood Food.": "We couldn't save your order. Please try WhatsApp or contact Mood Food.",
    },
  },
  hi: {
    navProduct: "हमारे उत्पाद",
    navCuisines: "व्यंजन",
    navStory: "हमारे बारे में",
    navNew: "नया क्या है",
    navWhy: "हमें क्यों चुनें",
    navOrderNow: "अभी ऑर्डर करें",
    account: "मेरा अकाउंट",
    switchLanguage: "भाषा बदलकर अंग्रेज़ी करें",
    documentTitle: "मूड फूड — आसान ज़िंदगी के लिए झटपट खाना",
    documentDescription: "छोटे बैच में बने मैरिनेड, कबाब और करी — बिना ज्यादा तैयारी के स्वादिष्ट खाने के लिए।",
    aria: {
      home: "मूड फूड होम",
      fssaiLicense: "FSSAI राज्य लाइसेंस",
      carousel: "मूड फूड की खास पेशकश",
      carouselRole: "कैराउज़ल",
      slideRole: "स्लाइड",
      slideCount: "{total} में से {current}",
      previousBanner: "पिछला बैनर",
      nextBanner: "अगला बैनर",
      chooseBanner: "बैनर चुनें",
      showBanner: "बैनर दिखाएं",
      call: "मूड फूड को कॉल करें",
      chatWhatsApp: "मूड फूड से WhatsApp पर बात करें",
      instagram: "Instagram पर मूड फूड",
      facebook: "Facebook पर मूड फूड",
      openBag: "बैग खोलें",
      closeMenu: "मेन्यू बंद करें",
      openMenu: "मेन्यू खोलें",
      featuredDishes: "खास व्यंजन",
      stars: "5 में से 5 सितारे",
      closeShoppingBag: "शॉपिंग बैग बंद करें",
      shoppingBag: "शॉपिंग बैग",
      closeBag: "बैग बंद करें",
      closeProduct: "उत्पाद की जानकारी बंद करें",
      closeSignIn: "साइन इन बंद करें",
      whatsapp: "WhatsApp",
    },
    promo: {
      defaultLead: "गुरुग्राम और नोएडा में आपके लिए स्वादिष्ट खाना",
      orderAtLeast: "कम से कम ऑर्डर करें",
      hoursAhead: "घंटे पहले",
    },
    heroSlides: [
      {
        tag: "अच्छा खाना। थोड़ी कम मेहनत।",
        lineOne: "आपके अंदाज़ का",
        lineTwo: "स्वादिष्ट खाना।",
        body: "छोटे बैच में बने मैरिनेड, कबाब और करी — उन शामों के लिए जब कुछ खास खाने का मन हो, बिना शुरुआत से पकाए।",
        cta: "अपना नया पसंदीदा चुनें",
        href: "#menu",
        image: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1400&q=90",
        badge: "ताज़ा बना, दिल से",
        contain: false,
      },
      {
        tag: "कबाब",
        lineOne: "धुएँदार, नरम,",
        lineTwo: "कबाब वाली शाम।",
        body: "हरियाली, टिक्का, शामी और सीख — मिनटों में ग्रिल या पैन में पकाएं और घर लाएं तंदूरी स्वाद।",
        cta: "कबाब देखें",
        href: "#menu",
        image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=1400&q=90",
        badge: "गरम, ताज़ा और तैयार",
        contain: false,
      },
      {
        tag: "करी",
        lineOne: "भरपूर स्वाद वाली करी,",
        lineTwo: "बिना झंझट।",
        body: "मुग़लई चिकन करी जैसी धीमी आंच पर पकी ग्रेवी — गरम करें, नान जोड़ें और खाना तैयार।",
        cta: "करी देखें",
        href: "#menu",
        image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=1400&q=90",
        badge: "हर कटोरी में सुकून",
        contain: false,
      },
      {
        tag: "मैरिनेड",
        lineOne: "मैरिनेटेड और",
        lineTwo: "पकाने के लिए तैयार।",
        body: "आंध्रा अंदाज़ और क्लासिक मैरिनेड — पैन, ओवन या ग्रिल में पकाएं; स्वाद पूरा, तैयारी कम।",
        cta: "मैरिनेड देखें",
        href: "#menu",
        image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1400&q=90",
        badge: "स्वाद हर निवाले में",
        contain: false,
      },
      {
        tag: "अभी ऑर्डर करें",
        lineOne: "गरम, ताज़ा और",
        lineTwo: "आपके मूड के लिए।",
        body: "वेबसाइट पर ऑर्डर करें या WhatsApp पर संदेश भेजें: 95998 44475 — कम से कम 1 किलो, 48 घंटे पहले।",
        cta: "WhatsApp पर बात करें",
        href: "whatsapp",
        image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=1400&q=90",
        badge: "@mood.foodworld",
        contain: false,
      },
    ],
    hero: {
      seeHow: "जानें, ऑर्डर कैसे करें",
      planning: "थोड़ी पहले से तैयारी",
      orderAhead: "48 घंटे पहले ऑर्डर करें",
    },
    featureItems: [
      { number: "01", title: "छोटे बैच में तैयार", caption: "पूरे ध्यान से बनाया" },
      { number: "02", title: "असली सामग्री", caption: "स्वाद सबसे पहले" },
      { number: "03", title: "ताज़ा या फ्रोजन", caption: "जैसा आपको पसंद" },
      { number: "04", title: "आसान ऑर्डर", caption: "यहीं या WhatsApp पर" },
    ],
    menu: {
      eyebrow: "व्यंजन",
      browse: "बेहतरीन खाने के लिए तैयार।",
      description: "असली स्वाद, सही सामग्री और ऐसा खाना जिसे सब दोबारा मांगें।",
      veg: "शाकाहारी",
      frozen: "फ्रोजन",
      preview: "शुरुआती मेन्यू दिखाया जा रहा है। स्टोर का डेटाबेस जुड़ने पर पूरा मेन्यू दिखाई देगा।",
      empty: "इस चयन में अभी कोई व्यंजन नहीं है।",
      clearFilters: "फ़िल्टर हटाएं",
      frozenTag: "फ्रोजन",
      vegetarian: "शाकाहारी",
      nonVegetarian: "मांसाहारी",
      moreAbout: "और जानें:",
      removeOne: "एक हटाएं:",
      addOne: "एक जोड़ें:",
      addToBag: "बैग में जोड़ें:",
      headsUp: "बैग में जोड़ने से पहले ध्यान दें:",
      minimum: "कम से कम ऑर्डर",
      orderAhead: "कृपया कम से कम",
      pricesInInr: "कीमतें भारतीय रुपये में",
    },
    bulk: {
      eyebrow: "थोक ऑर्डर",
      title: "आइए, आपका बड़ा ऑर्डर तय करें।",
      description: "डिलीवरी की जानकारी भेजें; हम WhatsApp पर आपका बड़ा ऑर्डर तय करने में मदद करेंगे।",
      deliveryDetails: "डिलीवरी की जानकारी",
      name: "नाम",
      mobile: "मोबाइल नंबर",
      deliveryDate: "डिलीवरी की तारीख (कम से कम 48 घंटे बाद)",
      area: "इलाका",
      gurugram: "गुरुग्राम",
      noida: "नोएडा",
      address: "पता",
      note: "अतिरिक्त जानकारी (वैकल्पिक)",
      payment: "भुगतान UPI से होगा। ऑर्डर की पुष्टि के बाद WhatsApp पर भुगतान की जानकारी भेजेंगे।",
      imageAlt: "मूड फूड के कबाब और करी",
      sendRequest: "WhatsApp पर थोक ऑर्डर भेजें",
      followUp: "WhatsApp पर डिलीवरी की जानकारी खुलेगी। वहीं उत्पादों के नाम और मात्रा भेजें; हम ऑर्डर की पुष्टि करेंगे।",
      dateError: "कृपया डिलीवरी की तारीख कम से कम {hours} घंटे बाद चुनें।",
    },
    whatsNew: {
      eyebrow: "रसोई से ताज़ा खबर",
      title: "मूड फूड में नया क्या है",
      takeALook: "देखें",
      items: [
        { tag: "जल्द आ रहा है", title: "हमारा फ्रोजन मेन्यू", text: "फ्रीज़र से निकालकर सीधे पकाएं। फ्रोजन कबाब और स्नैक्स जल्द आ रहे हैं।", href: "#frozen-menu" },
        { tag: "नया", title: "सीधे वेबसाइट पर ऑर्डर करें", text: "बैग में उत्पाद जोड़ें, डिलीवरी का समय चुनें और WhatsApp पर एक मिनट में पुष्टि करें।", href: "#menu" },
        { tag: "ताज़ा बैच", title: "अवधी शामी और देसी सीख", text: "नरम लखनवी शामी और रसीली चिकन सीख — अब मेन्यू में।", href: "#menu" },
      ],
    },
    whyUs: {
      eyebrow: "मूड फूड क्यों",
      title: "बिना झंझट, स्वादिष्ट खाना।",
      description: "हमारी हर चीज़ एक सोच से बनती है: अच्छा डिनर आसान होना चाहिए।",
      reasons: [
        { title: "छोटे बैच में पकाया", text: "ध्यान से छोटे बैच में बनाया, ताकि हर पैक का स्वाद आपके लिए खास हो।" },
        { title: "असली सामग्री", text: "सही मसाले, ताज़ी जड़ी-बूटियां और बढ़िया मैरिनेड। स्वाद सबसे पहले।" },
        { title: "आपके घर तक डिलीवरी", text: "आपकी चुनी तारीख पर गुरुग्राम और नोएडा में डिलीवरी।" },
        { title: "आसान और भरोसेमंद", text: "वेबसाइट या WhatsApp पर ऑर्डर करें, UPI से भुगतान करें और बिल पाएं।" },
      ],
    },
    testimonials: {
      eyebrow: "दिल से मिली तारीफ",
      title: "शहर के खाने की मेज़ों पर पसंदीदा",
      items: [
        { name: "Priya S.", area: "गुरुग्राम", text: "हमारी डिनर पार्टी में हरियाली कबाब सबको बहुत पसंद आया। पैन में दस मिनट और सभी ने रेसिपी पूछी!" },
        { name: "Rahul M.", area: "नोएडा", text: "WhatsApp पर ऑर्डर करना बहुत आसान था। आंध्रा चिकन मैरिनेड का स्वाद बढ़िया था, कुछ भी जल्दबाज़ी में बना नहीं लगा।" },
        { name: "Ananya K.", area: "गुरुग्राम", text: "व्यस्त शाम में मुग़लई चिकन करी बहुत काम आई। गरम करें, नान लें, खाना तैयार।" },
      ],
    },
    faq: {
      eyebrow: "सवाल",
      title: "अक्सर पूछे जाने वाले सवाल",
      items: [
        ["कम से कम कितना ऑर्डर करना होगा?", "कुल मिलाकर कम से कम 1 किलो जोड़ें। मैरिनेड, कबाब और करी मिलाकर ले सकते हैं।"],
        ["कितने समय पहले ऑर्डर करना चाहिए?", "ताज़ा तैयारी के लिए डिलीवरी की तारीख कम से कम 48 घंटे बाद चुनें।"],
        ["आप कहां डिलीवरी करते हैं?", "हम गुरुग्राम और नोएडा में डिलीवरी करते हैं। अपना इलाका जानने के लिए WhatsApp पर पूछें।"],
        ["भुगतान कैसे करना है?", "वेबसाइट पर भुगतान नहीं लिया जाता। WhatsApp पर ऑर्डर की पुष्टि के बाद UPI से भुगतान करें और बिल पाएं।"],
        ["क्या शाकाहारी विकल्प हैं?", "हां! मेन्यू में शाकाहारी फ़िल्टर चुनकर कबाब, स्नैक्स और दूसरे विकल्प देखें।"],
        ["खाना कैसे पकाएं?", "ग्रिल करें, पैन में पकाएं या गरम करें। हर पैक जल्दी और आसानी से तैयार होता है।"],
      ],
    },
    how: {
      eyebrow: "ऑर्डर करने का तरीका",
      title: "आसान डिनर के लिए तीन कदम।",
      steps: [
        ["1", "चुनें", "मैरिनेड, कबाब या करी चुनें। कुल मिलाकर कम से कम 1 किलो जोड़ें।"],
        ["2", "डिलीवरी तय करें", "कम से कम 48 घंटे बाद की तारीख चुनें और वेबसाइट या WhatsApp पर ऑर्डर भेजें।"],
        ["3", "पकाएं और मज़े से खाएं", "ग्रिल करें, पैन में पकाएं या गरम करें। UPI से भुगतान करें और बिल पाएं।"],
      ],
      cta: "हमारे साथ ऑर्डर तय करें",
    },
    cuisines: {
      eyebrow: "हर मूड के लिए कुछ खास",
      title: "हमारे व्यंजनों की खासियत जानें",
      description: "हमारे छोटे बैच के मेन्यू में शामिल क्षेत्रीय स्वादों को जानें।",
      exploreProducts: "उत्पाद देखें",
      items: [
        ["आंध्रा", "तीखा, खट्टा और भरपूर स्वाद।", "#e0793a"],
        ["लखनवी", "नरम और खुशबूदार अवधी स्वाद।", "#d9a62f"],
        ["मुग़लई", "भरपूर, मलाईदार और धीमी आंच पर पका।", "#c0405a"],
        ["सलीके से बना", "छोटे बैच, असली सामग्री।", "#712a82"],
      ],
    },
    story: {
      imageAlt: "घर का खाना तैयार होता हुआ",
      logoAlt: "मूड फूड का लोगो",
      stamp: "अच्छा खाना\nअच्छा मूड",
      eyebrow: "हमारे बारे में",
      title: "डिनर का अच्छा हिस्सा हम",
      emphasized: "आसान बनाते हैं।",
      paragraphOne: "जानी-पहचानी भूख, लंबा दिन या दोस्तों का आना — मूड फूड खास पलों के लिए सोच-समझकर तैयार मैरिनेड, कबाब और करी लाता है।",
      paragraphTwo: "असली स्वाद, काम की मात्रा और शाकाहारी व मांसाहारी पसंदीदा व्यंजन — आपके समय पर, आपकी मेज़ के लिए।",
    },
    frozen: {
      eyebrow: "आपके फ्रीज़र का संदेश",
      title: "एक बढ़िया दूसरे विकल्प के लिए थोड़ी जगह रखें।",
      description: "हमारा फ्रोजन मेन्यू आने की तैयारी में है। तब तक देखें कि क्या-क्या आने वाला है।",
      button: "आने वाले व्यंजन देखें",
      imageAlt: "मूड फूड का फ्रोजन फूड मेन्यू, जल्द आ रहा है",
      comingSoon: "जल्द आ रहा है",
    },
    cta: {
      eyebrow: "अच्छा डिनर, बस कुछ ही दूर",
      title: "बेहतर डिनर के लिए जगह बनाएं।",
      description: "बताएं, आज क्या खाने का मन है। आगे हम संभाल लेंगे।",
      button: "हमसे बात करें",
    },
    footer: {
      description: "आसान ज़िंदगी के लिए झटपट खाना। प्यार से बनाया, ताकि खाने की मेज़ पर थोड़ी और खुशी आए।",
      chips: ["UPI से भुगतान", "कम से कम 1 किलो", "48 घंटे पहले"],
      explore: "देखें",
      menu: "हमारा मेन्यू",
      sayHello: "संपर्क करें",
      frozenMenu: "फ्रोजन मेन्यू (जल्द)",
      whatsappUs: "WhatsApp पर बात करें",
      deliveryArea: "गुरुग्राम और नोएडा में डिलीवरी",
      copyright: "© मूड फूड। अच्छे मूड और स्वादिष्ट खाने के लिए।",
    },
    bag: {
      title: "आपका बैग",
      item: "आइटम",
      items: "आइटम",
      emptyTitle: "कुछ स्वादिष्ट चीज़ के लिए जगह खाली है।",
      emptyDescription: "अभी आपका बैग खाली है।",
      exploreMenu: "मेन्यू देखें",
      subtotal: "कुल राशि",
      minimumReached: "कम से कम ऑर्डर पूरा हुआ",
      moreToMinimum: "1 किलो पूरा करने के लिए {kg} किलो और जोड़ें",
      close: "बंद करें",
    },
    checkout: {
      deliveryPrompt: "डिलीवरी कहां करनी है?",
      name: "आपका नाम",
      namePlaceholder: "ऑर्डर के लिए नाम",
      mobile: "मोबाइल नंबर",
      mobilePlaceholder: "10 अंकों का मोबाइल नंबर",
      address: "डिलीवरी का पता",
      addressPlaceholder: "मकान, सड़क, इलाका, शहर और पिनकोड",
      deliveryTime: "डिलीवरी का पसंदीदा समय",
      anythingElse: "कुछ और बताना है?",
      optional: "(वैकल्पिक)",
      notePlaceholder: "डिलीवरी से जुड़ी जानकारी या अनुरोध",
      saving: "आपका ऑर्डर सेव हो रहा है…",
      placeOrder: "ऑर्डर करें और WhatsApp पर जारी रखें",
      confirmation: "WhatsApp पर उपलब्धता और UPI भुगतान की पुष्टि करेंगे। यहां कोई भुगतान नहीं लिया जाता।",
      addDeliveryDetails: "डिलीवरी की जानकारी भरें",
      advanceNotice: "ऑर्डर के लिए कम से कम {hours} घंटे पहले बताएं। चैट में डिलीवरी का समय तय करेंगे।",
      error: "ऑर्डर सेव नहीं हो सका। कृपया WhatsApp से कोशिश करें या मूड फूड से संपर्क करें।",
      errorTryAgain: "ऑर्डर सेव नहीं हो सका। फिर से कोशिश करें या WhatsApp पर मूड फूड से संपर्क करें।",
    },
    productDetails: {
      foodType: "खाने का प्रकार:",
      vegetarian: "शाकाहारी",
      nonVegetarian: "मांसाहारी",
      storage: "रखने का तरीका:",
      keepFrozen: "फ्रोजन रखें",
      fresh: "ताज़ा",
      pack: "पैक:",
      ingredients: "सामग्री:",
      nutrition: "हर पैक में पोषण:",
      calories: "किलो कैलोरी",
      protein: "ग्राम प्रोटीन",
      carbohydrates: "ग्राम कार्बोहाइड्रेट",
      fat: "ग्राम वसा",
      nutritionNote: "पैक पर दी जाने वाली पोषण जानकारी की पुष्टि की जा रही है। खाने से जुड़ी जरूरतों के लिए ऑर्डर से पहले पूछें।",
      addToBag: "बैग में जोड़ें",
    },
    accountDialog: {
      signedIn: "आप साइन इन हैं।",
      signedInAs: "इस नंबर से साइन इन हैं:",
      continue: "जारी रखें",
      welcome: "वापस स्वागत है।",
      enterCode: "+91 {phone} पर भेजा गया 4 अंकों का कोड डालें।",
      signInDescription: "अपना मोबाइल नंबर डालें; हम एक बार इस्तेमाल होने वाला साइन-इन कोड भेजेंगे।",
      mobile: "मोबाइल नंबर",
      mobilePlaceholder: "10 अंकों का मोबाइल नंबर",
      sending: "भेजा जा रहा है…",
      sendCode: "साइन-इन कोड भेजें",
      codeAgreement: "जारी रखने पर आप एक बार इस्तेमाल होने वाला सत्यापन कोड पाने के लिए सहमत हैं।",
      codeLabel: "4 अंकों का कोड",
      verifying: "जांच हो रही है…",
      verify: "सत्यापित करें और साइन इन करें",
      changeNumber: "नंबर बदलें",
      resendCode: "कोड फिर भेजें",
      checkPhone: "साइन-इन कोड के लिए अपना फोन देखें।",
      sendError: "कोड नहीं भेज सके। कृपया WhatsApp पर संपर्क करें।",
      connectionError: "साइन-इन सेवा से संपर्क नहीं हो सका। कृपया WhatsApp पर संपर्क करें।",
      signedInMessage: "आप साइन इन हैं।",
      invalidCode: "यह कोड सही नहीं है। कृपया फिर कोशिश करें।",
      verifyError: "कोड सत्यापित नहीं हो सका। कृपया फिर कोशिश करें।",
    },
    whatsapp: {
      hello: "नमस्ते मूड फूड!",
      placeOrder: "नमस्ते मूड फूड, मैं ऑर्डर करना चाहता/चाहती हूं।",
      heroOrder: "नमस्ते मूड फूड! मैं ऑर्डर करना चाहता/चाहती हूं।",
      planOrder: "नमस्ते मूड फूड! ऑर्डर तय करने में मेरी मदद करें।",
      footerOrder: "नमस्ते मूड फूड! कृपया मेन्यू की जानकारी दें।",
      bulkIntro: "नमस्ते मूड फूड, मुझे बड़ा ऑर्डर करना है।",
      requestedDate: "डिलीवरी की चुनी तारीख",
      deliveryTime: "डिलीवरी का समय",
      confirmTime: "मूड फूड से समय की पुष्टि करें",
      area: "इलाका",
      name: "नाम",
      phone: "फोन",
      address: "पता",
      note: "नोट",
      bulkFollowUp: "मैं इसी चैट में उत्पादों के नाम और मात्रा भेजूंगा/भेजूंगी। कृपया उपलब्धता की पुष्टि करें और UPI भुगतान की जानकारी दें।",
      orderIntro: "नमस्ते मूड फूड! मैंने अभी ऑर्डर दिया है",
      total: "कुल",
      requestedDelivery: "डिलीवरी का अनुरोधित समय",
      confirmOrder: "कृपया ऑर्डर की पुष्टि करें और UPI भुगतान की जानकारी भेजें।",
    },
    apiMessages: {
      "Invalid request.": "अनुरोध मान्य नहीं है।",
      "Mobile OTP delivery is not configured yet. Please contact us on WhatsApp to place an order.": "मोबाइल पर OTP भेजने की सुविधा अभी चालू नहीं है। ऑर्डर के लिए WhatsApp पर संपर्क करें।",
      "Please enter a valid 10-digit mobile number.": "कृपया 10 अंकों का सही मोबाइल नंबर डालें।",
      "Enter your mobile number and the 4-digit code.": "अपना मोबाइल नंबर और 4 अंकों का कोड डालें।",
      "This code has expired. Please request a new one.": "इस कोड की समय-सीमा खत्म हो गई है। नया कोड मंगाएं।",
      "Sign-in is not configured yet. Please use WhatsApp.": "साइन-इन सुविधा अभी चालू नहीं है। कृपया WhatsApp पर संपर्क करें।",
      "That code isn't correct or has expired.": "यह कोड गलत है या इसकी समय-सीमा खत्म हो गई है।",
      "We couldn't complete sign-in. Please try again.": "साइन-इन पूरा नहीं हो सका। कृपया फिर कोशिश करें।",
      "Check your name, mobile number, address, delivery time, and items.": "अपना नाम, मोबाइल नंबर, पता, डिलीवरी का समय और उत्पाद जांचें।",
      "Please choose a delivery time at least 48 hours from now.": "कृपया अभी से कम से कम 48 घंटे बाद का डिलीवरी समय चुनें।",
      "One or more selected products are no longer available. Please refresh the menu.": "चुना हुआ एक या अधिक उत्पाद अब उपलब्ध नहीं है। कृपया मेन्यू फिर से खोलें।",
      "The minimum order is 1 kg. Please add more to your bag.": "कम से कम 1 किलो का ऑर्डर जरूरी है। कृपया बैग में और जोड़ें।",
      "We couldn't save your order. Please try WhatsApp or contact Mood Food.": "ऑर्डर सेव नहीं हो सका। कृपया WhatsApp से कोशिश करें या मूड फूड से संपर्क करें।",
    },
  },
} as const;

type Language = keyof typeof translations;
type SiteTranslation = (typeof translations)[Language];
const LANGUAGE_STORAGE_KEY = "moodfood-language";
const LANGUAGE_CHANGE_EVENT = "moodfood-language-change";

const productTranslations: Partial<
  Record<
    string,
    {
      name: string;
      category: string;
      cuisine: string;
      description: string;
      badge?: string;
    }
  >
> = {
  "haryali-kebab": {
    name: "हरियाली कबाब",
    category: "कबाब",
    cuisine: "खास व्यंजन",
    description: "जड़ी-बूटियों का स्वाद, हल्का धुआँदारपन और भरपूर हरियाली।",
    badge: "सबसे पसंदीदा",
  },
  "chicken-tikka-chapata": {
    name: "चिकन टिक्का चपाता",
    category: "कबाब",
    cuisine: "मुग़लई",
    description: "धुएँदार, नरम चिकन टिक्का — असली तंदूरी स्वाद के साथ।",
    badge: "ग्राहकों की पसंद",
  },
  "awadhi-shammi": {
    name: "अवधी शामी मटन",
    category: "कबाब",
    cuisine: "लखनवी",
    description: "लखनवी अंदाज़ का क्लासिक कबाब — अंदर से नरम और स्वाद से भरपूर।",
    badge: "फ्रीज़र की पसंद",
  },
  "mini-veg-cutlets": {
    name: "मिनी वेज कटलेट",
    category: "स्नैक्स",
    cuisine: "खास व्यंजन",
    description: "कुरकुरे, छोटे कटलेट — साथ मिलकर खाने के लिए (या अकेले भी)।",
  },
  "andhra-chicken-marinade": {
    name: "आंध्रा चिकन मैरिनेड",
    category: "मैरिनेड",
    cuisine: "आंध्रा",
    description: "आंध्रा के खास स्वाद वाला तीखा और मसालेदार मैरिनेड।",
  },
  "mughlai-chicken-curry": {
    name: "मुग़लई चिकन करी",
    category: "करी",
    cuisine: "मुग़लई",
    description: "धीमी आंच पर पकी आरामदायक करी, परिवार के डिनर के लिए।",
  },
  "bhutta-kebab": {
    name: "भुट्टा कबाब",
    category: "कबाब",
    cuisine: "खास व्यंजन",
    description: "मकई की मिठास, गरम मसाले और सुनहरा, मज़ेदार स्वाद।",
  },
  "rustic-chicken-seekh": {
    name: "देसी चिकन सीख",
    category: "कबाब",
    cuisine: "खास व्यंजन",
    description: "देसी अंदाज़ के सीख कबाब — पैन या ग्रिल में जल्दी तैयार।",
  },
};

function localizeProduct(product: Product, language: Language): Product {
  if (language === "en") return product;
  const starterProduct = products.find((candidate) => candidate.id === product.id);
  const translated =
    starterProduct?.name === product.name &&
    starterProduct.description === product.description
      ? productTranslations[product.id]
      : undefined;
  return {
    ...product,
    category: translated?.category ?? localizeProductText(product.category, language),
    cuisine: translated?.cuisine ?? localizeProductText(product.cuisine, language),
    badge: translated?.badge ?? (product.badge ? localizeProductText(product.badge, language) : undefined),
    ...translated,
  };
}

function localizeProductText(value: string, language: Language) {
  if (language === "en") return value;
  const translationsByLabel: Record<string, string> = {
    Kebabs: "कबाब",
    Avadhi: "अवधी",
    Marinades: "मैरिनेड",
    Curries: "करी",
    Snacks: "स्नैक्स",
    Andhra: "आंध्रा",
    Lucknowi: "लखनवी",
    Mughlai: "मुग़लई",
    "House special": "खास व्यंजन",
    Bestseller: "सबसे पसंदीदा",
    "Customer favourite": "ग्राहकों की पसंद",
    "Freezer favourite": "फ्रीज़र की पसंद",
  };
  return translationsByLabel[value] ?? value;
}

function localizeServerMessage(message: string, language: Language) {
  if (language === "en") return message;
  const demoModeMatch = message.match(
    /^Demo mode: your sign-in code is (\d{4})\. It is valid for 5 minutes\.$/,
  );
  if (demoModeMatch) {
    return `डेमो मोड: आपका साइन-इन कोड ${demoModeMatch[1]} है। यह 5 मिनट तक मान्य है।`;
  }
  const translated =
    translations.hi.apiMessages[
      message as keyof typeof translations.hi.apiMessages
    ];
  return translated ?? message;
}

function getStoredLanguage(): Language {
  return window.localStorage.getItem(LANGUAGE_STORAGE_KEY) === "hi" ? "hi" : "en";
}

function subscribeToLanguage(onChange: () => void) {
  window.addEventListener(LANGUAGE_CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(LANGUAGE_CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

const contact = {
  phoneDisplay: "+91 95999 44745",
  phoneHref: "tel:+919599944745",
  instagram: "https://www.instagram.com/mood.foodworld",
  // TODO: replace with the real Mood Food Facebook page link
  facebook: "https://www.facebook.com/",
} as const;

function WhatsAppIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2a9.9 9.9 0 0 0-8.5 14.95L2 22l5.2-1.5A9.94 9.94 0 1 0 12.04 2Zm0 18.1a8.1 8.1 0 0 1-4.13-1.13l-.3-.18-3.08.89.9-3-.2-.31a8.12 8.12 0 1 1 6.81 3.73Zm4.45-6.07c-.24-.12-1.44-.71-1.66-.79-.22-.08-.39-.12-.55.12-.16.24-.63.79-.77.95-.14.16-.28.18-.52.06a6.6 6.6 0 0 1-1.95-1.2 7.3 7.3 0 0 1-1.35-1.69c-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.55-1.32-.75-1.8-.2-.47-.4-.41-.55-.42h-.47c-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.69 2.58 4.1 3.62.57.25 1.02.4 1.37.51.58.18 1.1.16 1.51.1.46-.07 1.44-.59 1.64-1.16.2-.57.2-1.06.14-1.16-.06-.1-.22-.16-.46-.28Z" />
    </svg>
  );
}

function InstagramIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M13.5 22v-8.2h2.8l.5-3.3h-3.3V8.4c0-.95.4-1.7 1.8-1.7h1.6V3.8c-.3 0-1.3-.1-2.4-.1-2.5 0-4.1 1.5-4.1 4.2v2.6H7.6v3.3h2.8V22h3.1Z" />
    </svg>
  );
}

function whatsAppUrl(message: string) {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
}

function minimumDeliveryDateTimeLocal() {
  const date = new Date(Date.now() + advanceOrderHours * 60 * 60 * 1000);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

/** Sets the --d CSS variable used for animation / transition delays. */
const d = (ms: number) => ({ "--d": `${ms}ms` }) as React.CSSProperties;

/** Reveals children with a one-time GSAP scroll animation. */
function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("is-visible");
      return () => el.classList.remove("is-visible");
    }
    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      gsap.fromTo(
        el,
        { autoAlpha: 0, y: 32 },
        {
          autoAlpha: 1,
          y: 0,
          delay: delay / 1000,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            once: true,
            onEnter: () => el.classList.add("is-visible"),
          },
        },
      );
    }, el);
    return () => {
      context.revert();
      el.classList.remove("is-visible");
    };
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`reveal ${className}`}
    >
      {children}
    </div>
  );
}

/** Thin gold bar at the very top that fills as the page scrolls. */
function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      gsap.fromTo(
        el,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            trigger: document.documentElement,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.25,
            invalidateOnRefresh: true,
          },
        },
      );
    }, el);
    return () => context.revert();
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[45] h-[3px]" aria-hidden="true">
      <div ref={ref} className="scroll-progress h-full origin-left" style={{ transform: "scaleX(0)" }} />
    </div>
  );
}

/** Soft gold and purple dots that drift upward and twinkle across the whole page. */
function GlobalParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const colors = ["241,210,106", "167,78,184", "113,42,130", "255,255,255"];
    type Particle = { x: number; y: number; r: number; vx: number; vy: number; phase: number; speed: number; c: string };
    let width = 0;
    let height = 0;
    let raf = 0;
    let particles: Particle[] = [];

    const make = (initial: boolean): Particle => ({
      x: Math.random() * width,
      y: initial ? Math.random() * height : height + 10,
      r: 0.6 + Math.random() * 1.8,
      vx: (Math.random() - 0.5) * 0.12,
      vy: 0.08 + Math.random() * 0.22,
      phase: Math.random() * Math.PI * 2,
      speed: 0.6 + Math.random() * 1.4,
      c: colors[Math.floor(Math.random() * colors.length)],
    });

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(70, Math.max(24, (width * height) / 26000)));
      particles = Array.from({ length: count }, () => make(true));
    };

    const tick = (time: number) => {
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        p.y -= p.vy;
        p.x += p.vx + Math.sin(time / 1800 + p.phase) * 0.15;
        if (p.y < -10) Object.assign(p, make(false));
        const alpha = 0.25 + 0.45 * (0.5 + 0.5 * Math.sin((time / 1000) * p.speed + p.phase));
        ctx.beginPath();
        ctx.fillStyle = `rgba(${p.c},${alpha})`;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };

    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) raf = requestAnimationFrame(tick);
    };

    resize();
    raf = requestAnimationFrame(tick);
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-[5]" aria-hidden="true" />;
}

/** Subtle 3D tilt that follows the pointer over a card. */
function tiltCard(event: React.MouseEvent<HTMLElement>) {
  const el = event.currentTarget;
  const rect = el.getBoundingClientRect();
  const px = (event.clientX - rect.left) / rect.width - 0.5;
  const py = (event.clientY - rect.top) / rect.height - 0.5;
  el.style.setProperty("--rx", `${(-py * 6).toFixed(2)}deg`);
  el.style.setProperty("--ry", `${(px * 8).toFixed(2)}deg`);
}

function resetTilt(event: React.MouseEvent<HTMLElement>) {
  event.currentTarget.style.removeProperty("--rx");
  event.currentTarget.style.removeProperty("--ry");
}

function BrandMark({
  compact = false,
  homeLabel = "Mood Food home",
  imageAlt = "Mood Food — Marinades, Kebabs, Curries",
}: {
  compact?: boolean;
  homeLabel?: string;
  imageAlt?: string;
}) {
  return (
    <Link
      className="flex h-[60px] items-center"
      href="/"
      aria-label={homeLabel}
    >
      <Image
        src="/brand/mood-food-logo-new.png"
        alt={imageAlt}
        width={956}
        height={768}
        className={compact ? "h-[52px] w-auto" : "h-[58px] w-auto"}
        priority={!compact}
      />
    </Link>
  );
}

function FssaiMark({ label = "FSSAI State License" }: { label?: string }) {
  return (
    <span className="inline-flex shrink-0 items-center">
      <svg
        viewBox="0 0 160 62"
        width="128"
        height="50"
        role="img"
        aria-label={label}
      >
        <ellipse cx="80" cy="24" rx="72" ry="22" fill="#fff" stroke="#c8c8c8" strokeWidth="1.5" />
        <text
          x="80"
          y="33"
          textAnchor="middle"
          fontFamily="Georgia, 'Times New Roman', serif"
          fontSize="29"
          fontStyle="italic"
          fill="#243c91"
        >
          fssai
        </text>
        <path d="M124 12c5-7 11-7 15-6-2 6-7 10-15 9" fill="#268f58" />
        <path d="M137 5c1-3 3-4 5-5" fill="none" stroke="#df8b2f" strokeWidth="2" />
        <text
          x="80"
          y="59"
          textAnchor="middle"
          fontFamily="Arial, sans-serif"
          fontSize="10"
          fontWeight="700"
          fill="#f6dc9a"
        >
          FSSAI STATE LICENSE
        </text>
      </svg>
    </span>
  );
}

function ParticleField() {
  return (
    <div className="particle-field" aria-hidden="true">
      {Array.from({ length: 16 }, (_, index) => (
        <span key={index} />
      ))}
    </div>
  );
}

function HeroSlider({ copy }: { copy: SiteTranslation }) {
  const heroSlides = copy.heroSlides;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);
  const total = heroSlides.length;

  const go = useCallback((index: number) => setActive((index + total) % total), [total]);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % total), 5500);
    return () => window.clearInterval(timer);
  }, [paused, total, active]);

  return (
    <section
      className="hero-banner relative"
      aria-roledescription={copy.aria.carouselRole}
      aria-label={copy.aria.carousel}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={(event) => { touchX.current = event.touches[0].clientX; }}
      onTouchEnd={(event) => {
        if (touchX.current === null) return;
        const delta = event.changedTouches[0].clientX - touchX.current;
        if (Math.abs(delta) > 45) go(active + (delta < 0 ? 1 : -1));
        touchX.current = null;
      }}
    >
      {/* Full-width background banners */}
      <div className="hero-bgs" aria-hidden="true">
        {heroSlides.map((slide, index) => (
          <div key={slide.tag} className={`hero-bg ${index === active ? "is-active" : ""}`}>
            <div
              className={`hero-bg-photo ${slide.contain ? "is-blurred" : ""}`}
              style={{ backgroundImage: `url('${slide.image}')` }}
            />
            {slide.contain && (
              <div
                className="hero-poster absolute inset-y-8 right-[5%] hidden w-[40%] lg:block"
                style={{ backgroundImage: `url('${slide.image}')` }}
              />
            )}
            <div className="hero-bg-overlay" />
          </div>
        ))}
      </div>
      <ParticleField />

      <div className="mx-auto flex min-h-[400px] max-w-[1320px] flex-col justify-between px-5 pb-5 pt-8 sm:min-h-[420px] sm:px-8 sm:pt-9 lg:min-h-[430px] lg:px-12 lg:pt-9">
        <div className="hero-stage">
          {heroSlides.map((slide, index) => {
            const isActive = index === active;
            const href = slide.href === "whatsapp" ? whatsAppUrl(copy.whatsapp.heroOrder) : slide.href;
            return (
              <div
                key={slide.tag}
                className={`hero-slide ${isActive ? "is-active" : ""}`}
                role="group"
                aria-roledescription={copy.aria.slideRole}
                aria-label={copy.aria.slideCount.replace("{current}", String(index + 1)).replace("{total}", String(total))}
                aria-hidden={!isActive}
              >
                <div className="hero-copy max-w-[560px]">
                  <div className="hero-anim mb-3 inline-flex items-center gap-2 rounded-full border border-white/40 bg-[#ffffff]/15 px-3.5 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-white backdrop-blur-sm" style={{ "--d": "0.05s" } as React.CSSProperties}>
                    <Sparkles size={13} className="text-white" />
                    {slide.badge}
                  </div>
                  <h1 className="hero-anim serif text-[clamp(2rem,4.2vw,3.7rem)] leading-[1.02] text-white" style={{ "--d": "0.15s" } as React.CSSProperties}>
                    {slide.lineOne}
                    <br />
                    <span className="hero-underline relative inline-block text-[#f6dc9a]">{slide.lineTwo}</span>
                  </h1>
                  <p className="hero-anim mt-4 max-w-[460px] text-[15px] leading-7 text-white/90 sm:text-base" style={{ "--d": "0.28s" } as React.CSSProperties}>{slide.body}</p>
                  <div className="hero-anim mt-5 flex flex-wrap items-center gap-3" style={{ "--d": "0.4s" } as React.CSSProperties}>
                    <a
                      href={href}
                      tabIndex={isActive ? 0 : -1}
                      {...(slide.href === "whatsapp" ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className="inline-flex items-center gap-3 rounded-full bg-[#ffffff] px-6 py-3.5 text-sm font-bold text-[#4a2477] transition hover:-translate-y-0.5 hover:bg-[#f6dc9a]"
                    >
                      {slide.cta}
                      <ArrowRight size={16} />
                    </a>
                    <a href="#how" tabIndex={isActive ? 0 : -1} className="inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-bold text-white transition hover:bg-[#ffffff]/15">
                      {copy.hero.seeHow} <ArrowDown size={14} />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex items-center gap-4 sm:gap-8">
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => go(active - 1)} aria-label={copy.aria.previousBanner} className="grid h-11 w-11 place-items-center rounded-full border border-white/40 bg-[#000000]/20 text-white backdrop-blur-sm transition hover:bg-[#ffffff] hover:text-[#4a2477]"><ChevronLeft size={18} /></button>
            <button type="button" onClick={() => go(active + 1)} aria-label={copy.aria.nextBanner} className="grid h-11 w-11 place-items-center rounded-full border border-white/40 bg-[#000000]/20 text-white backdrop-blur-sm transition hover:bg-[#ffffff] hover:text-[#4a2477]"><ChevronRight size={18} /></button>
          </div>
          <div className="flex items-center gap-2" role="tablist" aria-label={copy.aria.chooseBanner}>
            {heroSlides.map((slide, index) => (
              <button
                key={slide.tag}
                type="button"
                role="tab"
                aria-selected={index === active}
                aria-label={`${copy.aria.showBanner} ${index + 1}`}
                onClick={() => go(index)}
                className={`hero-dot ${index === active ? "is-active" : ""}`}
              >
                <span key={`${index}-${active}`} className="hero-dot-fill" style={{ animationPlayState: paused ? "paused" : "running" }} />
              </button>
            ))}
          </div>
          <p className="hidden text-xs font-semibold text-white/80 sm:block">
            {String(active + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </p>
          <div className="ml-auto hidden items-center gap-3 rounded-2xl border border-white/30 bg-[#3a1462]/70 p-3 backdrop-blur-md md:flex">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#ffffff]/15 text-white"><Clock3 size={18} /></span>
            <span>
              <span className="block text-xs font-bold text-white">{copy.hero.planning}</span>
              <span className="mt-0.5 block text-[10px] text-white/75">{copy.hero.orderAhead}</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionHead({ eyebrow, title, text }: { eyebrow: string; title: string; text?: string }) {
  return (
    <div className="mx-auto mb-10 max-w-2xl text-center md:mb-12">
      <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.19em] text-[#a97b1e]">{eyebrow}</p>
      <h2 className="serif text-4xl leading-[1.08] text-[#4a2477] sm:text-5xl">{title}</h2>
      {text && <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-[#6e5a86]">{text}</p>}
    </div>
  );
}

function WhatsNew({ copy }: { copy: SiteTranslation }) {
  const items = copy.whatsNew.items;
  return (
    <section id="whats-new" className="scroll-mt-24 mx-auto max-w-[1320px] px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
      <SectionHead eyebrow={copy.whatsNew.eyebrow} title={copy.whatsNew.title} />
      <div className="grid gap-5 md:grid-cols-3">
        {items.map((item) => (
          <a key={item.title} href={item.href} className="group relative overflow-hidden rounded-[24px] border border-[#e9c46a]/40 bg-[#ffffff] p-6 transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(74,36,119,0.14)]">
            <span className="inline-flex rounded-full bg-[#4a2477] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#f6dc9a]">{item.tag}</span>
            <h3 className="serif mt-5 text-2xl leading-tight text-[#4a2477]">{item.title}</h3>
            <p className="mt-3 text-sm leading-6 text-[#6e5a86]">{item.text}</p>
            <span className="mt-6 inline-flex items-center gap-2 text-xs font-bold text-[#a97b1e] transition group-hover:gap-3">{copy.whatsNew.takeALook} <ArrowUpRight size={14} /></span>
          </a>
        ))}
      </div>
    </section>
  );
}

function WhyUs({ copy }: { copy: SiteTranslation }) {
  const reasons = copy.whyUs.reasons;
  const icons = [ChefHat, Leaf, Truck, ShieldCheck] as const;
  return (
    <section id="why" className="scroll-mt-24 bg-gradient-to-b from-[#fffaf0] via-[#fbefcc] to-[#fffaf0]">
      <div className="mx-auto max-w-[1320px] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <SectionHead eyebrow={copy.whyUs.eyebrow} title={copy.whyUs.title} text={copy.whyUs.description} />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map(({ title, text }, index) => {
            const Icon = icons[index];
            return (
              <div key={title} className="rounded-[24px] border border-[#e9c46a]/40 bg-[#ffffff]/80 p-6 text-center">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-[#5b2a91] to-[#8a5cc4] text-[#f6dc9a] ring-4 ring-[#e9c46a]/30"><Icon size={22} /></span>
              <h3 className="mt-5 text-base font-bold text-[#4a2477]">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#6e5a86]">{text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Testimonials({ copy }: { copy: SiteTranslation }) {
  const reviews = copy.testimonials.items;
  return (
    <section id="testimonials" className="scroll-mt-24 mx-auto max-w-[1320px] px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
      <SectionHead eyebrow={copy.testimonials.eyebrow} title={copy.testimonials.title} />
      <div className="grid gap-5 md:grid-cols-3">
        {reviews.map((review) => (
          <figure key={review.name} className="relative rounded-[24px] border border-[#e9c46a]/40 bg-[#ffffff] p-7">
            <Quote size={34} className="absolute right-6 top-6 text-[#e9c46a]/60" aria-hidden="true" />
            <div className="flex gap-1 text-[#e0a923]" aria-label={copy.aria.stars}>
              {Array.from({ length: 5 }, (_, i) => <Star key={i} size={16} fill="currentColor" />)}
            </div>
            <blockquote className="mt-4 text-sm leading-7 text-[#4a3b63]">“{review.text}”</blockquote>
            <figcaption className="mt-6 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[#4a2477] text-sm font-bold text-[#f6dc9a]">{review.name[0]}</span>
              <span>
                <span className="block text-sm font-bold text-[#4a2477]">{review.name}</span>
                <span className="block text-[11px] text-[#6e5a86]">{review.area}</span>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

function Faq({ copy }: { copy: SiteTranslation }) {
  const [open, setOpen] = useState<number | null>(0);
  const faqs = copy.faq.items;
  return (
    <section id="faq" className="scroll-mt-24 mx-auto max-w-[900px] px-5 py-16 sm:px-8 sm:py-20">
      <SectionHead eyebrow={copy.faq.eyebrow} title={copy.faq.title} />
      <div className="grid gap-3">
        {faqs.map(([question, answer], index) => {
          const isOpen = open === index;
          return (
            <div key={question} className={`rounded-2xl border bg-[#ffffff] transition ${isOpen ? "border-[#e9c46a]" : "border-[#e9c46a]/40"}`}>
              <button type="button" onClick={() => setOpen(isOpen ? null : index)} aria-expanded={isOpen} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6">
                <span className="text-sm font-bold text-[#4a2477] sm:text-base">{question}</span>
                <ChevronDown size={18} className={`shrink-0 text-[#a97b1e] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
              </button>
              <div className={`grid transition-all duration-300 ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                <div className="overflow-hidden">
                  <p className="px-5 pb-5 text-sm leading-7 text-[#6e5a86] sm:px-6">{answer}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function HowItWorks({ copy }: { copy: SiteTranslation }) {
  const ref = useRef<HTMLElement | null>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="how" ref={ref} className={`how-section scroll-mt-24 ${seen ? "is-visible" : ""}`}>
      <ParticleField />
      <div className="mx-auto max-w-[1320px] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <div className="how-heading">
          <div className="mb-4 flex items-center gap-3">
            <span className="how-eyebrow-line" />
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#a97b1e]">{copy.how.eyebrow}</p>
          </div>
          <h2 className="serif text-4xl leading-[1.08] text-[#fff] sm:text-5xl lg:text-6xl">{copy.how.title}</h2>
        </div>
        <div className="step-track relative mt-12 grid gap-10 md:grid-cols-3 md:gap-6">
          {copy.how.steps.map(([step, title, text]) => (
            <article key={step} className="how-step relative z-10 text-center">
              <span className="how-step-number mx-auto grid h-[68px] w-[68px] place-items-center rounded-full text-2xl font-extrabold text-[#fff]">
                {step}
              </span>
              <h3 className="mt-5 text-lg font-bold text-[#fff]">{title}</h3>
              <p className="mx-auto mt-2 max-w-[330px] text-sm leading-6 text-[#fff]">{text}</p>
            </article>
          ))}
        </div>
        <div className="how-cta mt-10 text-center">
          <a href={whatsAppUrl(copy.whatsapp.planOrder)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-[#4a2477] px-5 py-3 text-xs font-bold text-[#f6dc9a] transition hover:-translate-y-0.5 hover:bg-[#3a1462]">
            {copy.how.cta} <ArrowUpRight size={15} />
          </a>
        </div>
      </div>
    </section>
  );
}

function Cuisines({ copy }: { copy: SiteTranslation }) {
  return (
    <section className="mx-auto max-w-[1320px] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
      <SectionHead
        eyebrow={copy.cuisines.eyebrow}
        title={copy.cuisines.title}
        text={copy.cuisines.description}
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {copy.cuisines.items.map(([label, text, color], index) => (
          <article
            key={label}
            className="glow-card relative overflow-hidden rounded-2xl border border-[#e9c46a]/40 bg-white/80 p-6 transition duration-300 hover:-translate-y-1"
          >
            <span
              className="cuisine-orb absolute -bottom-6 -right-6 h-20 w-20 rounded-full"
              style={{ background: color, animationDelay: `${index * 400}ms` }}
              aria-hidden="true"
            />
            <h2 className="relative text-lg font-bold text-[#35153b]">{label}</h2>
            <p className="relative mt-2 text-sm leading-6 text-[#766b7d]">{text}</p>
            <Link
              href="/products"
              className="relative mt-5 inline-flex text-xs font-bold text-[#712a82] hover:text-[#a97b1e]"
            >
              {copy.cuisines.exploreProducts} <ArrowRight size={14} className="ml-1" />
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}

export function Storefront({ page = "home" }: { page?: StorefrontPage }) {
  const language = useSyncExternalStore(
    subscribeToLanguage,
    getStoredLanguage,
    (): Language => "en",
  );
  const [catalog, setCatalog] = useState<Product[]>(products);
  const [catalogPreview, setCatalogPreview] = useState(false);
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("Avadhi");
  const [vegetarianOnly, setVegetarianOnly] = useState(false);
  const [frozenOnly, setFrozenOnly] = useState(false);
  const [bag, setBag] = useState<Bag>({});
  const [bulkForm, setBulkForm] = useState<BulkOrderForm>({
    name: "",
    phone: "",
    deliveryDate: "",
    area: "Gurugram",
    address: "",
    note: "",
  });
  const [bulkError, setBulkError] = useState("");
  const [bagOpen, setBagOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutName, setCheckoutName] = useState("");
  const [checkoutPhone, setCheckoutPhone] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryAt, setDeliveryAt] = useState("");
  const [customerNote, setCustomerNote] = useState("");
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpMessage, setOtpMessage] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [signedInPhone, setSignedInPhone] = useState<string | null>(null);
  const [bagRing, setBagRing] = useState(0);
  const bagButtonRef = useRef<HTMLButtonElement>(null);
  const t = translations[language];
  const isHome = page === "home";
  const showProducts = isHome || page === "products";
  const showAbout = isHome || page === "about";
  const navLinks = [
    { href: "/why-us", label: t.navWhy, page: "whyUs" },
    { href: "/cuisines", label: t.navCuisines, page: "cuisines" },
    { href: "/products", label: t.navProduct, page: "products" },
    { href: "/about-us", label: t.navStory, page: "about" },
    { href: "/whats-new", label: t.navNew, page: "whatsNew" },
  ];

  useEffect(() => {
    document.documentElement.lang = language;
    document.title = t.documentTitle;
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (description) description.content = t.documentDescription;
    const openGraphTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]');
    if (openGraphTitle) openGraphTitle.content = t.documentTitle;
    const openGraphDescription = document.querySelector<HTMLMetaElement>('meta[property="og:description"]');
    if (openGraphDescription) openGraphDescription.content = t.documentDescription;
  }, [language, t.documentDescription, t.documentTitle]);

  useEffect(() => {
    let active = true;
    fetch("/api/products")
      .then(async (response) => {
        if (!response.ok) throw new Error("Live product list unavailable.");
        const result = (await response.json()) as { products: Product[] };
        if (active && result.products.length > 0) setCatalog(result.products);
        if (active) setCatalogPreview(false);
      })
      .catch(() => {
        if (active) setCatalogPreview(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/promotions")
      .then(async (response) => {
        if (!response.ok) return;
        const result = (await response.json()) as { promotions: Promotion[] };
        if (active) setPromotion(result.promotions[0] ?? null);
      })
      .catch(() => {
        if (active) setPromotion(null);
      });
    return () => {
      active = false;
    };
  }, []);

  /** Flies a gold dot from the clicked button to the bag icon, then rings the bag. */
  function flyToBag(source: HTMLElement) {
    const target = bagButtonRef.current;
    if (!target || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setBagRing((n) => n + 1);
      return;
    }
    const s = source.getBoundingClientRect();
    const tr = target.getBoundingClientRect();
    const dx = tr.left + tr.width / 2 - (s.left + s.width / 2);
    const dy = tr.top + tr.height / 2 - (s.top + s.height / 2);
    const dot = document.createElement("span");
    dot.className = "fly-dot";
    dot.style.left = `${s.left + s.width / 2 - 9}px`;
    dot.style.top = `${s.top + s.height / 2 - 9}px`;
    document.body.appendChild(dot);
    const anim = dot.animate(
      [
        { transform: "translate(0,0) scale(1)", opacity: 1 },
        { transform: `translate(${dx * 0.55}px, ${dy * 0.55 - 90}px) scale(0.85)`, opacity: 1, offset: 0.5 },
        { transform: `translate(${dx}px, ${dy}px) scale(0.3)`, opacity: 0.4 },
      ],
      { duration: 800, easing: "cubic-bezier(0.4, 0, 0.2, 1)" },
    );
    anim.onfinish = () => {
      dot.remove();
      setBagRing((n) => n + 1);
    };
  }

  const visibleProducts = useMemo(
    () =>
      catalog.filter(
        (product) =>
          (activeCategory === "Avadhi" || product.category === activeCategory) &&
          (!vegetarianOnly || product.vegetarian) &&
          (!frozenOnly || product.frozen),
      ),
    [activeCategory, catalog, frozenOnly, vegetarianOnly],
  );

  const bagCount = Object.values(bag).reduce((sum, quantity) => sum + quantity, 0);
  // Uses the live catalog (not the static starter list) so admin-added products work in the bag
  const bagItems = catalog.filter((product) => bag[product.id]);
  const bagGrams = bagItems.reduce(
    (sum, product) => sum + bag[product.id] * product.weightGrams,
    0,
  );
  const bagTotal = bagItems.reduce(
    (sum, product) => sum + bag[product.id] * product.price,
    0,
  );
  const localizedDetailProduct = detailProduct
    ? localizeProduct(detailProduct, language)
    : null;

  function updateBag(productId: string, change: number) {
    setBag((current) => {
      const quantity = Math.max(0, (current[productId] || 0) + change);
      const next = { ...current };
      if (quantity === 0) delete next[productId];
      else next[productId] = quantity;
      return next;
    });
  }

  function placeBulkOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBulkError("");

    const requestedDeliveryAt = new Date(`${bulkForm.deliveryDate}T23:59:00`);
    if (
      Number.isNaN(requestedDeliveryAt.getTime()) ||
      requestedDeliveryAt.getTime() < new Date(minimumDeliveryDateTimeLocal()).getTime()
    ) {
      setBulkError(t.bulk.dateError.replace("{hours}", String(advanceOrderHours)));
      return;
    }

    const area = language === "hi"
      ? bulkForm.area === "Gurugram" ? t.bulk.gurugram : t.bulk.noida
      : bulkForm.area;
    const message = `${t.whatsapp.bulkIntro}\n${t.whatsapp.requestedDate}: ${requestedDeliveryAt.toLocaleDateString(language === "hi" ? "hi-IN" : "en-IN")}\n${t.whatsapp.deliveryTime}: ${t.whatsapp.confirmTime}\n${t.whatsapp.area}: ${area}\n${t.whatsapp.name}: ${bulkForm.name}\n${t.whatsapp.phone}: +91 ${bulkForm.phone}\n${t.whatsapp.address}: ${bulkForm.address}\n${bulkForm.note.trim() ? `${t.whatsapp.note}: ${bulkForm.note.trim()}\n` : ""}${t.whatsapp.bulkFollowUp}`;
    window.location.assign(whatsAppUrl(message));
  }

  async function placeOrder(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setOrderSubmitting(true);
    setOrderError("");
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: checkoutName,
          phone: checkoutPhone,
          deliveryAddress,
          requestedDeliveryAt: new Date(deliveryAt).toISOString(),
          customerNote,
          items: bagItems.map((product) => ({
            productId: product.id,
            quantity: bag[product.id],
          })),
        }),
      });
      const result = (await response.json()) as {
        orderNumber?: string;
        error?: string;
      };
      if (!response.ok || !result.orderNumber) {
        setOrderError(
          result.error
            ? localizeServerMessage(result.error, language)
            : t.checkout.error,
        );
        return;
      }

      const orderLines = bagItems
        .map((product) => `${localizeProduct(product, language).name} x ${bag[product.id]}`)
        .join("\n");
      const message = `${t.whatsapp.orderIntro} ${result.orderNumber}.\n${orderLines}\n${t.whatsapp.total}: ${formatPrice(bagTotal)}\n${t.whatsapp.requestedDelivery}: ${new Date(deliveryAt).toLocaleString(language === "hi" ? "hi-IN" : "en-IN")}\n${t.whatsapp.name}: ${checkoutName}\n${t.whatsapp.phone}: +91 ${checkoutPhone}\n${t.whatsapp.address}: ${deliveryAddress}\n${customerNote ? `${t.whatsapp.note}: ${customerNote}\n` : ""}\n${t.whatsapp.confirmOrder}`;
      window.location.assign(whatsAppUrl(message));
    } catch {
      setOrderError(t.checkout.errorTryAgain);
    } finally {
      setOrderSubmitting(false);
    }
  }

  function orderOnWhatsApp() {
    if (bagGrams < minimumOrderGrams) return;
    setOrderError("");
    setDeliveryAt((current) => current || minimumDeliveryDateTimeLocal());
    setCheckoutOpen(true);
  }

  function closeAccount() {
    setAccountOpen(false);
    setOtpMessage("");
    setOtpCode("");
    setOtpSent(false);
  }

  async function requestOtp(event?: React.FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    setOtpLoading(true);
    setOtpMessage("");
    setOtpCode("");
    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const result = (await response.json()) as { message?: string };
      setOtpSent(response.ok);
      setOtpMessage(
        result.message
          ? localizeServerMessage(result.message, language)
          : response.ok
            ? t.accountDialog.checkPhone
            : t.accountDialog.sendError,
      );
    } catch {
      setOtpSent(false);
      setOtpMessage(t.accountDialog.connectionError);
    } finally {
      setOtpLoading(false);
    }
  }

  async function verifyOtp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setOtpLoading(true);
    setOtpMessage("");
    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code: otpCode }),
      });
      const result = (await response.json()) as { verified?: boolean; message?: string };
      if (response.ok && result.verified) {
        setSignedInPhone(phone);
        setOtpSent(false);
        setOtpCode("");
        setOtpMessage(
          result.message
            ? localizeServerMessage(result.message, language)
            : t.accountDialog.signedInMessage,
        );
        // Pre-fill checkout phone for convenience
        setCheckoutPhone((current) => current || phone);
      } else {
        setOtpMessage(
          result.message
            ? localizeServerMessage(result.message, language)
            : t.accountDialog.invalidCode,
        );
      }
    } catch {
      setOtpMessage(t.accountDialog.verifyError);
    } finally {
      setOtpLoading(false);
    }
  }

  return (
    <main id={isHome ? "home" : undefined} className="overflow-hidden">
      <ScrollProgress />
      <GlobalParticleField />
      <div className="border-y border-[#e9c46a]/50 bg-gradient-to-r from-[#fffaf0] via-[#fbefcc] to-[#fffaf0]">
        <div className="mx-auto flex max-w-[1320px] flex-col items-center justify-between gap-2 px-5 py-2 text-[11px] font-medium tracking-wide sm:px-8 md:flex-row lg:px-12">
          <p className="hidden text-center md:block md:text-left">
            {promotion ? (
              <>
                <span className="font-bold text-[#5b2a91]">{promotion.title}</span>
                <span className="mx-2 text-[#3a1462]/50">·</span>
                {promotion.message}
                {promotion.code && <span className="ml-2 rounded bg-[#ffffff]/60 px-2 py-1 font-bold text-[#3a1462]">{promotion.code}</span>}
              </>
            ) : (
              <>{t.promo.defaultLead}{" "}
                <span className="mx-1 text-[#7a4cb0]">✳</span> {t.promo.orderAtLeast}{" "}
                {minimumOrderGrams / 1000} kg, {advanceOrderHours} {t.promo.hoursAhead}</>
            )}
          </p>
          <div className="flex items-center gap-4 sm:gap-5">
            <a href={contact.phoneHref} className="inline-flex items-center gap-1.5 font-bold transition hover:text-[#7a4cb0]" aria-label={`${t.aria.call} ${contact.phoneDisplay}`}>
              <Phone size={14} /> {contact.phoneDisplay}
            </a>
            <span className="h-4 w-px bg-[#3a1462]/25" aria-hidden="true" />
            <a href={whatsAppUrl(t.whatsapp.hello)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-bold transition hover:text-[#7a4cb0]" aria-label={t.aria.chatWhatsApp}>
              <WhatsAppIcon /> <span className="hidden sm:inline">WhatsApp</span>
            </a>
            <a href={contact.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-bold transition hover:text-[#7a4cb0]" aria-label={t.aria.instagram}>
              <InstagramIcon /> <span className="hidden sm:inline">Instagram</span>
            </a>
            <a href={contact.facebook} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-bold transition hover:text-[#7a4cb0]" aria-label={t.aria.facebook}>
              <FacebookIcon /> <span className="hidden sm:inline">Facebook</span>
            </a>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-30 border-b border-[#f6dc9a]/30 bg-[#542670]/95 backdrop-blur-md">
        <div className="mx-auto flex h-[76px] max-w-[1320px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <div className="flex items-center gap-2 sm:gap-3">
            <BrandMark homeLabel={t.aria.home} imageAlt={t.story.logoAlt} />
            <FssaiMark label={t.aria.fssaiLicense} />
          </div>
          <nav className="hidden items-center gap-6 text-[13px] font-semibold text-white xl:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={page === link.page ? "page" : undefined}
                className="whitespace-nowrap transition-colors hover:text-[#f6dc9a]"
              >
                {link.label}
              </Link>
            ))}
            <Link href="/products" className="whitespace-nowrap rounded-full bg-[#f6dc9a] px-4 py-2 text-[#4a2477] transition hover:bg-white">
              {t.navOrderNow}
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const nextLanguage = language === "en" ? "hi" : "en";
                window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
                window.dispatchEvent(new Event(LANGUAGE_CHANGE_EVENT));
              }}
              className="rounded-full px-3 py-2 text-xs font-bold text-white transition hover:bg-[#ffffff]/15"
              aria-label={t.switchLanguage}
            >
              {language === "en" ? "हिन्दी" : "English"}
            </button>
            <button
              type="button"
              onClick={() => setAccountOpen(true)}
              className="hidden items-center gap-2 rounded-full border border-[#ffffff]/40 px-4 py-2.5 text-xs font-bold text-white transition hover:border-[#f6dc9a] hover:text-[#f6dc9a] sm:flex"
            >
              {signedInPhone ? `+91 ${signedInPhone.slice(0, 2)}••••${signedInPhone.slice(-2)}` : t.account}
            </button>
            <button
              ref={bagButtonRef}
              type="button"
              onClick={() => setBagOpen(true)}
              aria-label={`${t.aria.openBag}, ${bagCount} ${t.bag.items}`}
              className="relative grid h-10 w-10 place-items-center rounded-full bg-[#f6dc9a] text-[#4a2477] transition hover:bg-[#ffffff]"
            >
              <span key={bagRing} className={`grid place-items-center ${bagRing ? "anim-bag-ring" : ""}`}>
                <ShoppingBag size={17} strokeWidth={2} />
              </span>
              {bagCount > 0 && (
                <span className="absolute -right-1 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-[#4a2477] px-1 text-[10px] font-bold text-white">
                  {bagCount}
                </span>
              )}
            </button>
            <button
              type="button"
              className="grid h-10 w-10 place-items-center rounded-full border border-[#ffffff]/40 text-white xl:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? t.aria.closeMenu : t.aria.openMenu}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav className="grid gap-1 border-t border-[#f6dc9a]/30 bg-[#5a1030] px-6 py-3 text-sm font-semibold text-white xl:hidden">
            {navLinks.map((link) => (
              <Link key={link.href} className="rounded-lg px-3 py-2.5" href={link.href} aria-current={page === link.page ? "page" : undefined} onClick={() => setMenuOpen(false)}>{link.label}</Link>
            ))}
            <Link className="rounded-lg bg-[#f6dc9a] px-3 py-2.5 font-bold text-[#4a2477]" href="/products" onClick={() => setMenuOpen(false)}>{t.navOrderNow}</Link>
            <button className="rounded-lg px-3 py-2.5 text-left" onClick={() => { setMenuOpen(false); setAccountOpen(true); }}>{t.account}</button>
          </nav>
        )}
      </header>

      {isHome && <HeroSlider copy={t} />}
      {isHome && (
        <div
          id="mq"
          className="menu-marquee"
          role="region"
          aria-label={t.aria.featuredDishes}
        >
          <p className="sr-only">{catalog.map((product) => localizeProduct(product, language).name).join(", ")}</p>
          <div
            className="menu-marquee__track"
            style={{ animation: "menu-marquee-scroll 28s linear infinite" }}
            aria-hidden="true"
          >
            {[0, 1].map((group) => (
              <div className="menu-marquee__group" key={group}>
                {catalog.map((product) => (
                  <span className="menu-marquee__item" key={product.id}>
                    {localizeProduct(product, language).name}
                    <span className="menu-marquee__separator">✦</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {isHome && (
        <section className="border-y border-[#e9c46a]/50 bg-gradient-to-r from-[#fffaf0] via-[#fbefcc] to-[#fffaf0]">
          <div className="mx-auto grid max-w-[1320px] grid-cols-2 divide-x divide-[#ded7cb] px-5 py-5 sm:px-8 md:grid-cols-4 lg:px-12">
            {t.featureItems.map(({ number, title, caption }, i) => (
              <Reveal key={number} delay={i * 100}>
                <div className="group flex items-center gap-3 px-3 py-3 sm:px-5">
                  <span className="serif hidden text-xl text-[#712a82] transition duration-300 group-hover:scale-125 sm:block">{number}</span>
                  <div>
                    <p className="text-xs font-bold text-[#35153b] sm:text-sm">{title}</p>
                    <p className="mt-1 text-[10px] text-[#766b7d] sm:text-[11px]">{caption}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {showProducts && (
        <section id="menu" className="scroll-mt-24 mx-auto max-w-[1320px] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
          <Reveal className="mb-8 flex flex-col justify-between gap-5 md:mb-10 md:flex-row md:items-end">
            <div>
              <p className="eyebrow mb-3 flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.19em] text-[#712a82]">{t.menu.eyebrow}</p>
              <h2 className="serif max-w-xl text-4xl leading-[1.06] sm:text-5xl">{t.menu.browse}</h2>
              <p className="mt-4 max-w-lg text-sm leading-6 text-[#766b7d]">{t.menu.description}</p>
            </div>
            {/* <a
              href={whatsAppUrl("Hello Mood Food! Please share your complete menu.")}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 self-start text-xs font-bold text-[#35153b] transition hover:text-[#712a82] md:self-auto"
            >
              {t.fullMenu}{" "}
              <ArrowUpRight size={15} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a> */}
          </Reveal>
          <Reveal delay={100} className="mb-7 flex flex-col gap-4 border-b border-[#e9e1ef] pb-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
              {cuisineFilters.map((category) => (
                <button
                  type="button"
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`shrink-0 rounded-full px-4 py-2.5 text-xs font-bold transition duration-200 active:scale-95 ${activeCategory === category
                      ? "bg-[#35153b] text-white shadow-[0_6px_16px_rgba(53,21,59,0.25)]"
                      : "border border-[#e9e1ef] bg-[#fff] text-[#51465a] hover:-translate-y-0.5 hover:border-[#897b90]"
                    }`}
                >
                  {localizeProductText(category, language)}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setVegetarianOnly(!vegetarianOnly)}
                aria-pressed={vegetarianOnly}
                className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2.5 text-[11px] font-bold transition duration-200 active:scale-95 ${vegetarianOnly
                    ? "border-[#71834f] bg-[#71834f] text-white"
                    : "border-[#e9e1ef] text-[#51465a] hover:bg-white"
                  }`}
              >
                <Leaf size={13} className={vegetarianOnly ? "anim-wiggle" : ""} /> {t.menu.veg}
              </button>
              <button
                type="button"
                onClick={() => setFrozenOnly(!frozenOnly)}
                aria-pressed={frozenOnly}
                className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2.5 text-[11px] font-bold transition duration-200 active:scale-95 ${frozenOnly
                    ? "border-[#507a8a] bg-[#507a8a] text-white"
                    : "border-[#e9e1ef] text-[#51465a] hover:bg-white"
                  }`}
              >
                <Snowflake size={13} className={frozenOnly ? "animate-spin" : ""} style={{ animationDuration: "6s" }} /> {t.menu.frozen}
              </button>
            </div>
          </Reveal>
          {catalogPreview && (
            <p className="mb-5 rounded-xl border border-[#e9e1ef] bg-[#f8f4fa] px-4 py-3 text-[11px] leading-5 text-[#766b7d]">
              {t.menu.preview}
            </p>
          )}

          {visibleProducts.length === 0 ? (
            <div className="anim-pop-in rounded-3xl border border-dashed border-[#e1d4e7] py-16 text-center text-sm text-[#766b7d]">
              {t.menu.empty}{" "}
              <button
                type="button"
                className="font-bold text-[#712a82] underline underline-offset-2"
                onClick={() => {
                  setVegetarianOnly(false);
                  setFrozenOnly(false);
                  setActiveCategory("Avadhi");
                }}
              >
                {t.menu.clearFilters}
              </button>
            </div>
          ) : (
            <div
              key={`${activeCategory}-${vegetarianOnly}-${frozenOnly}`}
              className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
            >
              {visibleProducts.map((product, index) => {
                const displayProduct = localizeProduct(product, language);
                return (
                  <div key={product.id} style={d((index % 8) * 70)} className="anim-card-in h-full">
                    <article onMouseMove={tiltCard} onMouseLeave={resetTilt} className="glow-card tilt-card group h-full overflow-hidden rounded-[23px] border border-[#e9e1ef] bg-[#fff] transition duration-300 hover:-translate-y-1.5">
                      <div className="img-skeleton relative aspect-[1.16/1] overflow-hidden">
                        <div
                          className="food-photo absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-110"
                          style={{ backgroundImage: `url('${product.image}')`, backgroundPosition: product.imagePosition || "center" }}
                          role="img"
                          aria-label={`${displayProduct.name} ${language === "hi" ? "का व्यंजन" : "dish"}`}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent opacity-70" />
                        <div className="absolute left-3.5 top-3.5 flex flex-wrap gap-1.5">
                          {displayProduct.badge && (
                            <span className="rounded-full bg-[#fff]/95 px-2.5 py-1.5 text-[9px] font-bold text-[#51465a]">
                              {displayProduct.badge}
                            </span>
                          )}
                          {product.frozen && (
                            <span className="rounded-full bg-[#edf6f6] px-2.5 py-1.5 text-[9px] font-bold text-[#3d7482]">
                              {t.menu.frozenTag}
                            </span>
                          )}
                        </div>
                        <span className="absolute bottom-3.5 left-3.5 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1.5 text-[9px] font-bold text-[#51465a]">
                          <span className={`h-2 w-2 rounded-[2px] border ${product.vegetarian ? "border-[#598647]" : "border-[#b14b3f]"}`}>
                            <span className={`m-[2px] block h-1 w-1 rounded-full ${product.vegetarian ? "bg-[#598647]" : "bg-[#b14b3f]"}`} />
                          </span>
                          {product.vegetarian ? t.menu.vegetarian : t.menu.nonVegetarian}
                        </span>
                        <button
                          type="button"
                          onClick={() => setDetailProduct(product)}
                          className="absolute bottom-3 right-3 grid h-9 w-9 translate-y-2 place-items-center rounded-full bg-white/95 text-[#35153b] opacity-0 shadow transition duration-300 hover:rotate-45 focus:translate-y-0 focus:opacity-100 group-hover:translate-y-0 group-hover:opacity-100"
                          aria-label={`${t.menu.moreAbout} ${displayProduct.name}`}
                        >
                          <ArrowUpRight size={16} />
                        </button>
                      </div>
                      <div className="p-4">
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <span className="text-[9px] font-bold uppercase tracking-[0.13em] text-[#897b90]">{displayProduct.cuisine}</span>
                          <span className="text-[10px] text-[#766b7d]">{product.pack}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setDetailProduct(product)}
                          className="text-left"
                        >
                          <h3 className="serif text-[21px] leading-tight text-[#35153b] transition-colors group-hover:text-[#712a82]">{displayProduct.name}</h3>
                        </button>
                        <p className="mt-2 min-h-[39px] text-[11px] leading-[1.65] text-[#766b7d]">{displayProduct.description}</p>
                        <div className="mt-4 flex items-center justify-between border-t border-[#e9e1ef] pt-3.5">
                          <p className="text-sm font-extrabold text-[#35153b]">{formatPrice(product.price)} <span className="text-[10px] font-medium text-[#766b7d]">/ {product.pack}</span></p>
                          {bag[product.id] ? (
                            <span className="anim-pop-in flex items-center gap-2 rounded-full bg-[#f8f4fa] px-1.5 py-1">
                              <button type="button" onClick={() => updateBag(product.id, -1)} className="grid h-6 w-6 place-items-center rounded-full bg-white transition active:scale-75" aria-label={`${t.menu.removeOne} ${displayProduct.name}`}><Minus size={12} /></button>
                              <span key={bag[product.id]} className="anim-bump min-w-[12px] text-center text-xs font-bold">{bag[product.id]}</span>
                              <button
                                type="button"
                                onClick={(e) => { flyToBag(e.currentTarget); updateBag(product.id, 1); }}
                                className="grid h-6 w-6 place-items-center rounded-full bg-[#712a82] text-white transition active:scale-75"
                                aria-label={`${t.menu.addOne} ${displayProduct.name}`}
                              ><Plus size={12} /></button>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => { flyToBag(e.currentTarget); updateBag(product.id, 1); }}
                              className="grid h-8 w-8 place-items-center rounded-full border border-[#e1d4e7] text-[#35153b] transition duration-200 hover:rotate-90 hover:scale-110 hover:border-[#712a82] hover:bg-[#712a82] hover:text-white active:scale-90"
                              aria-label={`${t.menu.addToBag} ${displayProduct.name}`}
                            >
                              <Plus size={15} />
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  </div>
                );
              })}
            </div>
          )}
          <div className="mt-8 flex flex-col items-start justify-between gap-3 rounded-2xl bg-[#efeadb] px-5 py-4 sm:flex-row sm:items-center sm:px-6">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white text-[#78834d]"><Check size={16} /></span>
              <p className="text-xs leading-5 text-[#5f5c52]">
                <span className="font-bold text-[#333229]">{t.menu.headsUp}</span>{" "}
                {t.menu.minimum} {minimumOrderGrams / 1000} kg · {t.menu.orderAhead} {advanceOrderHours} {t.promo.hoursAhead}.
              </p>
            </div>
            <span className="shrink-0 text-[10px] font-semibold text-[#6d6a61]">{t.menu.pricesInInr}</span>
          </div>
        </section>
      )}

      {showProducts && (
        <section id="order" className="scroll-mt-24 bg-[#fbf8f2] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
          <div className="mx-auto max-w-[1320px]">
            <Reveal className="mb-10 max-w-2xl">
              <p className="eyebrow mb-3 text-[10px] font-bold uppercase tracking-[0.19em] text-[#712a82]">{t.bulk.eyebrow}</p>
              <h2 className="serif text-4xl leading-[1.06] text-[#35153b] sm:text-5xl">{t.bulk.title}</h2>
              <p className="mt-4 text-sm leading-6 text-[#766b7d]">
                {t.bulk.description}
              </p>
            </Reveal>

            <form onSubmit={placeBulkOrder} className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-3xl border border-[#e9e1ef] bg-white p-5 sm:p-7">
                <h3 className="serif mb-6 text-2xl text-[#35153b]">{t.bulk.deliveryDetails}</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="bulk-name" className="mb-1.5 block text-xs font-bold text-[#51465a]">{t.bulk.name}</label>
                    <input
                      id="bulk-name"
                      autoComplete="name"
                      required
                      minLength={2}
                      maxLength={120}
                      value={bulkForm.name}
                      onChange={(event) => setBulkForm((current) => ({ ...current, name: event.target.value }))}
                      className="w-full rounded-xl border border-[#e9e1ef] px-3.5 py-3 text-sm outline-none transition focus:border-[#712a82]"
                    />
                  </div>
                  <div>
                    <label htmlFor="bulk-phone" className="mb-1.5 block text-xs font-bold text-[#51465a]">{t.bulk.mobile}</label>
                    <input
                      id="bulk-phone"
                      autoComplete="tel"
                      inputMode="numeric"
                      maxLength={10}
                      pattern="[0-9]{10}"
                      minLength={10}
                      placeholder="98XXXXXXXX"
                      required
                      value={bulkForm.phone}
                      onChange={(event) => setBulkForm((current) => ({ ...current, phone: event.target.value.replace(/\D/g, "").slice(0, 10) }))}
                      className="w-full rounded-xl border border-[#e9e1ef] px-3.5 py-3 text-sm outline-none transition focus:border-[#712a82]"
                    />
                  </div>
                  <div>
                    <label htmlFor="bulk-date" className="mb-1.5 block text-xs font-bold text-[#51465a]">{t.bulk.deliveryDate}</label>
                    <input
                      id="bulk-date"
                      type="date"
                      required
                      value={bulkForm.deliveryDate}
                      onChange={(event) => setBulkForm((current) => ({ ...current, deliveryDate: event.target.value }))}
                      className="w-full rounded-xl border border-[#e9e1ef] px-3.5 py-3 text-sm outline-none transition focus:border-[#712a82]"
                    />
                  </div>
                  <div>
                    <label htmlFor="bulk-area" className="mb-1.5 block text-xs font-bold text-[#51465a]">{t.bulk.area}</label>
                    <select
                      id="bulk-area"
                      value={bulkForm.area}
                      onChange={(event) => setBulkForm((current) => ({ ...current, area: event.target.value }))}
                      className="w-full rounded-xl border border-[#e9e1ef] bg-white px-3.5 py-3 text-sm outline-none transition focus:border-[#712a82]"
                    >
                      <option value="Gurugram">{t.bulk.gurugram}</option>
                      <option value="Noida">{t.bulk.noida}</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="bulk-address" className="mb-1.5 block text-xs font-bold text-[#51465a]">{t.bulk.address}</label>
                    <input
                      id="bulk-address"
                      autoComplete="street-address"
                      required
                      minLength={10}
                      maxLength={2000}
                      value={bulkForm.address}
                      onChange={(event) => setBulkForm((current) => ({ ...current, address: event.target.value }))}
                      className="w-full rounded-xl border border-[#e9e1ef] px-3.5 py-3 text-sm outline-none transition focus:border-[#712a82]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="bulk-note" className="mb-1.5 block text-xs font-bold text-[#51465a]">{t.bulk.note}</label>
                    <textarea
                      id="bulk-note"
                      maxLength={500}
                      rows={3}
                      value={bulkForm.note}
                      onChange={(event) => setBulkForm((current) => ({ ...current, note: event.target.value }))}
                      className="w-full resize-y rounded-xl border border-[#e9e1ef] px-3.5 py-3 text-sm outline-none transition focus:border-[#712a82]"
                    />
                  </div>
                </div>
                <p className="mt-5 text-[11px] leading-5 text-[#766b7d]">
                  {t.bulk.payment}
                </p>
              </div>

              <div className="relative min-h-[420px] overflow-hidden rounded-3xl border border-[#e9e1ef] bg-[#35153b] sm:min-h-[520px] lg:min-h-[640px]">
                {language === "hi" ? (
                  <div
                    role="img"
                    aria-label={t.bulk.imageAlt}
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url('${products[0].image}')` }}
                  />
                ) : (
                  <Image
                    src="/brand/banner-poster.jpeg"
                    alt={t.bulk.imageAlt}
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover object-[center_48%]"
                  />
                )}
              </div>

              <div className="lg:col-span-2">
                {bulkError && (
                  <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{bulkError}</p>
                )}
                <button
                  type="submit"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#712a82] px-7 py-3 text-sm font-bold text-white transition hover:bg-[#35153b] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {t.bulk.sendRequest}
                  <ArrowUpRight size={16} />
                </button>
                <p className="mt-3 text-[11px] leading-5 text-[#766b7d]">{t.bulk.followUp}</p>
              </div>
            </form>
          </div>
        </section>
      )}

      {(isHome || page === "whyUs") && <WhyUs copy={t} />}
      {(isHome || page === "whatsNew") && <WhatsNew copy={t} />}

      {isHome && <HowItWorks copy={t} />}

      {showAbout && (
        <section id="story" className="scroll-mt-24 mx-auto grid max-w-[1320px] items-center gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1fr_0.95fr] lg:gap-20 lg:px-12 lg:py-24">
          <Reveal className="relative mx-auto w-full max-w-[550px]">
            <div className="food-photo relative aspect-[1.2/1] rounded-[26px] bg-[#e8ddc8]" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1200&q=85')" }} role="img" aria-label={t.story.imageAlt}>
              <div className="absolute bottom-4 left-4 w-[104px] overflow-hidden rounded-xl border-2 border-white/80 shadow-lg sm:bottom-5 sm:left-5 sm:w-[120px]">
                <Image src="/brand/mood-food-logo-new.png" alt={t.story.logoAlt} width={956} height={768} className="h-auto w-full" />
              </div>
            </div>
            <div className="anim-float absolute -bottom-4 -right-2 grid h-[116px] w-[116px] place-items-center rounded-full border-[5px] border-[#fff] bg-[#eee2f2] text-center sm:-right-4 sm:h-[136px] sm:w-[136px]">
              <div>
                <span className="block animate-spin text-2xl" style={{ animationDuration: "10s" }}>✳</span>
                <span className="mt-1 block whitespace-pre-line text-[9px] font-extrabold uppercase leading-4 tracking-[0.12em] text-[#51465a]">{t.story.stamp}</span>
              </div>
            </div>
          </Reveal>
          <Reveal delay={150} className="max-w-lg pt-3 lg:pt-0">
            <p className="eyebrow mb-3 flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.19em] text-[#712a82]">{t.story.eyebrow}</p>
            <h2 className="serif text-4xl leading-[1.08] sm:text-5xl">{t.story.title} <span className="italic text-[#712a82]">{t.story.emphasized}</span></h2>
            <p className="mt-5 text-sm leading-7 text-[#766b7d]">{t.story.paragraphOne}</p>
            <p className="mt-4 text-sm leading-7 text-[#766b7d]">{t.story.paragraphTwo}</p>
          </Reveal>
        </section>
      )}
      {(isHome || page === "cuisines") && <Cuisines copy={t} />}

      {isHome && <Testimonials copy={t} />}

      {isHome && (
        <section className="px-5 pb-16 sm:px-8 sm:pb-20 lg:px-12">
          <Reveal>
            <div className="relative mx-auto max-w-[1320px] overflow-hidden rounded-[26px] bg-[#f2eaf5]">
              <div className="absolute inset-0 grain opacity-40" />
              <div className="relative grid items-center gap-8 p-6 sm:p-10 md:grid-cols-[1fr_0.75fr] md:p-12 lg:px-16 lg:py-14">
                <div>
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.19em] text-[#897b90]">{t.frozen.eyebrow}</p>
                  <h2 className="serif max-w-lg text-3xl leading-tight sm:text-4xl">{t.frozen.title}</h2>
                  <p className="mt-4 max-w-md text-sm leading-6 text-[#766b7d]">{t.frozen.description}</p>
                  <a href="#frozen-menu" className="btn-shine mt-6 inline-flex items-center gap-2 rounded-full bg-[#fff] px-5 py-3 text-xs font-bold text-[#35153b] transition hover:-translate-y-0.5 hover:bg-white hover:shadow-lg">
                    {t.frozen.button} <ArrowDown size={14} className="animate-bounce" />
                  </a>
                </div>
                <div id="frozen-menu" className="anim-float-slow relative mx-auto aspect-[4/5] w-full max-w-[360px] rotate-1 overflow-hidden rounded-2xl shadow-[0_16px_45px_rgba(54,39,20,0.18)] transition duration-500 hover:rotate-0 hover:scale-[1.03]">
                  {language === "hi" ? (
                    <div
                      role="img"
                      aria-label={t.frozen.imageAlt}
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url('${products[2].image}')` }}
                    />
                  ) : (
                    <Image src="/brand/frozen-menu.png" alt={t.frozen.imageAlt} width={720} height={900} className="h-auto w-full" />
                  )}
                  <div className="absolute right-3 top-3 animate-pulse rounded-full bg-white px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-wider text-[#358090] shadow">{t.frozen.comingSoon}</div>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      )}

      {isHome && <Faq copy={t} />}

      {isHome && (
        <section className="mx-auto max-w-[1320px] px-5 pb-16 sm:px-8 sm:pb-20 lg:px-12">
          <Reveal>
            <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#4a2477] via-[#6a3aa2] to-[#8a5cc4] px-6 py-11 text-white sm:px-10 sm:py-14 lg:px-16">
              <div className="absolute -right-10 -top-24 h-72 w-72 rounded-full border-[1px] border-white/20" />
              <div className="absolute -right-2 -top-16 h-56 w-56 rounded-full border-[1px] border-white/15" />
              <div className="relative flex flex-col justify-between gap-7 md:flex-row md:items-end">
                <div>
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#f6dc9a]">{t.cta.eyebrow}</p>
                  <h2 className="serif max-w-xl text-4xl leading-tight sm:text-5xl">{t.cta.title}</h2>
                  <p className="mt-4 text-sm text-white/80">{t.cta.description}</p>
                </div>
                <a href={whatsAppUrl(t.whatsapp.footerOrder)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 self-start rounded-full bg-[#f6dc9a] px-6 py-3.5 text-xs font-extrabold text-[#3a1462] transition hover:-translate-y-0.5 md:self-auto">
                  {t.cta.button} <ArrowUpRight size={15} />
                </a>
              </div>
            </div>
          </Reveal>
        </section>
      )}

      <footer className="relative overflow-hidden border-t border-[#e9e3d8] bg-[#5c3190]">
        <div className="mx-auto max-w-[1320px] px-5 pt-14 sm:px-8 lg:px-12">
          <div className="grid gap-10 pb-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
            <div>
              <BrandMark compact homeLabel={t.aria.home} imageAlt={t.story.logoAlt} />
              <div className="mt-4">
                <FssaiMark label={t.aria.fssaiLicense} />
              </div>
              <p className="mt-4 max-w-xs text-xs leading-6 text-[#fff]">{t.footer.description}</p>
              <div className="mt-5 flex items-center gap-2">
                {[
                  { href: whatsAppUrl(t.whatsapp.hello), label: "WhatsApp", icon: <WhatsAppIcon size={16} /> },
                  { href: contact.instagram, label: "Instagram", icon: <InstagramIcon size={16} /> },
                  { href: contact.facebook, label: "Facebook", icon: <FacebookIcon size={16} /> },
                ].map((social) => (
                  <a key={social.label} href={social.href} target="_blank" rel="noopener noreferrer" aria-label={social.label} className="grid h-10 w-10 place-items-center rounded-full border border-[#f6dc9a]/40 text-[#f6dc9a] transition hover:-translate-y-0.5 hover:bg-[#f6dc9a] hover:text-[#4a2477]">
                    {social.icon}
                  </a>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                {t.footer.chips.map((chip) => (
                  <span key={chip} className="rounded-full bg-[#ffffff]/12 px-3 py-1.5 text-[10px] font-semibold text-[#f6dc9a]">{chip}</span>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-4 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#f6dc9a]">{t.footer.explore}</p>
              <div className="grid gap-3 text-xs text-[#fff]">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href} className="transition hover:text-[#f6dc9a]">{link.label}</Link>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-4 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#f6dc9a]">{t.footer.menu}</p>
              <div className="grid gap-3 text-xs text-[#fff]">
                {["Kebabs", "Marinades", "Curries", "Snacks"].map((item) => (
                  <Link key={item} href="/products" className="transition hover:text-[#f6dc9a]">{localizeProductText(item, language)}</Link>
                ))}
                <Link href="/#frozen-menu" className="transition hover:text-[#f6dc9a]">{t.footer.frozenMenu}</Link>
              </div>
            </div>

            <div>
              <p className="mb-4 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#f6dc9a]">{t.footer.sayHello}</p>
              <div className="grid gap-3 text-xs text-[#fff]">
                {[
                  { href: whatsAppUrl(t.whatsapp.hello), label: t.footer.whatsappUs, icon: <WhatsAppIcon size={15} />, external: true },
                  { href: "tel:+919599944745", label: "+91 95999 44745", icon: <Phone size={15} /> },
                  { href: "mailto:hello@moodfood.com", label: "hello@moodfood.com", icon: <Mail size={15} /> },
                  { href: contact.instagram, label: "@mood.foodworld", icon: <InstagramIcon size={15} />, external: true },
                  { href: contact.facebook, label: "Facebook", icon: <FacebookIcon size={15} />, external: true },
                ].map((item) => (
                  <a key={item.label} href={item.href} {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="group flex items-center gap-3 transition hover:text-[#f6dc9a]">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-[#ffffff]/15 text-[#f6dc9a] transition group-hover:bg-[#f6dc9a] group-hover:text-[#4a2477]">{item.icon}</span>
                    {item.label}
                  </a>
                ))}
              </div>
              <p className="mt-5 flex items-start gap-2 text-[11px] leading-5 text-[#fff]/80">
                <Truck size={14} className="mt-0.5 shrink-0 text-[#f6dc9a]" /> {t.footer.deliveryArea}
              </p>
            </div>
          </div>
        </div>

        <p aria-hidden="true" className="serif pointer-events-none select-none whitespace-nowrap text-center text-[clamp(4rem,15vw,13rem)] leading-[0.8] text-[#ffffff]/[0.07]">Mood Food</p>

        <div className="relative border-t border-[#f6dc9a]/25 px-5 py-4 text-center text-[13px] text-[#fff]">
          {t.footer.copyright}
        </div>
      </footer>

      <a
        href={whatsAppUrl(t.whatsapp.placeOrder)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t.aria.whatsapp}
        className="floating-whatsapp"
      >
        <WhatsAppIcon size={28} />
      </a>

      {bagOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button type="button" className="anim-fade-in absolute inset-0 bg-[#35153b]/50 backdrop-blur-[2px]" onClick={() => setBagOpen(false)} aria-label={t.aria.closeShoppingBag} />
          <aside className="anim-slide-right relative flex h-full w-full max-w-[440px] flex-col bg-[#fff] shadow-2xl" aria-label={t.aria.shoppingBag}>
            <div className="flex items-center justify-between border-b border-[#e9e1ef] px-5 py-5 sm:px-7">
              <div><p className="serif text-2xl">{t.bag.title}</p><p className="mt-1 text-[11px] text-[#766b7d]">{bagCount} {bagCount === 1 ? t.bag.item : t.bag.items}</p></div>
              <button type="button" onClick={() => setBagOpen(false)} aria-label={t.bag.close} className="grid h-9 w-9 place-items-center rounded-full border border-[#e9e1ef] transition hover:rotate-90 hover:bg-[#f5f0f8]"><X size={17} /></button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-7">
              {bagItems.length === 0 ? (
                <div className="grid h-full content-center justify-items-center text-center">
                  <span className="anim-float grid h-16 w-16 place-items-center rounded-full bg-[#f4eff7] text-[#712a82]"><ShoppingBag size={24} /></span>
                  <p className="serif mt-5 text-2xl">{t.bag.emptyTitle}</p>
                  <p className="mt-2 text-xs text-[#766b7d]">{t.bag.emptyDescription}</p>
                  <button type="button" onClick={() => setBagOpen(false)} className="btn-shine mt-6 rounded-full bg-[#712a82] px-5 py-3 text-xs font-bold text-white transition hover:-translate-y-0.5 active:scale-95">{t.bag.exploreMenu}</button>
                </div>
              ) : (
                <div className="divide-y divide-[#e9e1ef]">
                  {bagItems.map((product, i) => {
                    const displayProduct = localizeProduct(product, language);
                    return (
                    <div className="anim-fade-up flex items-center gap-3 py-4" style={d(i * 60)} key={product.id}>
                      <div className="food-photo h-[66px] w-[66px] shrink-0 rounded-xl bg-[#f2eaf5]" style={{ backgroundImage: `url('${product.image}')` }} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold">{displayProduct.name}</p>
                        <p className="mt-1 text-[10px] text-[#766b7d]">{product.pack} · {formatPrice(product.price)}</p>
                        <div className="mt-2 flex w-fit items-center gap-3 rounded-full border border-[#e9e1ef] px-2 py-1">
                          <button type="button" className="transition active:scale-75" onClick={() => updateBag(product.id, -1)} aria-label={`${t.menu.removeOne} ${displayProduct.name}`}><Minus size={12} /></button>
                          <span key={bag[product.id]} className="anim-bump text-[11px] font-bold">{bag[product.id]}</span>
                          <button type="button" className="transition active:scale-75" onClick={() => updateBag(product.id, 1)} aria-label={`${t.menu.addOne} ${displayProduct.name}`}><Plus size={12} /></button>
                        </div>
                      </div>
                      <span className="text-xs font-bold">{formatPrice(product.price * bag[product.id])}</span>
                    </div>
                    );
                  })}
                </div>
              )}
            </div>
            {bagItems.length > 0 && (
              <div className="border-t border-[#e9e1ef] bg-[#fff] px-5 py-5 sm:px-7">
                <div className="mb-3 flex justify-between text-sm"><span className="text-[#766b7d]">{t.bag.subtotal}</span><span key={bagTotal} className="anim-bump font-bold">{formatPrice(bagTotal)}</span></div>
                <p className={`mb-4 flex items-center gap-2 text-[11px] ${bagGrams >= minimumOrderGrams ? "text-[#637544]" : "text-[#897b90]"}`}>
                  {bagGrams >= minimumOrderGrams ? <Check size={14} className="anim-pop-in" /> : <ArrowLeft size={14} />}
                  {bagGrams >= minimumOrderGrams
                    ? t.bag.minimumReached
                    : t.bag.moreToMinimum.replace("{kg}", ((minimumOrderGrams - bagGrams) / 1000).toFixed(1))}
                </p>
                {checkoutOpen ? (
                  <form onSubmit={placeOrder} className="anim-fade-up grid gap-3">
                    <p className="mb-1 text-xs font-bold">{t.checkout.deliveryPrompt}</p>
                    <label className="grid gap-1.5 text-[10px] font-bold text-[#51465a]">{t.checkout.name}
                      <input required minLength={2} maxLength={120} value={checkoutName} onChange={(event) => setCheckoutName(event.target.value)} className="rounded-lg border border-[#e9e1ef] bg-white px-3 py-2.5 text-xs outline-none transition focus:border-[#712a82] focus:shadow-[0_0_0_3px_rgba(113,42,130,0.12)]" placeholder={t.checkout.namePlaceholder} />
                    </label>
                    <label className="grid gap-1.5 text-[10px] font-bold text-[#51465a]">{t.checkout.mobile}
                      <div className="flex overflow-hidden rounded-lg border border-[#e9e1ef] bg-white transition focus-within:border-[#712a82] focus-within:shadow-[0_0_0_3px_rgba(113,42,130,0.12)]"><span className="grid place-items-center border-r border-[#e9e1ef] px-2.5 text-[10px] text-[#766b7d]">+91</span><input type="tel" inputMode="numeric" pattern="[0-9]{10}" maxLength={10} required value={checkoutPhone} onChange={(event) => setCheckoutPhone(event.target.value.replace(/\D/g, ""))} className="min-w-0 flex-1 px-3 py-2.5 text-xs outline-none" placeholder={t.checkout.mobilePlaceholder} /></div>
                    </label>
                    <label className="grid gap-1.5 text-[10px] font-bold text-[#51465a]">{t.checkout.address}
                      <textarea required minLength={10} maxLength={2000} rows={2} value={deliveryAddress} onChange={(event) => setDeliveryAddress(event.target.value)} className="resize-y rounded-lg border border-[#e9e1ef] bg-white px-3 py-2.5 text-xs outline-none transition focus:border-[#712a82] focus:shadow-[0_0_0_3px_rgba(113,42,130,0.12)]" placeholder={t.checkout.addressPlaceholder} />
                    </label>
                    <label className="grid gap-1.5 text-[10px] font-bold text-[#51465a]">{t.checkout.deliveryTime}
                      <input type="datetime-local" required min={minimumDeliveryDateTimeLocal()} value={deliveryAt} onChange={(event) => setDeliveryAt(event.target.value)} className="rounded-lg border border-[#e9e1ef] bg-white px-3 py-2.5 text-xs outline-none transition focus:border-[#712a82] focus:shadow-[0_0_0_3px_rgba(113,42,130,0.12)]" />
                    </label>
                    <label className="grid gap-1.5 text-[10px] font-bold text-[#51465a]">{t.checkout.anythingElse} <span className="font-normal text-[#766b7d]">{t.checkout.optional}</span>
                      <input maxLength={1000} value={customerNote} onChange={(event) => setCustomerNote(event.target.value)} className="rounded-lg border border-[#e9e1ef] bg-white px-3 py-2.5 text-xs outline-none transition focus:border-[#712a82] focus:shadow-[0_0_0_3px_rgba(113,42,130,0.12)]" placeholder={t.checkout.notePlaceholder} />
                    </label>
                    {orderError && <p role="alert" className="anim-shake rounded-lg bg-[#fbefeb] px-3 py-2 text-[10px] leading-4 text-[#815287]">{orderError}</p>}
                    <button type="submit" disabled={orderSubmitting} className="btn-shine mt-1 flex w-full items-center justify-center gap-2 rounded-full bg-[#712a82] py-3.5 text-xs font-extrabold text-white transition hover:bg-[#54205c] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60">
                      {orderSubmitting ? t.checkout.saving : <>{t.checkout.placeOrder} <ArrowRight size={15} /></>}
                    </button>
                    <p className="text-center text-[10px] leading-4 text-[#766b7d]">{t.checkout.confirmation}</p>
                  </form>
                ) : (
                  <button type="button" onClick={orderOnWhatsApp} disabled={bagGrams < minimumOrderGrams} className={`btn-shine flex w-full items-center justify-center gap-2 rounded-full bg-[#712a82] py-3.5 text-xs font-extrabold text-white transition hover:bg-[#54205c] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-[#b9a7c2] ${bagGrams >= minimumOrderGrams ? "anim-glow" : ""}`}>
                    {t.checkout.addDeliveryDetails} <ArrowRight size={15} />
                  </button>
                )}
                {!checkoutOpen && <p className="mt-3 text-center text-[10px] leading-4 text-[#766b7d]">{t.checkout.advanceNotice.replace("{hours}", String(advanceOrderHours))}</p>}
              </div>
            )}
          </aside>
        </div>
      )}  

      {localizedDetailProduct && (
        <div className="anim-fade-in fixed inset-0 z-[60] grid place-items-center overflow-y-auto bg-[#35153b]/55 p-4 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-labelledby="product-dialog-title">
          <div className="anim-pop-in relative my-auto grid w-full max-w-[720px] overflow-hidden rounded-[24px] bg-[#fff] shadow-2xl sm:grid-cols-2">
            <button type="button" onClick={() => setDetailProduct(null)} aria-label={t.aria.closeProduct} className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/90 transition hover:rotate-90"><X size={17} /></button>
            <div className="food-photo anim-kenburns min-h-[230px] bg-[#f2eaf5] sm:min-h-[380px]" style={{ backgroundImage: `url('${localizedDetailProduct.image}')` }} />
            <div className="flex flex-col p-6 sm:p-8">
              <span className="anim-fade-up text-[10px] font-bold uppercase tracking-[0.15em] text-[#712a82]" style={d(100)}>{localizedDetailProduct.cuisine} · {localizedDetailProduct.category}</span>
              <h2 id="product-dialog-title" className="serif anim-fade-up mt-3 text-3xl" style={d(180)}>{localizedDetailProduct.name}</h2>
              <p className="anim-fade-up mt-3 text-sm leading-6 text-[#766b7d]" style={d(260)}>{localizedDetailProduct.description}</p>
              <div className="anim-fade-up mt-5 grid gap-2 rounded-xl bg-[#f9f6fb] p-4 text-xs text-[#51465a]" style={d(340)}>
                <p><span className="font-bold text-[#35153b]">{t.productDetails.foodType}</span> {localizedDetailProduct.vegetarian ? t.productDetails.vegetarian : t.productDetails.nonVegetarian}</p>
                <p><span className="font-bold text-[#35153b]">{t.productDetails.storage}</span> {localizedDetailProduct.frozen ? t.productDetails.keepFrozen : t.productDetails.fresh}</p>
                <p><span className="font-bold text-[#35153b]">{t.productDetails.pack}</span> {localizedDetailProduct.pack}</p>
                {localizedDetailProduct.ingredients && <p><span className="font-bold text-[#35153b]">{t.productDetails.ingredients}</span> {localizedDetailProduct.ingredients}</p>}
                {localizedDetailProduct.nutrition ? (
                  <p><span className="font-bold text-[#35153b]">{t.productDetails.nutrition}</span> {localizedDetailProduct.nutrition.caloriesKcal} {t.productDetails.calories} · {localizedDetailProduct.nutrition.proteinGrams} {t.productDetails.protein} · {localizedDetailProduct.nutrition.carbohydratesGrams} {t.productDetails.carbohydrates} · {localizedDetailProduct.nutrition.fatGrams} {t.productDetails.fat}</p>
                ) : (
                  <p className="pt-1 text-[10px] leading-4 text-[#766b7d]">{t.productDetails.nutritionNote}</p>
                )}
              </div>
              <div className="mt-auto flex items-center justify-between gap-3 pt-6">
                <span className="text-lg font-extrabold">{formatPrice(localizedDetailProduct.price)} <span className="text-[10px] font-medium text-[#766b7d]">/ {localizedDetailProduct.pack}</span></span>
                <button type="button" onClick={() => { updateBag(localizedDetailProduct.id, 1); setDetailProduct(null); setBagOpen(true); }} className="btn-shine inline-flex items-center gap-2 rounded-full bg-[#712a82] px-4 py-3 text-xs font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#54205c] active:scale-95"><Plus size={14} /> {t.productDetails.addToBag}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {accountOpen && (
        <div className="anim-fade-in fixed inset-0 z-[60] grid place-items-center bg-[#35153b]/55 p-4 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-labelledby="account-dialog-title">
          <div className="anim-pop-in relative w-full max-w-[420px] rounded-[24px] bg-[#fff] p-6 shadow-2xl sm:p-8">
            <button type="button" onClick={closeAccount} aria-label={t.aria.closeSignIn} className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-[#e9e1ef] transition hover:rotate-90"><X size={16} /></button>
            <span className="anim-float grid h-12 w-12 place-items-center rounded-full bg-[#f4eff7] text-[#712a82]"><ShoppingBag size={20} /></span>

            {signedInPhone ? (
              <>
                <h2 id="account-dialog-title" className="serif mt-5 text-3xl">{t.accountDialog.signedIn}</h2>
                <p className="mt-2 text-sm leading-6 text-[#766b7d]">{t.accountDialog.signedInAs} +91 {signedInPhone}.</p>
                <button
                  type="button"
                  onClick={closeAccount}
                  className="btn-shine mt-6 w-full rounded-full bg-[#712a82] py-3.5 text-xs font-extrabold text-white transition hover:bg-[#54205c] active:scale-[0.98]"
                >
                  {t.accountDialog.continue}
                </button>
              </>
            ) : (
              <>
                <h2 id="account-dialog-title" className="serif mt-5 text-3xl">{t.accountDialog.welcome}</h2>
                <p className="mt-2 text-sm leading-6 text-[#766b7d]">
                  {otpSent
                    ? t.accountDialog.enterCode.replace("{phone}", phone)
                    : t.accountDialog.signInDescription}
                </p>

                {!otpSent ? (
                  <form onSubmit={requestOtp} className="anim-fade-up mt-6">
                    <label htmlFor="mobile" className="mb-2 block text-xs font-bold text-[#51465a]">{t.accountDialog.mobile}</label>
                    <div className="flex overflow-hidden rounded-xl border border-[#e9e1ef] bg-white transition focus-within:border-[#712a82] focus-within:shadow-[0_0_0_3px_rgba(113,42,130,0.12)]">
                      <span className="grid place-items-center border-r border-[#e9e1ef] px-3 text-xs font-semibold text-[#766b7d]">+91</span>
                      <input id="mobile" type="tel" inputMode="numeric" autoComplete="tel-national" pattern="[0-9]{10}" maxLength={10} required value={phone} onChange={(event) => setPhone(event.target.value.replace(/\D/g, ""))} placeholder={t.accountDialog.mobilePlaceholder} className="min-w-0 flex-1 px-3 py-3 text-sm outline-none" />
                    </div>
                    <button type="submit" disabled={otpLoading} className="btn-shine mt-4 w-full rounded-full bg-[#712a82] py-3.5 text-xs font-extrabold text-white transition hover:bg-[#54205c] active:scale-[0.98] disabled:opacity-60">{otpLoading ? t.accountDialog.sending : t.accountDialog.sendCode}</button>
                    {otpMessage && <p role="status" className="anim-fade-up mt-3 rounded-xl bg-[#f9f6fb] p-3 text-xs leading-5 text-[#51465a]">{otpMessage}</p>}
                    <p className="mt-4 text-center text-[10px] leading-4 text-[#766b7d]">{t.accountDialog.codeAgreement}</p>
                  </form>
                ) : (
                  <form onSubmit={verifyOtp} className="anim-fade-up mt-6">
                    {otpMessage && <p role="status" className="mb-4 rounded-xl bg-[#f9f6fb] p-3 text-xs leading-5 text-[#51465a]">{otpMessage}</p>}
                    <label htmlFor="otp" className="mb-2 block text-xs font-bold text-[#51465a]">{t.accountDialog.codeLabel}</label>
                    <input
                      id="otp"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      pattern="[0-9]{4}"
                      maxLength={4}
                      required
                      value={otpCode}
                      onChange={(event) => setOtpCode(event.target.value.replace(/\D/g, ""))}
                      placeholder="1234"
                      className="w-full rounded-xl border border-[#e9e1ef] bg-white px-3 py-3 text-center text-lg font-bold tracking-[0.5em] outline-none transition focus:border-[#712a82] focus:shadow-[0_0_0_3px_rgba(113,42,130,0.12)]"
                    />
                    <button type="submit" disabled={otpLoading || otpCode.length !== 4} className="btn-shine mt-4 w-full rounded-full bg-[#712a82] py-3.5 text-xs font-extrabold text-white transition hover:bg-[#54205c] active:scale-[0.98] disabled:opacity-60">{otpLoading ? t.accountDialog.verifying : t.accountDialog.verify}</button>
                    <div className="mt-4 flex items-center justify-between text-[11px] font-bold text-[#712a82]">
                      <button type="button" onClick={() => { setOtpSent(false); setOtpCode(""); setOtpMessage(""); }}>{t.accountDialog.changeNumber}</button>
                      <button type="button" disabled={otpLoading} onClick={() => void requestOtp()}>{t.accountDialog.resendCode}</button>
                    </div>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}