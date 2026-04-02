import React, { useState } from 'react';
import {
  Typography,
  Button,
  Upload,
  Select,
  Radio,
  Checkbox,
  Table,
  Alert,
} from 'antd';
import {
  CloudUploadOutlined,
  SettingOutlined,
  SearchOutlined,
  DownloadOutlined,
  CheckCircleFilled,
  WarningFilled,
  FolderFilled,
  FileTextOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

const { Title, Text } = Typography;
const { Dragger } = Upload;

const QUESTION_TYPE_OPTIONS = [
  { value: '', label: 'Select question type' },
  { value: 'multiple-choice', label: 'Multiple Choice' },
  { value: 'short-answer', label: 'Short Answer' },
  { value: 'essay', label: 'Essay' },
  { value: 'matching', label: 'Matching' },
  { value: 'ordering', label: 'Ordering' },
  { value: 'dropdown-list', label: 'Dropdown List' },
];

const PREVIEW_COLUMNS = [
  {
    title: 'Question ID',
    dataIndex: 'questionId',
    width: 120,
    align: 'center',
    render: (text) => <span className="text-[#1F2937] font-medium">{text}</span>,
  },
  {
    title: 'Question Text',
    dataIndex: 'questionText',
    ellipsis: true,
    render: (text) => <span className="text-[#4B5563]">{text}</span>,
  },
  {
    title: 'Type',
    dataIndex: 'type',
    width: 140,
    align: 'center',
    render: (text) => <span className="text-[#4B5563]">{text}</span>,
  },
  {
    title: 'Difficulty',
    dataIndex: 'difficulty',
    width: 120,
    align: 'center',
    render: (text) => <span className="text-[#4B5563]">{text}</span>,
  },
  {
    title: 'Skill',
    dataIndex: 'skill',
    width: 140,
    align: 'center',
    render: (text) => <span className="text-[#4B5563]">{text}</span>,
  },
  {
    title: 'Status',
    dataIndex: 'status',
    width: 80,
    align: 'center',
    render: (status) =>
      status === 'valid' ? (
        <CheckCircleFilled className="text-[#22C55E] text-lg" />
      ) : (
        <WarningFilled className="text-[#F59E0B] text-lg" />
      ),
  },
];

const ImportQuestionList = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [questionType, setQuestionType] = useState('');
  const [duplicateHandling, setDuplicateHandling] = useState('skip');
  const [includeMedia, setIncludeMedia] = useState(true);
  const [previewData, setPreviewData] = useState([]);
  const [errorCount, setErrorCount] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [previewCollapsed, setPreviewCollapsed] = useState(false);
  const [showAllRows, setShowAllRows] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const parseFile = (fileObj) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

        if (jsonData.length <= 1) {
          setPreviewData([]);
          setTotalQuestions(0);
          setErrorCount(0);
          return;
        }

        const rows = jsonData.slice(1).filter((row) => row.length > 0);
        const parsed = rows.map((row, index) => {
          const hasError = !row[1] || !row[2];
          return {
            key: index,
            questionId: row[0] || `Q${String(index + 1).padStart(3, '0')}`,
            questionText: row[1] || '',
            type: row[2] || '',
            difficulty: row[3] || '',
            skill: row[4] || '',
            status: hasError ? 'error' : 'valid',
          };
        });

        const errors = parsed.filter((q) => q.status === 'error').length;
        setPreviewData(parsed);
        setTotalQuestions(parsed.length);
        setErrorCount(errors);
      } catch {
        setPreviewData([]);
        setTotalQuestions(0);
        setErrorCount(0);
      }
    };
    reader.readAsArrayBuffer(fileObj);
  };

  const handleUpload = (info) => {
    const uploadedFile = info.file?.originFileObj || info.file;
    if (!uploadedFile) return;

    const isValid =
      uploadedFile.type ===
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      uploadedFile.type === 'text/csv' ||
      uploadedFile.name?.endsWith('.xlsx') ||
      uploadedFile.name?.endsWith('.csv');

    if (!isValid) return;
    if (uploadedFile.size > 10 * 1024 * 1024) return;

    setFile(uploadedFile);
    parseFile(uploadedFile);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreviewData([]);
    setTotalQuestions(0);
    setErrorCount(0);
    setShowAllRows(false);
  };

  const handleDownloadTemplate = () => {
    const headers = [
      'Question ID',
      'Question Text',
      'Type',
      'Difficulty',
      'Skill',
      'Answer',
    ];
    const sampleData = [
      ['Q001', 'What is the capital of France?', 'Multiple Choice', 'Easy', 'Geography', 'Paris'],
      ['Q002', 'Solve: 2x + 5 = 15', 'Short Answer', 'Medium', 'Mathematics', 'x = 5'],
    ];
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Questions');
    XLSX.writeFile(workbook, 'question_import_template.xlsx');
  };

  const handleDownloadErrorReport = () => {
    const errorRows = previewData.filter((q) => q.status === 'error');
    const headers = ['Question ID', 'Question Text', 'Type', 'Difficulty', 'Skill', 'Error'];
    const rows = errorRows.map((q) => [
      q.questionId,
      q.questionText,
      q.type,
      q.difficulty,
      q.skill,
      !q.questionText ? 'Missing question text' : 'Missing type',
    ]);
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Errors');
    XLSX.writeFile(workbook, 'error_report.xlsx');
  };

  const handleValidateOnly = () => {
    if (!file) return;
    setIsValidating(true);
    setTimeout(() => {
      setIsValidating(false);
    }, 1000);
  };

  const handleImport = () => {
    if (!file) return;
    setIsImporting(true);
    setTimeout(() => {
      setIsImporting(false);
      navigate('/questions');
    }, 1500);
  };

  const displayedData = showAllRows ? previewData : previewData.slice(0, 3);

  return (
    <div className="w-[90%] max-w-[1476px] mx-auto py-8 space-y-6">
        {/* Header */}
        <div>
          <Title level={3} className="!m-0 !font-bold !text-[#111928]">
            Import Question List
          </Title>
          <Text className="text-[#6B7280] text-[16px]">
            Upload a file to bulk import multiple questions into your Question Bank.
          </Text>
        </div>

        {/* Upload File Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <FolderFilled className="text-[#003087] text-lg" />
            <Title level={5} className="!m-0 !font-bold !text-[#111928]">
              Upload File
            </Title>
          </div>

          <Text className="text-[#6B7280]">
            Select an Excel or CSV file following the provided template.
          </Text>

          {!file ? (
            <Dragger
              accept=".xlsx,.csv"
              showUploadList={false}
              beforeUpload={() => false}
              onChange={handleUpload}
              className="!border-dashed !border-gray-300 !rounded-lg !bg-[#FAFAFA]"
            >
              <div className="py-8">
                <CloudUploadOutlined className="!text-4xl !text-gray-400 mb-3" />
                <p className="text-[#4B5563] text-base mb-1">
                  Drag & drop your file here or click to browse
                </p>
                <p className="text-[#9CA3AF] text-sm mb-4">
                  Supported formats: .xlsx, .csv
                </p>
                <Button
                  type="primary"
                  className="!bg-[#003087] !border-none !rounded-md !font-medium !px-6"
                >
                  Choose File
                </Button>
              </div>
            </Dragger>
          ) : (
            <div className="border border-dashed border-gray-300 rounded-lg bg-[#FAFAFA] p-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileTextOutlined className="text-2xl text-[#003087]" />
                <div>
                  <Text className="font-medium text-[#1F2937] block">
                    {file.name}
                  </Text>
                  <Text className="text-[#9CA3AF] text-sm">
                    {(file.size / 1024).toFixed(1)} KB
                  </Text>
                </div>
              </div>
              <Button
                type="text"
                danger
                onClick={handleRemoveFile}
                className="!font-medium"
              >
                Remove
              </Button>
            </div>
          )}

          <div className="flex justify-between items-center">
            <Text className="text-[#9CA3AF] text-sm">Maximum file size: 10MB</Text>
            <Button
              type="link"
              icon={<DownloadOutlined />}
              onClick={handleDownloadTemplate}
              className="!text-[#003087] !font-medium !p-0"
            >
              Download Template
            </Button>
          </div>
        </div>

        {/* Import Settings Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-5">
          <div className="flex items-center gap-2">
            <SettingOutlined className="text-[#003087] text-lg" />
            <Title level={5} className="!m-0 !font-bold !text-[#111928]">
              Import Settings
            </Title>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Text className="block text-[#374151] font-medium mb-2">
                Question Type Mapping
              </Text>
              <Select
                value={questionType}
                onChange={setQuestionType}
                options={QUESTION_TYPE_OPTIONS}
                className="w-full"
                size="large"
              />
            </div>

            <div>
              <Text className="block text-[#374151] font-medium mb-2">
                Duplicate Handling
              </Text>
              <Radio.Group
                value={duplicateHandling}
                onChange={(e) => setDuplicateHandling(e.target.value)}
                className="flex flex-col gap-2"
              >
                <Radio value="skip">Skip existing questions</Radio>
                <Radio value="update">Update existing questions</Radio>
                <Radio value="new">Import as new entries</Radio>
              </Radio.Group>
            </div>
          </div>

          <Checkbox
            checked={includeMedia}
            onChange={(e) => setIncludeMedia(e.target.checked)}
          >
            <span className="text-[#374151]">
              Include image/audio links if available
            </span>
          </Checkbox>
        </div>

        {/* Preview & Validation Section */}
        {previewData.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <SearchOutlined className="text-[#003087] text-lg" />
                <Title level={5} className="!m-0 !font-bold !text-[#111928]">
                  Preview & Validation
                </Title>
              </div>
              <Button
                type="link"
                onClick={() => setPreviewCollapsed(!previewCollapsed)}
                className="!text-[#6B7280] !p-0"
              >
                {previewCollapsed ? '▸ Expand' : '▾ Collapse'}
              </Button>
            </div>

            {!previewCollapsed && (
              <>
                {errorCount > 0 && (
                  <Alert
                    type="warning"
                    showIcon
                    icon={<WarningFilled className="!text-[#F59E0B]" />}
                    className="!bg-[#FFF8E1] !border-[#FFE082] !rounded-md"
                    message={
                      <span className="text-[#92400E]">
                        {errorCount} questions have validation errors.{' '}
                        <Button
                          type="link"
                          onClick={handleDownloadErrorReport}
                          className="!p-0 !text-[#92400E] !underline !font-medium"
                        >
                          Download error report
                        </Button>
                      </span>
                    }
                  />
                )}

                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <Table
                    columns={PREVIEW_COLUMNS}
                    dataSource={displayedData}
                    pagination={false}
                    rowKey="key"
                    rowClassName="hover:bg-gray-50"
                    scroll={{ x: 700 }}
                  />
                </div>

                {totalQuestions > 3 && (
                  <div>
                    <Text className="text-[#9CA3AF] text-sm">
                      Showing {displayedData.length} of {totalQuestions} questions.
                    </Text>
                    <Button
                      type="link"
                      onClick={() => setShowAllRows(!showAllRows)}
                      className="!p-0 !pl-1 !text-[#003087] !text-sm !font-medium"
                    >
                      {showAllRows ? 'Show less' : 'View all'}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex justify-end items-center gap-3 pt-2 pb-4">
          <Button
            size="large"
            onClick={() => navigate('/questions')}
            className="!rounded-md !border-gray-300 !text-[#374151] !font-medium !h-[44px] !px-8"
          >
            Cancel
          </Button>
          <Button
            size="large"
            onClick={handleValidateOnly}
            loading={isValidating}
            disabled={!file}
            className="!rounded-md !border-[#003087] !text-[#003087] !font-medium !h-[44px] !px-6"
          >
            Validate Only
          </Button>
          <Button
            type="primary"
            size="large"
            onClick={handleImport}
            loading={isImporting}
            disabled={!file}
            className="!rounded-md !bg-[#003087] !border-none !font-medium !h-[44px] !px-6 !text-white"
          >
            Import Questions
          </Button>
        </div>
      </div>
  );
};

export default ImportQuestionList;
