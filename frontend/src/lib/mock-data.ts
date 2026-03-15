// ============================================================
// Shared Mock Data — 按需求文档 (执行文件.html) 定义
// ============================================================

export const LOCALES = ['zh-CN', 'en-US', 'zh-TW', 'de', 'fr', 'pt', 'es', 'ru'] as const;

// ---- Products (8) ----
export interface MockProduct {
  documentId: string;
  title: string;
  slug: string;
  tagline: string;
  category: 'hardware' | 'software';
  description: string;
  specs: Record<string, string>;
  scenarios: string[]; // solution slugs
  cover: string | null;
}

export const MOCK_PRODUCTS: MockProduct[] = [
  {
    documentId: 'p1',
    title: 'Neuron II',
    slug: 'neuron-ii',
    tagline: '通用多协议网关（4G/WiFi/RS485/CAN）',
    category: 'hardware',
    description: 'Neuron II 是旭衡电子的通用多协议智能网关，支持 4G、WiFi、RS485、CAN 等多种通信接口，可广泛应用于储能、光伏、电能质量等多种场景。无需云端依赖，支持局域网独立运行。',
    specs: {
      '通信接口': 'RS485 × 2, CAN × 1, Ethernet × 1, WiFi, 4G LTE',
      '支持协议': 'Modbus RTU/TCP, OCPP 1.6J, MQTT, HTTP REST',
      '处理器': 'ARM Cortex-A7 双核 1.2GHz',
      '内存/存储': '512MB DDR3 / 8GB eMMC',
      '工作温度': '-20°C ~ +60°C',
      '防护等级': 'IP54',
      '供电': 'DC 12V / PoE',
      '尺寸': '140 × 100 × 35 mm',
    },
    scenarios: ['hems', 'ess', 'pqms'],
    cover: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=70',
  },
  {
    documentId: 'p2',
    title: 'Neuron III',
    slug: 'neuron-iii',
    tagline: '充电站专用控制器（内置电表 + DLB 动态负载均衡）',
    category: 'hardware',
    description: 'Neuron III 是专为充电站场景设计的智能控制器，内置高精度电表和毫秒级 DLB（动态负载均衡）能力，可实现多桩协调、防跳闸、智能调度。',
    specs: {
      '通信接口': 'RS485 × 4, CAN × 2, Ethernet × 2, WiFi, 4G LTE',
      '内置电表': '三相多回路，0.5S 级精度',
      'DLB 响应': '≤ 100ms 毫秒级动态负载均衡',
      '支持协议': 'Modbus RTU/TCP, OCPP 1.6J/2.0.1, MQTT',
      '处理器': 'ARM Cortex-A7 四核 1.5GHz',
      '工作温度': '-20°C ~ +55°C',
      '防护等级': 'IP65',
      '供电': 'AC 220V / DC 12V',
      '尺寸': '200 × 140 × 45 mm',
    },
    scenarios: ['evcms'],
    cover: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=70',
  },
  {
    documentId: 'p3',
    title: 'Neuron III Lite',
    slug: 'neuron-iii-lite',
    tagline: '防跳闸控制器（配套 ATP III）',
    category: 'hardware',
    description: 'Neuron III Lite 是轻量化的防跳闸控制器，专为小型充电场景设计，配套 ATP III 使用，提供基础 DLB 能力，有效防止家庭或小型商业场景因充电导致的跳闸问题。',
    specs: {
      '通信接口': 'RS485 × 2, WiFi, 4G LTE',
      'DLB 能力': '基础动态负载均衡',
      '支持协议': 'Modbus RTU, OCPP 1.6J, MQTT',
      '处理器': 'ARM Cortex-M4 168MHz',
      '工作温度': '-10°C ~ +50°C',
      '防护等级': 'IP44',
      '供电': 'AC 220V',
      '尺寸': '100 × 80 × 30 mm',
    },
    scenarios: ['evcms'],
    cover: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=70',
  },
  {
    documentId: 'p4',
    title: 'HEMS 家庭储能管理',
    slug: 'hems',
    tagline: '家庭能源管理系统 — 光储充一体化',
    category: 'software',
    description: 'HEMS（Home Energy Management System）是面向家庭用户和集成商的能源管理云平台，实现光伏、储能、充电桩的统一监控与智能调度，帮助用户优化电费支出。',
    specs: {
      '设备上限': '单账户 50 台设备',
      '数据刷新': '≤ 5s 实时数据',
      '历史数据': '保留 3 年',
      '支持协议': 'Modbus TCP, MQTT, HTTP API',
      '移动端': 'iOS / Android App',
      '是否需要网关': '可选（Neuron II）',
    },
    scenarios: ['hems'],
    cover: 'https://images.unsplash.com/photo-1558449028-b53a39d100fc?w=800&q=70',
  },
  {
    documentId: 'p5',
    title: 'ESS 工商业储能',
    slug: 'ess',
    tagline: '工商储能柜管理系统 — 峰谷套利、备用电源',
    category: 'software',
    description: 'ESS（Energy Storage System）是面向工商业项目方的储能管理云平台，支持多站点监控、峰谷套利策略、备用电源管理和动态增容，实现储能资产的最大化收益。',
    specs: {
      '设备上限': '单账户 500 台设备',
      '数据刷新': '≤ 3s 实时数据',
      '历史数据': '保留 5 年',
      '多站点': '支持多项目、多站点统一管理',
      '策略引擎': '峰谷套利 / 需量控制 / 备用电源',
      '是否需要网关': '可选（Neuron II）',
    },
    scenarios: ['ess'],
    cover: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&q=70',
  },
  {
    documentId: 'p6',
    title: 'EVCMS 充电站管理',
    slug: 'evcms',
    tagline: '充电站管理平台 — 多桩负载均衡',
    category: 'software',
    description: 'EVCMS（EV Charging Management System）是面向充电站运营商的管理平台，支持多桩负载均衡、防跳闸控制、计费管理和运营数据分析，推荐搭配 Neuron III 使用。',
    specs: {
      '设备上限': '单站 200 个充电桩',
      '数据刷新': '≤ 1s 实时数据',
      'DLB 控制': '支持毫秒级动态负载均衡',
      '支持协议': 'OCPP 1.6J / 2.0.1',
      '计费系统': '支持多种计费模式',
      '是否需要网关': '推荐 Neuron III',
    },
    scenarios: ['evcms'],
    cover: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&q=70',
  },
  {
    documentId: 'p7',
    title: 'PQMS 电能质量管理',
    slug: 'pqms',
    tagline: '电能质量监控系统 — 谐波治理、远程监控',
    category: 'software',
    description: 'PQMS（Power Quality Management System）面向工业园区和数据中心，提供电能质量的远程监控、谐波治理方案优化和参数调优，推荐搭配 Neuron II 使用。',
    specs: {
      '监测参数': '电压、电流、功率因数、谐波（至 50 次）',
      '数据刷新': '≤ 2s 实时数据',
      '历史数据': '保留 5 年',
      '告警系统': '多级告警 + 企微/邮件通知',
      '报表导出': '日报/周报/月报自动生成',
      '是否需要网关': '推荐 Neuron II',
    },
    scenarios: ['pqms'],
    cover: 'https://images.unsplash.com/photo-1545259742-a0f2c1a2d2b5?w=800&q=70',
  },
  {
    documentId: 'p8',
    title: 'VPP 虚拟电厂',
    slug: 'vpp',
    tagline: '定制化虚拟电厂平台 — 设备聚合、电网调度',
    category: 'software',
    description: 'VPP（Virtual Power Plant）是面向 VPP 运营商和能源聚合商的定制化平台，支持分布式能源设备聚合、参与电网调度，纯云端架构无需网关。',
    specs: {
      '聚合能力': '支持万级设备聚合',
      '调度响应': '≤ 500ms 指令下发',
      '支持资源': '储能、光伏、充电桩、可调负荷',
      '电网接口': '支持主流电网调度协议',
      '定制化': '按需定制调度策略',
      '是否需要网关': '不需要（纯云端）',
    },
    scenarios: ['vpp'],
    cover: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800&q=70',
  },
];

