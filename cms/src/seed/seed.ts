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
  { title: 'Neuron II 智能能源网关', slug: 'neuron-ii', tagline: '通用多协议网关，支持4G/WiFi/RS485/CAN', description: 'Neuron II 是旭衡电子推出的第二代智能能源网关，支持Modbus、OCPP、MQTT等20+通讯协议，可同时接入光伏逆变器、储能BMS、充电桩、电表等设备。内置边缘计算引擎，支持本地智能调度与云端协同，是分布式能源系统的核心枢纽。', sortOrder: 1 },
  { title: 'Neuron III 充电站专用控制器', slug: 'neuron-iii', tagline: '内置电表+动态负载均衡', description: 'Neuron III 专为充电站场景设计，内置计量级电表和动态负载均衡算法。支持OCPP 1.6/2.0协议，可管理最多32个充电桩的智能功率分配，在不增加变压器容量的前提下最大化充电效率。', sortOrder: 2 },
  { title: 'Neuron III Lite 防跳闸控制器', slug: 'neuron-iii-lite', tagline: '配套ATP III，极简安装', description: 'Neuron III Lite 是Neuron III的精简版本，专为小型充电场景设计。配套ATP III安装工具，即插即用，5分钟完成安装。内置防跳闸保护算法，智能限制充电功率，确保用电安全。', sortOrder: 3 },
  { title: 'HEMS 家庭能源管理系统', slug: 'hems', tagline: '光储充一体，智能电费优化', description: 'HEMS家庭能源管理系统将光伏逆变器、储能电池、充电桩深度集成，实现家庭光伏发电的最大化自用。系统自动根据电价、天气、用电习惯进行智能调度，帮助家庭用户节省50%以上电费支出。', sortOrder: 4 },
  { title: 'ESS 工商业储能管理系统', slug: 'ess', tagline: '峰谷套利，备用电源，动态增容', description: 'ESS工商业储能管理系统面向工商业用户，支持100kWh至10MWh灵活配置。通过智能削峰填谷策略帮助企业降低用电成本30%以上，同时提供备用电源保障和动态增容能力。', sortOrder: 5 },
  { title: 'EVCMS 充电站管理平台', slug: 'evcms', tagline: '多桩负载均衡，防跳闸', description: 'EVCMS充电站管理平台提供多充电桩的集中管理和智能调度，通过动态功率分配算法实现负载均衡。支持远程监控、计费管理、故障诊断等功能，降低充电站建设和运营成本。', sortOrder: 6 },
  { title: 'PQMS 电能质量监控系统', slug: 'pqms', tagline: '谐波治理，远程监控，参数优化', description: 'PQMS电能质量监控系统集电能质量监测、谐波治理、无功补偿于一体。支持GB/T 14549等国标要求，实时采集电压、电流、谐波、功率因数等参数，自动生成治理方案。', sortOrder: 7 },
  { title: 'VPP 虚拟电厂平台', slug: 'vpp', tagline: '设备聚合，参与电网调度', description: 'VPP虚拟电厂平台聚合分布式光伏、储能、可调负荷等柔性资源，通过AI预测与优化调度算法实现虚拟电厂的自动化运营。已接入国内多个省级电力交易平台，帮助用户获取需求响应收益。', sortOrder: 8 },
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
  {
    question: '旭衡的网关支持哪些品牌的设备接入？',
    answer:
      '旭衡智能能源网关已对接华为、比亚迪、宁德时代、阳光电源、固德威、古瑞瓦特、德业等国内外数十家主流品牌的光伏逆变器、储能BMS、充电桩设备。具体兼容品牌列表请查看官网兼容生态页面，我们持续在增加新品牌的支持。',
    sortOrder: 6,
  },
  {
    question: '云端直连和网关接入有什么区别？',
    answer:
      '云端直连通过互联网直接对接设备厂商的云API，无需硬件部署，适合纯软件平台和远程调度场景。网关接入通过Neuron网关在现场局域网内与设备通讯，数据不上云，适合对实时性和数据安全有要求的工业场景。两种方式可按需选择，也可混合使用。',
    sortOrder: 7,
  },
  {
    question: '如何申请API接入和开发者账号？',
    answer:
      '目前开发者中心正在建设中。如需API接入和技术对接，请通过官网联系我们页面提交申请，注明您的公司信息和接入需求，我们的技术团队会在2个工作日内与您联系，提供API文档和测试环境。',
    sortOrder: 8,
  },
  {
    question: 'VPP虚拟电厂平台是否支持定制开发？',
    answer:
      '是的，旭衡VPP平台支持深度定制开发。我们提供白标系统方案，可根据客户需求定制品牌、UI界面、调度策略、对接电力交易平台等。定制项目由专属项目经理跟进，详细需求请联系我们的商务团队。',
    sortOrder: 9,
  },
  {
    question: '产品安装是否需要专业人员？',
    answer:
      'Neuron II和Neuron III网关建议由专业电工或集成商安装，需要基本的电气接线和网络配置知识。Neuron III Lite配套ATP III安装工具，支持即插即用安装，普通用户参照快速安装指南即可在5分钟内完成安装。所有产品均提供详细的安装文档和视频教程。',
    sortOrder: 10,
  },
  {
    question: '储能系统的安全防护措施有哪些？',
    answer:
      '旭衡储能管理系统内置多重安全防护机制：电池过充/过放保护、温度异常告警、短路保护、漏电保护等。系统支持BMS深度集成，实时监控每个电芯的电压、温度、SOC等参数。同时支持远程断电和紧急停机功能，确保储能系统安全可靠运行。',
    sortOrder: 11,
  },
];

