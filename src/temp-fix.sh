#!/bin/bash

# Recuperar la copia de respaldo si existe
if [ -f /home/igor/Documentos/BPM/src/App.tsx.bak ]; then
  cp /home/igor/Documentos/BPM/src/App.tsx.bak /home/igor/Documentos/BPM/src/App.tsx
else
  # Si no hay backup, notificamos
  echo "No se encontró archivo de respaldo"
fi

# Modificar el App.tsx para incluir las importaciones de los skeletons
if grep -q "AlbumCardSkeleton" /home/igor/Documentos/BPM/src/App.tsx; then
  # Ya existe la importación, actualizamos para incluir todos los skeletons
  sed -i 's/import { AlbumSkeletonGrid } from .\/components\/ui\/AlbumCardSkeleton/import { AlbumSkeletonGrid } from ".\/components\/ui\/AlbumCardSkeleton"\nimport SongTableSkeleton from ".\/components\/ui\/SongTableSkeleton"\nimport AlbumDetailSkeleton from ".\/components\/ui\/AlbumDetailSkeleton"\nimport SearchResultsSkeleton from ".\/components\/ui\/SearchResultsSkeleton"\nimport AlbumDetailWithSongsSkeleton from ".\/components\/ui\/AlbumDetailWithSongsSkeleton"/' /home/igor/Documentos/BPM/src/App.tsx
else
  # No existe la importación, la agregamos antes de la primera línea que contenga "import"
  sed -i '1s/^/import { AlbumSkeletonGrid } from ".\/components\/ui\/AlbumCardSkeleton"\nimport SongTableSkeleton from ".\/components\/ui\/SongTableSkeleton"\nimport AlbumDetailSkeleton from ".\/components\/ui\/AlbumDetailSkeleton"\nimport SearchResultsSkeleton from ".\/components\/ui\/SearchResultsSkeleton"\nimport AlbumDetailWithSongsSkeleton from ".\/components\/ui\/AlbumDetailWithSongsSkeleton"\n\n/' /home/igor/Documentos/BPM/src/App.tsx
fi

# Reemplazar el mensaje de carga en la página de álbumes por el skeleton grid
sed -i 's/Cargando álbumes.../<AlbumSkeletonGrid count={8} \/>/' /home/igor/Documentos/BPM/src/App.tsx

# Reemplazar el mensaje de carga en la página de detalle del álbum por el skeleton
sed -i 's/Cargando detalles del álbum.../<AlbumDetailWithSongsSkeleton songCount={8} \/>/' /home/igor/Documentos/BPM/src/App.tsx

echo "Archivo App.tsx actualizado correctamente con los componentes skeleton"
