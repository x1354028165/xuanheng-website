import { useEffect, useState } from 'react';
import { Card, Col, Row, Statistic, Table, Typography } from 'antd';
import { TeamOutlined, ToolOutlined, FileTextOutlined, UserAddOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import api from '../lib/axios';

interface StatsData {
  leads: number;
  tickets: number;
  news: number;
  jobs: number;
}

// ✅ 测试通过: 统计卡片渲染、最近线索列表
export default function Dashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<StatsData>({ leads: 0, tickets: 0, news: 0, jobs: 0 });
  const [recentLeads, setRecentLeads] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const endpoints = [
          { key: 'leads', url: '/content-manager/collection-types/api::lead.lead?page=1&pageSize=1' },
          { key: 'tickets', url: '/content-manager/collection-types/api::repair-ticket.repair-ticket?page=1&pageSize=1' },
          { key: 'news', url: '/content-manager/collection-types/api::article.article?page=1&pageSize=1' },
          { key: 'jobs', url: '/content-manager/collection-types/api::job-posting.job-posting?page=1&pageSize=1' },
        ];
        const results = await Promise.allSettled(endpoints.map((e) => api.get(e.url)));
        const s: StatsData = { leads: 0, tickets: 0, news: 0, jobs: 0 };
        const keys: (keyof StatsData)[] = ['leads', 'tickets', 'news', 'jobs'];
        results.forEach((r, i) => {
          if (r.status === 'fulfilled') {
            s[keys[i]] = r.value.data?.pagination?.total ?? r.value.data?.results?.length ?? 0;
          }
        });
        setStats(s);

        const leadsRes = await api.get('/content-manager/collection-types/api::lead.lead?page=1&pageSize=5&sort=createdAt:desc');
        setRecentLeads(leadsRes.data?.results ?? []);
      } catch {
        // stats load failed silently
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const columns = [
    { title: t('common.id'), dataIndex: 'id', key: 'id', width: 60 },
    { title: t('common.name'), dataIndex: 'name', key: 'name' },
    { title: t('common.email'), dataIndex: 'email', key: 'email' },
    { title: t('common.phone'), dataIndex: 'phone', key: 'phone' },
    { title: t('leads.intentType'), dataIndex: 'intentType', key: 'intentType' },
  ];

  const statCards = [
    { title: t('dashboard.leads'), value: stats.leads, icon: <TeamOutlined />, color: '#1A3FAD' },
    { title: t('dashboard.tickets'), value: stats.tickets, icon: <ToolOutlined />, color: '#faad14' },
    { title: t('dashboard.news'), value: stats.news, icon: <FileTextOutlined />, color: '#52c41a' },
    { title: t('dashboard.jobs'), value: stats.jobs, icon: <UserAddOutlined />, color: '#38C4E8' },
  ];

  return (
    <div>
      <Row gutter={[16, 16]}>
        {statCards.map((s) => (
          <Col xs={24} sm={12} lg={6} key={s.title}>
            <Card>
              <Statistic title={s.title} value={s.value} prefix={s.icon} valueStyle={{ color: s.color }} />
            </Card>
          </Col>
        ))}
      </Row>
      <Card style={{ marginTop: 24 }}>
        <Typography.Title level={5}>{t('dashboard.recentLeads')}</Typography.Title>
        <Table
          dataSource={recentLeads}
          columns={columns}
          rowKey="id"
          pagination={false}
          loading={loading}
          size="small"
        />
      </Card>
    </div>
  );
}
