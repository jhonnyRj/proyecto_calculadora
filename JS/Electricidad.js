/* =========================================================
   CALCULADORA TÉCNICA
   MÓDULO: ELECTRICIDAD (Corriente, Voltaje, Resistencia, Potencia)

   REGLAS:

   Ley de Ohm    → V = I × R   |   I = V / R   |   R = V / I
   Ley de Watt   → P = V × I   |   V = P / I   |   I = P / V
   Ley combinada → P = I² × R  |   I = √(P/R)  |  V = √(P×R)
   ========================================================= */

/* =========================================================
   ELEMENTOS DEL HTML
   ========================================================= */

const tabsMagnitud = document.querySelectorAll(".tab-magnitud");

const dato1Select = document.getElementById("dato1");
const dato2Select = document.getElementById("dato2");

const dato1Valor = document.getElementById("dato1-valor");
const dato2Valor = document.getElementById("dato2-valor");

const dato1Unidad = document.getElementById("dato1-unidad");
const dato2Unidad = document.getElementById("dato2-unidad");

const dato1Etiqueta = document.getElementById("dato1-etiqueta");
const dato2Etiqueta = document.getElementById("dato2-etiqueta");

const botonCalcular = document.querySelector(".btn-calcular");

/* =========================================================
   MAGNITUDES ELÉCTRICAS
   ========================================================= */

/*
   Cada magnitud guarda:
   - nombre completo
   - símbolo que se usa en las fórmulas
   - unidad base (la que se usa internamente para calcular)
   - unidades que el usuario puede elegir, con su factor
     de conversión hacia la unidad base
*/

const magnitudes = {
  I: {
    nombre: "Corriente",
    simbolo: "I",
    unidadBase: "A",
    unidades: {
      A: 1,
      mA: 1 / 1000,
      "µA": 1 / 1000000,
    },
  },
  V: {
    nombre: "Voltaje",
    simbolo: "V",
    unidadBase: "V",
    unidades: {
      V: 1,
      mV: 1 / 1000,
      kV: 1000,
    },
  },
  R: {
    nombre: "Resistencia",
    simbolo: "R",
    unidadBase: "\\Omega",
    unidades: {
      "Ω": 1,
      "kΩ": 1000,
      "MΩ": 1000000,
    },
  },
  P: {
    nombre: "Potencia",
    simbolo: "P",
    unidadBase: "W",
    unidades: {
      W: 1,
      mW: 1 / 1000,
      kW: 1000,
    },
  },
};

const ordenMagnitudes = ["I", "V", "R", "P"];

let objetivo = "I";

/* =========================================================
   FORMATEAR NÚMEROS
   ========================================================= */

function formatearNumero(numero) {
  if (!Number.isFinite(numero)) {
    return "—";
  }

  /*
       Máximo 6 decimales.
       Evitamos mostrar cosas como:
       0.0000470000000001
    */

  let numeroLimpio = Number(numero.toFixed(6));

  return numeroLimpio.toLocaleString("es-CO", {
    maximumFractionDigits: 6,
  });
}

/* =========================================================
   ELEGIR LA MEJOR UNIDAD PARA MOSTRAR UN RESULTADO
   ========================================================= */

function elegirUnidadAuto(clave, valorBase) {
  const absoluto = Math.abs(valorBase);

  if (clave === "I") {
    if (absoluto === 0) return { valor: 0, unidad: "A" };
    if (absoluto < 0.001) return { valor: valorBase * 1000000, unidad: "µA" };
    if (absoluto < 1) return { valor: valorBase * 1000, unidad: "mA" };
    return { valor: valorBase, unidad: "A" };
  }

  if (clave === "V") {
    if (absoluto === 0) return { valor: 0, unidad: "V" };
    if (absoluto < 1) return { valor: valorBase * 1000, unidad: "mV" };
    if (absoluto >= 1000) return { valor: valorBase / 1000, unidad: "kV" };
    return { valor: valorBase, unidad: "V" };
  }

  if (clave === "R") {
    if (absoluto === 0) return { valor: 0, unidad: "Ω" };
    if (absoluto >= 1000000) return { valor: valorBase / 1000000, unidad: "MΩ" };
    if (absoluto >= 1000) return { valor: valorBase / 1000, unidad: "kΩ" };
    return { valor: valorBase, unidad: "Ω" };
  }

  if (clave === "P") {
    if (absoluto === 0) return { valor: 0, unidad: "W" };
    if (absoluto < 1) return { valor: valorBase * 1000, unidad: "mW" };
    if (absoluto >= 1000) return { valor: valorBase / 1000, unidad: "kW" };
    return { valor: valorBase, unidad: "W" };
  }

  return { valor: valorBase, unidad: magnitudes[clave].unidadBase };
}

