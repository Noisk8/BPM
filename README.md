# BPM Music Manager

Un sistema moderno para gestionar tu biblioteca musical organizada por BPM (Beats Per Minute) con un sistema intuitivo de codificación por colores.

## Sistema de Colores por BPM

El sistema usa los siguientes códigos de colores para clasificar las canciones según su BPM:

| BPM | Color | Emoji |
|-----|-------|-------|
| 70-90 | Azul | 🔵 |
| 90-100 | Verde | 🟢 |
| 100-110 | Amarillo | 🟡 |
| 110-120 | Naranja | 🟠 |
| 120-130 | Rojo | 🔴 |
| 130-140 | Púrpura | 🟣 |

## Características

- **Panel de Administración**: Gestiona artistas, álbumes y canciones
- **Interfaz Intuitiva**: Visualización clara con código de colores por BPM
- **Filtrado Avanzado**: Filtra canciones por rango de BPM
- **Deployment Sencillo**: Listo para desplegar en Vercel
- **Base de Datos**: Integración con Supabase (PostgreSQL)

## Tecnologías

- Frontend: React + TypeScript + Vite
- UI: Chakra UI
- Estado: React Query
- Backend/DB: Supabase

## Instalación

1. Clona este repositorio
2. Instala las dependencias:

```bash
npm install
```

3. Crea un archivo `.env` con tus credenciales de Supabase:

```
VITE_SUPABASE_URL=tu_url_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anonima
```

4. Inicia el servidor de desarrollo:

```bash
npm run dev
```

## Despliegue

El proyecto está configurado para un fácil despliegue en Vercel:

1. Conecta el repositorio a Vercel
2. Agrega las variables de entorno en la configuración del proyecto
3. ¡Listo!

## Estructura de la Base de Datos

La aplicación utiliza las siguientes tablas principales:

- `artists`: Información de artistas
- `albums`: Álbumes y su relación con artistas
- `songs`: Canciones con BPM, colores y relaciones

## Cómo Usar

1. Ve a la sección Admin y añade artistas, álbumes y canciones
2. Explora tu biblioteca en la sección Canciones
3. Filtra por rango de BPM usando el control deslizante
4. Organiza tus sets con la información de colores y BPM


- **70-90**: 🔵
- **90-100**: 🟢
- **100-110**: 🟡
- **110-120**: c
- **120-130**: 🔴
- **130-140**: 🟣

