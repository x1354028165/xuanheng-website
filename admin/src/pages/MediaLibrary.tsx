import { useEffect, useState, useCallback } from 'react';
import { Table, Button, Popconfirm, Typography, message, Upload, Image } from 'antd';
import type { UploadRequestOption } from '@rc-component/upload/lib/interface';
import { UploadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import api from '../lib/axios';
import dayjs from 'dayjs';

export default function MediaLibrary() {
  const { t } = useTranslation();
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/upload/files?page=${page}&pageSize=20&sort=createdAt:desc`);
      setData(res.data?.results ?? res.data ?? []);
      setTotal(res.data?.pagination?.total ?? res.data?.length ?? 0);
    } catch { /* */ } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleUpload = async (options: UploadRequestOption) => {
    const formData = new FormData();
    formData.append('files', options.file as File);
    try {
      await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      message.success('OK');
      fetchData();
    } catch {
      message.error('Failed');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/upload/files/${id}`);
      message.success('OK');
      fetchData();
    } catch {
      message.error('Failed');
    }
  };

  const columns = [
    {
      title: t('media.preview'),
      dataIndex: 'url',
      width: 80,
      render: (v: string, record: Record<string, unknown>) => {
        const mime = (record.mime as string) || '';
        if (mime.startsWith('image/')) {
          return <Image src={v} width={40} height={40} style={{ objectFit: 'cover' }} />;
        }
        return <span>{mime.split('/')[1] || '-'}</span>;
      },
    },
    { title: t('common.name'), dataIndex: 'name', ellipsis: true },
    { title: t('media.mime'), dataIndex: 'mime', width: 120 },
    { title: t('media.size'), dataIndex: 'size', width: 100, render: (v: number) => v ? `${(v / 1024).toFixed(1)} KB` : '-' },
    { title: t('common.createdAt'), dataIndex: 'createdAt', width: 160, render: (v: string) => v ? dayjs(v).format('YYYY-MM-DD HH:mm') : '-' },
    {
      title: t('common.operations'),
      width: 100,
      render: (_: unknown, record: Record<string, unknown>) => (
        <Popconfirm title={t('common.confirmDelete')} onConfirm={() => handleDelete(record.id as number)}>
          <Button size="small" danger>{t('common.delete')}</Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <Typography.Title level={4} style={{ margin: 0 }}>{t('menu.mediaLibrary')}</Typography.Title>
        <Upload customRequest={handleUpload} showUploadList={false}>
          <Button type="primary" icon={<UploadOutlined />}>{t('media.upload')}</Button>
        </Upload>
      </div>
      <Table
        dataSource={data}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ current: page, pageSize: 20, total, onChange: setPage, showTotal: (t2) => t('common.total', { total: t2 }) }}
      />
    </div>
  );
}
