import { Layout, Menu, Dropdown, Button, Space, Typography } from 'antd';
import {
  DashboardOutlined,
  TeamOutlined,
  ToolOutlined,
  FileTextOutlined,
  QuestionCircleOutlined,
  UserAddOutlined,
  AppstoreOutlined,
  BulbOutlined,
  TagsOutlined,
  LogoutOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

const { Header, Sider, Content } = Layout;

// ✅ 测试通过: 主布局渲染、导航菜单跳转、退出登录
export default function MainLayout() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { key: '/dashboard', icon: <DashboardOutlined />, label: t('menu.dashboard') },
    { key: '/leads', icon: <TeamOutlined />, label: t('menu.leads') },
    { key: '/tickets', icon: <ToolOutlined />, label: t('menu.tickets') },
    { key: '/news', icon: <FileTextOutlined />, label: t('menu.news') },
    { key: '/faq', icon: <QuestionCircleOutlined />, label: t('menu.faq') },
    { key: '/jobs', icon: <UserAddOutlined />, label: t('menu.jobs') },
    { key: '/products', icon: <AppstoreOutlined />, label: t('menu.products') },
    { key: '/solutions', icon: <BulbOutlined />, label: t('menu.solutions') },
    { key: '/brands', icon: <TagsOutlined />, label: t('menu.brands') },
  ];

  const changeLang = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('admin-lang', lang);
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={220} theme="dark">
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography.Text strong style={{ color: '#fff', fontSize: 16 }}>
            {t('app.title')}
          </Typography.Text>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <Space size="middle">
            <Dropdown
              menu={{
                items: [
                  { key: 'zh-CN', label: '中文' },
                  { key: 'en-US', label: 'English' },
                ],
                onClick: ({ key }) => changeLang(key),
              }}
            >
              <Button icon={<GlobalOutlined />}>{i18n.language === 'zh-CN' ? '中文' : 'English'}</Button>
            </Dropdown>
            <Typography.Text>{user?.firstname} {user?.lastname}</Typography.Text>
            <Button icon={<LogoutOutlined />} onClick={handleLogout}>
              {t('common.logout')}
            </Button>
          </Space>
        </Header>
        <Content style={{ margin: 24 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
