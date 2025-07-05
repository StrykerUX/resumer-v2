// Test del CV Formatter - Ejemplo de uso
import { CVFormatter } from './cv-formatter';

// Ejemplo de CV en Markdown (como el que proporcionaste)
const exampleMarkdownCV = `
**Julian Klimowicz**  
Combs-la-Ville, 77380, Seine-et-Marne, Île-de-France  
Teléfono: 07 83 84 80 10  
Email: klimowic.stefan77@gmail.com  

---

### Resumen Profesional
Soy un desarrollador de videojuegos apasionado, con experiencia en programación y diseño de juegos. Mi enfoque metódico y colaborativo me ha permitido contribuir en la creación de componentes gráficos y en la importación de assets 3D. Busco un entorno dinámico donde pueda aplicar mi creatividad y habilidades técnicas, favoreciendo la innovación y la excelencia en el desarrollo de videojuegos.

---

### Experiencia Laboral

**Practicante de Desarrollo de Videojuegos**  
*StudioPREMA*  
Septiembre 2024 - Noviembre 2024  
[StudioPREMA](https://afjv.com/societe/1330-studio-prema.htm)  
- Colaboré en la creación de componentes gráficos para "Epitiz", un módulo educativo innovador centrado en el aprendizaje de datos para jóvenes.
- Importé y optimicé más de 50 assets 3D, animaciones y efectos visuales (VFX) en estrecha colaboración con un equipo de Game Artists, logrando mejorar la calidad visual del juego en un 30%.
- Participé activamente en reuniones de equipo, donde ideamos y ejecutamos estrategias de diseño, fomentando un ambiente de trabajo colaborativo y creativo.

**Fundador y Coordinador de Proyectos**  
*Le Douzisme*  
Fecha de fundación: 2023  
- Fundé una asociación dedicada a promover la cultura y el arte digital, organizando eventos que reúnen a más de 100 artistas y desarrolladores en el ámbito de los videojuegos y las animaciones.
- Desarrollé y gestioné el primer evento de la asociación, superando el objetivo inicial de asistencia en un 150%, lo que fortaleció la red de contactos y colaboraciones en el sector.

---

### Educación

**Máster en Programación de Videojuegos**  
*Instituto de Educación Superior*  
Fecha de inicio: Actualidad

**Grado en Game Design**  
*Instituto de Educación Superior*  
Octubre 2021 - Junio 2024  
- Títulos obtenidos: Game Design, Diseñador Digital  
- Graduación prevista: 24 de junio de 2025

---

### Habilidades Técnicas
- **Desarrollo de Videojuegos:** Programación en C# y experiencia en Unity.
- **Diseño Gráfico:** Creación y edición de assets 3D y animaciones.
- **Colaboración:** Habilidades en trabajo en equipo y gestión de proyectos.
- **Optimización de Juegos:** Implementación de técnicas para mejorar el rendimiento y la calidad visual.

### Habilidades Blandas
- **Curiosidad:** Búsqueda constante de nuevas tendencias y tecnologías en el desarrollo de videojuegos.
- **Rigor:** Atención al detalle y compromiso con la calidad.
- **Metodología:** Enfoque estructurado en la resolución de problemas.
- **Habilidades Sociales:** Capacidad para trabajar en equipo y comunicarse de manera efectiva.

---

### Idiomas
- Francés: C1
- Inglés: B2
- Polaco: B2

---

### Certificaciones y Logros Adicionales
- Participante en talleres de desarrollo de videojuegos y diseño gráfico.
- Reconocimientos en eventos locales por proyectos de videojuegos innovadores.

---
`;

// Función para probar el formatter
export function testCVFormatter() {
  console.log('🧪 Probando CV Formatter...');
  
  const formattedHTML = CVFormatter.formatToHTML(exampleMarkdownCV);
  
  console.log('✅ CV formateado exitosamente');
  console.log('📏 Longitud del HTML:', formattedHTML.length);
  
  return formattedHTML;
}

// Función para probar la versión PDF
export function testCVFormatterPDF() {
  console.log('🧪 Probando CV Formatter para PDF...');
  
  const formattedPDF = CVFormatter.formatToPDF(exampleMarkdownCV);
  
  console.log('✅ CV para PDF formateado exitosamente');
  console.log('📏 Longitud del HTML para PDF:', formattedPDF.length);
  
  return formattedPDF;
}