/* =========================================================
   SÍMBOLO DE UNIDAD EN LATEX (para que Ω y µ se vean bien)
   ========================================================= */

function unidadLatex(unidad) {
  return unidad
    .replace("µ", "\\mu ")
    .replace("Ω", "\\Omega ");
}

function obtenerFactoresConversion(factor) {
  const exponente = Math.round(Math.log(factor) / Math.log(1000));
  const cantidad = Math.abs(exponente);
  const operacion = exponente > 0 ? "\\times" : "\\div";

  return Array.from({ length: cantidad }, () => `${operacion} 1000`);
}

function crearTextoConversion(dato) {
  const factor = magnitudes[dato.clave].unidades[dato.unidadOriginal];
  const unidadBase = magnitudes[dato.clave].unidadBase;

  if (factor === 1) {
    return null;
  }

  const factores = obtenerFactoresConversion(factor).join(" ");
  const operacion = `${formatearNumero(dato.valorOriginal)}\\ ${unidadLatex(dato.unidadOriginal)} ${factores}`;

  return `${magnitudes[dato.clave].simbolo} = ${operacion} = ${formatearNumero(dato.valorBase)}\\ ${unidadLatex(unidadBase)}`;
}

/* =========================================================
   ACTUALIZAR SELECTS DE "DATO 1" Y "DATO 2"
   ========================================================= */

function actualizarSelectsDatos() {
  const disponibles = ordenMagnitudes.filter((clave) => clave !== objetivo);

  [dato1Select, dato2Select].forEach((select) => {
    const valorActual = select.value;

    select.innerHTML = "";

    disponibles.forEach((clave) => {
      const opcion = document.createElement("option");
      opcion.value = clave;
      opcion.textContent = magnitudes[clave].nombre;
      select.appendChild(opcion);
    });

    if (disponibles.includes(valorActual)) {
      select.value = valorActual;
    }
  });

  /*
       Si quedaron los dos selects apuntando a la misma
       magnitud, movemos el segundo al siguiente disponible.
    */

  if (dato1Select.value === dato2Select.value) {
    const otra = disponibles.find((clave) => clave !== dato1Select.value);
    if (otra) {
      dato2Select.value = otra;
    }
  }

  actualizarUnidadesDatos();
}

/* =========================================================
   ACTUALIZAR UNIDADES DISPONIBLES SEGÚN LA MAGNITUD ELEGIDA
   ========================================================= */

function llenarUnidades(selectUnidad, clave) {
  const magnitudAnterior = selectUnidad.dataset.magnitud;
  const unidadAnterior = selectUnidad.value;
  const unidadesDisponibles = Object.keys(magnitudes[clave].unidades);

  selectUnidad.innerHTML = "";

  unidadesDisponibles.forEach((unidad) => {
    const opcion = document.createElement("option");
    opcion.value = unidad;
    opcion.textContent = unidad;
    selectUnidad.appendChild(opcion);
  });

  if (magnitudAnterior === clave && unidadesDisponibles.includes(unidadAnterior)) {
    selectUnidad.value = unidadAnterior;
  }

  selectUnidad.dataset.magnitud = clave;
}

function actualizarUnidadesDatos() {
  const clave1 = dato1Select.value;
  const clave2 = dato2Select.value;

  dato1Etiqueta.textContent = magnitudes[clave1].nombre;
  dato2Etiqueta.textContent = magnitudes[clave2].nombre;

  llenarUnidades(dato1Unidad, clave1);
  llenarUnidades(dato2Unidad, clave2);
}

