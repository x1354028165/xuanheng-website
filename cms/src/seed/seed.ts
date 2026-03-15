import type { Core } from '@strapi/strapi';

/* ------------------------------------------------------------------ */
/*  Helper: check if a collection already has data (zh-CN locale)     */
/* ------------------------------------------------------------------ */
async function isEmpty(strapi: Core.Strapi, uid: string): Promise<boolean> {
  const result = await strapi.documents(uid as never).findMany({
    locale: 'zh-CN',
    limit: 1,
  });
  return !result || result.length === 0;
}

/* ------------------------------------------------------------------ */
/*  Products (8)                                                       */
/* ------------------------------------------------------------------ */
const products = [
  {
    title: '智能能源网关',
    slug: 'smart-energy-gateway',
    tagline: '多协议兼容，智能调度',
    description:
      '旭衡智能能源网关支持 Modbus、OCPP、MQTT 等多种通讯协议，可同时接入光伏逆变器、储能BMS、充电桩、电表等设备，实现本地边缘计算与云端协同调度，是分布式能源系统的核心枢纽。',
    sortOrder: 1,
  },
  {
    title: '工商业储能系统',
    slug: 'commercial-ess',
    tagline: '大容量储能，削峰填谷',
    description:
      '面向工商业用户的大容量储能解决方案，支持100kWh至10MWh灵活配置。通过智能削峰填谷策略，帮助企业降低用电成本30%以上，同时提供备用电源保障，确保生产连续性。',
    sortOrder: 2,
  },
  {
    title: '户用储能系统',
    slug: 'home-ess',
    tagline: '家庭能源管理，安全可靠',
    description:
      '专为家庭用户设计的一体化储能系统，采用磷酸铁锂电池，循环寿命超6000次。支持光伏自发自用、峰谷套利、应急备电等多种模式，配合手机App实时监控，让家庭用电更智能更经济。',
    sortOrder: 3,
  },
  {
    title: '充电桩负载管理器',
    slug: 'ev-load-manager',
    tagline: '智能分配，高效充电',
    description:
      '针对多充电桩场景的智能负载管理设备，通过动态功率分配算法，在不增加变压器容量的前提下最大化充电效率。支持OCPP 1.6/2.0协议，兼容市面主流充电桩品牌。',
    sortOrder: 4,
  },
  {
    title: 'VPP虚拟电厂平台',
    slug: 'vpp-platform',
    tagline: '聚合分布式资源，参与电力市场',
    description:
      '旭衡VPP平台聚合分布式光伏、储能、可调负荷等柔性资源，通过AI预测与优化调度算法，实现虚拟电厂的自动化运营。已接入国内多个省级电力交易平台，帮助用户获取需求响应收益。',
    sortOrder: 5,
  },
  {
    title: '电能质量管理系统',
    slug: 'pqms',
    tagline: '实时监测，精准治理',
    description:
      '集电能质量监测、谐波治理、无功补偿于一体的综合管理系统。支持GB/T 14549等国标要求，实时采集电压、电流、谐波、功率因数等参数，自动生成治理方案并执行补偿策略。',
    sortOrder: 6,
  },
  {
    title: '光储一体逆变器',
    slug: 'hybrid-inverter',
    tagline: '光伏+储能，一机搞定',
    description:
      '集光伏MPPT与储能变流器于一体的混合逆变器，支持3~20kW功率段。内置智能EMS能量管理系统，自动切换并网/离网模式，实现光伏发电、储能充放电、负载供电的最优调度。',
    sortOrder: 7,
  },
  {
    title: '智慧能源云平台',
    slug: 'cloud-platform',
    tagline: '数据驱动，智慧运维',
    description:
      '基于云计算和大数据技术的能源管理SaaS平台，提供设备监控、能耗分析、告警推送、运维工单、报表生成等功能。支持多站点统一管理，帮助运维人员提升管理效率，降低运维成本。',
    sortOrder: 8,
  },
];

