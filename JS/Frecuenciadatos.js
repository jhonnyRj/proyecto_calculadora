/* =========================================================
   CALCULADORA TÉCNICA
   MÓDULO: FRECUENCIA Y DATOS

   REGLAS (todas en BASE 10):

   Hz  → kHz → MHz → GHz          = ×1000 / ÷1000
   bps → kbps → Mbps → Gbps       = ×1000 / ÷1000

   SUBIR  = DIVIDIR
   BAJAR  = MULTIPLICAR

   No existe caso especial (como el ×8 bit↔Byte del módulo
   de Almacenamiento): aquí todo es siempre ×1000 / ÷1000.
   ========================================================= */

/* =========================================================
   ELEMENTOS DEL HTML
   ========================================================= */

const valorInput = document.getElementById("valor");
const desdeSelect = document.getElementById("desde");
const hastaSelect = document.getElementById("hasta");
const botonCalcular = document.querySelector(".btn-calcular");
const botonesModo = document.querySelectorAll(".modo-btn");

const tituloModulo = document.getElementById("tituloModulo");
const tituloPanel = document.getElementById("tituloPanel");
const subtituloPanel = document.getElementById("subtituloPanel");
const reglaMiniTitulo = document.getElementById("reglaMiniTitulo");
const reglaMiniPequeno = document.getElementById("reglaMiniPequeno");

const escalaFrecuencia = document.getElementById("escalaFrecuencia");
const escalaDatos = document.getElementById("escalaDatos");

/* =========================================================
   CONFIGURACIÓN DE CADA MODO
   ========================================================= */

const modos = {
  frecuencia: {
    tituloModulo: "Frecuencia",
    tituloPanel: "Conversor de frecuencia",
    subtituloPanel: "Convierte Hz y sus múltiplos (base 10)",
    reglaTitulo: "Regla de frecuencia",
    reglaPequeno: "Hz ↔ kHz ↔ MHz ↔ GHz  (×1000 / ÷1000)",
    factorFamilias: null,
    grupos: [
      {
        familia: "hz",
        unidades: ["Hz", "kHz", "MHz", "GHz", "THz"],
        nombres: {
          Hz: "Hercio",
          kHz: "Kilohercio",
          MHz: "Megahercio",
          GHz: "Gigahercio",
          THz: "Terahercio",
        },
      },
    ],
    ejemplo: { valor: 3, desde: "GHz", hasta: "Hz" },
  },

  datos: {
    tituloModulo: "Datos",
    tituloPanel: "Conversor de tasa de datos y ancho de banda",
    subtituloPanel: "Convierte bps en base 10 y Bytes en base 2",
    reglaTitulo: "Regla de datos",
    reglaPequeno: "TB↔GB↔MB↔KB = 1000  ·  KB→B = 1024  ·  B↔bit = 1024",
    /*
       1 Byte-por-segundo equivale a 8 bit-por-segundo,
       en el MISMO nivel de magnitud (bps↔Bps, kbps↔kBps, etc).
       Por eso el "puente" entre familias siempre es ×8 / ÷8,
       nunca ×1000: eso es lo que pediste, igual que en
       Almacenamiento con bit↔Byte.
    */
    factorFamilias: 8,
    grupos: [
      {
        familia: "tasa-bit",
        tipo: "bit",
        unidades: ["bps", "kbps", "Mbps", "Gbps", "Tbps"],
        nombres: {
          bps: "Bit por segundo",
          kbps: "Kilobit por segundo",
          Mbps: "Megabit por segundo",
          Gbps: "Gigabit por segundo",
          Tbps: "Terabit por segundo",
        },
      },
      {
        familia: "tasa-byte",
        tipo: "byte",
        unidades: ["Bps", "kBps", "MBps", "GBps", "TBps"],
        nombres: {
          Bps: "Byte por segundo",
          kBps: "Kilobyte por segundo",
          MBps: "Megabyte por segundo",
          GBps: "Gigabyte por segundo",
          TBps: "Terabyte por segundo",
        },
      },
      {
        familia: "almacenamiento",
        tipo: "almacenamiento",
        unidades: ["bit", "B", "KB", "MB", "GB", "TB"],
        factoresSubir: [1024, 1000, 1000, 1000, 1000],
        factoresBajar: [1024, 1024, 1000, 1000, 1000],
        nombres: {
          bit: "bit",
          B: "Byte",
          KB: "Kilobyte",
          MB: "Megabyte",
          GB: "Gigabyte",
          TB: "Terabyte",
        },
      },
    ],
    ejemplo: { valor: 3.5, desde: "KB", hasta: "B" },
  },
};