/* =========================================================
   CONVERTIR UN DATO A SU UNIDAD BASE
   ========================================================= */

function convertirABase(clave, valor, unidad) {
  const factor = magnitudes[clave].unidades[unidad];
  return valor * factor;
}

/* =========================================================
   CALCULAR LAS DOS MAGNITUDES FALTANTES
   ========================================================= */

/*
   Recibe las dos magnitudes conocidas (ya en unidad base)
   y devuelve los pasos del procedimiento junto con los
   valores de las dos magnitudes que faltan.
*/

function calcularFaltantes(clave1, valor1, clave2, valor2) {
  const conocidas = {};
  conocidas[clave1] = valor1;
  conocidas[clave2] = valor2;

  const combinacion = [clave1, clave2].sort().join("");

  const pasos = [];
  const resultados = {};

  function agregarPaso(ley, simboloResultado, formula, sustitucion, valorResultado, unidadResultadoBase) {
    pasos.push({
      ley,
      simboloResultado,
      formula,
      sustitucion,
      valorResultado,
      unidadResultadoBase,
    });
  }

  /* =====================================================
       CASO: se conocen VOLTAJE e INTENSIDAD
       Faltan: RESISTENCIA y POTENCIA
       ===================================================== */

  if (combinacion === "IV") {
    const V = conocidas.V;
    const I = conocidas.I;

    const R = V / I;
    agregarPaso(
      "Ley de Ohm",
      "R",
      "R = \\dfrac{V}{I}",
      `R = \\dfrac{${formatearNumero(V)}}{${formatearNumero(I)}}`,
      R,
      "\\Omega",
    );

    const P = V * I;
    agregarPaso(
      "Ley de Watt",
      "P",
      "P = V \\times I",
      `P = ${formatearNumero(V)} \\times ${formatearNumero(I)}`,
      P,
      "W",
    );

    resultados.R = R;
    resultados.P = P;
  }

  /* =====================================================
       CASO: se conocen VOLTAJE y RESISTENCIA
       Faltan: INTENSIDAD y POTENCIA
       ===================================================== */

  if (combinacion === "RV") {
    const V = conocidas.V;
    const R = conocidas.R;

    const I = V / R;
    agregarPaso(
      "Ley de Ohm",
      "I",
      "I = \\dfrac{V}{R}",
      `I = \\dfrac{${formatearNumero(V)}}{${formatearNumero(R)}}`,
      I,
      "A",
    );

    const P = V * I;
    agregarPaso(
      "Ley de Watt",
      "P",
      "P = V \\times I",
      `P = ${formatearNumero(V)} \\times ${formatearNumero(I)}`,
      P,
      "W",
    );

    resultados.I = I;
    resultados.P = P;
  }

  /* =====================================================
       CASO: se conocen VOLTAJE y POTENCIA
       Faltan: INTENSIDAD y RESISTENCIA
       ===================================================== */

  if (combinacion === "PV") {
    const V = conocidas.V;
    const P = conocidas.P;

    const I = P / V;
    agregarPaso(
      "Ley de Watt",
      "I",
      "I = \\dfrac{P}{V}",
      `I = \\dfrac{${formatearNumero(P)}}{${formatearNumero(V)}}`,
      I,
      "A",
    );

    const R = V / I;
    agregarPaso(
      "Ley de Ohm",
      "R",
      "R = \\dfrac{V}{I}",
      `R = \\dfrac{${formatearNumero(V)}}{${formatearNumero(I)}}`,
      R,
      "\\Omega",
    );

    resultados.I = I;
    resultados.R = R;
  }

  /* =====================================================
       CASO: se conocen INTENSIDAD y RESISTENCIA
       Faltan: VOLTAJE y POTENCIA
       ===================================================== */

  if (combinacion === "IR") {
    const I = conocidas.I;
    const R = conocidas.R;

    const V = I * R;
    agregarPaso(
      "Ley de Ohm",
      "V",
      "V = I \\times R",
      `V = ${formatearNumero(I)} \\times ${formatearNumero(R)}`,
      V,
      "V",
    );

    const P = V * I;
    agregarPaso(
      "Ley de Watt",
      "P",
      "P = V \\times I",
      `P = ${formatearNumero(V)} \\times ${formatearNumero(I)}`,
      P,
      "W",
    );

    resultados.V = V;
    resultados.P = P;
  }

  /* =====================================================
       CASO: se conocen INTENSIDAD y POTENCIA
       Faltan: VOLTAJE y RESISTENCIA
       ===================================================== */

  if (combinacion === "IP") {
    const I = conocidas.I;
    const P = conocidas.P;

    const V = P / I;
    agregarPaso(
      "Ley de Watt",
      "V",
      "V = \\dfrac{P}{I}",
      `V = \\dfrac{${formatearNumero(P)}}{${formatearNumero(I)}}`,
      V,
      "V",
    );

    const R = V / I;
    agregarPaso(
      "Ley de Ohm",
      "R",
      "R = \\dfrac{V}{I}",
      `R = \\dfrac{${formatearNumero(V)}}{${formatearNumero(I)}}`,
      R,
      "\\Omega",
    );

    resultados.V = V;
    resultados.R = R;
  }

  /* =====================================================
       CASO: se conocen RESISTENCIA y POTENCIA
       Faltan: INTENSIDAD y VOLTAJE
       (aquí se usa la ley combinada, con raíz cuadrada)
       ===================================================== */

  if (combinacion === "PR") {
    const R = conocidas.R;
    const P = conocidas.P;

    const I = Math.sqrt(P / R);
    agregarPaso(
      "Ley combinada (Ohm + Watt)",
      "I",
      "I = \\sqrt{\\dfrac{P}{R}}",
      `I = \\sqrt{\\dfrac{${formatearNumero(P)}}{${formatearNumero(R)}}}`,
      I,
      "A",
    );

    const V = Math.sqrt(P * R);
    agregarPaso(
      "Ley combinada (Ohm + Watt)",
      "V",
      "V = \\sqrt{P \\times R}",
      `V = \\sqrt{${formatearNumero(P)} \\times ${formatearNumero(R)}}`,
      V,
      "V",
    );

    resultados.I = I;
    resultados.V = V;
  }

  return { pasos, resultados };
}