// ---- Solutions (5) ----
export interface MockSolution {
  documentId: string;
  title: string;
  slug: string;
  tagline: string;
  description: string;
  painPoints: string[];
  highlights: string[];
  relatedProducts: string[]; // product slugs
  cover: string | null;
  accessModes: ('cloud' | 'gateway')[];
}

export const MOCK_SOLUTIONS: MockSolution[] = [
  {
    documentId: 's1',
    title: '户用家庭储能',
    slug: 'hems',
    tagline: '光储充一体，电费优化',
    description: '面向家庭用户的一站式能源管理方案，整合光伏发电、储能电池和充电桩，通过智能调度实现自发自用、余电上网，大幅降低电费支出。支持云端直连和网关局域网两种接入方式。',
    painPoints: [
      '电费持续上涨，缺少有效的能源管理手段',
      '光伏、储能、充电桩各自独立，无法联动优化',
      '缺乏实时监控和智能调度，能源利用率低',
    ],
    highlights: [
      '光储充一体化管理，一个平台统一控制',
      '智能调度引擎，自动优化充放电策略',
      'App 远程监控，随时随地掌握能源状态',
      '支持云端直连，无需额外硬件投入',
    ],
    relatedProducts: ['hems', 'neuron-ii'],
    cover: 'https://images.unsplash.com/photo-1558449028-b53a39d100fc?w=800&q=70',
    accessModes: ['cloud', 'gateway'],
  },
  {
    documentId: 's2',
    title: '工商业储能',
    slug: 'ess',
    tagline: '峰谷套利，备用电源，动态增容',
    description: '面向工商业用户的储能解决方案，通过峰谷电价差套利、需量管理和备用电源功能，帮助企业降低用电成本并保障供电可靠性。支持多站点集中管理。',
    painPoints: [
      '工商业电价高企，峰谷价差带来的套利空间未被利用',
      '变压器容量不足，扩容成本高昂',
      '突发停电影响生产，缺少可靠的备用电源方案',
    ],
    highlights: [
      '智能峰谷套利，自动低充高放最大化收益',
      '动态增容方案，避免高额变压器扩容费',
      '备用电源模式，确保关键负荷不间断供电',
      '多站点统一管理，运维效率提升 80%',
    ],
    relatedProducts: ['ess', 'neuron-ii'],
    cover: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&q=70',
    accessModes: ['cloud', 'gateway'],
  },
  {
    documentId: 's3',
    title: '充电站负载管理',
    slug: 'evcms',
    tagline: '多桩负载均衡，防跳闸',
    description: '面向充电站运营商的负载管理方案，通过 Neuron III 控制器实现毫秒级动态负载均衡（DLB），有效防止多车同充导致的跳闸问题，最大化利用现有电力容量。',
    painPoints: [
      '多车同时充电导致频繁跳闸，用户体验差',
      '电力容量有限，无法简单增加充电桩数量',
      '缺乏智能调度，充电效率低下',
    ],
    highlights: [
      '毫秒级 DLB 动态负载均衡，杜绝跳闸',
      '在现有电力容量下最大化充电桩利用率',
      'OCPP 2.0.1 标准协议，兼容主流充电桩',
      '实时监控和运营数据分析',
    ],
    relatedProducts: ['evcms', 'neuron-iii'],
    cover: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&q=70',
    accessModes: ['gateway'],
  },
  {
    documentId: 's4',
    title: 'VPP 虚拟电厂',
    slug: 'vpp',
    tagline: '设备聚合，参与电网调度',
    description: '面向 VPP 运营商和能源聚合商的虚拟电厂解决方案，聚合分布式储能、光伏、充电桩等资源，参与电力市场交易和电网调度，纯云端架构无需额外硬件。',
    painPoints: [
      '分布式能源资源分散，难以统一管理和调度',
      '参与电力市场交易门槛高，缺乏技术支撑',
      '调度响应速度不达标，无法满足电网要求',
    ],
    highlights: [
      '万级设备聚合管理能力',
      '500ms 内完成调度指令下发',
      '纯云端架构，无需部署硬件网关',
      '支持多种电力市场交易模式',
    ],
    relatedProducts: ['vpp'],
    cover: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800&q=70',
    accessModes: ['cloud'],
  },
  {
    documentId: 's5',
    title: '电能质量管理',
    slug: 'pqms',
    tagline: '谐波治理，远程监控，参数优化',
    description: '面向工业园区和数据中心的电能质量管理方案，通过 Neuron II 网关采集电能质量数据，实现谐波监测、治理方案优化和远程参数调优。',
    painPoints: [
      '谐波污染严重，影响设备寿命和生产效率',
      '电能质量问题难以定位，排查耗时耗力',
      '缺乏远程监控手段，运维人员需频繁现场巡检',
    ],
    highlights: [
      '50 次谐波全面监测，精准定位问题源',
      '远程监控和参数优化，减少 90% 现场巡检',
      '自动生成日报/周报/月报，辅助决策',
      '多级告警机制，企微/邮件实时通知',
    ],
    relatedProducts: ['pqms', 'neuron-ii'],
    cover: 'https://images.unsplash.com/photo-1545259742-a0f2c1a2d2b5?w=800&q=70',
    accessModes: ['gateway', 'cloud'],
  },
];

