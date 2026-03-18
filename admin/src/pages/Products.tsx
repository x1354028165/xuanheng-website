import { useEffect, useState, useCallback, useRef } from 'react';
import {
  Table, Button, Drawer, Form, Input, Typography, message, Image, Select, Tabs, Card, Space, Tag,
} from 'antd';
import { UploadOutlined, PlusOutlined, DeleteOutlined, HolderOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import LocaleTabs, { useTranslationMeta, markAsManual, FieldStatusTag } from '../components/LocaleTabs';
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import api from '../lib/axios';

const API_URL = '/content-manager/collection-types/api::product.product';
const CONTENT_UID = 'api::product.product';

interface FeatureItem {
  label: string;
  desc: string;
  points: string[];
  image?: string;
}

function SortableFeatureCard({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <span {...listeners} style={{ cursor: 'grab', paddingTop: 4, color: '#94a3b8' }}>
          <HolderOutlined />
        </span>
        <div style={{ flex: 1 }}>{children}</div>
      </div>
    </div>
  );
}

interface SpecItem {
  key: string;
  value: string;
}

interface GalleryImage {
  id: number;
  url: string;
  name?: string;
}

export default function Products() {
  const { t } = useTranslation();
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [locale, setLocale] = useState('zh-CN');
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pendingCoverId, setPendingCoverId] = useState<number | null>(null);
  const [category, setCategory] = useState<string>('hardware');
  const [features, setFeatures] = useState<FeatureItem[]>([]);
  const [keySpecs, setKeySpecs] = useState<SpecItem[]>([]);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const { meta: translationMeta, refetchMeta } = useTranslationMeta(editingDocId, CONTENT_UID);
  const [form] = Form.useForm();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const featureImageRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const sensors = useSensors(useSensor(PointerSensor));

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`${API_URL}?page=1&pageSize=50&sort=sortOrder:asc&locale=${locale}&populate=cover,gallery`);
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

    setCategory((record.category as string) ?? 'hardware');
    setFeatures(Array.isArray(record.features) ? (record.features as FeatureItem[]) : []);
    setKeySpecs(Array.isArray(record.keySpecs) ? (record.keySpecs as SpecItem[]) : []);

    const galleryData = record.gallery as GalleryImage[] | null;
    setGallery(Array.isArray(galleryData) ? galleryData.map((g) => ({ id: g.id, url: g.url, name: g.name })) : []);

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

  const handleGalleryUpload = async (files: FileList) => {
    setGalleryUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('files', file);
        const res = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const uploaded = res.data?.[0];
        if (uploaded) {
          setGallery((prev) => [...prev, { id: uploaded.id, url: uploaded.url, name: uploaded.name }]);
        }
      }
      message.success('图库图片上传成功');
    } catch { message.error('图库上传失败'); } finally { setGalleryUploading(false); }
  };

  const removeGalleryImage = (id: number) => {
    setGallery((prev) => prev.filter((g) => g.id !== id));
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

  // --- KeySpecs helpers ---
  const addSpec = () => setKeySpecs((prev) => [...prev, { key: '', value: '' }]);
  const removeSpec = (idx: number) => setKeySpecs((prev) => prev.filter((_, i) => i !== idx));
  const updateSpec = (idx: number, field: 'key' | 'value', value: string) => {
    setKeySpecs((prev) => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  };

  const uploadFeatureImage = async (fIdx: number, file: File) => {
    const formData = new FormData();
    formData.append('files', file);
    const res = await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const url = res.data[0]?.url;
    if (url) {
      const fullUrl = url.startsWith('/uploads/') ? `/strapi${url}` : url;
      updateFeature(fIdx, 'image', fullUrl);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setFeatures((prev) => {
        const oldIndex = prev.findIndex((_, i) => String(i) === active.id);
        const newIndex = prev.findIndex((_, i) => String(i) === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    try {
      const payload: Record<string, unknown> = {
        title: values.title,
        tagline: values.tagline,
        description: values.description,
        category,
        features: features.length > 0 ? features : null,
        keySpecs: keySpecs.length > 0 ? keySpecs : null,
        gallery: gallery.map((g) => g.id),
      };
      if (pendingCoverId !== null) payload.cover = pendingCoverId;
      await api.put(`${API_URL}/${editingDocId}?locale=${locale}`, payload);
      // Auto-publish
      try {
        await api.post(`${API_URL}/${editingDocId}/actions/publish?locale=${locale}`, {});
      } catch { /* publish may fail for drafts without required fields */ }
      // Mark as manual if editing a non-source locale
      if (locale !== 'zh-CN' && editingDocId) {
        await markAsManual(editingDocId, CONTENT_UID, locale);
        refetchMeta();
      }
      message.success('保存成功');
      setDrawerOpen(false);
      fetchData();
    } catch { message.error('保存失败'); }
  };

  const columns = [
    { title: 'Slug', dataIndex: 'slug', width: 120 },
    {
      title: '封面', dataIndex: 'cover', width: 80,
      render: (cover: { url?: string } | null) => cover?.url
        ? <Image src={cover.url.startsWith('/uploads/') ? `/strapi${cover.url}` : cover.url} width={60} height={40} style={{ objectFit: 'cover', borderRadius: 4 }} />
        : <span style={{ color: '#ccc', fontSize: 12 }}>无图</span>,
    },
    { title: t('common.title'), dataIndex: 'title', ellipsis: true },
    {
      title: '分类', dataIndex: 'category', width: 90,
      render: (cat: string) => <Tag color={cat === 'hardware' ? 'blue' : 'green'}>{cat ?? '-'}</Tag>,
    },
    { title: t('products.tagline'), dataIndex: 'tagline', ellipsis: true },
    {
      title: t('common.operations'), width: 80,
      render: (_: unknown, record: Record<string, unknown>) => (
        <Button size="small" onClick={() => openEdit(record)}>{t('common.edit')}</Button>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Typography.Title level={4} style={{ margin: 0 }}>{t('menu.products')}</Typography.Title>
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
                  const res = await api.get(`${API_URL}/${editingDocId}?locale=${v}&populate=cover,gallery`);
                  // content-manager API returns {data: {...}, meta: {...}}
                  const rec = (res.data?.data ?? res.data) as Record<string, unknown>;
                  form.setFieldsValue({ title: rec.title ?? '', tagline: rec.tagline ?? '', description: rec.description ?? '' });
                  setCategory((rec.category as string) ?? 'hardware');
                  setFeatures(Array.isArray(rec.features) ? (rec.features as FeatureItem[]) : []);
                  setKeySpecs(Array.isArray(rec.keySpecs) ? (rec.keySpecs as SpecItem[]) : []);
                  const cover = rec.cover as { url?: string } | null;
                  setCoverPreview(cover?.url ?? null);
                  const galleryData = rec.gallery as GalleryImage[] | null;
                  setGallery(Array.isArray(galleryData) ? galleryData.map((g) => ({ id: g.id, url: g.url, name: g.name })) : []);
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
        extra={<Button type="primary" onClick={handleSave} loading={uploading || galleryUploading}>{t('common.save')}</Button>}
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

                  <Form.Item label="产品分类">
                    <Select value={category} onChange={setCategory}>
                      <Select.Option value="hardware">硬件 Hardware</Select.Option>
                      <Select.Option value="software">软件 Software</Select.Option>
                    </Select>
                  </Form.Item>

                  <Form.Item label="封面图">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {coverPreview && (
                        <img
                          src={coverPreview.startsWith('http') ? coverPreview : `/strapi${coverPreview}`}
                          alt="封面"
                          style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 8, border: '1px solid #e2e8f0' }}
                        />
                      )}
                      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }}
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); e.target.value = ''; }} />
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
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={features.map((_, i) => String(i))} strategy={verticalListSortingStrategy}>
                      {features.map((feat, fIdx) => (
                        <SortableFeatureCard key={fIdx} id={String(fIdx)}>
                          <Card
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
                              {/* Feature image upload */}
                              <div>
                                <Typography.Text type="secondary" style={{ fontSize: 12 }}>功能图片：</Typography.Text>
                                {feat.image && (
                                  <div style={{ position: 'relative', marginTop: 4, marginBottom: 4 }}>
                                    <img
                                      src={feat.image.startsWith('http') ? feat.image : feat.image}
                                      alt={feat.label}
                                      style={{ width: '100%', maxHeight: 150, objectFit: 'cover', borderRadius: 8, border: '1px solid #e2e8f0' }}
                                    />
                                    <Button
                                      size="small"
                                      danger
                                      icon={<DeleteOutlined />}
                                      style={{ position: 'absolute', top: 4, right: 4 }}
                                      onClick={() => updateFeature(fIdx, 'image', '')}
                                    />
                                  </div>
                                )}
                                <input
                                  ref={(el) => { featureImageRefs.current[fIdx] = el; }}
                                  type="file"
                                  accept="image/*"
                                  style={{ display: 'none' }}
                                  onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFeatureImage(fIdx, f); e.target.value = ''; }}
                                />
                                <Button
                                  size="small"
                                  icon={<UploadOutlined />}
                                  onClick={() => featureImageRefs.current[fIdx]?.click()}
                                  style={{ marginTop: 4 }}
                                >
                                  {feat.image ? '更换图片' : '上传图片'}
                                </Button>
                              </div>
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
                        </SortableFeatureCard>
                      ))}
                    </SortableContext>
                  </DndContext>
                  <Button type="dashed" icon={<PlusOutlined />} onClick={addFeature} block>
                    添加功能点
                  </Button>
                </div>
              ),
            },
            {
              key: 'specs',
              label: `规格 (${keySpecs.length})`,
              children: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {keySpecs.map((spec, idx) => (
                    <Space key={idx} style={{ width: '100%' }}>
                      <Input
                        placeholder="参数名"
                        value={spec.key}
                        onChange={(e) => updateSpec(idx, 'key', e.target.value)}
                        style={{ width: 180 }}
                      />
                      <Input
                        placeholder="参数值"
                        value={spec.value}
                        onChange={(e) => updateSpec(idx, 'value', e.target.value)}
                        style={{ flex: 1 }}
                      />
                      <Button danger size="small" icon={<DeleteOutlined />} onClick={() => removeSpec(idx)} />
                    </Space>
                  ))}
                  <Button type="dashed" icon={<PlusOutlined />} onClick={addSpec} block>
                    添加规格
                  </Button>
                </div>
              ),
            },
            {
              key: 'gallery',
              label: `图库 (${gallery.length})`,
              children: (
                <div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
                    {gallery.map((img) => (
                      <div key={img.id} style={{ position: 'relative', width: 120, height: 90, borderRadius: 8, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                        <img
                          src={img.url.startsWith('http') ? img.url : `/strapi${img.url}`}
                          alt={img.name ?? ''}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <Button
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          style={{ position: 'absolute', top: 2, right: 2, minWidth: 24, padding: '0 4px' }}
                          onClick={() => removeGalleryImage(img.id)}
                        />
                      </div>
                    ))}
                  </div>
                  <input ref={galleryInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }}
                    onChange={(e) => { if (e.target.files?.length) handleGalleryUpload(e.target.files); e.target.value = ''; }} />
                  <Button icon={<UploadOutlined />} loading={galleryUploading} onClick={() => galleryInputRef.current?.click()}>
                    上传图库图片
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
