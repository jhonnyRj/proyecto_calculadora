/* =========================================================
   CALCULADORA TÉCNICA
   MÓDULO: ALMACENAMIENTO

   REGLAS:

   B → KB → MB → GB → TB = 1024

   bit ↔ B = 8

   SUBIR  = DIVIDIR
   BAJAR  = MULTIPLICAR
   ========================================================= */

/* =========================================================
   ELEMENTOS DEL HTML
   ========================================================= */

const valorInput = document.getElementById("valor");
const desdeSelect = document.getElementById("desde");
const hastaSelect = document.getElementById("hasta");
const botonCalcular = document.querySelector(".btn-calcular");

/* =========================================================
   ESCALA DE ALMACENAMIENTO
   ========================================================= */

/*
   Cada posición representa un nivel.

   bit = posición 0
   B   = posición 1
   KB  = posición 2
   MB  = posición 3
   GB  = posición 4
   TB  = posición 5
*/

const unidades = ["bit", "B", "KB", "MB", "GB", "TB"];

/* =========================================================
   NOMBRES COMPLETOS
   ========================================================= */

const nombresUnidades = {
  bit: "bit",
  B: "Byte",
  KB: "Kilobyte",
  MB: "Megabyte",
  GB: "Gigabyte",
  TB: "Terabyte",
};

/* =========================================================
   FORMATEAR NÚMEROS
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
   OBTENER SÍMBOLO DE OPERACIÓN
   ========================================================= */

function obtenerOperacion(origen, destino) {
  const posicionOrigen = unidades.indexOf(origen);
  const posicionDestino = unidades.indexOf(destino);

  if (posicionDestino > posicionOrigen) {
    return "÷";
  } else {
    return "×";
  }
}

/* =========================================================
   CALCULAR CONVERSIÓN
   ========================================================= */

function convertir(valor, origen, destino) {
  /*
       Si las unidades son iguales,
       no hacemos ninguna operación.
    */

  if (origen === destino) {
    return {
      resultado: valor,
      pasos: [],
    };
  }

  const posicionOrigen = unidades.indexOf(origen);
  const posicionDestino = unidades.indexOf(destino);

  let resultado = valor;

  const pasos = [];

  /* =====================================================
       CASO 1
       BIT → BYTE
       ===================================================== */

  if (origen === "bit" && destino !== "bit") {
    /*
           Primero convertimos bit → B.
        */

    if (posicionDestino >= 1) {
      const anterior = resultado;

      resultado = resultado / 8;

      pasos.push({
        numero: pasos.length + 1,
        desde: "bit",
        hasta: "B",
        valorAnterior: anterior,
        resultado: resultado,
        operacion: "÷",
        factor: 8,
      });
    }

    /*
           Después seguimos:
           B → KB → MB → GB → TB
        */

    let posicionActual = 1;

    while (posicionActual < posicionDestino) {
      const unidadActual = unidades[posicionActual];
      const siguienteUnidad = unidades[posicionActual + 1];

      const anterior = resultado;

      resultado = resultado / 1024;

      pasos.push({
        numero: pasos.length + 1,
        desde: unidadActual,
        hasta: siguienteUnidad,
        valorAnterior: anterior,
        resultado: resultado,
        operacion: "÷",
        factor: 1024,
      });

      posicionActual++;
    }

    return {
      resultado,
      pasos,
    };
  }

  /* =====================================================
       CASO 2
       BYTE → BIT
       ===================================================== */

  if (origen !== "bit" && destino === "bit") {
    /*
           Primero hacemos:
           B → bit
        */

    if (origen === "B") {
      const anterior = resultado;

      resultado = resultado * 8;

      pasos.push({
        numero: pasos.length + 1,
        desde: "B",
        hasta: "bit",
        valorAnterior: anterior,
        resultado: resultado,
        operacion: "×",
        factor: 8,
      });
    } else {
      /*
               Primero bajamos hasta B.

               Ejemplo:

               MB → KB → B
            */

      let posicionActual = posicionOrigen;

      while (posicionActual > 1) {
        const unidadActual = unidades[posicionActual];
        const siguienteUnidad = unidades[posicionActual - 1];

        const anterior = resultado;

        resultado = resultado * 1024;

        pasos.push({
          numero: pasos.length + 1,
          desde: unidadActual,
          hasta: siguienteUnidad,
          valorAnterior: anterior,
          resultado: resultado,
          operacion: "×",
          factor: 1024,
        });

        posicionActual--;
      }

      /*
               Finalmente:
               B → bit
            */

      const anterior = resultado;

      resultado = resultado * 8;

      pasos.push({
        numero: pasos.length + 1,
        desde: "B",
        hasta: "bit",
        valorAnterior: anterior,
        resultado: resultado,
        operacion: "×",
        factor: 8,
      });
    }

    return {
      resultado,
      pasos,
    };
  }

  /* =====================================================
       CASO 3
       ALMACENAMIENTO NORMAL

       B ↔ KB ↔ MB ↔ GB ↔ TB
       ===================================================== */

  if (origen !== "bit" && destino !== "bit") {
    /*
           BAJAR

           Ejemplo:

           GB → MB → KB

           ×1024
           ×1024
        */

    if (posicionDestino < posicionOrigen) {
      let posicionActual = posicionOrigen;

      while (posicionActual > posicionDestino) {
        const unidadActual = unidades[posicionActual];
        const siguienteUnidad = unidades[posicionActual - 1];

        const anterior = resultado;

        resultado = resultado * 1024;

        pasos.push({
          numero: pasos.length + 1,
          desde: unidadActual,
          hasta: siguienteUnidad,
          valorAnterior: anterior,
          resultado: resultado,
          operacion: "×",
          factor: 1024,
        });

        posicionActual--;
      }
    } else {
      /*
        SUBIR

        Ejemplo:

        KB → MB → GB

        ÷1024
        ÷1024
        */
      let posicionActual = posicionOrigen;

      while (posicionActual < posicionDestino) {
        const unidadActual = unidades[posicionActual];
        const siguienteUnidad = unidades[posicionActual + 1];

        const anterior = resultado;

        resultado = resultado / 1024;

        pasos.push({
          numero: pasos.length + 1,
          desde: unidadActual,
          hasta: siguienteUnidad,
          valorAnterior: anterior,
          resultado: resultado,
          operacion: "÷",
          factor: 1024,
        });

        posicionActual++;
      }
    }
  }

  return {
    resultado,
    pasos,
  };
}