// ---- Compatible Brands ----
export const MOCK_BRANDS = [
  { documentId: 'b1', name: 'Huawei', category: '逆变器', accessMethod: '云端', capabilities: ['遥测', '控制'], status: '已接入' },
  { documentId: 'b2', name: 'Sungrow', category: '逆变器', accessMethod: '云端', capabilities: ['遥测', '控制'], status: '已接入' },
  { documentId: 'b3', name: 'GoodWe', category: '逆变器', accessMethod: '网关', capabilities: ['遥测', '控制'], status: '已接入' },
  { documentId: 'b4', name: 'Growatt', category: '逆变器', accessMethod: '云端', capabilities: ['遥测'], status: '已接入' },
  { documentId: 'b5', name: 'Deye', category: '逆变器', accessMethod: '网关', capabilities: ['遥测', '控制'], status: '已接入' },
  { documentId: 'b6', name: 'SofarSolar', category: '逆变器', accessMethod: '网关', capabilities: ['遥测'], status: '适配中' },
  { documentId: 'b7', name: 'CATL', category: '电池', accessMethod: '网关', capabilities: ['遥测'], status: '已接入' },
  { documentId: 'b8', name: 'BYD', category: '电池', accessMethod: '网关', capabilities: ['遥测', '控制'], status: '已接入' },
  { documentId: 'b9', name: 'EVE Energy', category: '电池', accessMethod: '网关', capabilities: ['遥测'], status: '已接入' },
  { documentId: 'b10', name: 'Pylontech', category: '电池', accessMethod: '网关', capabilities: ['遥测', '控制'], status: '已接入' },
  { documentId: 'b11', name: 'Schneider', category: '充电桩', accessMethod: '网关', capabilities: ['遥测', '控制'], status: '已接入' },
  { documentId: 'b12', name: 'ABB', category: '充电桩', accessMethod: '网关', capabilities: ['遥测', '控制'], status: '已接入' },
];

