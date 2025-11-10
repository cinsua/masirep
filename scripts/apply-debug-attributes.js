#!/usr/bin/env node

/**
 * Script para aplicar automáticamente atributos de depuración a todos los componentes
 * 
 * Uso: npm run apply-debug-attributes
 */

const fs = require('fs');
const path = require('path');

// Configuración
const COMPONENTS_DIR = path.join(__dirname, '../src/components');
const EXCLUDED_PATTERNS = [
  /__tests__/,
  /\.test\.tsx$/,
  /\.stories\.tsx$/,
  /ui\//,  // Excluir componentes UI básicos
];

// Plantilla para importar la utilidad
const IMPORT_STATEMENT = `import { createDebugAttributes } from "@/lib/debug-attributes";`;

// Plantilla para atributos de depuración
const DEBUG_ATTRS_TEMPLATE = (componentName, filePath) => `
  // Atributos de depuración para el componente principal
  const debugAttrs = createDebugAttributes({
    componentName: '${componentName}',
    filePath: '${filePath}'
  });`;

// Función para verificar si un archivo debe ser procesado
function shouldProcessFile(filePath) {
  return !EXCLUDED_PATTERNS.some(pattern => pattern.test(filePath));
}

// Función para extraer el nombre del componente del archivo
function extractComponentName(content, filePath) {
  const fileName = path.basename(filePath, '.tsx');
  
  // Buscar export function ComponentName
  const functionMatch = content.match(/export\s+function\s+(\w+)/);
  if (functionMatch) return functionMatch[1];
  
  // Buscar export const ComponentName
  const constMatch = content.match(/export\s+const\s+(\w+)\s*=/);
  if (constMatch) return constMatch[1];
  
  // Buscar export default function ComponentName
  const defaultFunctionMatch = content.match(/export\s+default\s+function\s+(\w+)/);
  if (defaultFunctionMatch) return defaultFunctionMatch[1];
  
  // Fallback al nombre del archivo
  return fileName;
}

// Función para encontrar el elemento principal del componente
function findMainElement(content) {
  // Buscar el primer return con JSX
  const returnMatch = content.match(/return\s*\(\s*<(\w+)/);
  if (returnMatch) return returnMatch[1];
  
  // Buscar return con componente
  const componentReturnMatch = content.match(/return\s*\(\s*<(\w+)\s+([^>]*?)>/);
  if (componentReturnMatch) return componentReturnMatch[1];
  
  return null;
}

// Función para aplicar atributos de depuración a un archivo
function applyDebugAttributes(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Verificar si ya tiene atributos de depuración
    if (content.includes('createDebugAttributes') || content.includes('data-debug')) {
      console.log(`⏭️  Skipping ${filePath} (already has debug attributes)`);
      return;
    }
    
    const componentName = extractComponentName(content, filePath);
    const relativePath = path.relative(path.join(__dirname, '../src'), filePath);
    
    // Encontrar dónde insertar el import
    const importInsertIndex = content.lastIndexOf('import');
    const importEndIndex = content.indexOf('\n', importInsertIndex);
    
    // Insertar import
    let newContent = content.slice(0, importEndIndex) + 
                    '\n' + IMPORT_STATEMENT + 
                    content.slice(importEndIndex);
    
    // Encontrar dónde insertar los atributos de depuración
    const componentMatch = newContent.match(
      new RegExp(`export\\s+(?:function|const)\\s+${componentName}\\s*\\([^)]*\\)\\s*{`)
    );
    
    if (!componentMatch) {
      console.log(`❌ Could not find component definition in ${filePath}`);
      return;
    }
    
    const componentStartIndex = componentMatch.index + componentMatch[0].length;
    
    // Insertar atributos de depuración
    newContent = newContent.slice(0, componentStartIndex) +
                DEBUG_ATTRS_TEMPLATE(componentName, relativePath) +
                newContent.slice(componentStartIndex);
    
    // Encontrar y modificar el elemento principal
    const mainElement = findMainElement(newContent);
    if (mainElement) {
      const elementRegex = new RegExp(`(<${mainElement}[^>]*?)>`, 'g');
      newContent = newContent.replace(elementRegex, '$1 {...debugAttrs}>');
    }
    
    // Escribir el archivo modificado
    fs.writeFileSync(filePath, newContent);
    console.log(`✅ Applied debug attributes to ${componentName} in ${filePath}`);
    
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

// Función para encontrar todos los archivos de componentes
function findComponentFiles(dir) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        traverse(fullPath);
      } else if (item.endsWith('.tsx') && shouldProcessFile(fullPath)) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

// Función principal
function main() {
  console.log('🔍 Applying debug attributes to components...\n');
  
  if (!fs.existsSync(COMPONENTS_DIR)) {
    console.error(`❌ Components directory not found: ${COMPONENTS_DIR}`);
    process.exit(1);
  }
  
  const componentFiles = findComponentFiles(COMPONENTS_DIR);
  console.log(`📁 Found ${componentFiles.length} component files\n`);
  
  let processed = 0;
  let skipped = 0;
  
  for (const file of componentFiles) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      
      // Verificar si es un componente React real
      if (content.includes('export') && 
          (content.includes('function') || content.includes('const')) &&
          content.includes('return') &&
          content.includes('<')) {
        
        // Verificar si ya tiene atributos
        if (content.includes('createDebugAttributes') || content.includes('data-debug')) {
          console.log(`⏭️  Skipping ${path.relative(process.cwd(), file)} (already has debug attributes)`);
          skipped++;
        } else {
          applyDebugAttributes(file);
          processed++;
        }
      } else {
        console.log(`⏭️  Skipping ${path.relative(process.cwd(), file)} (not a React component)`);
        skipped++;
      }
    } catch (error) {
      console.error(`❌ Error reading ${file}:`, error.message);
      skipped++;
    }
  }
  
  console.log(`\n🎉 Summary:`);
  console.log(`   ✅ Processed: ${processed} files`);
  console.log(`   ⏭️  Skipped: ${skipped} files`);
  console.log(`   📊 Total: ${componentFiles.length} files`);
  
  if (processed > 0) {
    console.log(`\n🚀 Debug attributes have been applied!`);
    console.log(`   You can now inspect components in your browser with:`);
    console.log(`   - data-debug-component-name`);
    console.log(`   - data-debug-component-file`);
  }
}

// Ejecutar script
if (require.main === module) {
  main();
}

module.exports = { applyDebugAttributes, findComponentFiles };