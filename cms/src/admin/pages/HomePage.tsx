import { useEffect, useState } from 'react';
import { Card, Col, Row, Statistic, Button, Typography, Space, Spin } from 'antd';
import {
  FileTextOutlined,
  ShoppingOutlined,
  TeamOutlined,
  ToolOutlined,
  PlusOutlined,
} from '@ant-design/icons';
const { Title, Text } = Typography;

interface DashboardStats {
  leadsToday: number;
  openTickets: number;
  draftArticles: number;
}

/**
 * Fetches count from Strapi content-manager API.
 * Falls back to 0 on any error (e.g. missing collection, permissions).
 */
async function fetchCount(
  endpoint: string,
  filters?: Record<string, unknown>,
): Promise<number> {
  try {
    const params = new URLSearchParams();
    params.set('page', '1');
    params.set('pageSize', '1');
    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        params.set(key, String(value));
      }
    }
    const res = await fetch(`/api/${endpoint}?${params.toString()}`, {
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    if (!res.ok) return 0;
    const json = await res.json();
    return json?.meta?.pagination?.total ?? json?.data?.length ?? 0;
  } catch {
    return 0;
  }
}

function todayISO(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export default function HomePage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [leadsToday, openTickets, draftArticles] = await Promise.all([
        fetchCount('leads', {
          'filters[createdAt][$gte]': todayISO(),
        }),
        fetchCount('repair-tickets', {
          'filters[status][$ne]': 'closed',
        }),
        fetchCount('articles', {
          'publicationState': 'preview',
          'filters[publishedAt][$null]': 'true',
        }),
      ]);

      if (!cancelled) {
        setStats({ leadsToday, openTickets, draftArticles });
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const quickLinks = [
    {
      label: '新建新闻',
      icon: <PlusOutlined />,
      href: '/admin/content-manager/collection-types/api::article.article/create',
    },
    {
      label: '新建产品',
      icon: <ShoppingOutlined />,
      href: '/admin/content-manager/collection-types/api::product.product/create',
    },
    {
      label: '查看线索',
      icon: <TeamOutlined />,
      href: '/admin/content-manager/collection-types/api::lead.lead',
    },
    {
      label: '查看工单',
      icon: <ToolOutlined />,
      href: '/admin/content-manager/collection-types/api::repair-ticket.repair-ticket',
    },
  ];

  return (
    <div style={{ padding: 32, maxWidth: 1200, margin: '0 auto' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>
            旭衡电子 CMS 管理后台
          </Title>
          <Text type="secondary">AlwaysControl Technology — 内容管理仪表盘</Text>
        </div>

        {/* Stats Cards */}
        <Spin spinning={loading}>
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={8}>
              <Card bordered={false} style={{ borderTop: `3px solid #1A3FAD` }}>
                <Statistic
                  title="今日新线索"
                  value={stats?.leadsToday ?? 0}
                  prefix={<TeamOutlined style={{ color: '#1A3FAD' }} />}
                  valueStyle={{ color: '#1A3FAD' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card bordered={false} style={{ borderTop: `3px solid #faad14` }}>
                <Statistic
                  title="待处理工单"
                  value={stats?.openTickets ?? 0}
                  prefix={<ToolOutlined style={{ color: '#faad14' }} />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card bordered={false} style={{ borderTop: `3px solid #38C4E8` }}>
                <Statistic
                  title="待发布文章"
                  value={stats?.draftArticles ?? 0}
                  prefix={<FileTextOutlined style={{ color: '#38C4E8' }} />}
                  valueStyle={{ color: '#38C4E8' }}
                />
              </Card>
            </Col>
          </Row>
        </Spin>

        {/* Quick Actions */}
        <Card title="快捷操作" bordered={false}>
          <Row gutter={[16, 16]}>
            {quickLinks.map((link) => (
              <Col key={link.href} xs={12} sm={6}>
                <Button
                  type="default"
                  icon={link.icon}
                  block
                  size="large"
                  href={link.href}
                  style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  {link.label}
                </Button>
              </Col>
            ))}
          </Row>
        </Card>
      </Space>
    </div>
  );
}
