#!/bin/bash

# Recuperar la copia de respaldo si existe
if [ -f /home/igor/Documentos/BPM/src/App.tsx.bak ]; then
  cp /home/igor/Documentos/BPM/src/App.tsx.bak /home/igor/Documentos/BPM/src/App.tsx
  echo "Restaurado App.tsx desde el backup"
else
  echo "No se encontró archivo de respaldo, no se pudo restaurar"
fi

# Mantenemos solo la importación y uso del AlbumSkeletonGrid
sed -i '/import SongTableSkeleton/d' /home/igor/Documentos/BPM/src/App.tsx
sed -i '/import AlbumDetailSkeleton/d' /home/igor/Documentos/BPM/src/App.tsx
sed -i '/import SearchResultsSkeleton/d' /home/igor/Documentos/BPM/src/App.tsx
sed -i '/import AlbumDetailWithSongsSkeleton/d' /home/igor/Documentos/BPM/src/App.tsx

# Asegurarnos de que solo exista el skeleton en la página principal
sed -i 's/<AlbumDetailWithSongsSkeleton songCount={8} \/>/Cargando detalles del álbum.../' /home/igor/Documentos/BPM/src/App.tsx

echo "Restaurada la versión que solo tenía los skeletons de las tarjetas de álbumes"
