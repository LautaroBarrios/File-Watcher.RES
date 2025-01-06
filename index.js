import fs from "fs";
import path from "path";
import fetch from "node-fetch";

// Ruta de la carpeta a monitorizar
const directoryPath = path.join("C:", "Quimica"); // Cambia esta ruta a tu carpeta de archivos .RES
const apiEndpoint = process.env.API; // URL a la que se envían los archivos
const maxRetries = 5; // Número máximo de reintentos
const retryInterval = 60000; // Tiempo entre máximo entre reintentos (1 minuto)

// Crear la carpeta si no existe
if (!fs.existsSync(directoryPath)) {
  fs.mkdirSync(directoryPath, { recursive: true });
  console.log(`\x1b[92m Carpeta creada en: \x1b[93m${directoryPath}\x1b[0m`);
}

// Función para convertir un archivo .RES a JSON
async function convertREStoJSON(filePath) {
  try {
    // Leer el contenido del archivo
    const fileContent = await fs.promises.readFile(filePath, "utf-8");

    // Dividir el contenido por líneas
    const lines = fileContent.split("\n");

    // Array para almacenar los objetos JSON
    const jsonData = [];

    // Procesar cada línea
    for (let line of lines) {
      // Ignorar líneas vacías o comentarios
      if (line.trim() === "" || line.startsWith(";")) {
        continue;
      }

      // Dividir la línea en campos
      const fields = line.split(";");

      // Construir el objeto JSON a partir de los campos
      let record = {
        "ID muestr": fields[0].trim(),
        Fecha: fields[6].trim(),
      };

      const measurements = {};

      const decimals = {
        FOS: 1,
        "CA As": 1,
        ALB: 2,
        PT: 2,
      };

      const specialDecimals = ["CRE L"];

      // Extraer los datos de las mediciones
      for (let i = 10; i < fields.length; i += 3) {
        // Incrementar i de 3 en 3
        if (fields[i].trim() !== "" && fields[i + 1] && fields[i + 2]) {
          // Asegurarse de que haya 3 campos
          const measurementKey =
            fields[i].trim() + " (" + fields[i + 2].trim() + ")";
          if (decimals[fields[i].trim()]) {
            measurements[measurementKey] = Number(
              fields[i + 1].trim().replace(",", ".")
            )
              .toFixed(decimals[fields[i].trim()])
              .replace(".", ",");
          } else if (specialDecimals.includes(fields[i].trim())) {
            measurements[measurementKey] = String(
              Number(fields[i + 1].trim().replace(",", "."))
            ).replace(".", ",");
          } else {
            measurements[measurementKey] = Math.round(
              Number(fields[i + 1].trim().replace(",", "."))
            );
          }
        }
      }

      // Asignar las mediciones a record como propiedades
      record = { ...record, ...measurements };

      // Agregar el objeto al array de datos
      jsonData.push(record);
    }

    // Convertir el array de objetos a una cadena JSON
    const jsonString = JSON.stringify(jsonData, null, 2);
    return jsonString;
  } catch (error) {
    console.error(
      `Error al convertir ${path.basename(filePath)} a JSON:`,
      error
    );
    throw error;
  }
}

// Función para enviar el archivo a la API
async function sendFileToAPI(filePath) {
  const fileName = path.basename(filePath);

  try {
    const jsonData = await convertREStoJSON(filePath);
    // return console.log(jsonData); // Puedes descomentar esto para depurar

    const response = await fetch(apiEndpoint, {
      method: "POST",
      body: jsonData,
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error en la API: ${response.statusText}`);
    }

    // Mostrar la respuesta de la API
    const responseData = await response.json();
    console.log(`\x1b[96m     Respuesta de la API:\x1b[0m`, responseData);

    console.log(
      `\x1b[92m     OK - Archivo \x1b[93m${fileName} \x1b[92menviado exitosamente.\x1b[0m`
    );

    // Eliminar el archivo después de enviarlo correctamente
    await deleteFile(filePath);
  } catch (error) {
    console.error(
      `\x1b[91m     UPS - Error al enviar \x1b[93m${fileName}: \x1b[0m`,
      error
    );
    throw error;
  }
}

// Función para intentar reenviar el archivo con reintentos y espera
async function retrySendFileToAPI(filePath, retries = 0) {
  try {
    await sendFileToAPI(filePath);
  } catch (error) {
    if (retries < maxRetries) {
      console.log(
        `\x1b[93m     ESPERA - Reintentando (${
          retries + 1
        }/${maxRetries}) en 1 minuto...\x1b[0m`
      );
      setTimeout(
        () => retrySendFileToAPI(filePath, retries + 1),
        retryInterval
      );
    } else {
      console.error(
        `\x1b[91m     UPS - Error después de ${maxRetries} intentos. No se pudo enviar el archivo.\x1b[0m`
      );
    }
  }
}

// Función para eliminar el archivo después de enviarlo
async function deleteFile(filePath) {
  try {
    await fs.promises.unlink(filePath); // Eliminar archivo de forma asíncrona
    console.log(
      `\x1b[96m      LIMPIEZA - Archivo \x1b[93m${path.basename(
        filePath
      )} \x1b[92meliminado exitosamente.\x1b[0m`
    );
  } catch (error) {
    console.error(
      `\x1b[91m     UPS - Error al eliminar el archivo: \x1b[93m${path.basename(
        filePath
      )}\x1b[0m`,
      error
    );
  }
}

// Monitorizar la carpeta en busca de archivos nuevos

const filesInProcess = new Set(); // Objeto para rastrear archivos en proceso

fs.watch(directoryPath, (eventType, filename) => {
  if (eventType === "rename" && filename.endsWith(".RES")) {
    const filePath = path.join(directoryPath, filename);

    // Verificar si el archivo ya está en proceso
    if (filesInProcess.has(filePath)) {
      return; // Salir si ya está siendo procesado
    }

    // Verificar si el archivo existe (evita procesar eliminaciones)
    if (fs.existsSync(filePath)) {
      filesInProcess.add(filePath); // Marcar como en proceso
      console.log(
        `\x1b[32m  BÚSQUEDA - Nuevo archivo detectado: \x1b[93m${filename}\x1b[0m`
      );

      retrySendFileToAPI(filePath)
        .catch((err) => console.error(err))
        .finally(() => filesInProcess.delete(filePath)); // Liberar al finalizar
    }
  }
});

// Mensaje de confirmación cuando la aplicación está montada y funcionando
console.log("\x1b[96m ██████╗░███████╗░██████╗\x1b[0m");
console.log("\x1b[96m ██╔══██╗██╔════╝██╔════╝\x1b[0m");
console.log("\x1b[96m ██████╔╝█████╗░░╚█████╗░\x1b[0m");
console.log("\x1b[96m ██╔══██╗██╔══╝░░░╚═══██╗\x1b[0m");
console.log("\x1b[96m ██║░░██║███████╗██████╔╝\x1b[0m");
console.log("\x1b[96m ╚═╝░░╚═╝╚══════╝╚═════╝░\x1b[0m");
console.log(
  "\x1b[96m App en funcionamiento y escuchando cambios en la carpeta de archivos...\x1b[0m"
);
