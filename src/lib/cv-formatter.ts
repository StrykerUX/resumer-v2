// Procesador de CV - Convierte Markdown a HTML Profesional
import { marked } from 'marked';

export class CVFormatter {
  
  /**
   * Convierte un CV en formato Markdown a HTML profesional
   * @param markdownCV - CV en formato Markdown
   * @returns CV en HTML con estilos profesionales
   */
  static formatToHTML(markdownCV: string): string {
    // Configurar marked para mejor rendering
    marked.setOptions({
      breaks: true,
      gfm: true,
    });
    
    // Limpiar el markdown de caracteres problemáticos
    const cleanMarkdown = this.cleanMarkdown(markdownCV);
    
    // Convertir Markdown a HTML
    const html = marked(cleanMarkdown);
    
    // Aplicar estilos CSS profesionales
    return this.applyProfessionalStyles(html);
  }
  
  /**
   * Limpia el markdown de caracteres problemáticos
   */
  private static cleanMarkdown(markdown: string): string {
    return markdown
      // Limpiar múltiples saltos de línea
      .replace(/\n{3,}/g, '\n\n')
      // Limpiar espacios extra
      .replace(/[ \t]+$/gm, '')
      // Asegurar que los headers tengan espacio
      .replace(/^(#{1,6})([^\s])/gm, '$1 $2')
      // Limpiar caracteres especiales problemáticos
      .replace(/[""]/g, '"')
      .replace(/['']/g, "'")
      .trim();
  }
  
  /**
   * Aplica estilos CSS minimalistas ATS-friendly al HTML
   */
  private static applyProfessionalStyles(html: string): string {
    return `
      <div class="cv-container">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
          
          .cv-container {
            max-width: 800px;
            margin: 0;
            padding: 30px;
            font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #000;
            background: #fff;
          }
          
          /* Encabezado Principal */
          .cv-container h1 {
            color: #000;
            font-size: 2.2em;
            font-weight: 600;
            margin-bottom: 8px;
            margin-top: 0;
            text-align: left;
            border-bottom: 2px solid #000;
            padding-bottom: 8px;
          }
          
          /* Información de Contacto */
          .cv-container p:first-of-type {
            text-align: left;
            color: #000;
            font-size: 1em;
            font-weight: 400;
            margin-bottom: 25px;
            margin-top: 8px;
            line-height: 1.5;
          }
          
          /* Separadores */
          .cv-container hr {
            border: none;
            height: 1px;
            background: #000;
            margin: 25px 0;
          }
          
          /* Secciones (h2, h3) */
          .cv-container h2,
          .cv-container h3 {
            color: #000;
            margin-top: 30px;
            margin-bottom: 15px;
            font-weight: 600;
            text-align: left;
          }
          
          .cv-container h2 {
            font-size: 1.6em;
            font-weight: 600;
            border-bottom: 1px solid #000;
            padding-bottom: 5px;
          }
          
          .cv-container h3 {
            font-size: 1.3em;
            font-weight: 500;
          }
          
          /* Experiencia Laboral */
          .cv-container strong {
            color: #000;
            font-weight: 600;
          }
          
          .cv-container em {
            color: #000;
            font-style: italic;
          }
          
          /* Listas */
          .cv-container ul {
            padding-left: 20px;
            margin-bottom: 20px;
            margin-top: 10px;
          }
          
          .cv-container li {
            margin-bottom: 6px;
            color: #000;
            text-align: left;
            font-weight: 400;
          }
          
          .cv-container li::marker {
            color: #000;
          }
          
          /* Enlaces */
          .cv-container a {
            color: #000;
            text-decoration: underline;
          }
          
          .cv-container a:hover {
            color: #000;
            text-decoration: underline;
          }
          
          /* Párrafos */
          .cv-container p {
            margin-bottom: 12px;
            text-align: left;
            color: #000;
            font-weight: 400;
          }
          
          /* Habilidades en línea */
          .cv-container h4 {
            color: #000;
            margin-top: 18px;
            margin-bottom: 8px;
            font-size: 1.1em;
            font-weight: 500;
          }
          
          /* Espaciado limpio entre secciones */
          .cv-container h2 + p,
          .cv-container h3 + p {
            margin-top: 10px;
          }
          
          .cv-container h2 + ul,
          .cv-container h3 + ul {
            margin-top: 10px;
          }
          
          /* Optimización para ATS y impresión */
          @media print {
            .cv-container {
              padding: 20px;
              margin: 0;
            }
            
            .cv-container h1 {
              font-size: 1.8em;
              page-break-after: avoid;
            }
            
            .cv-container h2 {
              font-size: 1.4em;
              page-break-after: avoid;
            }
            
            .cv-container h3 {
              font-size: 1.2em;
              page-break-after: avoid;
            }
            
            .cv-container a {
              color: #000;
              text-decoration: none;
            }
            
            .cv-container hr {
              background: #000;
              height: 1px;
            }
            
            .cv-container ul {
              page-break-inside: avoid;
            }
            
            .cv-container li {
              page-break-inside: avoid;
            }
          }
          
          /* Responsive manteniendo legibilidad */
          @media (max-width: 768px) {
            .cv-container {
              padding: 15px;
              margin: 0;
            }
            
            .cv-container h1 {
              font-size: 1.8em;
            }
            
            .cv-container h2 {
              font-size: 1.4em;
            }
            
            .cv-container h3 {
              font-size: 1.2em;
            }
          }
          
          /* Espaciado específico para mejor legibilidad */
          .cv-container h3 + p {
            margin-top: 8px;
          }
          
          .cv-container p + ul {
            margin-top: 8px;
          }
          
          /* Asegurar que todo el texto sea negro */
          .cv-container * {
            color: #000 !important;
          }
          
          /* Mejorar legibilidad de secciones */
          .cv-container > * {
            margin-left: 0;
            text-align: left;
          }
        </style>
        ${html}
      </div>
    `;
  }
  
  /**
   * Convierte un CV a HTML para exportación PDF
   * @param markdownCV - CV en formato Markdown
   * @returns CV en HTML optimizado para PDF
   */
  static formatToPDF(markdownCV: string): string {
    const html = this.formatToHTML(markdownCV);
    
    // Añadir estilos específicos para PDF
    return html.replace(
      '</style>',
      `
        /* Estilos específicos para PDF */
        @page {
          margin: 2cm;
          size: A4;
        }
        
        .cv-container {
          box-shadow: none !important;
          border-radius: 0 !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        
        .cv-container h1 {
          page-break-after: avoid;
        }
        
        .cv-container h2,
        .cv-container h3 {
          page-break-after: avoid;
          page-break-inside: avoid;
        }
        
        .cv-container ul {
          page-break-inside: avoid;
        }
        
        .cv-container li {
          page-break-inside: avoid;
        }
        
        </style>`
    );
  }
  
  /**
   * Extrae solo el texto plano del CV (sin formato)
   * @param markdownCV - CV en formato Markdown
   * @returns Texto plano del CV
   */
  static extractPlainText(markdownCV: string): string {
    return markdownCV
      .replace(/[#*_`~\[\]()]/g, '')
      .replace(/\n{2,}/g, '\n\n')
      .replace(/^\s+|\s+$/g, '')
      .trim();
  }
}

// Función helper para usar en las APIs
export function formatCVToHTML(markdownCV: string): string {
  return CVFormatter.formatToHTML(markdownCV);
}

export function formatCVToPDF(markdownCV: string): string {
  return CVFormatter.formatToPDF(markdownCV);
}