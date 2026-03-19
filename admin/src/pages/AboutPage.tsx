import { useEffect, useState } from 'react';
import {
  Form, Input, Button, Typography, message, Card, Space, Divider,
} from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import api from '../lib/axios';

const API_URL = '/content-manager/collection-types/api::page-content.page-content';
const PAGE_KEY = 'about-page';

interface CoreNumber { value: string; label: string }
interface CoreCapability { icon: string; title: string; description: string }
interface Milestone { year: string; text: string }
interface AboutContent {
  companyIntro: string;
  coreNumbers: CoreNumber[];
  coreCapabilities: CoreCapability[];
  milestones: Milestone[];
}

const DEFAULT_CONTENT: AboutContent = {
  companyIntro: '',
  coreNumbers: [
    { value: '200+', label: '兼容品牌' },
    { value: '50+', label: '覆盖国家' },
    { value: '1000+', label: '已交付项目' },
  ],
  coreCapabilities: [
    { icon: '🔧', title: '软硬一体', description: '' },
    { icon: '🔗', title: '跨品牌接入', description: '' },
    { icon: '🌐', title: '多场景覆盖', description: '' },
  ],
  milestones: [
    { year: '2018', text: '公司成立' },
  ],
};

export default function AboutPage() {
  const { t } = useTranslation();
  const [form] = Form.useForm<AboutContent>();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [documentId, setDocumentId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    api.get(`${API_URL}?filters[pageKey][$eq]=${PAGE_KEY}`)
      .then((res) => {
        const record = res.data?.results?.[0];
        if (record) {
          setDocumentId(record.documentId as string);
          let parsed: AboutContent = DEFAULT_CONTENT;
          try { parsed = JSON.parse(record.content as string) as AboutContent; } catch { /* use default */ }
          form.setFieldsValue(parsed);
        } else {
          form.setFieldsValue(DEFAULT_CONTENT);
        }
      })
      .catch(() => { form.setFieldsValue(DEFAULT_CONTENT); })
      .finally(() => setLoading(false));
  }, [form]);

  const handleSave = async () => {
    const values = await form.validateFields();
    setSaving(true);
    try {
      const payload = { pageKey: PAGE_KEY, content: JSON.stringify(values) };
      if (documentId) {
        await api.put(`${API_URL}/${documentId}`, payload);
      } else {
        const res = await api.post(API_URL, payload);
        setDocumentId((res.data?.data?.documentId ?? res.data?.documentId) as string);
      }
      // Trigger translation
      try {
        await api.post('/api/translate/batch', { pageKey: PAGE_KEY });
      } catch { /* non-critical */ }
      message.success(t('common.success'));
    } catch {
      message.error(t('common.failed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 860 }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography.Title level={4} style={{ margin: 0 }}>{t('about.title')}</Typography.Title>
        <Button type="primary" loading={saving || loading} onClick={handleSave}>{t('common.save')}</Button>
      </div>

      <Form form={form} layout="vertical">
        {/* 公司简介 */}
        <Card title={t('about.companyIntro')} style={{ marginBottom: 16 }}>
          <Form.Item name="companyIntro" rules={[{ required: true }]}>
            <Input.TextArea rows={6} />
          </Form.Item>
        </Card>

        {/* 核心数字 */}
        <Card title={t('about.coreNumbers')} style={{ marginBottom: 16 }}>
          <Form.List name="coreNumbers">
            {(fields) => (
              <Space wrap>
                {fields.map(({ key, name }) => (
                  <Card key={key} size="small" style={{ width: 220 }}>
                    <Form.Item name={[name, 'value']} label={t('about.numberValue')} rules={[{ required: true }]}>
                      <Input />
                    </Form.Item>
                    <Form.Item name={[name, 'label']} label={t('about.numberLabel')} rules={[{ required: true }]}>
                      <Input />
                    </Form.Item>
                  </Card>
                ))}
              </Space>
            )}
          </Form.List>
        </Card>

        {/* 核心能力 */}
        <Card title={t('about.coreCapabilities')} style={{ marginBottom: 16 }}>
          <Form.List name="coreCapabilities">
            {(fields) => (
              <Space wrap>
                {fields.map(({ key, name }) => (
                  <Card key={key} size="small" style={{ width: 260 }}>
                    <Form.Item name={[name, 'icon']} label={t('about.capabilityIcon')}>
                      <Input />
                    </Form.Item>
                    <Form.Item name={[name, 'title']} label={t('about.capabilityTitle')} rules={[{ required: true }]}>
                      <Input />
                    </Form.Item>
                    <Form.Item name={[name, 'description']} label={t('about.capabilityDesc')}>
                      <Input.TextArea rows={3} />
                    </Form.Item>
                  </Card>
                ))}
              </Space>
            )}
          </Form.List>
        </Card>

        {/* 发展历程 */}
        <Card title={t('about.milestones')} style={{ marginBottom: 16 }}>
          <Form.List name="milestones">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name }, index) => (
                  <div key={key}>
                    {index > 0 && <Divider style={{ margin: '8px 0' }} />}
                    <Space align="start">
                      <Form.Item name={[name, 'year']} label={t('about.milestoneYear')} rules={[{ required: true }]} style={{ width: 120 }}>
                        <Input />
                      </Form.Item>
                      <Form.Item name={[name, 'text']} label={t('about.milestoneText')} rules={[{ required: true }]} style={{ width: 480 }}>
                        <Input.TextArea rows={2} />
                      </Form.Item>
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        style={{ marginTop: 30 }}
                        onClick={() => remove(name)}
                      />
                    </Space>
                  </div>
                ))}
                <Button
                  type="dashed"
                  icon={<PlusOutlined />}
                  onClick={() => add({ year: '', text: '' })}
                >
                  {t('about.addMilestone')}
                </Button>
              </>
            )}
          </Form.List>
        </Card>
      </Form>
    </div>
  );
}
