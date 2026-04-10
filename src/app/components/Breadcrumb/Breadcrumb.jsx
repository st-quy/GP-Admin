import { Breadcrumb as AntBreadcrumb } from 'antd';
import { Link } from 'react-router-dom';

export const Breadcrumb = ({ paths }) => {
  if (!paths || paths.length === 0) return null;

  const breadcrumbItems = paths
    .filter((path) => path.name)
    .map((path, index, array) => ({
      title:
        index === array.length - 1 ? (
          <span>{path.name}</span>
        ) : path.index ? (
          <Link to={path.link}>{path.name}</Link>
        ) : (
          <span>{path.name}</span>
        ),
      key: index,
    }));

  return (
    <AntBreadcrumb
      separator='>'
      className='text-xs'
      items={breadcrumbItems}
    />
  );
};