/* =========================================================
   RENDERIZAR UNA EXPRESIÓN MATEMÁTICA (KATEX)
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
   CREAR PROCEDIMIENTO (TODO EN UNA SOLA HOJA)
   ========================================================= */

function crearProcedimiento(datosConocidos, datos) {
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
       DATOS DE PARTIDA
    ----------------------------------------------------- */

  const lineaDatos = document.createElement("div");
  lineaDatos.className = "math-line math-datos";

  const datosTexto = datosConocidos
    .map((dato) => {
      return `${magnitudes[dato.clave].simbolo} = ${formatearNumero(dato.valorOriginal)}\\ ${unidadLatex(dato.unidadOriginal)}`;
    })
    .join("\\;\\;\\text{y}\\;\\;");

  renderMathExpression(lineaDatos, datosTexto);
  mathOutput.appendChild(lineaDatos);

  datosConocidos.forEach((dato) => {
    const textoConversion = crearTextoConversion(dato);

    if (!textoConversion) {
      return;
    }

    const lineaConversion = document.createElement("div");
    lineaConversion.className = "math-line math-conversion";
    renderMathExpression(lineaConversion, textoConversion);
    mathOutput.appendChild(lineaConversion);
  });

  /* -----------------------------------------------------
       UN PASO POR CADA MAGNITUD QUE SE VA CALCULANDO
    ----------------------------------------------------- */

  datos.pasos.forEach((paso, indice) => {
    const contenedor = document.createElement("div");
    contenedor.className = "math-line";

    const etiquetaLey = document.createElement("span");
    etiquetaLey.className = "etiqueta-ley";
    etiquetaLey.textContent = `Paso ${indice + 1} · ${paso.ley}`;
    contenedor.appendChild(etiquetaLey);

    const linea = document.createElement("div");

    const texto = `${paso.formula} \\;=\\; ${paso.sustitucion} \\;=\\; ${formatearNumero(paso.valorResultado)}\\ ${unidadLatex(paso.unidadResultadoBase)}`;

    renderMathExpression(linea, texto);
    contenedor.appendChild(linea);

    mathOutput.appendChild(contenedor);
  });

  /* -----------------------------------------------------
       RESULTADOS FINALES (los que faltaban)
    ----------------------------------------------------- */

  const clavesResultado = Object.keys(datos.resultados);

  clavesResultado.forEach((clave) => {
    const resultadoFinal = document.createElement("div");
    resultadoFinal.className = "math-line resultado";

    const auto = elegirUnidadAuto(clave, datos.resultados[clave]);

    const etiqueta = document.createElement("span");
    etiqueta.className = "etiqueta-resultado";
    etiqueta.textContent = magnitudes[clave].nombre;
    resultadoFinal.appendChild(etiqueta);

    const linea = document.createElement("div");

    const texto = `${magnitudes[clave].simbolo} = ${formatearNumero(auto.valor)}\\ ${unidadLatex(auto.unidad)}`;

    renderMathExpression(linea, texto);
    resultadoFinal.appendChild(linea);

    mathOutput.appendChild(resultadoFinal);
  });
}