let modoActual = "frecuencia";

/* =========================================================
   CAMBIAR DE MODO (Frecuencia ↔ Datos)
   ========================================================= */

function cambiarModo(nuevoModo) {
  modoActual = nuevoModo;

  const cfg = modos[modoActual];

  /* Botones activos */
  botonesModo.forEach((boton) => {
    boton.classList.toggle("activo", boton.dataset.modo === modoActual);
    boton.setAttribute(
      "aria-selected",
      boton.dataset.modo === modoActual ? "true" : "false",
    );
  });

  /* Textos del panel */
  tituloModulo.textContent = cfg.tituloModulo;
  tituloPanel.textContent = cfg.tituloPanel;
  subtituloPanel.textContent = cfg.subtituloPanel;
  reglaMiniTitulo.textContent = cfg.reglaTitulo;
  reglaMiniPequeno.textContent = cfg.reglaPequeno;

  /* Escala visual de la sección inferior */
  escalaFrecuencia.classList.toggle("oculto", modoActual !== "frecuencia");
  escalaDatos.classList.toggle("oculto", modoActual !== "datos");

  /* Selects */
  poblarSelects();

  /* Ejemplo inicial */
  const ejemplo = convertir(cfg.ejemplo.valor, cfg.ejemplo.desde, cfg.ejemplo.hasta, cfg);
  crearProcedimiento(cfg.ejemplo.valor, cfg.ejemplo.desde, cfg.ejemplo.hasta, ejemplo);
}

/* =========================================================
   POBLAR SELECTS SEGÚN EL MODO
   (usa <optgroup> cuando el modo tiene más de una familia,
   por ejemplo bit-por-segundo vs Byte-por-segundo)
   ========================================================= */

function crearOpcion(unidad, nombre) {
  const opcion = document.createElement("option");
  opcion.value = unidad;
  opcion.textContent = `${unidad} (${nombre})`;
  return opcion;
}

function poblarSelects() {
  const cfg = modos[modoActual];

  desdeSelect.innerHTML = "";
  hastaSelect.innerHTML = "";

  cfg.grupos.forEach((grupo) => {
    const usarOptgroup = cfg.grupos.length > 1;

    const contenedorDesde = usarOptgroup
      ? document.createElement("optgroup")
      : null;
    const contenedorHasta = usarOptgroup
      ? document.createElement("optgroup")
      : null;

    if (usarOptgroup) {
      const etiqueta =
        grupo.tipo === "bit"
          ? "Bits por segundo"
          : grupo.tipo === "byte"
            ? "Bytes por segundo"
            : grupo.tipo === "almacenamiento"
              ? "Almacenamiento (base 2)"
            : grupo.familia;

      contenedorDesde.label = etiqueta;
      contenedorHasta.label = etiqueta;
    }

    grupo.unidades.forEach((unidad) => {
      const nombre = grupo.nombres[unidad];

      const opcionDesde = crearOpcion(unidad, nombre);
      const opcionHasta = crearOpcion(unidad, nombre);

      if (usarOptgroup) {
        contenedorDesde.appendChild(opcionDesde);
        contenedorHasta.appendChild(opcionHasta);
      } else {
        desdeSelect.appendChild(opcionDesde);
        hastaSelect.appendChild(opcionHasta);
      }
    });

    if (usarOptgroup) {
      desdeSelect.appendChild(contenedorDesde);
      hastaSelect.appendChild(contenedorHasta);
    }
  });

  desdeSelect.value = cfg.ejemplo.desde;
  hastaSelect.value = cfg.ejemplo.hasta;
}