/* ------------------------------------------------------------------ */
/*  Solutions (5)                                                      */
/* ------------------------------------------------------------------ */
const solutions = [
  {
    title: '户用家庭储能',
    slug: 'hems',
    tagline: '家庭能源自给自足',
    sortOrder: 1,
    description:
      '旭衡户用家庭储能解决方案将光伏逆变器、储能电池、智能能源网关深度集成，实现家庭光伏发电的最大化自用。系统自动根据电价、天气、用电习惯进行智能调度，帮助家庭用户节省50%以上电费支出，同时提供停电应急保障。',
  },
  {
    title: '工商业储能',
    slug: 'ess',
    tagline: '降低企业用电成本',
    sortOrder: 2,
    description:
      '面向工商业用户的综合储能解决方案，结合峰谷电价差进行智能充放电策略优化。系统支持需量管理、备用电源、光储协同等多种应用场景，帮助企业在不影响正常生产的前提下实现电费成本的显著降低。',
  },
  {
    title: '充电站负载管理',
    slug: 'evcms',
    tagline: '智能充电调度',
    sortOrder: 3,
    description:
      '为电动汽车充电站提供智能负载管理方案，通过旭衡充电桩负载管理器与云平台的协同工作，实现多充电桩之间的动态功率分配。在现有电力容量下最大化服务车辆数，避免因过载导致的跳闸风险，降低充电站建设和运营成本。',
  },
  {
    title: 'VPP虚拟电厂',
    slug: 'vpp',
    tagline: '聚合分布式能源',
    sortOrder: 4,
    description:
      '旭衡VPP虚拟电厂解决方案将分散的分布式光伏、储能系统、可调节负荷聚合为统一的虚拟电厂，参与电力市场辅助服务和需求响应。通过AI算法实现资源的最优调度，为用户创造额外收益的同时，助力电网安全稳定运行。',
  },
  {
    title: '电能质量管理',
    slug: 'pqms',
    tagline: '电网质量保障',
    sortOrder: 5,
    description:
      '为工业用户和配电网提供全面的电能质量管理方案，涵盖谐波治理、无功补偿、电压调节等关键环节。通过旭衡电能质量管理系统的实时监测与自动治理，确保用电设备安全运行，避免因电能质量问题导致的设备损坏和生产损失。',
  },
];

/* ------------------------------------------------------------------ */
/*  Articles (3)                                                       */
/* ------------------------------------------------------------------ */
const articles = [
  {
    title: '旭衡电子发布新一代智能能源网关',
    slug: 'new-gateway-release',
    summary:
      '旭衡电子正式发布新一代智能能源网关EG-3000系列，支持超过20种通讯协议，内置边缘计算引擎，为分布式能源管理提供更强大的连接能力。',
    content:
      '2025年11月15日，旭衡电子在深圳举办新品发布会，正式推出新一代智能能源网关EG-3000系列。该产品在前代基础上实现了多项重大升级：通讯协议支持从12种扩展至超过20种，涵盖Modbus RTU/TCP、OCPP 1.6/2.0、MQTT、IEC 61850等主流协议；内置ARM Cortex-A72处理器，边缘计算能力提升3倍；新增本地AI推理模块，支持设备故障预测和能效优化。EG-3000系列同时获得了CE、UL、TUV等国际认证，将助力旭衡电子加速拓展海外市场。',
    publishedAt: '2025-11-15T09:00:00.000Z',
  },
  {
    title: '旭衡电子荣获2025年度储能行业创新奖',
    slug: 'innovation-award-2025',
    summary:
      '在第十届中国国际储能大会上，旭衡电子凭借VPP虚拟电厂平台和智能能源网关产品，荣获"2025年度储能行业技术创新奖"。',
    content:
      '2025年9月20日，第十届中国国际储能大会在广州盛大举行。旭衡电子凭借在虚拟电厂和分布式能源管理领域的技术创新，荣获"2025年度储能行业技术创新奖"。评审委员会表示，旭衡电子的VPP虚拟电厂平台在聚合调度算法和市场交易策略方面展现了业界领先水平，其智能能源网关产品在协议兼容性和边缘计算能力方面树立了行业新标杆。旭衡电子CEO表示，此次获奖是对公司持续技术投入的肯定，未来将继续加大研发力度，推动新型电力系统建设。',
    publishedAt: '2025-09-20T10:00:00.000Z',
  },
  {
    title: '旭衡电子与国家电网达成战略合作',
    slug: 'sgcc-partnership',
    summary:
      '旭衡电子与国家电网签署战略合作协议，双方将在虚拟电厂、需求响应、分布式能源管理等领域开展深度合作。',
    content:
      '2025年8月10日，旭衡电子与国家电网有限公司在北京签署战略合作框架协议。根据协议，双方将在虚拟电厂运营、需求侧响应、分布式能源并网管理、电能质量治理等多个领域开展深度合作。旭衡电子将为国家电网提供智能能源网关、VPP平台等核心产品和技术支持，助力构建新型电力系统。国家电网相关负责人表示，旭衡电子在分布式能源管理和虚拟电厂领域具有深厚的技术积累，此次合作将加速推进新型电力系统的数字化转型。',
    publishedAt: '2025-08-10T08:00:00.000Z',
  },
];

