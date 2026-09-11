// cart-unit-price.js — VapeZone
// Muestra el precio POR PIEZA real (según modelo + rango de piezas del catálogo)
// en cada línea del carrito, en vez de calcularlo dividiendo total/cantidad.

(function () {

  // ---------------------------------------------------------------
  // 1) TABLA DE PRECIOS POR MODELO
  // ---------------------------------------------------------------

  // Actualizado: Lista de Precios VapeZone 2026 V61.1
  const PRICE_TABLE = {
    // NOTA: NOVABAR, NEXA PIX y FASTA ya no usan descuento activo/inactivo,
    // el catálogo 2026 trae su precio definitivo directo.
    "NOVABAR 35K": [[1,9,400],[10,300,200]],
    "NEXA PIX": [[1,9,400],[10,49,230],[50,149,225],[150,300,220]],
    "FASTA 35000": [[1,9,400],[10,300,300]],

    // ---- IPLAY ----
    "IPLAY PRO MAX": [[1,9,400],[10,49,245],[50,149,240],[150,300,235]],
    "IPLAY MAX": [[1,9,220],[10,300,125]],
    "IPLAY XBOX EDICION MUNDIAL": [[1,9,297],[10,49,161],[50,149,157],[150,300,153]],
    "IPLAY XBOX NP": [[1,9,250],[10,null,150]],
    "IPLAY BIG MAX": [[1,9,250],[10,49,160],[50,149,155],[150,300,150]],
    "IPLAY SLURP": [[1,9,200],[10,1000,135]],
    "IPLAY BANG": [[1,9,200],[10,1000,135]],
    "IPLAY ULIX": [[1,9,200],[10,1000,135]],
    "IPLAY VIBAR": [[1,9,200],[10,1000,135]],
    "IPLAY ECCO": [[1,9,200],[10,1000,135]],
    "IPLAY GHOST": [[1,9,250],[10,null,190]],
    "IPLAY XBOX PRO": [[1,9,350],[10,49,195],[50,149,190],[150,300,185]],
    "IPLAY WALKER": [[1,9,250],[10,null,190]],
    "IPLAY BURST": [[1,9,400],[10,49,220],[50,149,215],[150,300,210]],

    // ---- Otras marcas ----
    "BILLIONAIRE BOYS": [[1,9,200],[10,null,150]],
    "VHILL 3000": [[1,9,250]],
    "VHILL 6000": [[1,9,300],[10,49,200],[50,149,195],[150,300,190]],
    "VHILL 12000": [[1,9,400]],
    "VHILL 32000": [[1,9,480]],

    "GEEK BAR PULSE X": [[1,9,350],[10,49,240],[50,149,235],[150,300,230]],
    "GEEK BAR PULSE": [[1,9,320],[10,49,210],[50,149,205],[150,300,200]],
    "X RETURNS": [[1,9,350],[10,49,240],[50,149,235],[150,300,230]],

    "TOMORO D20": [[1,9,400],[10,49,240],[50,149,235],[150,300,230]],
    "TOMORO MAX": [[1,9,345],[10,49,210],[50,149,205],[150,300,200]],
    "SUONON DONETE": [[1,9,400],[10,49,270],[50,149,265],[150,300,260]],
    "INSTABAR MEGA 80K": [[1,9,450],[10,49,270],[50,149,265],[150,300,260]],
    "INSTABAR 15K": [[1,9,300],[10,300,195]],
    "INSTABAR 70K": [[1,9,400],[10,49,260],[50,149,255],[150,300,250]],
    "VOOM METEOR 70K": [[1,9,400],[10,49,270],[50,149,265],[150,300,260]],
    "VPLAY 20K": [[1,9,300],[10,300,225]],

    "VFLY ZERO CLOUD": [[1,9,320],[10,49,192],[50,149,188],[150,300,184]],
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
    "LANAVAPE AIRSHIP": [[1,9,300],[10,300,180]],
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

    if (totalQty <= 1) {
      traducirTextoMayoreo();
      return; // carrito con 1 sola pieza: no aplica mayoreo, no hay nada que mostrar
    }

    // 2) Para cada línea, buscar el precio de SU modelo al nivel del total del carrito
    var sumaConMayoreo = 0;
    var algunaLineaTieneMayoreo = false;

    itemEls.forEach(function (itemEl) {
      var titleEl = itemEl.querySelector('.ec-cart-item__title');
      var qtyEl = itemEl.querySelector('.ec-cart-item__count input') || itemEl.querySelector('.ec-cart-item__count');
      var lineQty = qtyEl ? parseInt(qtyEl.value || qtyEl.textContent) : null;

      if (titleEl && lineQty) {
        var productName = titleEl.textContent.trim();
        var unitPrice = getUnitPrice(productName, totalQty);
        if (unitPrice !== null) {
          sumaConMayoreo += unitPrice * lineQty;
          algunaLineaTieneMayoreo = true;
        } else {
          // Modelo sin tabulador de mayoreo: usa su precio normal de linea tal cual lo muestra Ecwid
          var lineTotalEl = itemEl.querySelector('.ec-cart-item__price-inner');
          var lineTotalNum = lineTotalEl ? parseFloat(lineTotalEl.textContent.replace(/[^0-9.]/g, '')) : 0;
          sumaConMayoreo += lineTotalNum || 0;
        }
      }

      if (itemEl.querySelector('.vz-unit-price')) return;
      if (!titleEl) return;

      var productName2 = titleEl.textContent.trim();
      var unitPrice2 = getUnitPrice(productName2, totalQty);
      if (unitPrice2 === null) return; // modelo no está en la tabla, no mostramos nada

      var priceEl = itemEl.querySelector('.ec-cart-item__price-inner');
      if (!priceEl) return;

      var tag = document.createElement('div');
      tag.className = 'vz-unit-price';
      tag.style.cssText = 'font-size:12px;color:#888;text-align:right;margin-top:3px;';
      tag.textContent = '$' + unitPrice2.toLocaleString('es-MX', { minimumFractionDigits: 2 }) + ' c/u';
      priceEl.parentNode.appendChild(tag);

      if (lineQty) {
        var lineTotal = unitPrice2 * lineQty;
        var totalTag = document.createElement('div');
        totalTag.className = 'vz-unit-price';
        totalTag.style.cssText = 'font-size:12px;color:#888;text-align:right;margin-top:1px;font-weight:600;';
        totalTag.textContent = '$' + lineTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 }) + ' total (' + lineQty + ' pz)';
        priceEl.parentNode.appendChild(totalTag);
      }
    });

    // 3) Insertar debajo de "Subtotal" el total ya con precios de mayoreo aplicados
    if (algunaLineaTieneMayoreo) {
      insertarResumenMayoreo(sumaConMayoreo);
    }

    // 4) Traducir "Discount for bulk products" a "Descuento por mayoreo"
    traducirTextoMayoreo();
  }

  function insertarResumenMayoreo(total) {
    if (document.querySelector('.vz-subtotal-mayoreo')) {
      document.querySelector('.vz-subtotal-mayoreo').remove();
    }

    var candidatos = document.querySelectorAll('div, span, td, p');
    var subtotalRow = null;
    for (var i = 0; i < candidatos.length; i++) {
      if (candidatos[i].textContent.trim() === 'Subtotal') {
        subtotalRow = candidatos[i].closest('[class*="row"]') || candidatos[i].parentElement;
        break;
      }
    }
    if (!subtotalRow) return;

    var resumen = document.createElement('div');
    resumen.className = 'vz-subtotal-mayoreo';
    resumen.style.cssText = 'display:flex;justify-content:space-between;font-size:13px;color:#555;padding:4px 0;font-weight:600;';
    resumen.innerHTML = '<span>Total con mayoreo aplicado</span><span>$' + total.toLocaleString('es-MX', { minimumFractionDigits: 2 }) + '</span>';
    subtotalRow.parentNode.insertBefore(resumen, subtotalRow.nextSibling);
  }

  function traducirTextoMayoreo() {
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    var node;
    while ((node = walker.nextNode())) {
      if (node.nodeValue.indexOf('Discount for bulk products') !== -1) {
        node.nodeValue = node.nodeValue.replace('Discount for bulk products', 'Descuento por mayoreo');
      }
    }
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