/* =========================================================
   LOCALIZAR UNA UNIDAD DENTRO DE LOS GRUPOS DEL MODO
   Devuelve en qué familia está y en qué posición (magnitud)
   ========================================================= */

function localizarUnidad(codigo, cfg) {
  for (const grupo of cfg.grupos) {
    const magnitud = grupo.unidades.indexOf(codigo);

    if (magnitud !== -1) {
      return { grupo, magnitud };
    }
  }

  return null;
}

/* =========================================================
   FORMATEAR NÚMEROS (forma larga)
   ========================================================= */

function formatearNumero(numero) {
  if (!Number.isFinite(numero)) {
    return "—";
  }

  /*
       Máximo 10 decimales.
       Evitamos mostrar cosas como:
       3.0000000000000004
    */

  let numeroLimpio = Number(numero.toFixed(10));

  return numeroLimpio.toLocaleString("es-CO", {
    maximumFractionDigits: 10,
  });
}

/* =========================================================
   NOTACIÓN CIENTÍFICA (forma corta)
   ========================================================= */

function aNotacionCientifica(numero) {
  if (numero === 0) {
    return "0";
  }

  let exponente = Math.floor(Math.log10(Math.abs(numero)));
  let mantisa = numero / Math.pow(10, exponente);

  /* redondeamos la mantisa a 6 cifras significativas */
  mantisa = Number(mantisa.toFixed(6));

  /* corrige casos donde el redondeo deja la mantisa en 10 */
  if (Math.abs(mantisa) >= 10) {
    mantisa = mantisa / 10;
    exponente += 1;
  }

  const mantisaTexto = mantisa.toLocaleString("es-CO", {
    maximumFractionDigits: 6,
  });

  if (exponente === 0) {
    return mantisaTexto;
  }

  return `${mantisaTexto}\\times10^{${exponente}}`;
}

/* =========================================================
   CALCULAR CONVERSIÓN (BASE 10)
   ========================================================= */

/*
   Encadena pasos de ×1000 / ÷1000 dentro de UNA MISMA familia,
   desde una magnitud hasta otra. Devuelve el resultado y va
   empujando los pasos al arreglo "pasos" que se le pase.
*/
function encadenarMagnitud(
  resultado,
  unidadesFamilia,
  magnitudOrigen,
  magnitudDestino,
  pasos,
  factor = 1000,
  factoresSubir = null,
  factoresBajar = null,
) {
  let posicionActual = magnitudOrigen;

  /* BAJAR (ej. GHz → MHz → kHz) = ×1000 */
  while (posicionActual > magnitudDestino) {
    const unidadActual = unidadesFamilia[posicionActual];
    const siguienteUnidad = unidadesFamilia[posicionActual - 1];

    const anterior = resultado;

    const factorPaso = factoresBajar
      ? factoresBajar[posicionActual - 1]
      : factor;
    resultado = resultado * factorPaso;

    pasos.push({
      numero: pasos.length + 1,
      desde: unidadActual,
      hasta: siguienteUnidad,
      valorAnterior: anterior,
      resultado: resultado,
      operacion: "×",
      factor: factorPaso,
    });

    posicionActual--;
  }

  /* SUBIR (ej. kbps → Mbps → Gbps) = ÷1000 */
  while (posicionActual < magnitudDestino) {
    const unidadActual = unidadesFamilia[posicionActual];
    const siguienteUnidad = unidadesFamilia[posicionActual + 1];

    const anterior = resultado;

    const factorPaso = factoresSubir
      ? factoresSubir[posicionActual]
      : factor;
    resultado = resultado / factorPaso;

    pasos.push({
      numero: pasos.length + 1,
      desde: unidadActual,
      hasta: siguienteUnidad,
      valorAnterior: anterior,
      resultado: resultado,
      operacion: "÷",
      factor: factorPaso,
    });

    posicionActual++;
  }

  return resultado;
}

