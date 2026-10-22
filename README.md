# MotorStock

Demo estática de una tienda de repuestos automotrices construida únicamente con HTML5, CSS3 y JavaScript vanilla. El catálogo y el stock son ficticios: sirven para validar la experiencia antes de incorporar el inventario real del taller.

## Ejecutar

Abre la carpeta en VS Code y ejecuta `index.html` con una extensión como **Live Server**. El archivo JSON se carga mediante `fetch()`, por lo que normalmente requiere un servidor local y no funciona al abrir el HTML directamente con `file://`.

## Personalizar

- **Nombre, WhatsApp y moneda:** edita [`js/config.js`](js/config.js). El número debe estar en formato internacional, sin `+`, espacios ni guiones. El número incluido es un marcador de demostración.
- **Logo:** modifica los dos SVG inline del encabezado y pie en [`index.html`](index.html).
- **Productos, precios y stock:** reemplaza los elementos de [`data/products.json`](data/products.json). Mantén las propiedades existentes y actualiza `metadata.isDemo` y `metadata.totalStock` cuando uses datos reales.
- **Imágenes:** agrega SVG locales en [`assets/images/`](assets/images/) y actualiza la propiedad `image`. Las rutas se validan y tienen un respaldo seguro.
- **Estilos:** ajusta [`css/styles.css`](css/styles.css).

Los SKU, nombres, compatibilidades, precios y cantidades actuales son completamente ficticios. La demo no procesa pagos ni confirma compras: todas las consultas se coordinan por WhatsApp y quedan sujetas a confirmación.