/* =========================================================
   EJECUTAR CALCULADORA
   ========================================================= */

function calcular() {
  const clave1 = dato1Select.value;
  const clave2 = dato2Select.value;

  const valor1 = Number(dato1Valor.value);
  const valor2 = Number(dato2Valor.value);

  const unidad1 = dato1Unidad.value;
  const unidad2 = dato2Unidad.value;

  /* =====================================================
       VALIDAR VALORES
       ===================================================== */

  if (dato1Valor.value === "" || dato2Valor.value === "") {
    alert("Ingresa los dos datos que conoces para poder calcular.");
    return;
  }

  if (!Number.isFinite(valor1) || !Number.isFinite(valor2)) {
    alert("Alguno de los valores ingresados no es válido.");
    return;
  }

  if (valor1 < 0 || valor2 < 0) {
    alert("Los valores no pueden ser negativos.");
    return;
  }

  if (clave1 === clave2) {
    alert("Elige dos magnitudes diferentes.");
    return;
  }

  /* =====================================================
       CONVERTIR A UNIDAD BASE Y CALCULAR
       ===================================================== */

  const valor1Base = convertirABase(clave1, valor1, unidad1);
  const valor2Base = convertirABase(clave2, valor2, unidad2);

  const datos = calcularFaltantes(clave1, valor1Base, clave2, valor2Base);

  const datosConocidos = [
    { clave: clave1, valorOriginal: valor1, unidadOriginal: unidad1, valorBase: valor1Base },
    { clave: clave2, valorOriginal: valor2, unidadOriginal: unidad2, valorBase: valor2Base },
  ];

  crearProcedimiento(datosConocidos, datos);
}

/* =========================================================
   EVENTOS
   ========================================================= */

tabsMagnitud.forEach((tab) => {
  tab.addEventListener("click", function () {
    tabsMagnitud.forEach((t) => t.classList.remove("activa"));
    tab.classList.add("activa");

    objetivo = tab.dataset.magnitud;

    actualizarSelectsDatos();
  });
});

dato1Select.addEventListener("change", actualizarUnidadesDatos);
dato2Select.addEventListener("change", actualizarUnidadesDatos);

botonCalcular.addEventListener("click", calcular);

[dato1Valor, dato2Valor].forEach((input) => {
  input.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
      calcular();
    }
  });
});

/* =========================================================
   EJEMPLO INICIAL AL CARGAR LA PÁGINA
   (mismo ejemplo del cuaderno: V = 24 V, I = 350 mA)
   ========================================================= */

window.addEventListener("DOMContentLoaded", function () {
  actualizarSelectsDatos();

  dato1Select.value = "V";
  dato2Select.value = "I";
  actualizarUnidadesDatos();

  dato1Valor.value = 24;
  dato1Unidad.value = "V";

  dato2Valor.value = 350;
  dato2Unidad.value = "mA";

  calcular();
});