/* ------------------------------------------------------------------ */
/*  FAQs (5)                                                           */
/* ------------------------------------------------------------------ */
const faqs = [
  {
    question: '旭衡电子的产品支持哪些通讯协议？',
    answer:
      '旭衡电子的智能能源网关支持包括 Modbus RTU/TCP、OCPP 1.6/2.0、MQTT、IEC 61850、DL/T 645、SunSpec 等在内的20多种主流通讯协议，可兼容市面上绝大多数光伏逆变器、储能BMS、充电桩和智能电表设备。',
    sortOrder: 1,
  },
  {
    question: '储能系统的质保期是多久？',
    answer:
      '旭衡电子的储能系统提供整机5年质保服务，电池模组提供10年质保或6000次循环质保（以先到者为准）。质保期内如因产品质量问题导致故障，我们将免费提供维修或更换服务。同时我们提供延保服务选项，详情请咨询销售团队。',
    sortOrder: 2,
  },
  {
    question: '如何获取产品的技术文档？',
    answer:
      '您可以通过以下方式获取旭衡电子产品的技术文档：1）访问官网产品页面下载对应产品的数据手册和安装指南；2）联系您的专属销售经理获取完整技术方案；3）拨打技术支持热线 400-XXX-XXXX 获取在线技术支持。部分高级开发文档需要注册开发者账号后方可下载。',
    sortOrder: 3,
  },
  {
    question: '产品是否支持海外使用？',
    answer:
      '是的，旭衡电子的核心产品已获得CE（欧盟）、UL（北美）、TUV（德国）等国际认证，支持全球主要市场使用。我们的智能能源网关和云平台支持多语言界面，通讯协议兼容国际标准。目前产品已出口至东南亚、欧洲、南美等20多个国家和地区。如需了解特定市场的认证和适配情况，请联系我们的海外业务团队。',
    sortOrder: 4,
  },
  {
    question: '如何申请售后维修？',
    answer:
      '您可以通过以下渠道申请售后维修：1）登录旭衡电子官网，在"服务支持"页面提交维修申请工单；2）拨打24小时服务热线 400-XXX-XXXX；3）联系您的专属客户经理。提交申请后，我们将在2小时内响应，24小时内给出诊断方案，必要时安排现场服务工程师上门处理。',
    sortOrder: 5,
  },
];

