// cart-unit-price.js — VapeZone
// Muestra el precio POR PIEZA real (según modelo + rango de piezas del catálogo)
// en cada línea del carrito, en vez de calcularlo dividiendo total/cantidad.

(function () {

  // ---------------------------------------------------------------
  // 1) TABLA DE PRECIOS POR MODELO
  // ---------------------------------------------------------------

  // 🔀 INTERRUPTOR: true = catálogo con descuento vigente (15%/10% off)
  //                 false = catálogo a precio completo
  const DISCOUNT_ACTIVE = true;

  const DISCOUNT_VARIANTS = {
    "NOVABAR 35K": {
      active:   [[1,9,340],[10,49,170],[50,149,165],[150,300,161]],
      inactive: [[1,9,400],[10,49,200],[50,149,195],[150,300,190]],
    },
    "NEXA PIX": {
      active:   [[1,9,340],[10,49,195],[50,149,191],[150,300,187]],
      inactive: [[1,9,400],[10,49,230],[50,149,225],[150,300,220]],
    },
    "FASTA 35000": {
      active:   [[1,9,315],[10,49,207],[50,149,202],[150,300,198]],
      inactive: [[1,9,350],[10,49,230],[50,149,225],[150,300,220]],
    },
  };

  const PRICE_TABLE = {
    "NOVABAR 35K": DISCOUNT_ACTIVE ? DISCOUNT_VARIANTS["NOVABAR 35K"].active : DISCOUNT_VARIANTS["NOVABAR 35K"].inactive,
    "NEXA PIX": DISCOUNT_ACTIVE ? DISCOUNT_VARIANTS["NEXA PIX"].active : DISCOUNT_VARIANTS["NEXA PIX"].inactive,
    "FASTA 35000": DISCOUNT_ACTIVE ? DISCOUNT_VARIANTS["FASTA 35000"].active : DISCOUNT_VARIANTS["FASTA 35000"].inactive,

    // ---- IPLAY ----
    "IPLAY PRO MAX": [[1,9,400],[10,49,245],[50,149,240],[150,300,235]],
    "IPLAY MAX": [[1,9,220],[10,300,125]],
    "IPLAY XBOX EDICION MUNDIAL": [[1,9,350],[10,49,190],[50,149,185],[150,300,180]],
    "IPLAY XBOX NP": [[1,9,250],[10,null,150]],
    "IPLAY BIG MAX": [[1,9,250],[10,null,190]],
    "IPLAY SLURP": [[1,9,200],[10,1000,135]],
    "IPLAY BANG": [[1,9,200],[10,1000,135]],
    "IPLAY ULIX": [[1,9,200],[10,1000,135]],
    "IPLAY VIBAR": [[1,9,200],[10,1000,135]],
    "IPLAY ECCO": [[1,9,200],[10,1000,135]],
    "IPLAY GHOST": [[1,9,250],[10,null,190]],
    "IPLAY XBOX PRO": [[1,9,350],[10,49,195],[50,149,190],[150,300,185]],
    "IPLAY WALKER": [[1,9,250],[10,null,190]],
    "IPLAY BURST": [[1,9,300],[10,49,210],[50,149,205],[150,300,200]],

    // ---- Otras marcas ----
    "BILLIONAIRE BOYS": [[1,9,200],[10,null,150]],
    "VHILL 3000": [[1,9,240],[10,49,140],[50,149,135],[150,300,130]],
    "VHILL 6000": [[1,9,300],[10,49,200],[50,149,195],[150,300,190]],
    "VHILL 12000": [[1,9,400],[10,10,245]],
    "VHILL 32000": [[1,9,480]],

    "GEEK BAR PULSE X": [[1,9,350],[10,49,240],[50,149,235],[150,300,230]],
    "GEEK BAR PULSE": [[1,9,320],[10,49,210],[50,149,205],[150,300,200]],
    "X RETURNS": [[1,9,350],[10,49,240],[50,149,235],[150,300,230]],

    "TOMORO D20": [[1,9,400],[10,49,240],[50,149,235],[150,300,230]],
    "INSTABAR MEGA 80K": [[1,9,450],[10,49,270],[50,149,265],[150,300,260]],
    "VOOM METEOR 70K": [[1,9,400],[10,49,270],[50,149,265],[150,300,260]],

    "VFLY ZERO CLOUD": [[1,9,400],[10,49,240],[50,149,235],[150,300,230]],
    "VFLY": [[1,9,200],[10,null,150]],

    "WONDER G8": [[1,9,300],[10,1000,160]],
    "WONDER NEO": [[1,9,350],[10,1000,165]],

    "MUEKK 2.5K": [[1,9,250],[10,49,175],[50,149,170],[150,300,165]],
    "MUEKK MODEL X": [[1,9,300],[10,49,235],[50,149,230],[150,300,225]],

    "FLAWLSS": [[1,9,250],[10,49,180],[50,149,175],[150,300,170]],
    "AIR PUFF": [[1,9,250],[10,49,165],[50,149,160],[150,300,155]],

    "DRAGBAR 3K": [[1,9,105],[10,300,105]],
    "DRAGBAR 6.5K": [[1,9,155],[10,300,155]],
    "SUPREME VAPE": [[1,9,150],[10,300,150]],
    "BAPE VAPE": [[1,9,150],[10,300,150]],
    "NORTH": [[1,9,145],[10,300,145]],
    "IJOY CAPTAIN": [[1,9,150],[10,300,150]],
    "HEYLO": [[1,9,145],[10,300,145]],
    "SKWEZED": [[1,9,145],[10,300,145]],
    "LANAVAPE AIRSHIP": [[1,9,150],[10,300,150]],
    "PACKSPOD": [[1,9,145],[10,300,145]],
    "POD MESH": [[1,9,145],[10,300,145]],
    "SPACE MAX": [[1,9,145],[10,300,145]],
    "SPACE PRO": [[1,9,145],[10,300,145]],
    "SNOWWOLF EASE": [[1,9,150],[10,300,150]],

    "NIKOT 4MG": [[1,9,160],[10,49,160],[50,149,110],[150,300,105]],
  };

  function normalize(str) {
    return str.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  }

  // Versión "compacta": sin espacios ni signos, para que "NOVA BAR 35K" y
  // "NOVABAR 35K" (o cualquier variación de espaciado) hagan match igual.
  function compact(str) {
    return normalize(str).replace(/[^A-Z0-9]/g, '');
  }

  // Precalcular claves compactas, ordenadas de más larga a más corta
  // (para que "VFLY ZERO CLOUD" gane sobre "VFLY" cuando ambas calzan)
  const COMPACT_KEYS = Object.keys(PRICE_TABLE)
    .map(function (key) { return { key: key, compact: compact(key) }; })
    .sort(function (a, b) { return b.compact.length - a.compact.length; });

  function findPriceTiers(productName) {
    const compactName = compact(productName);
    for (const entry of COMPACT_KEYS) {
      if (compactName.includes(entry.compact)) return PRICE_TABLE[entry.key];
    }
    return null;
  }

  function getUnitPrice(productName, qty) {
    const tiers = findPriceTiers(productName);
    if (!tiers) return null;
    for (const [min, max, price] of tiers) {
      if (qty >= min && (max === null || qty <= max)) return price;
    }
    return tiers[tiers.length - 1][2];
  }

  // ---------------------------------------------------------------
  // 2) LÓGICA DEL CARRITO
  // ---------------------------------------------------------------

  function addUnitPrices() {
    var itemEls = document.querySelectorAll('.ec-cart__item:not(.ec-cart-item--summary)');

    // 1) Sumar TODAS las piezas del carrito (sin importar modelo/sabor),
    //    porque el mayoreo se activa por el total del carrito, no por línea.
    var totalQty = 0;
    itemEls.forEach(function (itemEl) {
      var qtyEl = itemEl.querySelector('.ec-cart-item__count input') || itemEl.querySelector('.ec-cart-item__count');
      if (!qtyEl) return;
      var qty = parseInt(qtyEl.value || qtyEl.textContent);
      if (qty) totalQty += qty;
    });

    if (totalQty <= 1) return; // carrito con 1 sola pieza: no aplica mayoreo, no hay nada que mostrar

    // 2) Para cada línea, buscar el precio de SU modelo al nivel del total del carrito
    itemEls.forEach(function (itemEl) {
      if (itemEl.querySelector('.vz-unit-price')) return;

      var titleEl = itemEl.querySelector('.ec-cart-item__title');
      if (!titleEl) return;

      var productName = titleEl.textContent.trim();
      var unitPrice = getUnitPrice(productName, totalQty);
      if (unitPrice === null) return; // modelo no está en la tabla, no mostramos nada

      var priceEl = itemEl.querySelector('.ec-cart-item__price-inner');
      if (!priceEl) return;

      var tag = document.createElement('div');
      tag.className = 'vz-unit-price';
      tag.style.cssText = 'font-size:12px;color:#888;text-align:right;margin-top:3px;';
      tag.textContent = '$' + unitPrice.toLocaleString('es-MX', { minimumFractionDigits: 2 }) + ' c/u';
      priceEl.parentNode.appendChild(tag);
    });
  }

  function waitForCart() {
    var items = document.querySelectorAll('.ec-cart__item:not(.ec-cart-item--summary)');
    if (items.length > 0) {
      addUnitPrices();
    } else {
      setTimeout(waitForCart, 500);
    }
  }

  // Ejecutar inmediatamente al cargar (por si el carrito ya está abierto)
  setTimeout(waitForCart, 1000);

  // Registrar para navegación futura dentro de Ecwid
  if (typeof Ecwid !== 'undefined') {
    Ecwid.OnPageLoaded.add(function (page) {
      if (page.type === 'CART') {
        setTimeout(addUnitPrices, 800);
      }
    });
    Ecwid.OnCartChanged.add(function () {
      setTimeout(function () {
        document.querySelectorAll('.vz-unit-price').forEach(function (el) { el.remove(); });
        addUnitPrices();
      }, 800);
    });
  }

})();
