const QuestionLayout = ({ title, subtitle, children }) => {
  return (
    <div className="figma-page-container">
      <div className="figma-content-wrapper">
        <div className="py-8">
          <div className="mb-8">
            <h4 className="figma-title">{title}</h4>
            <p className="figma-subtitle">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default QuestionLayout;
