import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // Create 7 pre-configured technicians
  const technicians = [
    {
      name: 'Carlos Rodríguez',
      email: 'carlos.rodriguez@masirep.com',
      technicianId: 'TEC-001',
      role: 'tecnico',
      password: 'temp123', // Will be hashed
    },
    {
      name: 'María González',
      email: 'maria.gonzalez@masirep.com',
      technicianId: 'TEC-002',
      role: 'tecnico',
      password: 'temp123',
    },
    {
      name: 'Juan Pérez',
      email: 'juan.perez@masirep.com',
      technicianId: 'TEC-003',
      role: 'tecnico',
      password: 'temp123',
    },
    {
      name: 'Ana Martínez',
      email: 'ana.martinez@masirep.com',
      technicianId: 'TEC-004',
      role: 'supervisor',
      password: 'temp123',
    },
    {
      name: 'Luis Fernández',
      email: 'luis.fernandez@masirep.com',
      technicianId: 'TEC-005',
      role: 'tecnico',
      password: 'temp123',
    },
    {
      name: 'Sofía López',
      email: 'sofia.lopez@masirep.com',
      technicianId: 'TEC-006',
      role: 'tecnico',
      password: 'temp123',
    },
    {
      name: 'Diego Sánchez',
      email: 'diego.sanchez@masirep.com',
      technicianId: 'TEC-007',
      role: 'admin',
      password: 'temp123',
    },
  ];

  // Create users with hashed passwords
  for (const tech of technicians) {
    const hashedPassword = await bcrypt.hash(tech.password, 10);

    await prisma.user.upsert({
      where: { email: tech.email },
      update: {},
      create: {
        name: tech.name,
        email: tech.email,
        technicianId: tech.technicianId,
        role: tech.role,
        passwordHash: hashedPassword,
      },
    });

    console.log(`✅ Created user: ${tech.name} (${tech.technicianId})`);
  }

  console.log('🏭 Creating locations and storage hierarchy...');

  // Create base locations
  const ubicaciones = await Promise.all([
    prisma.ubicacion.upsert({
      where: { codigo: 'AC-001' },
      update: {},
      create: {
        codigo: 'AC-001',
        nombre: 'Aceria Principal',
        descripcion: 'Área principal de producción de acero',
      },
    }),
    prisma.ubicacion.upsert({
      where: { codigo: 'MS-001' },
      update: {},
      create: {
        codigo: 'MS-001',
        nombre: 'Masi',
        descripcion: 'Área de maquinaria y sistemas',
      },
    }),
    prisma.ubicacion.upsert({
      where: { codigo: 'RD-001' },
      update: {},
      create: {
        codigo: 'RD-001',
        nombre: 'Reducción',
        descripcion: 'Área de procesos de reducción',
      },
    }),
  ]);

  // Create shelving units in different locations
  const estanterias = await Promise.all([
    prisma.estanteria.upsert({
      where: { codigo: 'EST-FRX-001' },
      update: {},
      create: {
        codigo: 'EST-FRX-001',
        nombre: 'Estantería FRX',
        descripcion: 'Estantería principal para repuestos grandes',
        ubicacionId: ubicaciones[0].id, // Aceria
      },
    }),
    prisma.estanteria.upsert({
      where: { codigo: 'EST-MS-001' },
      update: {},
      create: {
        codigo: 'EST-MS-001',
        nombre: 'Estantería Sistema 1',
        descripcion: 'Estantería para componentes electrónicos',
        ubicacionId: ubicaciones[1].id, // Masi
      },
    }),
  ]);

  // Create cabinets in different locations
  const armarios = await Promise.all([
    prisma.armario.upsert({
      where: { codigo: 'ARM-ACE-001' },
      update: {},
      create: {
        codigo: 'ARM-ACE-001',
        nombre: 'Armario ACE',
        descripcion: 'Armario para herramientas de precisión',
        ubicacionId: ubicaciones[0].id, // Aceria
      },
    }),
    prisma.armario.upsert({
      where: { codigo: 'ARM-RD-001' },
      update: {},
      create: {
        codigo: 'ARM-RD-001',
        nombre: 'Armario Reducción',
        descripcion: 'Armario para repuestos específicos',
        ubicacionId: ubicaciones[2].id, // Reduccion
      },
    }),
  ]);

  // Create drawers for shelving units and cabinets
  const cajones = await Promise.all([
    // Drawers in estanteria FRX
    prisma.cajon.upsert({
      where: { codigo: 'CAJ-FRX-001-1' },
      update: {},
      create: {
        codigo: 'CAJ-FRX-001-1',
        nombre: 'Cajón 1 - Filtros',
        descripcion: 'Filtros de aceite y aire',
        estanteriaId: estanterias[0].id,
      },
    }),
    prisma.cajon.upsert({
      where: { codigo: 'CAJ-FRX-001-2' },
      update: {},
      create: {
        codigo: 'CAJ-FRX-001-2',
        nombre: 'Cajón 2 - Rodamientos',
        descripcion: 'Rodamientos y bujes',
        estanteriaId: estanterias[0].id,
      },
    }),
    // Drawers in armario ACE
    prisma.cajon.upsert({
      where: { codigo: 'CAJ-ACE-001-1' },
      update: {},
      create: {
        codigo: 'CAJ-ACE-001-1',
        nombre: 'Cajón Herramientas',
        descripcion: 'Herramientas de mano',
        armarioId: armarios[0].id,
      },
    }),
  ]);

  // Create shelves in estanterias
  const estantes = await Promise.all([
    prisma.estante.upsert({
      where: { codigo: 'EST-FRX-001-1' },
      update: {},
      create: {
        codigo: 'EST-FRX-001-1',
        nombre: 'Estante 1 - Motores',
        descripcion: 'Motores y accesorios',
        estanteriaId: estanterias[0].id,
      },
    }),
    prisma.estante.upsert({
      where: { codigo: 'EST-FRX-001-2' },
      update: {},
      create: {
        codigo: 'EST-FRX-001-2',
        nombre: 'Estante 2 - Bombas',
        descripcion: 'Bombas hidráulicas',
        estanteriaId: estanterias[0].id,
      },
    }),
  ]);

  // Create divisions in drawers
  const divisiones = await Promise.all([
    prisma.division.upsert({
      where: { codigo: 'DIV-FRX-001-1-1' },
      update: {},
      create: {
        codigo: 'DIV-FRX-001-1-1',
        nombre: 'División 1 - Filtros Aceite',
        cajonId: cajones[0].id,
      },
    }),
    prisma.division.upsert({
      where: { codigo: 'DIV-FRX-001-1-2' },
      update: {},
      create: {
        codigo: 'DIV-FRX-001-1-2',
        nombre: 'División 2 - Filtros Aire',
        cajonId: cajones[0].id,
      },
    }),
  ]);

  // Create organizers for components
  const organizadores = await Promise.all([
    prisma.organizador.upsert({
      where: { codigo: 'ORG-MS-001-1' },
      update: {},
      create: {
        codigo: 'ORG-MS-001-1',
        nombre: 'Organizador Resistencias',
        descripcion: 'Resistencias de varios valores',
        estanteriaId: estanterias[1].id,
      },
    }),
    prisma.organizador.upsert({
      where: { codigo: 'ORG-MS-001-2' },
      update: {},
      create: {
        codigo: 'ORG-MS-001-2',
        nombre: 'Organizador Capacitores',
        descripcion: 'Capacitores electrolíticos y cerámicos',
        estanteriaId: estanterias[1].id,
      },
    }),
  ]);

  // Create small compartments (cajoncitos)
  const cajoncitos = await Promise.all([
    prisma.cajoncito.upsert({
      where: { codigo: 'CJC-MS-001-1-1' },
      update: {},
      create: {
        codigo: 'CJC-MS-001-1-1',
        nombre: '1KΩ 1/4W',
        descripcion: 'Resistencias 1KΩ 1/4W',
        organizadorId: organizadores[0].id,
      },
    }),
    prisma.cajoncito.upsert({
      where: { codigo: 'CJC-MS-001-1-2' },
      update: {},
      create: {
        codigo: 'CJC-MS-001-1-2',
        nombre: '10KΩ 1/4W',
        descripcion: 'Resistencias 10KΩ 1/4W',
        organizadorId: organizadores[0].id,
      },
    }),
  ]);

  console.log('🔧 Creating equipment...');

  // Create equipment
  const equipos = await Promise.all([
    prisma.equipo.upsert({
      where: { codigo: 'EQ-001' },
      update: {},
      create: {
        codigo: 'EQ-001',
        sap: '1000001',
        nombre: 'Torno CNC HAAS VF-2',
        descripcion: 'Torno CNC control numérico',
        marca: 'HAAS',
        modelo: 'VF-2',
        numeroSerie: 'HAAS-VF2-2023-001',
      },
    }),
    prisma.equipo.upsert({
      where: { codigo: 'EQ-002' },
      update: {},
      create: {
        codigo: 'EQ-002',
        sap: '1000002',
        nombre: 'Fresadora Vertical',
        descripcion: 'Fresadora vertical 3 ejes',
        marca: 'Bridgeport',
        modelo: 'Series 1',
        numeroSerie: 'BP-001234',
      },
    }),
    prisma.equipo.upsert({
      where: { codigo: 'EQ-003' },
      update: {},
      create: {
        codigo: 'EQ-003',
        sap: '1000003',
        nombre: 'Compresor de Aire',
        descripcion: 'Compresor de aire industrial 50HP',
        marca: 'Ingersoll Rand',
        modelo: 'XV-250',
        numeroSerie: 'IR-250-2022-005',
      },
    }),
  ]);

  console.log('📦 Creating spare parts...');

  // Create spare parts
  const repuestos = await Promise.all([
    prisma.repuesto.upsert({
      where: { codigo: 'REP-001' },
      update: {},
      create: {
        codigo: 'REP-001',
        nombre: 'Rodamiento 6205-2RS',
        descripcion: 'Rodamiento de bolas con doble sello',
        marca: 'SKF',
        modelo: '6205-2RS',
        numeroParte: '6205-2RS-C3',
        stockMinimo: 5,
        categoria: 'Rodamientos',
      },
    }),
    prisma.repuesto.upsert({
      where: { codigo: 'REP-002' },
      update: {},
      create: {
        codigo: 'REP-002',
        nombre: 'Filtro de Aceite FL-400S',
        descripcion: 'Filtro de aceite para motor diesel',
        marca: 'WIX',
        modelo: 'FL-400S',
        numeroParte: 'WIX-400S',
        stockMinimo: 10,
        categoria: 'Filtros',
      },
    }),
    prisma.repuesto.upsert({
      where: { codigo: 'REP-003' },
      update: {},
      create: {
        codigo: 'REP-003',
        nombre: 'Banda Industrial B-50',
        descripcion: 'Banda industrial en V tipo B',
        marca: 'Gates',
        modelo: 'B-50',
        numeroParte: 'GATES-B50',
        stockMinimo: 8,
        categoria: 'Bandas',
      },
    }),
    prisma.repuesto.upsert({
      where: { codigo: 'REP-004' },
      update: {},
      create: {
        codigo: 'REP-004',
        nombre: 'Kit de Juntas Torno CNC',
        descripcion: 'Kit completo de juntas para torno CNC',
        marca: 'HAAS',
        modelo: 'VF-2-GASKET-KIT',
        numeroParte: 'HAAS-VF2-GASKET-001',
        stockMinimo: 2,
        categoria: 'Juntas',
      },
    }),
  ]);

  console.log('🔌 Creating electronic components...');

  // Create electronic components with new schema
  const componentes = await Promise.all([
    prisma.componente.create({
      data: {
        categoria: 'RESISTENCIA',
        descripcion: 'Resistencia carbón 1KΩ 1/4W 5%',
        valorUnidad: [
          { valor: '1K', unidad: 'Ω' },
          { valor: '1/4', unidad: 'W' },
          { valor: '5', unidad: '%' }
        ],
        stockMinimo: 100,
      },
    }),
    prisma.componente.create({
      data: {
        categoria: 'CAPACITOR',
        descripcion: 'Capacitor electrolítico 100µF 25V',
        valorUnidad: [
          { valor: '100', unidad: 'µF' },
          { valor: '25', unidad: 'V' }
        ],
        stockMinimo: 50,
      },
    }),
    prisma.componente.create({
      data: {
        categoria: 'OTROS',
        descripcion: 'LED rojo estándar 5mm',
        valorUnidad: [
          { valor: 'Rojo', unidad: 'color' },
          { valor: '5mm', unidad: 'diámetro' },
          { valor: '20', unidad: 'mA' }
        ],
        stockMinimo: 200,
      },
    }),
  ]);

  console.log('🔗 Creating relationships...');

  // Create equipment-spare part relationships
  await Promise.all([
    // Torno CNC - Rodamiento
    prisma.repuestoEquipo.upsert({
      where: {
        repuestoId_equipoId: {
          repuestoId: repuestos[0].id,
          equipoId: equipos[0].id
        }
      },
      update: {},
      create: {
        repuestoId: repuestos[0].id, // Rodamiento
        equipoId: equipos[0].id,     // Torno CNC
      },
    }),
    // Torno CNC - Kit de Juntas
    prisma.repuestoEquipo.upsert({
      where: {
        repuestoId_equipoId: {
          repuestoId: repuestos[3].id,
          equipoId: equipos[0].id
        }
      },
      update: {},
      create: {
        repuestoId: repuestos[3].id, // Kit de Juntas
        equipoId: equipos[0].id,     // Torno CNC
      },
    }),
    // Compresor - Filtro
    prisma.repuestoEquipo.upsert({
      where: {
        repuestoId_equipoId: {
          repuestoId: repuestos[1].id,
          equipoId: equipos[2].id
        }
      },
      update: {},
      create: {
        repuestoId: repuestos[1].id, // Filtro
        equipoId: equipos[2].id,     // Compresor
      },
    }),
  ]);

  // Create storage locations for spare parts
  await Promise.all([
    // Store rodamientos in cajon
    prisma.repuestoUbicacion.upsert({
      where: { id: 'ru-001' },
      update: {},
      create: {
        id: 'ru-001',
        repuestoId: repuestos[0].id, // Rodamiento
        cajonId: cajones[1].id,     // Cajón de Rodamientos
      },
    }),
    // Store filtros in division
    prisma.repuestoUbicacion.upsert({
      where: { id: 'ru-002' },
      update: {},
      create: {
        id: 'ru-002',
        repuestoId: repuestos[1].id, // Filtro
        divisionId: divisiones[0].id, // División de Filtros de Aceite
      },
    }),
    // Store bandas in estante
    prisma.repuestoUbicacion.upsert({
      where: { id: 'ru-003' },
      update: {},
      create: {
        id: 'ru-003',
        repuestoId: repuestos[2].id, // Banda
        estanteId: estantes[0].id,   // Estante de Motores
      },
    }),
  ]);

  // Create storage locations for components
  await Promise.all([
    // Store resistencias in cajoncitos
    prisma.componenteUbicacion.upsert({
      where: {
        componenteId_cajoncitoId: {
          componenteId: componentes[0].id,
          cajoncitoId: cajoncitos[0].id
        }
      },
      update: {},
      create: {
        componenteId: componentes[0].id, // Resistencia 1KΩ
        cajoncitoId: cajoncitos[0].id,  // Cajoncito 1KΩ
      },
    }),
    prisma.componenteUbicacion.upsert({
      where: {
        componenteId_cajoncitoId: {
          componenteId: componentes[0].id,
          cajoncitoId: cajoncitos[1].id
        }
      },
      update: {},
      create: {
        componenteId: componentes[0].id, // Resistencia 1KΩ (mismo tipo en otro cajoncito)
        cajoncitoId: cajoncitos[1].id,  // Cajoncito 10KΩ (vacío, pero creamos relación)
      },
    }),
  ]);

  // Update stockActual based on storage quantities
  await Promise.all([
    prisma.repuesto.update({
      where: { id: repuestos[0].id },
      data: { stockActual: 15 }, // Rodamientos
    }),
    prisma.repuesto.update({
      where: { id: repuestos[1].id },
      data: { stockActual: 25 }, // Filtros
    }),
    prisma.repuesto.update({
      where: { id: repuestos[2].id },
      data: { stockActual: 12 }, // Bandas
    }),
    // Note: Componente stockActual is removed - stock is calculated from ComponenteUbicacion relationships
  ]);

  console.log('✨ Creating sample transactions...');

  // Get admin user for transactions
  const adminUser = await prisma.user.findFirst({
    where: { role: 'admin' }
  });

  if (adminUser) {
    // Create sample transactions
    await Promise.all([
      prisma.transaccion.upsert({
        where: { codigo: 'TRX-001' },
        update: {},
        create: {
          codigo: 'TRX-001',
          tipo: 'entrada',
          itemId: repuestos[0].id,
          itemType: 'repuesto',
          cantidad: 5, // 15 - 10
          stockAnterior: 10,
          stockNuevo: 15,
          motivo: 'Reposición de stock',
          referencia: 'OC-2023-001',
          userId: adminUser.id,
        },
      }),
      prisma.transaccion.upsert({
        where: { codigo: 'TRX-002' },
        update: {},
        create: {
          codigo: 'TRX-002',
          tipo: 'salida',
          itemId: repuestos[1].id,
          itemType: 'repuesto',
          cantidad: -3, // 25 - 28
          stockAnterior: 28,
          stockNuevo: 25,
          motivo: 'Mantenimiento preventivo',
          referencia: 'OT-2023-045',
          destinoTipo: 'cajon',
          destinoId: cajones[0].id,
          userId: adminUser.id,
        },
      }),
    ]);
  }

  console.log('📊 Summary of created data:');
  console.log(`📍 Ubicaciones: ${ubicaciones.length}`);
  console.log(`🏗️  Estanterías: ${estanterias.length}`);
  console.log(`🚪 Armarios: ${armarios.length}`);
  console.log(`📁 Cajones: ${cajones.length}`);
  console.log(`📋 Estantes: ${estantes.length}`);
  console.log(`📐 Divisiones: ${divisiones.length}`);
  console.log(`🎯 Organizadores: ${organizadores.length}`);
  console.log(`📦 Cajoncitos: ${cajoncitos.length}`);
  console.log(`🔧 Equipos: ${equipos.length}`);
  console.log(`⚙️  Repuestos: ${repuestos.length}`);
  console.log(`🔌 Componentes: ${componentes.length}`);

  console.log('✅ Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });