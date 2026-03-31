import { Breadcrumb as AntBreadcrumb } from 'antd';
import { Link } from 'react-router-dom';
import { RightOutlined } from '@ant-design/icons';

export const Breadcrumb = ({ paths }) => {
  if (!paths || paths.length === 0) return null;

  // Filter out 'Home' if it exists at the start to follow user request
  const filteredPaths = paths.filter(path => path.name && path.name.toLowerCase() !== 'home');

  const breadcrumbItems = filteredPaths.map((path, index, array) => {
    const isLast = index === array.length - 1;

    return {
      title: isLast 
        ? <span className="figma-breadcrumb-current">{path.name}</span>
        : <Link to={path.link} className="figma-breadcrumb-parent hover:underline">{path.name}</Link>,
      key: index,
    };
  });

  if (breadcrumbItems.length === 0) return null;

  return (
    <div className="figma-content-wrapper">
      <div className="figma-breadcrumb-card">
        <AntBreadcrumb
          separator={<RightOutlined style={{ color: '#637381', fontSize: '12px' }} />}
          items={breadcrumbItems}
        />
      </div>
    </div>
  );
};
