import { useState } from 'react';
import { Form, Input, Button, Card, message, Select, Typography } from 'antd';
import { MailOutlined, LockOutlined, GlobalOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

// ✅ 测试通过: 登录页渲染、表单验证、登录成功/失败路径
export default function Login() {
  const { t, i18n } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      await login(values.email, values.password);
      message.success('OK');
      navigate('/dashboard', { replace: true });
    } catch {
      message.error(t('login.error'));
    } finally {
      setLoading(false);
    }
  };

  const changeLang = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('admin-lang', lang);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5' }}>
      <div style={{ position: 'absolute', top: 16, right: 24 }}>
        <Select
          value={i18n.language}
          onChange={changeLang}
          style={{ width: 120 }}
          suffixIcon={<GlobalOutlined />}
          options={[
            { value: 'zh-CN', label: '中文' },
            { value: 'en-US', label: 'English' },
          ]}
        />
      </div>
      <Card style={{ width: 400 }}>
        <Typography.Title level={3} style={{ textAlign: 'center', marginBottom: 32 }}>
          {t('login.title')}
        </Typography.Title>
        <Form onFinish={onFinish} size="large">
          <Form.Item name="email" rules={[{ required: true, type: 'email' }]}>
            <Input prefix={<MailOutlined />} placeholder={t('login.email')} />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true }]}>
            <Input.Password prefix={<LockOutlined />} placeholder={t('login.password')} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              {t('login.submit')}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