function convertir(valor, origen, destino, cfg) {
  if (origen === destino) {
    return {
      resultado: valor,
      pasos: [],
    };
  }

  const uOrigen = localizarUnidad(origen, cfg);
  const uDestino = localizarUnidad(destino, cfg);

  let resultado = valor;
  const pasos = [];

  /* =====================================================
       CASO 1
       Misma familia (ej. kbps → Gbps, o Hz → GHz)
       Solo pasos de ×1000 / ÷1000
       ===================================================== */

  if (uOrigen.grupo.familia === uDestino.grupo.familia) {
    resultado = encadenarMagnitud(
      resultado,
      uOrigen.grupo.unidades,
      uOrigen.magnitud,
      uDestino.magnitud,
      pasos,
      uOrigen.grupo.factor || 1000,
      uOrigen.grupo.factoresSubir || null,
      uOrigen.grupo.factoresBajar || null,
    );

    return { resultado, pasos };
  }

  /* =====================================================
       CASO 2
       Familias distintas (bit ↔ Byte, ej. Mbps → kBps)

       Paso A: nos movemos dentro de la familia de ORIGEN
               hasta llegar a la MISMA magnitud que el destino
               (×1000 / ÷1000)

       Paso B: cruzamos de familia con el factor fijo
               (×8 si vamos de bit a Byte es ÷8,
                ×8 si vamos de Byte a bit)
       ===================================================== */

  resultado = encadenarMagnitud(
    resultado,
    uOrigen.grupo.unidades,
    uOrigen.magnitud,
    uDestino.magnitud,
    pasos,
    uOrigen.grupo.factor || 1000,
    uOrigen.grupo.factoresSubir || null,
    uOrigen.grupo.factoresBajar || null,
  );

  const unidadIntermedia = uOrigen.grupo.unidades[uDestino.magnitud];
  const anterior = resultado;

  if (uOrigen.grupo.tipo === "bit") {
    /* bit-familia (más pequeña) → Byte-familia (más grande) = ÷8 */
    resultado = resultado / cfg.factorFamilias;

    pasos.push({
      numero: pasos.length + 1,
      desde: unidadIntermedia,
      hasta: destino,
      valorAnterior: anterior,
      resultado: resultado,
      operacion: "÷",
      factor: cfg.factorFamilias,
    });
  } else {
    /* Byte-familia (más grande) → bit-familia (más pequeña) = ×8 */
    resultado = resultado * cfg.factorFamilias;

    pasos.push({
      numero: pasos.length + 1,
      desde: unidadIntermedia,
      hasta: destino,
      valorAnterior: anterior,
      resultado: resultado,
      operacion: "×",
      factor: cfg.factorFamilias,
    });
  }

  return { resultado, pasos };
}

/* =========================================================
   RENDERIZAR EXPRESIÓN MATEMÁTICA (KaTeX)
   ========================================================= */

function renderMathExpression(elemento, texto) {
  if (window.katex && typeof window.katex.render === "function") {
    try {
      window.katex.render(texto, elemento, {
        throwOnError: false,
        displayMode: true,
      });
      return;
    } catch (error) {
      console.warn("KaTeX no pudo renderizar:", error);
    }
  }

  elemento.textContent = texto;
}

/* =========================================================
   CREAR PROCEDIMIENTO (pasos + cuadro de resultado)
   ========================================================= */