/* =========================================================
   CREAR PROCEDIMIENTO
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

  if (datos.pasos.length === 0) {
    const linea = document.createElement("div");
    linea.className = "math-line";
    renderMathExpression(
      linea,
      `${formatearNumero(valor)} = ${formatearNumero(datos.resultado)}`,
    );
    mathOutput.appendChild(linea);
    return;
  }

  datos.pasos.forEach((paso) => {
    const linea = document.createElement("div");
    linea.className = "math-line";

    const simbolo = paso.operacion === "×" ? "\\times" : "\\div";
    const texto = `${formatearNumero(paso.valorAnterior)} ${simbolo} ${paso.factor} = ${formatearNumero(paso.resultado)}`;

    renderMathExpression(linea, texto);
    mathOutput.appendChild(linea);
  });

  const resultadoFinal = document.createElement("div");
  resultadoFinal.className = "math-line";
  renderMathExpression(
    resultadoFinal,
    `${formatearNumero(datos.resultado)}\\;${destino}`,
  );
  mathOutput.appendChild(resultadoFinal);
}

/* =========================================================
   EJECUTAR CALCULADORA
   ========================================================= */

function calcular() {
  const valor = Number(valorInput.value);

  const origen = desdeSelect.value;
  const destino = hastaSelect.value;

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

  const datos = convertir(valor, origen, destino);

  /* =====================================================
       MOSTRAR RESULTADO
       ===================================================== */

  crearProcedimiento(valor, origen, destino, datos);
}

/* =========================================================
   EVENTO DEL BOTÓN
   ========================================================= */

botonCalcular.addEventListener("click", calcular);

/* =========================================================
   ENTER PARA CALCULAR
   ========================================================= */

valorInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    calcular();
  }
});

/* =========================================================
   CAMBIAR EJEMPLO VISUAL AL MODIFICAR UNIDAD
   ========================================================= */

desdeSelect.addEventListener("change", function () {
  /*
           No calculamos automáticamente.
           Esperamos que el usuario pulse CALCULAR.
        */
});

hastaSelect.addEventListener("change", function () {
  /*
           No calculamos automáticamente.
        */
});

window.addEventListener("DOMContentLoaded", function () {
  const ejemplo = convertir(4096, "MB", "GB");
  crearProcedimiento(4096, "MB", "GB", ejemplo);
});