/* ------------------------------------------------------------------ */
/*  Compatible Brands (22)                                             */
/* ------------------------------------------------------------------ */
const compatibleBrands = [
  { name: '华为', sortOrder: 1, category: '光伏逆变器/储能' },
  { name: '比亚迪', sortOrder: 2, category: '储能/电动汽车' },
  { name: '宁德时代', sortOrder: 3, category: '储能电池' },
  { name: '阳光电源', sortOrder: 4, category: '光伏逆变器/储能' },
  { name: '固德威', sortOrder: 5, category: '光伏逆变器' },
  { name: '古瑞瓦特', sortOrder: 6, category: '光伏逆变器' },
  { name: '德业', sortOrder: 7, category: '微型逆变器' },
  { name: '科华数据', sortOrder: 8, category: '储能PCS' },
  { name: '海基新能源', sortOrder: 9, category: '储能电池' },
  { name: '南都电源', sortOrder: 10, category: '储能电池' },
  { name: '特斯拉', sortOrder: 11, category: '储能/充电' },
  { name: 'SMA', sortOrder: 12, category: '光伏逆变器' },
  { name: 'Fronius', sortOrder: 13, category: '光伏逆变器' },
  { name: 'Enphase', sortOrder: 14, category: '微型逆变器' },
  { name: 'ABB', sortOrder: 15, category: '充电桩/PCS' },
  { name: '锦浪', sortOrder: 16, category: '光伏逆变器' },
  { name: '天合光能', sortOrder: 17, category: '光伏组件' },
  { name: '派能科技', sortOrder: 18, category: '储能电池' },
  { name: '星星充电', sortOrder: 19, category: '充电桩' },
  { name: '特来电', sortOrder: 20, category: '充电桩' },
  { name: 'SolarEdge', sortOrder: 21, category: '光伏优化器' },
  { name: '科陆电子', sortOrder: 22, category: '储能PCS' },
];

/* ------------------------------------------------------------------ */
/*  Job Postings (5)                                                   */
/* ------------------------------------------------------------------ */
const jobPostings = [
  { title: '嵌入式软件工程师', department: '研发部', location: '深圳', type: 'full-time' as const, description: '负责智能能源网关的嵌入式软件开发，包括通讯协议栈开发、边缘计算引擎优化、实时操作系统适配等。', requirements: '计算机/电子相关本科及以上，3年以上嵌入式开发经验，熟悉C/C++，了解Modbus/MQTT/OCPP等协议优先。', isActive: true },
  { title: '云平台后端工程师', department: '研发部', location: '深圳', type: 'full-time' as const, description: '负责旭衡云平台后端服务开发，包括设备管理、数据采集、调度引擎等核心模块的设计与实现。', requirements: '计算机相关本科及以上，3年以上后端开发经验，熟悉Go/Java/Python，了解微服务架构。', isActive: true },
  { title: '售前技术支持', department: '销售部', location: '深圳/上海', type: 'full-time' as const, description: '为客户提供技术咨询和方案设计支持，协助销售团队完成技术评审和投标。', requirements: '电气/能源/计算机相关本科及以上，2年以上售前或技术支持经验，良好的沟通能力。', isActive: true },
  { title: '国际业务拓展经理', department: '销售部', location: '深圳', type: 'full-time' as const, description: '负责海外市场业务开拓，重点区域包括东南亚、澳洲、欧洲。', requirements: '本科及以上，3年以上海外业务开发经验，英语流利。', isActive: true },
  { title: 'UI/UX 设计师', department: '产品部', location: '深圳', type: 'full-time' as const, description: '负责旭衡云平台、移动端App及官网的UI/UX设计工作。', requirements: '设计相关本科及以上，3年以上UI/UX设计经验，精通Figma/Sketch。', isActive: true },
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

  /* ---------- FAQs (draftAndPublish) ---------- */
  if (await isEmpty(strapi, 'api::faq.faq')) {
    strapi.log.info('[seed] Seeding FAQs…');
    for (const f of faqs) {
      await strapi.documents('api::faq.faq').create({
        data: f as never,
        locale: 'zh-CN',
        status: 'published',
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

  /* ---------- Job Postings (no draftAndPublish) ---------- */
  if (await isEmpty(strapi, 'api::job-posting.job-posting')) {
    strapi.log.info('[seed] Seeding job postings…');
    for (const j of jobPostings) {
      await strapi.documents('api::job-posting.job-posting').create({
        data: j as never,
        locale: 'zh-CN',
      });
    }
    strapi.log.info(`[seed] ${jobPostings.length} job postings created.`);
  } else {
    strapi.log.info('[seed] Job postings already exist — skipping.');
  }

  strapi.log.info('[seed] Seed complete.');
}