// ---- Articles ----
export const MOCK_ARTICLES = [
  { documentId: 'a1', title: '旭衡电子发布新一代智能能源网关', slug: 'new-gateway-release', summary: '全新 Neuron III 系列正式发布，内置计量级电表和毫秒级 DLB 动态负载均衡，为充电站运营商提供极致防跳闸体验', cover: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=70', publishedDate: '2026-02-15' },
  { documentId: 'a2', title: '旭衡电子荣获2025年度储能行业创新奖', slug: 'innovation-award-2025', summary: '旭衡电子凭借跨品牌能源管理解决方案的技术突破，荣获2025年度储能行业最具创新性企业奖项', cover: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800&q=70', publishedDate: '2026-01-20' },
  { documentId: 'a3', title: '旭衡电子与国家电网达成战略合作', slug: 'sgcc-partnership', summary: '双方将在虚拟电厂调度、分布式能源接入等领域展开深度合作，共同推动新型电力系统建设', cover: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&q=70', publishedDate: '2025-12-10' },
];

// ---- FAQ ----
export const MOCK_FAQS = [
  { id: '1', question: 'Neuron II 和 Neuron III 有什么区别？', answer: 'Neuron II 是通用多协议网关，适用于储能、光伏、电能质量等多种场景；Neuron III 是充电站专用控制器，内置高精度电表和毫秒级 DLB 动态负载均衡能力，专为充电站场景优化。', category: '设备接入' },
  { id: '2', question: '云平台是否需要搭配硬件网关使用？', answer: '不一定。HEMS 和 ESS 支持云端直连模式，无需网关；EVCMS 推荐搭配 Neuron III 使用以获得最佳 DLB 性能；PQMS 推荐搭配 Neuron II；VPP 是纯云端平台，不需要网关。', category: '云平台使用' },
  { id: '3', question: '如何接入兼容品牌的设备？', answer: '旭衡的产品支持两种接入方式：1) 云端直连 — 通过品牌开放 API 直接对接，无需额外硬件；2) 网关局域网 — 通过 Neuron 网关在本地局域网内采集设备数据。具体接入方式请查看兼容生态页面。', category: '设备接入' },
  { id: '4', question: 'EVCMS 支持哪些充电桩品牌？', answer: 'EVCMS 支持所有兼容 OCPP 1.6J 和 OCPP 2.0.1 协议的充电桩，包括但不限于 ABB、Schneider、Wallbox、Easee 等品牌。详情请查看兼容生态页面。', category: '设备接入' },
  { id: '5', question: '数据安全如何保障？', answer: '所有数据传输使用 TLS 1.3 加密，云平台通过 ISO 27001 认证，支持数据本地化部署。用户数据严格隔离，遵循 GDPR 等国际隐私法规。', category: '账号与权限' },
  { id: '6', question: '系统故障如何报修？', answer: '您可以通过帮助中心的「在线报修」功能提交报修工单，我们的技术支持团队会在 24 小时内响应。紧急故障可直接拨打技术支持热线。', category: '故障排查' },
  { id: '7', question: '是否支持 API 接口对接？', answer: '开发者中心即将上线，届时将提供完整的 API 文档和 SDK。目前如有 API 对接需求，请通过联系我们页面提交需求，我们会安排技术团队对接。', category: '云平台使用' },
  { id: '8', question: 'Neuron III Lite 和 Neuron III 的应用场景有什么不同？', answer: 'Neuron III 适用于大型充电站（多桩场景），提供完整的 DLB 能力和内置电表；Neuron III Lite 则面向小型场景（如家庭充电或 2-4 桩小型站点），提供基础防跳闸功能，成本更低。', category: '网关配置' },
  { id: '9', question: '固件升级需要注意什么？', answer: '固件升级前请确认云平台和配置工具的版本兼容性，可在帮助中心的「版本兼容矩阵」页面查询。建议在非业务高峰期进行升级，升级过程中请勿断电。', category: '网关配置' },
  { id: '10', question: '如何申请 Demo 试用？', answer: '您可以通过联系我们页面提交试用申请，选择意向类型为「解决方案咨询」，我们的销售团队会在 1-2 个工作日内联系您安排 Demo 演示。', category: '账号与权限' },
];

// Helper: get product by slug
export function getMockProduct(slug: string): MockProduct | undefined {
  return MOCK_PRODUCTS.find(p => p.slug === slug);
}

// Helper: get solution by slug
export function getMockSolution(slug: string): MockSolution | undefined {
  return MOCK_SOLUTIONS.find(s => s.slug === slug);
}
