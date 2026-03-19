import { useEffect, useState } from 'react';
import {
  Form, Input, Button, Typography, message, Card, Space, Divider,
} from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import api from '../lib/axios';

const API_URL = '/content-manager/collection-types/api::page-content.page-content';
const PAGE_KEY = 'contact-page';

interface ContactPerson { name: string; position: string; email: string; phone: string }
interface ContactContent {
  contacts: ContactPerson[];
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
}

const DEFAULT_CONTENT: ContactContent = {
  contacts: [
    { name: '', position: '', email: '', phone: '' },
  ],
  companyAddress: '',
  companyPhone: '',
  companyEmail: '',
};

export default function ContactPage() {
  const { t } = useTranslation();
  const [form] = Form.useForm<ContactContent>();
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
          let parsed: ContactContent = DEFAULT_CONTENT;
          try {
            const raw = record.content;
            const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
            // Map Strapi field names to form field names
            if (data?.contacts) {
              parsed = {
                contacts: data.contacts.map((c: Record<string, string>) => ({
                  name: c.name || '',
                  position: c.position || c.title || '',
                  email: c.email || '',
                  phone: c.phone || '',
                })),
                companyAddress: data.companyAddress || '',
                companyPhone: data.companyPhone || '',
                companyEmail: data.companyEmail || '',
              };
            }
          } catch { /* use default */ }
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
        <Typography.Title level={4} style={{ margin: 0 }}>{t('contact.title')}</Typography.Title>
        <Button type="primary" loading={saving || loading} onClick={handleSave}>{t('common.save')}</Button>
      </div>

      <Form form={form} layout="vertical">
        {/* 公司信息 */}
        <Card title={t('contact.companyInfo')} style={{ marginBottom: 16 }}>
          <Form.Item name="companyAddress" label={t('contact.address')}>
            <Input.TextArea rows={2} />
          </Form.Item>
          <Space>
            <Form.Item name="companyPhone" label={t('contact.phone')} style={{ width: 260 }}>
              <Input />
            </Form.Item>
            <Form.Item name="companyEmail" label={t('contact.email')} style={{ width: 260 }}>
              <Input />
            </Form.Item>
          </Space>
        </Card>

        {/* 联系人列表 */}
        <Card title={t('contact.contacts')}>
          <Form.List name="contacts">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name }, index) => (
                  <div key={key}>
                    {index > 0 && <Divider style={{ margin: '8px 0' }} />}
                    <Space align="start" wrap>
                      <Form.Item name={[name, 'name']} label={t('common.name')} rules={[{ required: true }]} style={{ width: 180 }}>
                        <Input />
                      </Form.Item>
                      <Form.Item name={[name, 'position']} label={t('contact.position')} style={{ width: 180 }}>
                        <Input />
                      </Form.Item>
                      <Form.Item name={[name, 'email']} label={t('common.email')} style={{ width: 220 }}>
                        <Input />
                      </Form.Item>
                      <Form.Item name={[name, 'phone']} label={t('common.phone')} style={{ width: 180 }}>
                        <Input />
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
                  onClick={() => add({ name: '', position: '', email: '', phone: '' })}
                >
                  {t('contact.addContact')}
                </Button>
              </>
            )}
          </Form.List>
        </Card>
      </Form>
    </div>
  );
}