function crearProcedimiento(valor, origen, destino, datos) {
  const documento = document.querySelector(".documento");

  if (!documento) {
    return;
  }

  const mathOutput = documento.querySelector(".math-output");
  if (!mathOutput) {
    return;
  }

  mathOutput.innerHTML = "";

  /* -----------------------------------------------------
       PASOS (la fórmula, uno por línea)
     ----------------------------------------------------- */

  if (datos.pasos.length === 0) {
    const linea = document.createElement("div");
    linea.className = "math-line";
    renderMathExpression(
      linea,
      `${formatearNumero(valor)}\\;${origen} = ${formatearNumero(datos.resultado)}\\;${destino}`,
    );
    mathOutput.appendChild(linea);
  } else {
    datos.pasos.forEach((paso) => {
      const linea = document.createElement("div");
      linea.className = "math-line";

      const simbolo = paso.operacion === "×" ? "\\times" : "\\div";
      const texto = `${formatearNumero(paso.valorAnterior)} ${simbolo} ${paso.factor} = ${formatearNumero(paso.resultado)}`;

      renderMathExpression(linea, texto);
      mathOutput.appendChild(linea);
    });
  }

  /* -----------------------------------------------------
       CUADRO ÚNICO: resultado largo + resultado corto
     ----------------------------------------------------- */

  const cuadroResultado = document.createElement("div");
  cuadroResultado.className = "resultado-doble";

  const cajaLarga = document.createElement("div");
  cajaLarga.className = "resultado-caja";

  const etiquetaLarga = document.createElement("span");
  etiquetaLarga.className = "resultado-etiqueta";
  etiquetaLarga.textContent = "RESULTADO";
  cajaLarga.appendChild(etiquetaLarga);

  const valorLargo = document.createElement("div");
  renderMathExpression(
    valorLargo,
    `${formatearNumero(datos.resultado)}\\;${destino}`,
  );
  cajaLarga.appendChild(valorLargo);

  const cajaCorta = document.createElement("div");
  cajaCorta.className = "resultado-caja";

  const etiquetaCorta = document.createElement("span");
  etiquetaCorta.className = "resultado-etiqueta";
  etiquetaCorta.textContent = "NOTACIÓN CIENTÍFICA";
  cajaCorta.appendChild(etiquetaCorta);

  const valorCorto = document.createElement("div");
  renderMathExpression(
    valorCorto,
    `${aNotacionCientifica(datos.resultado)}\\;${destino}`,
  );
  cajaCorta.appendChild(valorCorto);

  cuadroResultado.appendChild(cajaLarga);
  cuadroResultado.appendChild(cajaCorta);

  mathOutput.appendChild(cuadroResultado);
}

/* =========================================================
   EJECUTAR CALCULADORA
   ========================================================= */

function calcular() {
  const valor = Number(valorInput.value);

  const origen = desdeSelect.value;
  const destino = hastaSelect.value;

  const cfg = modos[modoActual];

  /* =====================================================
       VALIDAR VALOR
       ===================================================== */

  if (valorInput.value === "") {
    alert("Ingresa un valor para realizar la conversión.");
    valorInput.focus();
    return;
  }

  if (!Number.isFinite(valor)) {
    alert("El valor ingresado no es válido.");
    valorInput.focus();
    return;
  }

  if (valor < 0) {
    alert("El valor no puede ser negativo.");
    valorInput.focus();
    return;
  }

  /* =====================================================
       REALIZAR CONVERSIÓN
       ===================================================== */

  const datos = convertir(valor, origen, destino, cfg);

  /* =====================================================
       MOSTRAR RESULTADO
       ===================================================== */

  crearProcedimiento(valor, origen, destino, datos);
}

/* =========================================================
   EVENTOS
   ========================================================= */

botonCalcular.addEventListener("click", calcular);

valorInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    calcular();
  }
});

botonesModo.forEach((boton) => {
  boton.addEventListener("click", function () {
    cambiarModo(boton.dataset.modo);
  });
});

desdeSelect.addEventListener("change", function () {
  /* No calculamos automáticamente, esperamos el botón Calcular. */
});

hastaSelect.addEventListener("change", function () {
  /* No calculamos automáticamente. */
});

/* =========================================================
   INICIO
   ========================================================= */

window.addEventListener("DOMContentLoaded", function () {
  cambiarModo("frecuencia");
});