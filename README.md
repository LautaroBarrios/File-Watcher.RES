# 🔍 AnalysisFilesWatcher

## 📌 Descripción

Este programa está diseñado para monitorear una carpeta en busca de nuevos archivos RES y enviar estos archivos a un servidor API en formato JSON. Si el envío de un archivo es exitoso, se eliminara de la carpeta, pero si falla, el programa intentará reenviarlo hasta un número máximo de veces y tiempo especificado.

> ## ⚠️ **IMPORTANTE**
>
> Si no se cambian las rutas de acuerdo al ordenador local va a arrojar error (`const result = binding.mkdir()`).
> Al no tener una URL de API va a arrojar un error hasta que se ingrese una correcta o modifique la función `sendFileToAPI()` que se encuentra a partir de la línea 52 para que haga lo que usted desea con los datos. **También, puede descomentar la línea 57 para ver qué datos se enviarían sin la necesidad de colocar una URL de API aún(ten en cuenta que no se borrarán los archivos de la carpeta en caso de utilizar esa línea).**

## 🎯 Acciones

- **Monitoreo de carpeta:** El programa observa una carpeta específica para detectar archivos RES nuevos.
- **Envío de archivos:** Los archivos RES detectados son procesados y enviados a un endpoint (API especificado en su .env).
- **Reintentos:** Si el envío de un archivo falla, el programa intentará reenviarlo la cantidad de veces establecida en el tiempo establecido (para prevenir problemas con cortes de internet).
- **Notificaciones en consola:** El programa imprime mensajes en la consola para indicar el estado del proceso (éxito, reintentos, error).

## ⚙️ Requisitos

- **Node.js**: Se requiere tener [Node.js](https://nodejs.org/en/download/prebuilt-installer) instalado para ejecutar este programa.
- **Generar un archivo ".env" en la ruta principal y agregar las siguientes variables de entorno:**
  - `API`: "colocar URL de la API para el envio de los datos.".

## 📂 Dependencias instaladas

- `node-fetch`: Para realizar las solicitudes HTTP a la API.
- `fs` y `path`: Para gestionar el sistema de archivos y las rutas.

## 📥 Instalación

1. Clona este repositorio o descarga los archivos del programa.
2. Instala las dependencias necesarias con el siguiente comando:

   ```bash
   npm install
   ```

## ▶️ Ejecución mediante terminal

- **Comando de producción:**

```bash
  npm start
```

- **Comando de desarrollo:**

```bash
  npm run nodemon
```

## 💻 Ejecución mediante ejecutable ".bat" en windows

1. Seleccionar el archivo "Ejecutable Files Watcher.bat", editar la primera línea estableciendo la ruta hacia la carpeta del proyecto, por ejemplo:

```
  cd /D "D:\EjemploDeRuta\File-watcher"
```

2. Una vez, editado y guardados los cambios, cerrar y darle doble click al archivo mencionado para que abra una terminal con la app en funcionamiento.

## 🔄 Iniciar la aplicación al iniciar el ordenador en windows

1. Teniendo el archivo "Ejecutable Files Watcher.bat" con la ruta establecida correctamente, creamos un acceso directo de este (clic derecho en el archivo y "Crear acceso directo").
2. Buscamos la herramienta ejecutar o pulsa las teclas "Win + R" y colocamos lo siguiente(sin comillas): "shell:startup" y le damos al botón de Aceptar, lo que nos llevará a las aplicaciones que inician cuando inician Windows.
3. Nos dirigimos al acceso directo que creamos previamente, lo seleccionamos dando un clic y movemos ("Ctl + X") este archivo a la carpeta que se abrio al seguir los pasos previamente ("Ctl + V" para pegar en la carpeta de Inicio).
4. Cerramos todo y reiniciamos el equipo para luego ver, si todo salió bien, que al iniciar el equipo se abrirá una terminal con nuestra app en funcionamiento.