/* ------------------------------------------------------------------ */
/*  Compatible Brands (10)                                             */
/* ------------------------------------------------------------------ */
const compatibleBrands = [
  { name: '华为', slug: 'huawei', sortOrder: 1, description: '全球领先的ICT和智能终端提供商，在光伏逆变器和储能领域占据市场领导地位。' },
  { name: '比亚迪', slug: 'byd', sortOrder: 2, description: '全球领先的新能源企业，业务涵盖电池、储能、电动汽车等领域。' },
  { name: '宁德时代', slug: 'catl', sortOrder: 3, description: '全球最大的动力电池和储能电池制造商，技术领先，产能全球第一。' },
  { name: '阳光电源', slug: 'sungrow', sortOrder: 4, description: '全球领先的光伏逆变器和储能系统供应商，产品远销全球150多个国家。' },
  { name: '固德威', slug: 'goodwe', sortOrder: 5, description: '全球知名的光伏逆变器及储能产品供应商，产品覆盖户用和工商业场景。' },
  { name: '古瑞瓦特', slug: 'growatt', sortOrder: 6, description: '全球领先的分布式能源解决方案供应商，逆变器出货量位居全球前列。' },
  { name: '德业', slug: 'deye', sortOrder: 7, description: '国内知名的逆变器和热泵制造商，微型逆变器市场占有率领先。' },
  { name: '科华数据', slug: 'kehua', sortOrder: 8, description: '国内领先的智慧电能供应商，在UPS、储能PCS等领域拥有30余年经验。' },
  { name: '海基新能源', slug: 'highstar', sortOrder: 9, description: '专注于储能电池系统研发与制造的高新技术企业，产品广泛应用于电力储能领域。' },
  { name: '南都电源', slug: 'narada', sortOrder: 10, description: '国内领先的储能和工业电池解决方案提供商，产品远销全球100多个国家。' },
];

/* ================================================================== */
/*  Main seed function                                                 */
/* ================================================================== */
export async function seed(strapi: Core.Strapi): Promise<void> {
  strapi.log.info('[seed] Checking whether seed data is needed…');

  /* ---------- Products ---------- */
  if (await isEmpty(strapi, 'api::product.product')) {
    strapi.log.info('[seed] Seeding products…');
    for (const p of products) {
      await strapi.documents('api::product.product').create({
        data: p as never,
        locale: 'zh-CN',
        status: 'published',
      });
    }
    strapi.log.info(`[seed] ${products.length} products created.`);
  } else {
    strapi.log.info('[seed] Products already exist — skipping.');
  }

  /* ---------- Solutions ---------- */
  if (await isEmpty(strapi, 'api::solution.solution')) {
    strapi.log.info('[seed] Seeding solutions…');
    for (const s of solutions) {
      await strapi.documents('api::solution.solution').create({
        data: s as never,
        locale: 'zh-CN',
        status: 'published',
      });
    }
    strapi.log.info(`[seed] ${solutions.length} solutions created.`);
  } else {
    strapi.log.info('[seed] Solutions already exist — skipping.');
  }

  /* ---------- Articles ---------- */
  if (await isEmpty(strapi, 'api::article.article')) {
    strapi.log.info('[seed] Seeding articles…');
    for (const a of articles) {
      await strapi.documents('api::article.article').create({
        data: a as never,
        locale: 'zh-CN',
        status: 'published',
      });
    }
    strapi.log.info(`[seed] ${articles.length} articles created.`);
  } else {
    strapi.log.info('[seed] Articles already exist — skipping.');
  }

  /* ---------- FAQs (no draftAndPublish) ---------- */
  if (await isEmpty(strapi, 'api::faq.faq')) {
    strapi.log.info('[seed] Seeding FAQs…');
    for (const f of faqs) {
      await strapi.documents('api::faq.faq').create({
        data: f as never,
        locale: 'zh-CN',
      });
    }
    strapi.log.info(`[seed] ${faqs.length} FAQs created.`);
  } else {
    strapi.log.info('[seed] FAQs already exist — skipping.');
  }

  /* ---------- Compatible Brands (no draftAndPublish) ---------- */
  if (await isEmpty(strapi, 'api::compatible-brand.compatible-brand')) {
    strapi.log.info('[seed] Seeding compatible brands…');
    for (const b of compatibleBrands) {
      await strapi.documents('api::compatible-brand.compatible-brand').create({
        data: b as never,
        locale: 'zh-CN',
      });
    }
    strapi.log.info(`[seed] ${compatibleBrands.length} compatible brands created.`);
  } else {
    strapi.log.info('[seed] Compatible brands already exist — skipping.');
  }

  strapi.log.info('[seed] Seed complete.');
}
