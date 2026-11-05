import { PrismaClient, Role, CustomerTier, ProfessionalStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do Konnexy Agenda...');

  const passwordHash = await bcrypt.hash('Konnexy@2026', 10);

  // ---------------------------------------------------------------------------
  // TENANT 1: Konnexy Beauty Studio (Flagship)
  // ---------------------------------------------------------------------------
  const tenant1 = await prisma.tenant.upsert({
    where: { slug: 'konnexy-demo' },
    update: {
      name: 'Konnexy Beauty Studio',
      phone: '(11) 98765-4321',
      address: 'Alameda Santos, 1200 - Jardins, São Paulo - SP',
      visualTheme: {
        primaryColor: '#22d3ee',
        secondaryColor: '#7c3aed',
        darkTheme: true,
        headerBanner: 'Experiência Konnexy Hair & Beauty',
      },
      businessSettings: {
        businessType: 'salon',
        cancelationWindowHours: 4,
        minAdvanceMinutes: 60,
        maxAdvanceDays: 45,
        requiresDeposit: true,
        depositPercentage: 20.0,
      },
    },
    create: {
      slug: 'konnexy-demo',
      name: 'Konnexy Beauty Studio',
      phone: '(11) 98765-4321',
      email: 'contato@konnexy.com.br',
      address: 'Alameda Santos, 1200 - Jardins, São Paulo - SP',
      visualTheme: {
        primaryColor: '#22d3ee',
        secondaryColor: '#7c3aed',
        darkTheme: true,
        headerBanner: 'Experiência Konnexy Hair & Beauty',
      },
      businessSettings: {
        businessType: 'salon',
        cancelationWindowHours: 4,
        minAdvanceMinutes: 60,
        maxAdvanceDays: 45,
        requiresDeposit: true,
        depositPercentage: 20.0,
      },
    },
  });

  // Assinatura ativa do Tenant 1
  await prisma.subscription.upsert({
    where: { id: `sub-${tenant1.slug}` },
    update: { status: 'active', plan: 'pro' },
    create: {
      id: `sub-${tenant1.slug}`,
      tenantId: tenant1.id,
      plan: 'pro',
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  // Usuários do Tenant 1
  const ownerUser = await prisma.user.upsert({
    where: { email: 'owner@konnexy.com.br' },
    update: { name: 'Diretoria Konnexy', passwordHash },
    create: {
      email: 'owner@konnexy.com.br',
      name: 'Diretoria Konnexy',
      phone: '(11) 99999-1111',
      passwordHash,
    },
  });

  await prisma.userMembership.upsert({
    where: {
      tenantId_userId_role: {
        tenantId: tenant1.id,
        userId: ownerUser.id,
        role: Role.owner,
      },
    },
    update: {},
    create: {
      tenantId: tenant1.id,
      userId: ownerUser.id,
      role: Role.owner,
    },
  });

  const recepUser = await prisma.user.upsert({
    where: { email: 'recepcao@konnexy.com.br' },
    update: { name: 'Ana Paula Recepção', passwordHash },
    create: {
      email: 'recepcao@konnexy.com.br',
      name: 'Ana Paula Recepção',
      phone: '(11) 99999-2222',
      passwordHash,
    },
  });

  await prisma.userMembership.upsert({
    where: {
      tenantId_userId_role: {
        tenantId: tenant1.id,
        userId: recepUser.id,
        role: Role.receptionist,
      },
    },
    update: {},
    create: {
      tenantId: tenant1.id,
      userId: recepUser.id,
      role: Role.receptionist,
    },
  });

  // Categorias de Serviços
  const catCabelo = await prisma.serviceCategory.upsert({
    where: { tenantId_slug: { tenantId: tenant1.id, slug: 'cabelo' } },
    update: { name: 'Cabelo & Visagismo', order: 1 },
    create: { tenantId: tenant1.id, name: 'Cabelo & Visagismo', slug: 'cabelo', order: 1 },
  });

  const catEstetica = await prisma.serviceCategory.upsert({
    where: { tenantId_slug: { tenantId: tenant1.id, slug: 'estetica' } },
    update: { name: 'Estética Avançada', order: 2 },
    create: { tenantId: tenant1.id, name: 'Estética Avançada', slug: 'estetica', order: 2 },
  });

  const catSobrancelhas = await prisma.serviceCategory.upsert({
    where: { tenantId_slug: { tenantId: tenant1.id, slug: 'sobrancelhas' } },
    update: { name: 'Sobrancelhas & Olhar', order: 3 },
    create: { tenantId: tenant1.id, name: 'Sobrancelhas & Olhar', slug: 'sobrancelhas', order: 3 },
  });

  // Serviços
  const servCorte = await prisma.service.upsert({
    where: { tenantId_slug: { tenantId: tenant1.id, slug: 'corte-visagista' } },
    update: { price: 180.0, durationMinutes: 60, bufferMinutes: 10 },
    create: {
      tenantId: tenant1.id,
      categoryId: catCabelo.id,
      name: 'Corte Visagista & Finalização Glow',
      slug: 'corte-visagista',
      description: 'Análise visagista completa, corte sob medida e styling profissional com produtos Konnexy Care.',
      price: 180.0,
      durationMinutes: 60,
      bufferMinutes: 10,
      color: '#22d3ee',
    },
  });

  const servMechas = await prisma.service.upsert({
    where: { tenantId_slug: { tenantId: tenant1.id, slug: 'mechas-glow' } },
    update: { price: 480.0, durationMinutes: 180, bufferMinutes: 15, requiresDeposit: true, depositAmount: 100.0 },
    create: {
      tenantId: tenant1.id,
      categoryId: catCabelo.id,
      name: 'Mechas & Iluminação Glow',
      slug: 'mechas-glow',
      description: 'Técnica de morena iluminada ou loiro dos sonhos com proteção plex e matização de alto brilho.',
      price: 480.0,
      durationMinutes: 180,
      bufferMinutes: 15,
      color: '#d946ef',
      requiresDeposit: true,
      depositAmount: 100.0,
    },
  });

  const servLimpezaPele = await prisma.service.upsert({
    where: { tenantId_slug: { tenantId: tenant1.id, slug: 'limpeza-ultrasonica' } },
    update: { price: 230.0, durationMinutes: 75, bufferMinutes: 15 },
    create: {
      tenantId: tenant1.id,
      categoryId: catEstetica.id,
      name: 'Limpeza de Pele Profunda Ultrassônica',
      slug: 'limpeza-ultrasonica',
      description: 'Higienização, vapor de ozônio, extração suave ultrassônica, alta frequência e máscara tensora.',
      price: 230.0,
      durationMinutes: 75,
      bufferMinutes: 15,
      color: '#10b981',
    },
  });

  const servSobrancelha = await prisma.service.upsert({
    where: { tenantId_slug: { tenantId: tenant1.id, slug: 'design-henna' } },
    update: { price: 90.0, durationMinutes: 40, bufferMinutes: 5 },
    create: {
      tenantId: tenant1.id,
      categoryId: catSobrancelhas.id,
      name: 'Design Estratégico com Henna Híbrida',
      slug: 'design-henna',
      description: 'Mapeamento facial com paquímetro digital, alinhamento dos fios e aplicação de pigmento botânico.',
      price: 90.0,
      durationMinutes: 40,
      bufferMinutes: 5,
      color: '#f59e0b',
    },
  });

  // Profissionais do Tenant 1
  const profJulianaUser = await prisma.user.upsert({
    where: { email: 'juliana@konnexy.com.br' },
    update: { name: 'Juliana Mendes', passwordHash },
    create: {
      email: 'juliana@konnexy.com.br',
      name: 'Juliana Mendes',
      phone: '(11) 98888-0001',
      passwordHash,
    },
  });

  await prisma.userMembership.upsert({
    where: {
      tenantId_userId_role: {
        tenantId: tenant1.id,
        userId: profJulianaUser.id,
        role: Role.professional,
      },
    },
    update: {},
    create: {
      tenantId: tenant1.id,
      userId: profJulianaUser.id,
      role: Role.professional,
    },
  });

  let profJuliana = await prisma.professional.findFirst({
    where: { tenantId: tenant1.id, userId: profJulianaUser.id },
  });

  if (!profJuliana) {
    profJuliana = await prisma.professional.create({
      data: {
        tenantId: tenant1.id,
        userId: profJulianaUser.id,
        name: 'Juliana Mendes',
        specialty: 'Master Hair Stylist & Visagista',
        description: 'Especialista em cortes personalizados, visagismo e finalização glow com mais de 8 anos de carreira.',
        colorHex: '#22d3ee',
        commissionRate: 50.0,
        experienceYears: 8,
        instagram: '@julianamendes_hair',
        status: ProfessionalStatus.active,
      },
    });
  }

  // Vincular serviços à Juliana
  await prisma.professionalService.upsert({
    where: {
      professionalId_serviceId: {
        professionalId: profJuliana.id,
        serviceId: servCorte.id,
      },
    },
    update: {},
    create: {
      tenantId: tenant1.id,
      professionalId: profJuliana.id,
      serviceId: servCorte.id,
    },
  });

  await prisma.professionalService.upsert({
    where: {
      professionalId_serviceId: {
        professionalId: profJuliana.id,
        serviceId: servMechas.id,
      },
    },
    update: {},
    create: {
      tenantId: tenant1.id,
      professionalId: profJuliana.id,
      serviceId: servMechas.id,
    },
  });

  // Escala semanal da Juliana: Terça a Sábado, 09:00 às 19:00, almoço 12:00 às 13:00
  // Dias da semana: 0=Domingo, 1=Segunda, 2=Terça, 3=Quarta, 4=Quinta, 5=Sexta, 6=Sábado
  for (let day = 0; day <= 6; day++) {
    const isWorking = day >= 2 && day <= 6; // Terça a sábado
    await prisma.workingHours.upsert({
      where: {
        professionalId_dayOfWeek: {
          professionalId: profJuliana.id,
          dayOfWeek: day,
        },
      },
      update: {
        isWorking,
        startTime: '09:00',
        endTime: '19:00',
        breakStart: '12:00',
        breakEnd: '13:00',
      },
      create: {
        professionalId: profJuliana.id,
        dayOfWeek: day,
        isWorking,
        startTime: '09:00',
        endTime: '19:00',
        breakStart: '12:00',
        breakEnd: '13:00',
      },
    });
  }

  // Profissional 2: Camila Estética
  const profCamilaUser = await prisma.user.upsert({
    where: { email: 'camila@konnexy.com.br' },
    update: { name: 'Camila Rocha', passwordHash },
    create: {
      email: 'camila@konnexy.com.br',
      name: 'Camila Rocha',
      phone: '(11) 98888-0002',
      passwordHash,
    },
  });

  let profCamila = await prisma.professional.findFirst({
    where: { tenantId: tenant1.id, userId: profCamilaUser.id },
  });

  if (!profCamila) {
    profCamila = await prisma.professional.create({
      data: {
        tenantId: tenant1.id,
        userId: profCamilaUser.id,
        name: 'Dra. Camila Rocha',
        specialty: 'Fisioterapeuta Dermato-Funcional & Lash Designer',
        description: 'Pós-graduada em procedimentos faciais não invasivos, rejuvenescimento e embelezamento do olhar.',
        colorHex: '#10b981',
        commissionRate: 45.0,
        experienceYears: 6,
        status: ProfessionalStatus.active,
      },
    });
  }

  await prisma.professionalService.upsert({
    where: {
      professionalId_serviceId: {
        professionalId: profCamila.id,
        serviceId: servLimpezaPele.id,
      },
    },
    update: {},
    create: {
      tenantId: tenant1.id,
      professionalId: profCamila.id,
      serviceId: servLimpezaPele.id,
    },
  });

  await prisma.professionalService.upsert({
    where: {
      professionalId_serviceId: {
        professionalId: profCamila.id,
        serviceId: servSobrancelha.id,
      },
    },
    update: {},
    create: {
      tenantId: tenant1.id,
      professionalId: profCamila.id,
      serviceId: servSobrancelha.id,
    },
  });

  // Escala da Camila: Segunda a Sexta, 10:00 às 20:00, almoço 13:00 às 14:00
  for (let day = 0; day <= 6; day++) {
    const isWorking = day >= 1 && day <= 5; // Segunda a Sexta
    await prisma.workingHours.upsert({
      where: {
        professionalId_dayOfWeek: {
          professionalId: profCamila.id,
          dayOfWeek: day,
        },
      },
      update: {
        isWorking,
        startTime: '10:00',
        endTime: '20:00',
        breakStart: '13:00',
        breakEnd: '14:00',
      },
      create: {
        professionalId: profCamila.id,
        dayOfWeek: day,
        isWorking,
        startTime: '10:00',
        endTime: '20:00',
        breakStart: '13:00',
        breakEnd: '14:00',
      },
    });
  }

  // Clientes para o Tenant 1
  const custMariana = await prisma.customer.upsert({
    where: { tenantId_email: { tenantId: tenant1.id, email: 'mariana.souza@gmail.com' } },
    update: { tier: CustomerTier.vip_diamante, visitsCount: 14, totalSpent: 3820.0 },
    create: {
      tenantId: tenant1.id,
      name: 'Mariana Souza',
      email: 'mariana.souza@gmail.com',
      phone: '(11) 97777-1111',
      tier: CustomerTier.vip_diamante,
      colorFormula: 'Tonalizante 8.13 com oxidante 10vol + Acidificante Konnexy',
      allergies: 'Sensibilidade leve a amônia',
      visitsCount: 14,
      totalSpent: 3820.0,
      lastVisit: new Date(),
    },
  });

  // ---------------------------------------------------------------------------
  // TENANT 2: Barbearia Alfa & Estética Masculina
  // ---------------------------------------------------------------------------
  const tenant2 = await prisma.tenant.upsert({
    where: { slug: 'barbearia-alfa' },
    update: {
      name: 'Barbearia Alfa & Grooming Club',
      phone: '(19) 98888-7777',
      address: 'Rua Barão de Jaguara, 850 - Centro, Campinas - SP',
      visualTheme: {
        primaryColor: '#f59e0b',
        secondaryColor: '#3b82f6',
      },
      businessSettings: {
        businessType: 'barbershop',
        cancelationWindowHours: 2,
      },
    },
    create: {
      slug: 'barbearia-alfa',
      name: 'Barbearia Alfa & Grooming Club',
      phone: '(19) 98888-7777',
      email: 'contato@barbeariaalfa.com.br',
      address: 'Rua Barão de Jaguara, 850 - Centro, Campinas - SP',
      visualTheme: {
        primaryColor: '#f59e0b',
        secondaryColor: '#3b82f6',
      },
      businessSettings: {
        businessType: 'barbershop',
        cancelationWindowHours: 2,
      },
    },
  });

  await prisma.subscription.upsert({
    where: { id: `sub-${tenant2.slug}` },
    update: { status: 'active', plan: 'starter' },
    create: {
      id: `sub-${tenant2.slug}`,
      tenantId: tenant2.id,
      plan: 'starter',
      status: 'active',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  const catAlfa = await prisma.serviceCategory.upsert({
    where: { tenantId_slug: { tenantId: tenant2.id, slug: 'barbearia' } },
    update: { name: 'Cortes & Barba' },
    create: { tenantId: tenant2.id, name: 'Cortes & Barba', slug: 'barbearia', order: 1 },
  });

  const servAlfaCorte = await prisma.service.upsert({
    where: { tenantId_slug: { tenantId: tenant2.id, slug: 'corte-fade-navalhado' } },
    update: { price: 75.0, durationMinutes: 45 },
    create: {
      tenantId: tenant2.id,
      categoryId: catAlfa.id,
      name: 'Fade Navalhado + Lavagem Especial',
      slug: 'corte-fade-navalhado',
      price: 75.0,
      durationMinutes: 45,
      bufferMinutes: 5,
    },
  });

  console.log(`✅ Seed concluído com sucesso!`);
  console.log(`- Tenant 1: ${tenant1.name} (slug: ${tenant1.slug})`);
  console.log(`- Tenant 2: ${tenant2.name} (slug: ${tenant2.slug})`);
  console.log(`- Usuários de teste configurados com senha padrão: Konnexy@2026`);
}

main()
  .catch((e) => {
    console.error('❌ Erro durante execução do seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
