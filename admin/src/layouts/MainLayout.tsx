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
  FolderOpenOutlined,
  PictureOutlined,
  FileSearchOutlined,
  LinkOutlined,
  SettingOutlined,
  TranslationOutlined,
  SearchOutlined,
  BellOutlined,
  ClearOutlined,
  HeartOutlined,
  SisternodeOutlined,
  UserOutlined,
  AuditOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import type { MenuProps } from 'antd';

const { Header, Sider, Content } = Layout;

export default function MainLayout() {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems: MenuProps['items'] = [
    { key: '/dashboard', icon: <DashboardOutlined />, label: t('menu.dashboard') },
    {
      key: 'content',
      icon: <FileTextOutlined />,
      label: t('menu.group.content'),
      children: [
        { key: '/news', icon: <FileTextOutlined />, label: t('menu.news') },
        { key: '/faq', icon: <QuestionCircleOutlined />, label: t('menu.faq') },
        { key: '/cases', icon: <FolderOpenOutlined />, label: t('menu.cases') },
        { key: '/jobs', icon: <UserAddOutlined />, label: t('menu.jobs') },
      ],
    },
    {
      key: 'pages',
      icon: <PictureOutlined />,
      label: t('menu.group.pages'),
      children: [
        { key: '/media-library', icon: <PictureOutlined />, label: t('menu.mediaLibrary') },
        { key: '/page-content', icon: <FileSearchOutlined />, label: t('menu.pageContent') },
        { key: '/products', icon: <AppstoreOutlined />, label: t('menu.products') },
        { key: '/solutions', icon: <BulbOutlined />, label: t('menu.solutions') },
      ],
    },
    {
      key: 'assets',
      icon: <AppstoreOutlined />,
      label: t('menu.group.assets'),
      children: [
        { key: '/file-assets', icon: <FolderOpenOutlined />, label: t('menu.fileAssets') },
        { key: '/brands', icon: <TagsOutlined />, label: t('menu.brands') },
        { key: '/product-relations', icon: <LinkOutlined />, label: t('menu.productRelations') },
      ],
    },
    {
      key: 'leads',
      icon: <TeamOutlined />,
      label: t('menu.group.leads'),
      children: [
        { key: '/leads', icon: <TeamOutlined />, label: t('menu.leads') },
        { key: '/tickets', icon: <ToolOutlined />, label: t('menu.tickets') },
      ],
    },
    {
      key: 'system',
      icon: <SettingOutlined />,
      label: t('menu.group.system'),
      children: [
        { key: '/i18n-dict', icon: <TranslationOutlined />, label: t('menu.i18nDict') },
        { key: '/seo-config', icon: <SearchOutlined />, label: t('menu.seoConfig') },
        { key: '/notification-config', icon: <BellOutlined />, label: t('menu.notificationConfig') },
      ],
    },
    {
      key: 'ops',
      icon: <ToolOutlined />,
      label: t('menu.group.ops'),
      children: [
        { key: '/cache-mgmt', icon: <ClearOutlined />, label: t('menu.cacheMgmt') },
        { key: '/health-check', icon: <HeartOutlined />, label: t('menu.healthCheck') },
        { key: '/sitemap', icon: <SisternodeOutlined />, label: t('menu.sitemapMgmt') },
        { key: '/audit-logs', icon: <AuditOutlined />, label: t('menu.auditLogs') },
      ],
    },
    { key: '/account-mgmt', icon: <UserOutlined />, label: t('menu.accountMgmt') },
  ];

  const changeLang = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('admin-lang', lang);
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  // Determine which menu keys should be open/selected
  const selectedKeys = [location.pathname];
  const openKeys = menuItems
    ?.filter((item): item is NonNullable<typeof item> & { children: MenuProps['items'] } => !!(item && 'children' in item))
    .filter((item) => item.children?.some((child) => child && 'key' in child && child.key === location.pathname))
    .map((item) => item.key as string) ?? [];

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
          selectedKeys={selectedKeys}
          defaultOpenKeys={openKeys}
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
