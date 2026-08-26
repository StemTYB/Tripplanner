import { useEffect, useState } from 'react';
import { ImageOff } from 'lucide-react';

// Imagen opcional con fallback integrado: sin URL, URL inválida o recurso que
// no carga (onError) se dibuja un placeholder genérico en vez de un <img> roto.
// El ratio de aspecto se controla por prop (aspect-[4/3], aspect-video, ...).
// El flag de error se re-evalúa cuando cambia el src, para que el preview en
// vivo del formulario reintente al pegar una URL corregida.
function ItemImage({ src, alt, aspect = 'aspect-[4/3]', className = '' }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => { setFailed(false); }, [src]);
  const show = Boolean(src) && !failed;
  const frame = `${aspect} w-full shrink-0 overflow-hidden rounded-xl bg-paper-dim ${className}`;

  if (!show) {
    return (
      <div className={`${frame} flex items-center justify-center`}>
        <ImageOff size={20} className="text-ink" style={{ opacity: 0.35 }} />
      </div>
    );
  }

  return (
    <div className={frame}>
      <img src={src} alt={alt || ''} loading="lazy" onError={() => setFailed(true)} className="w-full h-full object-cover" />
    </div>
  );
}

export { ItemImage };
