import { useEffect, useState, useCallback, useRef } from 'react';
import { Table, Button, Drawer, Form, Input, Typography, message, Image } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import api from '../lib/axios';

const API_URL = '/content-manager/collection-types/api::solution.solution';
const STRAPI_BASE = '/';

export default function Solutions() {
  const { t } = useTranslation();
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pendingCoverId, setPendingCoverId] = useState<number | null>(null);
  const [form] = Form.useForm();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`${API_URL}?page=1&pageSize=50&sort=sortOrder:asc&populate=cover`);
      setData(res.data?.results ?? []);
    } catch { /**/ } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openEdit = (record: Record<string, unknown>) => {
    setEditingId(record.id as number);
    setPendingCoverId(null);
    const cover = record.cover as { url?: string; id?: number } | null;
    setCoverPreview(cover?.url ? cover.url : null);
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
        message.success('图片上传成功');
      }
    } catch {
      message.error('上传失败');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    const values = await form.validateFields();
    try {
      const payload: Record<string, unknown> = {
        title: values.title,
        tagline: values.tagline,
        description: values.description,
      };
      if (pendingCoverId !== null) {
        payload.cover = pendingCoverId;
      }
      await api.put(`${API_URL}/${editingId}`, payload);
      message.success('保存成功');
      setDrawerOpen(false);
      fetchData();
    } catch { message.error('保存失败'); }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 60 },
    {
      title: '封面', dataIndex: 'cover', width: 80,
      render: (cover: { url?: string } | null) => cover?.url
        ? <Image src={cover.url} width={60} height={40} style={{ objectFit: 'cover', borderRadius: 4 }} />
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
      <Typography.Title level={4}>{t('menu.solutions')}</Typography.Title>
      <Table dataSource={data} columns={columns} rowKey="id" loading={loading} pagination={false} />

      <Drawer
        title="编辑解决方案"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        width={540}
        extra={<Button type="primary" onClick={handleSave} loading={uploading}>保存</Button>}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="标题" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="tagline" label="副标题（一句话描述）">
            <Input />
          </Form.Item>
          <Form.Item name="description" label="详细描述">
            <Input.TextArea rows={5} />
          </Form.Item>
          <Form.Item label="封面图">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {coverPreview && (
                <img
                  src={coverPreview.startsWith('http') ? coverPreview : `${STRAPI_BASE}${coverPreview}`}
                  alt="封面预览"
                  style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 8, border: '1px solid #e2e8f0' }}
                />
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUpload(file);
                  e.target.value = '';
                }}
              />
              <Button
                icon={<UploadOutlined />}
                loading={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {coverPreview ? '更换封面图' : '上传封面图'}
              </Button>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>建议尺寸：1200×800，JPG/PNG，≤2MB</span>
            </div>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
}
