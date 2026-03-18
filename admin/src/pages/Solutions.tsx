import { useEffect, useState, useCallback, useRef } from 'react';
import {
  Table, Button, Drawer, Form, Input, Typography, message, Image, Tabs, Card, Space,
} from 'antd';
import { UploadOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import LocaleTabs, { useTranslationMeta, markAsManual, FieldStatusTag } from '../components/LocaleTabs';
import api from '../lib/axios';

const API_URL = '/content-manager/collection-types/api::solution.solution';
const CONTENT_UID = 'api::solution.solution';

interface FeatureItem {
  label: string;
  desc: string;
  points: string[];
}

interface CaseItem {
  area: string;
  scale: string;
  problem: string;
}

export default function Solutions() {
  const { t } = useTranslation();
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [locale, setLocale] = useState('zh-CN');
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pendingCoverId, setPendingCoverId] = useState<number | null>(null);
  const [features, setFeatures] = useState<FeatureItem[]>([]);
  const [cases, setCases] = useState<CaseItem[]>([]);
  const { meta: translationMeta, refetchMeta } = useTranslationMeta(editingDocId, CONTENT_UID);
  const [form] = Form.useForm();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`${API_URL}?page=1&pageSize=50&sort=sortOrder:asc&locale=${locale}&populate=cover`);
      setData(res.data?.results ?? []);
    } catch { /**/ } finally {
      setLoading(false);
    }
  }, [locale]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openEdit = (record: Record<string, unknown>) => {
    const docId = (record.documentId ?? record.id) as string;
    setEditingDocId(docId);
    setPendingCoverId(null);

    const cover = record.cover as { url?: string } | null;
    setCoverPreview(cover?.url ?? null);

    setFeatures(Array.isArray(record.features) ? (record.features as FeatureItem[]) : []);
    setCases(Array.isArray(record.cases) ? (record.cases as CaseItem[]) : []);

    form.setFieldsValue({
      title: record.title,
      tagline: record.tagline,
      description: record.description,
    });
    setDrawerOpen(true);
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('files', file);
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const uploaded = res.data?.[0];
      if (uploaded) {
        setPendingCoverId(uploaded.id);
        setCoverPreview(uploaded.url);
        message.success('封面上传成功');
      }
    } catch { message.error('上传失败'); } finally { setUploading(false); }
  };

  // --- Features helpers ---
  const addFeature = () => setFeatures((prev) => [...prev, { label: '', desc: '', points: [] }]);
  const removeFeature = (idx: number) => setFeatures((prev) => prev.filter((_, i) => i !== idx));
  const updateFeature = (idx: number, field: keyof FeatureItem, value: unknown) => {
    setFeatures((prev) => prev.map((f, i) => i === idx ? { ...f, [field]: value } : f));
  };
  const addPoint = (fIdx: number) => {
    setFeatures((prev) => prev.map((f, i) => i === fIdx ? { ...f, points: [...f.points, ''] } : f));
  };
  const removePoint = (fIdx: number, pIdx: number) => {
    setFeatures((prev) => prev.map((f, i) => i === fIdx ? { ...f, points: f.points.filter((_, j) => j !== pIdx) } : f));
  };
  const updatePoint = (fIdx: number, pIdx: number, value: string) => {
    setFeatures((prev) => prev.map((f, i) => i === fIdx ? { ...f, points: f.points.map((p, j) => j === pIdx ? value : p) } : f));
  };

  // --- Cases helpers ---
  const addCase = () => setCases((prev) => [...prev, { area: '', scale: '', problem: '' }]);
  const removeCase = (idx: number) => setCases((prev) => prev.filter((_, i) => i !== idx));
  const updateCase = (idx: number, field: keyof CaseItem, value: string) => {
    setCases((prev) => prev.map((c, i) => i === idx ? { ...c, [field]: value } : c));
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    try {
      const payload: Record<string, unknown> = {
        title: values.title,
        tagline: values.tagline,
        description: values.description,
        features: features.length > 0 ? features : null,
        cases: cases.length > 0 ? cases : null,
      };
      if (pendingCoverId !== null) payload.cover = pendingCoverId;
      await api.put(`${API_URL}/${editingDocId}?locale=${locale}`, payload);
      // Auto-publish
      try {
        await api.post(`${API_URL}/${editingDocId}/actions/publish?locale=${locale}`, {});
      } catch { /* publish may fail */ }
      // Mark as manual if editing a non-source locale
      if (locale !== 'zh-CN' && editingDocId) {
        await markAsManual(editingDocId, CONTENT_UID, locale);
        refetchMeta();
      }
      message.success('保存并发布成功');
      setDrawerOpen(false);
      fetchData();
    } catch { message.error('保存失败'); }
  };

  const columns = [
    { title: 'Slug', dataIndex: 'slug', width: 100 },
    {
      title: '封面', dataIndex: 'cover', width: 80,
      render: (cover: { url?: string } | null) => cover?.url
        ? <Image src={cover.url.startsWith('/uploads/') ? `/strapi${cover.url}` : cover.url} width={60} height={40} style={{ objectFit: 'cover', borderRadius: 4 }} />
        : <span style={{ color: '#ccc', fontSize: 12 }}>无图</span>,
    },
    { title: '标题', dataIndex: 'title', ellipsis: true },
    { title: '副标题', dataIndex: 'tagline', ellipsis: true },
    {
      title: '操作', width: 80,
      render: (_: unknown, record: Record<string, unknown>) => (
        <Button size="small" onClick={() => openEdit(record)}>编辑</Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Typography.Title level={4} style={{ margin: 0 }}>{t('menu.solutions')}</Typography.Title>
        </div>
        <LocaleTabs
          currentLocale={locale}
          onLocaleChange={(v) => setLocale(v)}
          showTranslateButton={false}
        />
      </div>
      <Table dataSource={data} columns={columns} rowKey="documentId" loading={loading} pagination={false} />

      <Drawer
        title={
          <LocaleTabs
            currentLocale={locale}
            onLocaleChange={async (v) => {
              setLocale(v);
              if (editingDocId) {
                try {
                  const res = await api.get(`${API_URL}/${editingDocId}?locale=${v}&populate=cover`);
                  const rec = res.data as Record<string, unknown>;
                  form.setFieldsValue({ title: rec.title, tagline: rec.tagline, description: rec.description });
                  setFeatures(Array.isArray(rec.features) ? (rec.features as FeatureItem[]) : []);
                  setCases(Array.isArray(rec.cases) ? (rec.cases as CaseItem[]) : []);
                  const cover = rec.cover as { url?: string } | null;
                  setCoverPreview(cover?.url ?? null);
                } catch { /* */ }
              }
            }}
            documentId={editingDocId}
            uid={CONTENT_UID}
          />
        }
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={720}
        extra={<Button type="primary" onClick={handleSave} loading={uploading}>保存</Button>}
      >
        <Tabs
          items={[
            {
              key: 'basic',
              label: '基本信息',
              children: (
                <Form form={form} layout="vertical">
                  <Form.Item name="title" label={<span>{t('common.title')}<FieldStatusTag meta={translationMeta} locale={locale} field="title" /></span>} rules={[{ required: true }]}><Input /></Form.Item>
                  <Form.Item name="tagline" label={<span>{t('products.tagline')}<FieldStatusTag meta={translationMeta} locale={locale} field="tagline" /></span>}><Input /></Form.Item>
                  <Form.Item name="description" label={<span>{t('common.description')}<FieldStatusTag meta={translationMeta} locale={locale} field="description" /></span>}><Input.TextArea rows={4} /></Form.Item>
                  <Form.Item label="封面图">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {coverPreview && (
                        <img
                          src={coverPreview.startsWith('http') ? coverPreview : `/strapi${coverPreview}`}
                          alt="封面预览"
                          style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 8, border: '1px solid #e2e8f0' }}
                        />
                      )}
                      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }}
                        onChange={(e) => { const file = e.target.files?.[0]; if (file) handleUpload(file); e.target.value = ''; }} />
                      <Button icon={<UploadOutlined />} loading={uploading} onClick={() => fileInputRef.current?.click()}>
                        {coverPreview ? '更换封面图' : '上传封面图'}
                      </Button>
                    </div>
                  </Form.Item>
                </Form>
              ),
            },
            {
              key: 'features',
              label: `功能点 (${features.length})`,
              children: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {features.map((feat, fIdx) => (
                    <Card
                      key={fIdx}
                      size="small"
                      title={`功能 ${fIdx + 1}`}
                      extra={<Button danger size="small" icon={<DeleteOutlined />} onClick={() => removeFeature(fIdx)} />}
                    >
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Input
                          placeholder="标签 (label)"
                          value={feat.label}
                          onChange={(e) => updateFeature(fIdx, 'label', e.target.value)}
                        />
                        <Input.TextArea
                          placeholder="描述 (desc)"
                          value={feat.desc}
                          rows={2}
                          onChange={(e) => updateFeature(fIdx, 'desc', e.target.value)}
                        />
                        <div>
                          <Typography.Text type="secondary" style={{ fontSize: 12 }}>要点列表：</Typography.Text>
                          {feat.points.map((pt, pIdx) => (
                            <Space key={pIdx} style={{ width: '100%', marginTop: 4 }}>
                              <Input
                                placeholder={`要点 ${pIdx + 1}`}
                                value={pt}
                                onChange={(e) => updatePoint(fIdx, pIdx, e.target.value)}
                                style={{ flex: 1 }}
                              />
                              <Button size="small" danger icon={<DeleteOutlined />} onClick={() => removePoint(fIdx, pIdx)} />
                            </Space>
                          ))}
                          <Button size="small" type="dashed" icon={<PlusOutlined />} onClick={() => addPoint(fIdx)} style={{ marginTop: 4 }}>
                            添加要点
                          </Button>
                        </div>
                      </Space>
                    </Card>
                  ))}
                  <Button type="dashed" icon={<PlusOutlined />} onClick={addFeature} block>
                    添加功能点
                  </Button>
                </div>
              ),
            },
            {
              key: 'cases',
              label: `案例 (${cases.length})`,
              children: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {cases.map((c, idx) => (
                    <Card
                      key={idx}
                      size="small"
                      title={`案例 ${idx + 1}`}
                      extra={<Button danger size="small" icon={<DeleteOutlined />} onClick={() => removeCase(idx)} />}
                    >
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Input
                          placeholder="区域 (area)"
                          value={c.area}
                          onChange={(e) => updateCase(idx, 'area', e.target.value)}
                        />
                        <Input
                          placeholder="规模 (scale)"
                          value={c.scale}
                          onChange={(e) => updateCase(idx, 'scale', e.target.value)}
                        />
                        <Input.TextArea
                          placeholder="成效 (problem)"
                          value={c.problem}
                          rows={2}
                          onChange={(e) => updateCase(idx, 'problem', e.target.value)}
                        />
                      </Space>
                    </Card>
                  ))}
                  <Button type="dashed" icon={<PlusOutlined />} onClick={addCase} block>
                    添加案例
                  </Button>
                </div>
              ),
            },
          ]}
        />
      </Drawer>
    </div>
  );
}
