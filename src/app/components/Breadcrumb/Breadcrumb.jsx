import { Breadcrumb as AntBreadcrumb } from "antd";
import { Link } from "react-router-dom";

export const Breadcrumb = ({ paths }) => {
  const breadcrumbItems = paths
    .filter((path) => path.name) // Filter out empty names
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
      separator=">"
      className="p-6 bg-white m-8 mb-0 rounded-xl border border-slate-300 border-solid"
      items={breadcrumbItems}
    />
  );
};
